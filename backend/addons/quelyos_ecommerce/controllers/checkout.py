# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EcommerceCheckoutController(http.Controller):
    """Controller pour le processus de checkout."""

    def _get_cart(self):
        """Récupère le panier actif."""
        if request.session.uid:
            partner = request.env.user.partner_id
            cart = request.env['sale.order'].sudo().get_or_create_cart(partner_id=partner.id)
        else:
            session_id = request.session.sid
            cart = request.env['sale.order'].sudo().get_or_create_cart(session_id=session_id)
        return cart

    @http.route('/api/ecommerce/checkout/validate', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def validate_cart(self, **kwargs):
        """
        Valide que le panier peut être converti en commande.
        Vérifie stock, montant minimum, etc.

        Returns:
        {
            "valid": true/false,
            "errors": [],
            "cart": {...}
        }
        """
        try:
            cart = self._get_cart()

            if not cart:
                return {
                    'success': False,
                    'valid': False,
                    'errors': ['Panier vide'],
                }

            validation_result = cart.validate_cart()

            return {
                'success': True,
                **validation_result,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la validation du panier: {str(e)}")
            return {
                'success': False,
                'valid': False,
                'errors': [str(e)],
            }

    @http.route('/api/ecommerce/checkout/shipping', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def calculate_shipping(self, **kwargs):
        """
        Calcule les frais de livraison.

        Body JSON:
        {
            "delivery_method_id": 1,
            "address": {
                "street": "...",
                "city": "...",
                "zip": "...",
                "country_id": 75
            }
        }

        Returns:
        {
            "success": true,
            "shipping_cost": 10.00,
            "delivery_method": {...}
        }
        """
        try:
            params = request.jsonrequest
            cart = self._get_cart()

            if not cart:
                return {
                    'success': False,
                    'error': 'Panier non trouvé',
                }

            delivery_method_id = params.get('delivery_method_id')

            if not delivery_method_id:
                return {
                    'success': False,
                    'error': 'delivery_method_id requis',
                }

            # Récupérer la méthode de livraison
            delivery_method = request.env['delivery.carrier'].sudo().browse(delivery_method_id)

            if not delivery_method.exists():
                return {
                    'success': False,
                    'error': 'Méthode de livraison non trouvée',
                }

            # Mettre à jour l'adresse si fournie
            address_data = params.get('address')
            if address_data:
                partner = cart.partner_id
                if partner:
                    partner.write(address_data)

            # Calculer les frais
            shipping_cost = delivery_method.get_shipping_price_from_so(cart)[0]

            return {
                'success': True,
                'shipping_cost': shipping_cost,
                'delivery_method': {
                    'id': delivery_method.id,
                    'name': delivery_method.name,
                    'description': delivery_method.delivery_description or '',
                },
            }

        except Exception as e:
            _logger.error(f"Erreur lors du calcul de livraison: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/checkout/confirm', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def confirm_order(self, **kwargs):
        """
        Confirme la commande et lance le processus de paiement.

        Body JSON:
        {
            "delivery_method_id": 1,
            "payment_method_id": 1,
            "billing_address": {...},
            "shipping_address": {...},
            "notes": "..."
        }

        Returns:
        {
            "success": true,
            "order": {...},
            "payment_url": "https://..."  # Si paiement en ligne
        }
        """
        try:
            params = request.jsonrequest
            cart = self._get_cart()

            if not cart:
                return {
                    'success': False,
                    'error': 'Panier non trouvé',
                }

            # Valider le panier
            validation = cart.validate_cart()
            if not validation['valid']:
                return {
                    'success': False,
                    'error': 'Panier invalide',
                    'errors': validation['errors'],
                }

            # Mettre à jour les informations de commande
            partner = request.env.user.partner_id

            # Adresse de facturation
            billing_address = params.get('billing_address')
            if billing_address:
                billing_partner = request.env['res.partner'].sudo().create({
                    **billing_address,
                    'parent_id': partner.id,
                    'type': 'invoice',
                })
                cart.partner_invoice_id = billing_partner

            # Adresse de livraison
            shipping_address = params.get('shipping_address')
            if shipping_address:
                shipping_partner = request.env['res.partner'].sudo().create({
                    **shipping_address,
                    'parent_id': partner.id,
                    'type': 'delivery',
                })
                cart.partner_shipping_id = shipping_partner

            # Méthode de livraison
            delivery_method_id = params.get('delivery_method_id')
            if delivery_method_id:
                delivery_carrier = request.env['delivery.carrier'].sudo().browse(delivery_method_id)
                cart.set_delivery_line(delivery_carrier, delivery_carrier.get_shipping_price_from_so(cart)[0])

            # Notes
            notes = params.get('notes')
            if notes:
                cart.frontend_notes = notes

            # Confirmer la commande
            cart.action_confirm()

            # Méthode de paiement
            payment_method_id = params.get('payment_method_id')
            payment_url = None

            if payment_method_id:
                payment_provider = request.env['payment.provider'].sudo().browse(payment_method_id)
                if payment_provider.exists():
                    # Créer transaction de paiement
                    tx = request.env['payment.transaction'].sudo().create({
                        'provider_id': payment_provider.id,
                        'amount': cart.amount_total,
                        'currency_id': cart.currency_id.id,
                        'partner_id': partner.id,
                        'sale_order_ids': [(6, 0, [cart.id])],
                    })

                    # Générer l'URL de paiement
                    payment_url = tx._get_processing_values().get('redirect_form_html')

            return {
                'success': True,
                'order': {
                    'id': cart.id,
                    'name': cart.name,
                    'amount_total': cart.amount_total,
                    'state': cart.state,
                },
                'payment_url': payment_url,
                'message': 'Commande confirmée',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la confirmation de commande: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/payment-methods', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_payment_methods(self, **kwargs):
        """
        Liste les méthodes de paiement disponibles.

        Returns:
        {
            "payment_methods": [
                {
                    "id": 1,
                    "name": "Carte bancaire",
                    "type": "online",
                    ...
                }
            ]
        }
        """
        try:
            payment_providers = request.env['payment.provider'].sudo().search([
                ('state', '=', 'enabled')
            ])

            methods = []
            for provider in payment_providers:
                methods.append({
                    'id': provider.id,
                    'name': provider.name,
                    'code': provider.code,
                    'image_url': f'/web/image/payment.provider/{provider.id}/image_128' if provider.image_128 else None,
                })

            return {
                'success': True,
                'payment_methods': methods,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des méthodes de paiement: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/delivery-methods', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_delivery_methods(self, **kwargs):
        """
        Liste les méthodes de livraison disponibles.

        Returns:
        {
            "delivery_methods": [...]
        }
        """
        try:
            delivery_carriers = request.env['delivery.carrier'].sudo().search([])

            methods = []
            for carrier in delivery_carriers:
                methods.append({
                    'id': carrier.id,
                    'name': carrier.name,
                    'description': carrier.delivery_description or '',
                    'fixed_price': carrier.fixed_price if carrier.delivery_type == 'fixed' else None,
                })

            return {
                'success': True,
                'delivery_methods': methods,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des méthodes de livraison: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
