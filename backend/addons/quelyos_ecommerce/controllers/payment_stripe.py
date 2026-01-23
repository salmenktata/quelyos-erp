# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging
import json
import hmac
import hashlib

_logger = logging.getLogger(__name__)


class EcommercePaymentStripeController(BaseEcommerceController):
    """
    Controller pour intégration Stripe Payment Intents avec sécurité renforcée.
    Permet au frontend Next.js d'utiliser Stripe.js/Elements.
    """

    @http.route('/api/ecommerce/payment/stripe/intent', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=10, window=300)  # 10 tentatives par 5 minutes (protection spam paiement)
    def create_payment_intent(self, **kwargs):
        """
        Crée un Stripe Payment Intent pour le panier actuel.

        Le frontend Next.js utilisera cet intent avec Stripe Elements
        pour collecter les informations de carte de manière sécurisée.

        Body JSON:
        {
            "order_id": 123,
            "payment_method_types": ["card"]  # optionnel
        }

        Returns:
        {
            "success": true,
            "client_secret": "pi_xxx_secret_yyy",
            "publishable_key": "pk_test_xxx",
            "amount": 99.99,
            "currency": "eur",
            "transaction_id": 456
        }
        """
        try:
            params = request.jsonrequest

            # Validation paramètres requis
            self._validate_required_params(params, ['order_id'])

            # Validation order_id
            input_validator = request.env['input.validator']
            order_id = input_validator.validate_id(params.get('order_id'), 'order_id')

            partner = request.env.user.partner_id

            # Récupérer la commande
            order = request.env['sale.order'].sudo().browse(order_id)

            if not order.exists():
                return self._handle_error(
                    Exception('Commande non trouvée'),
                    "création Payment Intent"
                )

            # SÉCURITÉ: Vérifier que c'est bien la commande de l'utilisateur
            if order.partner_id.id != partner.id:
                _logger.warning(f"Tentative d'accès non autorisé à la commande {order_id} par {partner.id}")
                return self._handle_error(
                    Exception('Accès non autorisé à cette commande'),
                    "création Payment Intent"
                )

            # Vérifier que le montant est > 0
            if order.amount_total <= 0:
                return self._handle_error(
                    Exception('Le montant de la commande doit être supérieur à 0'),
                    "création Payment Intent"
                )

            # Récupérer le provider Stripe
            stripe_provider = request.env['payment.provider'].sudo().search([
                ('code', '=', 'stripe'),
                ('state', '=', 'enabled')
            ], limit=1)

            if not stripe_provider:
                _logger.error("Stripe provider non configuré ou désactivé")
                return self._handle_error(
                    Exception('Le paiement Stripe n\'est pas disponible pour le moment'),
                    "création Payment Intent"
                )

            # Créer la transaction de paiement Odoo
            tx = request.env['payment.transaction'].sudo().create({
                'provider_id': stripe_provider.id,
                'amount': order.amount_total,
                'currency_id': order.currency_id.id,
                'partner_id': partner.id,
                'sale_order_ids': [(6, 0, [order.id])],
                'reference': f'ORDER-{order.id}',
            })

            # Créer le Payment Intent via l'API Stripe
            # NOTE: Odoo 15+ a une intégration Stripe native
            # On utilise les méthodes Odoo plutôt que d'appeler Stripe directement
            payment_data = tx._create_stripe_payment_intent()

            _logger.info(f"Payment Intent créé avec succès pour commande {order_id} (transaction {tx.id})")

            return self._success_response({
                'client_secret': payment_data.get('client_secret'),
                'publishable_key': stripe_provider.stripe_publishable_key,
                'amount': order.amount_total,
                'currency': order.currency_id.name.lower(),
                'transaction_id': tx.id,
            })

        except Exception as e:
            return self._handle_error(e, "création Payment Intent")

    @http.route('/api/ecommerce/payment/stripe/confirm', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=300)  # 20 tentatives par 5 minutes (permettre retries pour problèmes réseau)
    def confirm_payment(self, **kwargs):
        """
        Confirme le paiement après que le client ait soumis sa carte via Stripe Elements.

        Body JSON:
        {
            "transaction_id": 123,
            "payment_intent_id": "pi_xxx"
        }

        Returns:
        {
            "success": true,
            "status": "succeeded",
            "order": {...}
        }
        """
        try:
            params = request.jsonrequest

            # Validation paramètres requis
            self._validate_required_params(params, ['transaction_id', 'payment_intent_id'])

            # Validation transaction_id
            input_validator = request.env['input.validator']
            transaction_id = input_validator.validate_id(params.get('transaction_id'), 'transaction_id')

            # Validation payment_intent_id (format Stripe: "pi_xxx")
            payment_intent_id = input_validator.validate_string(
                params.get('payment_intent_id'),
                field_name='payment_intent_id',
                min_length=3,
                max_length=100,
                required=True
            )

            if not payment_intent_id.startswith('pi_'):
                return self._handle_error(
                    Exception('Format payment_intent_id invalide (doit commencer par "pi_")'),
                    "confirmation paiement"
                )

            partner = request.env.user.partner_id

            # Récupérer la transaction
            tx = request.env['payment.transaction'].sudo().browse(transaction_id)

            if not tx.exists():
                return self._handle_error(
                    Exception('Transaction non trouvée'),
                    "confirmation paiement"
                )

            # SÉCURITÉ: Vérifier que c'est bien la transaction de l'utilisateur
            if tx.partner_id.id != partner.id:
                _logger.warning(f"Tentative d'accès non autorisé à la transaction {transaction_id} par {partner.id}")
                return self._handle_error(
                    Exception('Accès non autorisé à cette transaction'),
                    "confirmation paiement"
                )

            # Vérifier le statut du Payment Intent auprès de Stripe
            intent_status = tx._stripe_payment_intent_verify(payment_intent_id)

            if intent_status == 'succeeded':
                # Marquer la transaction comme validée
                tx._set_done()

                # Confirmer la commande si pas déjà fait
                for order in tx.sale_order_ids:
                    if order.state == 'draft':
                        order.action_confirm()

                _logger.info(f"Paiement confirmé avec succès pour transaction {transaction_id} (intent {payment_intent_id})")

                return self._success_response({
                    'status': 'succeeded',
                    'order': {
                        'id': tx.sale_order_ids[0].id,
                        'name': tx.sale_order_ids[0].name,
                        'state': tx.sale_order_ids[0].state,
                    },
                }, message='Paiement confirmé avec succès')

            elif intent_status == 'processing':
                _logger.info(f"Paiement en cours de traitement pour transaction {transaction_id}")
                return self._success_response({
                    'status': 'processing',
                }, message='Paiement en cours de traitement')

            else:
                # Payment failed or cancelled
                tx._set_error(f"Stripe payment {intent_status}")
                _logger.warning(f"Paiement échoué pour transaction {transaction_id}: {intent_status}")
                return self._handle_error(
                    Exception(f'Paiement {intent_status}'),
                    "confirmation paiement"
                )

        except Exception as e:
            return self._handle_error(e, "confirmation paiement")

    @http.route('/api/ecommerce/payment/stripe/webhook', type='http', auth='public', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)  # 100 webhooks par minute (Stripe peut retry en cas d'échec)
    def stripe_webhook(self, **kwargs):
        """
        Webhook Stripe pour gérer les événements asynchrones avec sécurité renforcée.

        Stripe envoie des événements comme:
        - payment_intent.succeeded
        - payment_intent.payment_failed
        - charge.refunded

        SÉCURITÉ: L'authentification se fait via signature HMAC, pas via auth Odoo.
        Chaque webhook est vérifié avec le webhook_secret Stripe.

        IMPORTANT: Configurer ce webhook dans le dashboard Stripe:
        https://dashboard.stripe.com/webhooks
        URL: https://yourdomain.com/api/ecommerce/payment/stripe/webhook
        """
        try:
            payload = request.httprequest.data
            sig_header = request.httprequest.headers.get('Stripe-Signature')

            # Validation: Vérifier que la payload existe
            if not payload:
                _logger.error("Webhook reçu sans payload")
                return request.make_response('Missing payload', status=400)

            if not sig_header:
                _logger.error("Webhook reçu sans signature")
                return request.make_response('Missing signature', status=400)

            # Récupérer le provider Stripe
            stripe_provider = request.env['payment.provider'].sudo().search([
                ('code', '=', 'stripe'),
                ('state', '=', 'enabled')
            ], limit=1)

            if not stripe_provider:
                _logger.error("Stripe provider non configuré ou désactivé")
                return request.make_response('Provider not configured', status=400)

            webhook_secret = stripe_provider.stripe_webhook_secret

            if not webhook_secret:
                _logger.error("Webhook secret non configuré dans le provider Stripe")
                return request.make_response('Webhook secret not configured', status=400)

            # SÉCURITÉ CRITIQUE: Vérifier la signature HMAC Stripe
            if not self._verify_stripe_signature(payload, sig_header, webhook_secret):
                _logger.error("Signature Stripe invalide - tentative de webhook frauduleux")
                return request.make_response('Invalid signature', status=400)

            # Parser l'événement
            try:
                event = json.loads(payload)
            except json.JSONDecodeError as e:
                _logger.error(f"Payload JSON invalide: {str(e)}")
                return request.make_response('Invalid JSON', status=400)

            event_type = event.get('type')
            event_data = event.get('data', {}).get('object', {})

            if not event_type:
                _logger.error("Event type manquant dans le webhook")
                return request.make_response('Missing event type', status=400)

            _logger.info(f"Webhook Stripe reçu et vérifié: {event_type}")

            # Traiter selon le type d'événement
            if event_type == 'payment_intent.succeeded':
                self._handle_payment_succeeded(event_data)
            elif event_type == 'payment_intent.payment_failed':
                self._handle_payment_failed(event_data)
            elif event_type == 'charge.refunded':
                self._handle_charge_refunded(event_data)
            else:
                _logger.info(f"Type d'événement non géré: {event_type}")

            return request.make_response('Success', status=200)

        except Exception as e:
            _logger.error(f"Erreur critique lors du traitement du webhook Stripe: {str(e)}", exc_info=True)
            return request.make_response(str(e), status=500)

    def _verify_stripe_signature(self, payload, sig_header, webhook_secret):
        """Vérifie la signature HMAC du webhook Stripe."""
        try:
            # Extraire timestamp et signature
            elements = sig_header.split(',')
            timestamp = None
            signature = None

            for element in elements:
                key, value = element.split('=')
                if key == 't':
                    timestamp = value
                elif key == 'v1':
                    signature = value

            if not timestamp or not signature:
                return False

            # Construire la chaîne signée
            signed_payload = f"{timestamp}.{payload.decode('utf-8')}"

            # Calculer la signature attendue
            expected_signature = hmac.new(
                webhook_secret.encode('utf-8'),
                signed_payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            # Comparer
            return hmac.compare_digest(signature, expected_signature)

        except Exception as e:
            _logger.error(f"Erreur vérification signature: {str(e)}")
            return False

    def _handle_payment_succeeded(self, payment_intent):
        """Traite l'événement payment_intent.succeeded avec logging renforcé."""
        try:
            # Trouver la transaction correspondante
            reference = payment_intent.get('metadata', {}).get('reference')
            payment_intent_id = payment_intent.get('id')

            if not reference:
                _logger.warning(f"Webhook payment_intent.succeeded sans reference dans metadata (intent: {payment_intent_id})")
                return

            tx = request.env['payment.transaction'].sudo().search([
                ('reference', '=', reference)
            ], limit=1)

            if tx:
                tx._set_done()
                # Confirmer les commandes liées
                confirmed_orders = []
                for order in tx.sale_order_ids:
                    if order.state == 'draft':
                        order.action_confirm()
                        confirmed_orders.append(order.name)

                _logger.info(
                    f"Transaction {tx.id} (ref: {reference}) marquée comme payée suite au webhook Stripe. "
                    f"Commandes confirmées: {confirmed_orders or 'aucune'}"
                )
            else:
                _logger.warning(f"Transaction non trouvée pour référence: {reference} (intent: {payment_intent_id})")

        except Exception as e:
            _logger.error(f"Erreur lors du traitement de payment_intent.succeeded: {str(e)}", exc_info=True)

    def _handle_payment_failed(self, payment_intent):
        """Traite l'événement payment_intent.payment_failed avec logging renforcé."""
        try:
            reference = payment_intent.get('metadata', {}).get('reference')
            payment_intent_id = payment_intent.get('id')

            if not reference:
                _logger.warning(f"Webhook payment_intent.payment_failed sans reference dans metadata (intent: {payment_intent_id})")
                return

            tx = request.env['payment.transaction'].sudo().search([
                ('reference', '=', reference)
            ], limit=1)

            if tx:
                error_message = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
                error_code = payment_intent.get('last_payment_error', {}).get('code', 'unknown')
                tx._set_error(error_message)
                _logger.warning(
                    f"Transaction {tx.id} (ref: {reference}) marquée comme échouée suite au webhook Stripe. "
                    f"Erreur: {error_message} (code: {error_code})"
                )
            else:
                _logger.warning(f"Transaction non trouvée pour référence: {reference} (intent: {payment_intent_id})")

        except Exception as e:
            _logger.error(f"Erreur lors du traitement de payment_intent.payment_failed: {str(e)}", exc_info=True)

    def _handle_charge_refunded(self, charge):
        """Traite l'événement charge.refunded avec logging renforcé."""
        try:
            payment_intent_id = charge.get('payment_intent')
            charge_id = charge.get('id')
            refund_amount = charge.get('amount_refunded', 0) / 100  # Stripe utilise les centimes

            if not payment_intent_id:
                _logger.warning(f"Webhook charge.refunded sans payment_intent_id (charge: {charge_id})")
                return

            tx = request.env['payment.transaction'].sudo().search([
                ('provider_reference', '=', payment_intent_id)
            ], limit=1)

            if tx:
                tx._set_canceled()
                _logger.info(
                    f"Transaction {tx.id} (intent: {payment_intent_id}) remboursée suite au webhook Stripe. "
                    f"Montant remboursé: {refund_amount} {tx.currency_id.name}"
                )
            else:
                _logger.warning(f"Transaction non trouvée pour payment_intent: {payment_intent_id} (charge: {charge_id})")

        except Exception as e:
            _logger.error(f"Erreur lors du traitement de charge.refunded: {str(e)}", exc_info=True)
