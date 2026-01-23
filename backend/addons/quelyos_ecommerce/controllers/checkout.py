# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceCheckoutController(BaseEcommerceController):
    """Controller pour le processus de checkout avec sécurité renforcée."""

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
    @rate_limit(limit=30, window=60)
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

            if not cart or not cart.order_line:
                return self._success_response({
                    'valid': False,
                    'errors': ['Panier vide'],
                })

            validation_result = cart.validate_cart()

            return self._success_response(validation_result)

        except Exception as e:
            return self._handle_error(e, "validation du panier")

    @http.route('/api/ecommerce/checkout/shipping', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
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
                return self._handle_error(
                    Exception('Panier non trouvé'),
                    "calcul de livraison"
                )

            # Validation delivery_method_id
            self._validate_required_params(params, ['delivery_method_id'])

            input_validator = request.env['input.validator']
            delivery_method_id = input_validator.validate_id(
                params.get('delivery_method_id'),
                'delivery_method_id'
            )

            # Récupérer la méthode de livraison
            delivery_method = request.env['delivery.carrier'].sudo().browse(delivery_method_id)

            if not delivery_method.exists():
                return self._handle_error(
                    Exception('Méthode de livraison non trouvée'),
                    "calcul de livraison"
                )

            # Valider et mettre à jour l'adresse si fournie
            address_data = params.get('address')
            if address_data:
                partner = cart.partner_id
                if partner:
                    # Valider les données d'adresse avec PartnerValidator
                    partner_validator = request.env['partner.validator']
                    validated_address = partner_validator.validate_update_data(address_data, partner.id)
                    partner.sudo().write(validated_address)

            # Calculer les frais
            shipping_cost = delivery_method.get_shipping_price_from_so(cart)[0]

            _logger.info(f"Frais de livraison calculés: {shipping_cost} pour commande {cart.id}")

            return self._success_response({
                'shipping_cost': shipping_cost,
                'delivery_method': {
                    'id': delivery_method.id,
                    'name': delivery_method.name,
                    'description': delivery_method.delivery_description or '',
                },
            })

        except Exception as e:
            return self._handle_error(e, "calcul de livraison")

    @http.route('/api/ecommerce/checkout/confirm', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=5, window=300)  # 5 confirmations max par 5 minutes (protection spam)
    def confirm_order(self, **kwargs):
        """
        Confirme la commande et lance le processus de paiement avec validation sécurisée.

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

            if not cart or not cart.order_line:
                return self._handle_error(
                    Exception('Panier non trouvé ou vide'),
                    "confirmation de commande"
                )

            # Valider le panier
            validation = cart.validate_cart()
            if not validation['valid']:
                return self._handle_error(
                    Exception(f"Panier invalide: {', '.join(validation['errors'])}"),
                    "confirmation de commande"
                )

            partner = request.env.user.partner_id
            partner_validator = request.env['partner.validator']
            input_validator = request.env['input.validator']

            # SÉCURITÉ: Valider et créer adresse de facturation avec whitelist
            billing_address = params.get('billing_address')
            if billing_address:
                # Validation stricte avec PartnerValidator
                validated_billing = partner_validator.validate_address_data(billing_address)
                validated_billing['parent_id'] = partner.id
                validated_billing['type'] = 'invoice'

                billing_partner = request.env['res.partner'].sudo().create(validated_billing)
                cart.partner_invoice_id = billing_partner
                _logger.info(f"Adresse de facturation créée: {billing_partner.id}")

            # SÉCURITÉ: Valider et créer adresse de livraison avec whitelist
            shipping_address = params.get('shipping_address')
            if shipping_address:
                # Validation stricte avec PartnerValidator
                validated_shipping = partner_validator.validate_address_data(shipping_address)
                validated_shipping['parent_id'] = partner.id
                validated_shipping['type'] = 'delivery'

                shipping_partner = request.env['res.partner'].sudo().create(validated_shipping)
                cart.partner_shipping_id = shipping_partner
                _logger.info(f"Adresse de livraison créée: {shipping_partner.id}")

            # Méthode de livraison
            delivery_method_id = params.get('delivery_method_id')
            if delivery_method_id:
                delivery_method_id = input_validator.validate_id(delivery_method_id, 'delivery_method_id')
                delivery_carrier = request.env['delivery.carrier'].sudo().browse(delivery_method_id)

                if delivery_carrier.exists():
                    shipping_cost = delivery_carrier.get_shipping_price_from_so(cart)[0]
                    cart.set_delivery_line(delivery_carrier, shipping_cost)
                    _logger.info(f"Méthode de livraison appliquée: {delivery_carrier.name}")

            # Notes (sanitize)
            notes = params.get('notes')
            if notes:
                notes_str = input_validator.validate_string(notes, field_name='notes', max_length=500)
                cart.frontend_notes = notes_str

            # Confirmer la commande
            cart.action_confirm()
            _logger.info(f"Commande confirmée: {cart.name} (id={cart.id})")

            # Méthode de paiement
            payment_method_id = params.get('payment_method_id')
            payment_url = None

            if payment_method_id:
                payment_method_id = input_validator.validate_id(payment_method_id, 'payment_method_id')
                payment_provider = request.env['payment.provider'].sudo().browse(payment_method_id)

                if payment_provider.exists() and payment_provider.state == 'enabled':
                    # Créer transaction de paiement
                    tx = request.env['payment.transaction'].sudo().create({
                        'provider_id': payment_provider.id,
                        'amount': cart.amount_total,
                        'currency_id': cart.currency_id.id,
                        'partner_id': partner.id,
                        'sale_order_ids': [(6, 0, [cart.id])],
                    })

                    # Générer l'URL de paiement
                    payment_values = tx._get_processing_values()
                    payment_url = payment_values.get('redirect_form_html')
                    _logger.info(f"Transaction de paiement créée: {tx.id}")

            return self._success_response(
                data={
                    'order': {
                        'id': cart.id,
                        'name': cart.name,
                        'amount_total': cart.amount_total,
                        'state': cart.state,
                    },
                    'payment_url': payment_url,
                },
                message='Commande confirmée'
            )

        except Exception as e:
            return self._handle_error(e, "confirmation de commande")

    @http.route('/api/ecommerce/payment-methods', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
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

            return self._success_response({
                'payment_methods': methods
            })

        except Exception as e:
            return self._handle_error(e, "récupération des méthodes de paiement")

    @http.route('/api/ecommerce/delivery-methods', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
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

            return self._success_response({
                'delivery_methods': methods
            })

        except Exception as e:
            return self._handle_error(e, "récupération des méthodes de livraison")
