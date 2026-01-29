# -*- coding: utf-8 -*-
"""
Contrôleur Stripe Connect - Payouts Designers Marketplace

Endpoints:
- /api/themes/designers/stripe-connect/onboard : Initialiser onboarding Stripe Connect
- /api/themes/designers/payout : Déclencher payout manuel
- /api/stripe-connect/webhook : Webhook pour transfer.paid
"""

import logging
import stripe
from datetime import datetime
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class StripeConnectController(http.Controller):
    """Gestion des payouts designers via Stripe Connect"""

    def _get_stripe_key(self):
        """Récupérer clé secrète Stripe"""
        secret_key = request.env['ir.config_parameter'].sudo().get_param('payment.stripe.secret_key')
        if not secret_key:
            raise ValueError('Stripe secret key not configured')
        stripe.api_key = secret_key
        return secret_key

    def _get_webhook_secret(self):
        """Récupérer webhook secret Stripe Connect"""
        return request.env['ir.config_parameter'].sudo().get_param('payment.stripe.connect_webhook_secret')

    @http.route('/api/themes/designers/stripe-connect/onboard', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def stripe_connect_onboard(self, designer_id):
        """
        Initialiser onboarding Stripe Connect pour un designer

        Args:
            designer_id (int): ID du designer

        Returns:
            dict: {
                success: bool,
                account_link_url: str (URL onboarding Stripe),
                account_id: str (Stripe Connect Account ID)
            }
        """
        try:
            self._get_stripe_key()
            designer = request.env['quelyos.theme.designer'].sudo().browse(designer_id)

            if not designer.exists():
                return {'success': False, 'error': 'Designer not found'}

            # Vérifier autorisation (admin ou owner)
            if not request.env.user.has_group('quelyos_api.group_quelyos_admin') and designer.user_id.id != request.env.user.id:
                return {'success': False, 'error': 'Unauthorized'}

            # Créer ou récupérer Stripe Connect Account
            if designer.stripe_connect_account_id:
                account_id = designer.stripe_connect_account_id
            else:
                # Créer nouveau compte Connect
                account = stripe.Account.create(
                    type='express',
                    country='FR',  # TODO: Détecter pays designer
                    email=designer.email,
                    capabilities={
                        'transfers': {'requested': True},
                    },
                    business_type='individual',
                    metadata={
                        'designer_id': designer_id,
                        'quelyos_designer': designer.display_name,
                    }
                )
                account_id = account.id
                designer.sudo().write({'stripe_connect_account_id': account_id})

            # Générer lien d'onboarding
            account_link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=f"{request.httprequest.host_url}store/themes/my-submissions?stripe_refresh=true",
                return_url=f"{request.httprequest.host_url}store/themes/my-submissions?stripe_onboarding=success",
                type='account_onboarding',
            )

            _logger.info(f"Stripe Connect onboarding initiated for designer {designer.display_name} (account {account_id})")

            return {
                'success': True,
                'account_link_url': account_link.url,
                'account_id': account_id,
            }

        except stripe.error.StripeError as e:
            _logger.error(f"Stripe Connect onboarding error: {str(e)}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Stripe Connect onboarding error: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/designers/stripe-connect/status', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def stripe_connect_status(self, designer_id):
        """
        Vérifier statut onboarding Stripe Connect

        Args:
            designer_id (int): ID du designer

        Returns:
            dict: {
                success: bool,
                onboarding_completed: bool,
                payouts_enabled: bool,
                charges_enabled: bool
            }
        """
        try:
            self._get_stripe_key()
            designer = request.env['quelyos.theme.designer'].sudo().browse(designer_id)

            if not designer.exists() or not designer.stripe_connect_account_id:
                return {'success': False, 'error': 'Designer not found or not connected'}

            # Récupérer statut du compte Stripe
            account = stripe.Account.retrieve(designer.stripe_connect_account_id)

            onboarding_completed = account.details_submitted and account.charges_enabled and account.payouts_enabled

            # Mettre à jour le designer
            designer.sudo().write({
                'stripe_onboarding_completed': onboarding_completed,
                'stripe_payouts_enabled': account.payouts_enabled,
                'stripe_charges_enabled': account.charges_enabled,
            })

            return {
                'success': True,
                'onboarding_completed': onboarding_completed,
                'payouts_enabled': account.payouts_enabled,
                'charges_enabled': account.charges_enabled,
            }

        except stripe.error.StripeError as e:
            _logger.error(f"Stripe Connect status error: {str(e)}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Stripe Connect status error: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/themes/designers/payout', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def trigger_designer_payout(self, designer_id, amount=None):
        """
        Déclencher payout manuel pour un designer

        Args:
            designer_id (int): ID du designer
            amount (float, optional): Montant à payer (si None, paie tout le pending_balance)

        Returns:
            dict: {
                success: bool,
                transfer_id: str,
                amount: float,
                revenues_paid: int (nombre de revenues marqués paid)
            }
        """
        try:
            # Vérifier admin uniquement
            if not request.env.user.has_group('quelyos_api.group_quelyos_admin'):
                return {'success': False, 'error': 'Admin access required'}

            self._get_stripe_key()
            designer = request.env['quelyos.theme.designer'].sudo().browse(designer_id)

            if not designer.exists():
                return {'success': False, 'error': 'Designer not found'}

            if not designer.stripe_connect_account_id:
                return {'success': False, 'error': 'Designer not connected to Stripe'}

            if not designer.stripe_payouts_enabled:
                return {'success': False, 'error': 'Payouts not enabled for this designer'}

            # Déterminer montant à payer
            if amount is None:
                amount = designer.pending_balance

            if amount <= 0:
                return {'success': False, 'error': 'No pending balance to pay'}

            # Minimum 5 EUR pour déclencher payout
            if amount < 5:
                return {'success': False, 'error': 'Minimum payout amount is 5 EUR'}

            # Récupérer revenus en attente
            pending_revenues = request.env['quelyos.theme.revenue'].sudo().search([
                ('designer_id', '=', designer_id),
                ('payout_status', '=', 'pending'),
            ], order='create_date asc')

            if not pending_revenues:
                return {'success': False, 'error': 'No pending revenues found'}

            # Créer Stripe Transfer
            transfer = stripe.Transfer.create(
                amount=int(amount * 100),  # Convertir en centimes
                currency=designer.currency_id.name.lower() or 'eur',
                destination=designer.stripe_connect_account_id,
                description=f"Payout for {designer.display_name} - {len(pending_revenues)} sales",
                metadata={
                    'designer_id': designer_id,
                    'quelyos_designer': designer.display_name,
                    'revenues_count': len(pending_revenues),
                }
            )

            # Marquer revenues comme "processing"
            pending_revenues.sudo().write({
                'payout_status': 'processing',
                'stripe_transfer_id': transfer.id,
            })

            # Mettre à jour date dernier payout
            designer.sudo().write({'last_payout_date': datetime.now()})

            _logger.info(f"Payout triggered for designer {designer.display_name}: {amount} EUR (transfer {transfer.id})")

            return {
                'success': True,
                'transfer_id': transfer.id,
                'amount': amount,
                'revenues_paid': len(pending_revenues),
            }

        except stripe.error.StripeError as e:
            _logger.error(f"Stripe Transfer error: {str(e)}")
            # Marquer revenues en erreur
            if 'pending_revenues' in locals():
                pending_revenues.sudo().write({
                    'payout_status': 'failed',
                    'payout_error': str(e),
                })
            return {'success': False, 'error': str(e)}
        except Exception as e:
            _logger.error(f"Payout error: {str(e)}")
            return {'success': False, 'error': 'Internal error'}

    @http.route('/api/stripe-connect/webhook', auth='none', type='http', methods=['POST'], csrf=False)
    def stripe_connect_webhook(self, **kwargs):
        """
        Webhook Stripe Connect pour événements transfer.paid, transfer.failed

        Events:
        - transfer.paid : Transfer réussi → Marquer revenues "paid"
        - transfer.failed : Transfer échoué → Marquer revenues "failed"
        """
        payload = request.httprequest.data
        sig_header = request.httprequest.headers.get('Stripe-Signature')
        webhook_secret = self._get_webhook_secret()

        try:
            # Vérifier signature webhook
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except ValueError:
            _logger.error("Stripe Connect webhook: Invalid payload")
            return request.make_response('Invalid payload', status=400)
        except stripe.error.SignatureVerificationError:
            _logger.error("Stripe Connect webhook: Invalid signature")
            return request.make_response('Invalid signature', status=400)

        event_type = event['type']
        transfer = event['data']['object']
        transfer_id = transfer['id']

        _logger.info(f"Stripe Connect webhook received: {event_type} (transfer {transfer_id})")

        if event_type == 'transfer.paid':
            return self._handle_transfer_paid(transfer_id, transfer)
        elif event_type == 'transfer.failed':
            return self._handle_transfer_failed(transfer_id, transfer)
        else:
            return request.make_response('Event ignored', status=200)

    def _handle_transfer_paid(self, transfer_id, transfer):
        """Gérer événement transfer.paid"""
        revenues = request.env['quelyos.theme.revenue'].sudo().search([
            ('stripe_transfer_id', '=', transfer_id),
            ('payout_status', '=', 'processing'),
        ])

        if not revenues:
            _logger.warning(f"No revenues found for transfer {transfer_id}")
            return request.make_response('No revenues found', status=200)

        # Marquer revenues comme payés
        revenues.sudo().write({
            'payout_status': 'paid',
            'payout_date': datetime.now().date(),
            'payout_reference': transfer_id,
        })

        designer = revenues[0].designer_id
        _logger.info(f"Transfer paid: {transfer_id} - {len(revenues)} revenues marked as paid for designer {designer.display_name}")

        return request.make_response('Transfer paid processed', status=200)

    def _handle_transfer_failed(self, transfer_id, transfer):
        """Gérer événement transfer.failed"""
        revenues = request.env['quelyos.theme.revenue'].sudo().search([
            ('stripe_transfer_id', '=', transfer_id),
            ('payout_status', '=', 'processing'),
        ])

        if not revenues:
            _logger.warning(f"No revenues found for transfer {transfer_id}")
            return request.make_response('No revenues found', status=200)

        failure_message = transfer.get('failure_message', 'Unknown error')

        # Marquer revenues comme échoués
        revenues.sudo().write({
            'payout_status': 'failed',
            'payout_error': failure_message,
        })

        designer = revenues[0].designer_id
        _logger.error(f"Transfer failed: {transfer_id} - Designer {designer.display_name} - Error: {failure_message}")

        return request.make_response('Transfer failed processed', status=200)

    @http.route('/api/themes/designers/payout/auto', auth='none', type='http', methods=['POST'], csrf=False)
    def auto_payout_cron(self, **kwargs):
        """
        Cron job pour payouts automatiques mensuels

        Critères:
        - Designer avec stripe_payouts_enabled=True
        - pending_balance >= 50 EUR (minimum)
        - Revenues en attente depuis > 7 jours
        """
        try:
            self._get_stripe_key()

            # Récupérer designers éligibles
            designers = request.env['quelyos.theme.designer'].sudo().search([
                ('stripe_payouts_enabled', '=', True),
                ('pending_balance', '>=', 50),
            ])

            payouts_triggered = 0
            total_amount = 0

            for designer in designers:
                try:
                    result = self.trigger_designer_payout(designer.id, amount=None)
                    if result.get('success'):
                        payouts_triggered += 1
                        total_amount += result.get('amount', 0)
                except Exception as e:
                    _logger.error(f"Auto payout error for designer {designer.id}: {str(e)}")
                    continue

            _logger.info(f"Auto payout cron completed: {payouts_triggered} payouts, total {total_amount} EUR")

            return request.make_response(f"Auto payouts: {payouts_triggered} processed", status=200)

        except Exception as e:
            _logger.error(f"Auto payout cron error: {str(e)}")
            return request.make_response('Cron error', status=500)
