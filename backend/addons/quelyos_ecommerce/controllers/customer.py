# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceCustomerController(BaseEcommerceController):
    """Controller pour l'espace client avec sécurité renforcée."""

    @http.route('/api/ecommerce/customer/profile', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)
    def get_profile(self, **kwargs):
        """
        Récupère le profil du client.

        Returns:
        {
            "success": true,
            "profile": {
                "id": 123,
                "name": "John Doe",
                "email": "john@example.com",
                ...
            }
        }
        """
        try:
            partner = request.env.user.partner_id

            return self._success_response({
                'profile': {
                    'id': partner.id,
                    'name': partner.name,
                    'email': partner.email,
                    'phone': partner.phone or '',
                    'mobile': partner.mobile or '',
                    'street': partner.street or '',
                    'street2': partner.street2 or '',
                    'city': partner.city or '',
                    'zip': partner.zip or '',
                    'country_id': partner.country_id.id if partner.country_id else None,
                    'country_name': partner.country_id.name if partner.country_id else None,
                    'state_id': partner.state_id.id if partner.state_id else None,
                    'state_name': partner.state_id.name if partner.state_id else None,
                }
            })

        except Exception as e:
            return self._handle_error(e, "récupération du profil")

    @http.route('/api/ecommerce/customer/profile/update', type='json', auth='user', methods=['PUT', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
    def update_profile(self, **kwargs):
        """
        Met à jour le profil du client avec validation stricte.

        Body JSON:
        {
            "name": "John Doe",
            "phone": "+33612345678",
            "street": "123 Main St",
            ...
        }
        """
        try:
            params = request.jsonrequest
            partner = request.env.user.partner_id

            # SÉCURITÉ: Utiliser PartnerValidator pour filtrer et valider les données
            partner_validator = request.env['partner.validator']
            validated_data = partner_validator.validate_update_data(params, partner.id)

            if validated_data:
                partner.sudo().write(validated_data)
                _logger.info(f"Profil mis à jour pour partner {partner.id}")

            return self._success_response(
                data={'profile': self.get_profile()['profile']},
                message='Profil mis à jour'
            )

        except Exception as e:
            return self._handle_error(e, "mise à jour du profil")

    @http.route('/api/ecommerce/customer/orders', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
    def get_orders(self, **kwargs):
        """
        Liste toutes les commandes du client.

        Query params:
        - limit: int (default 20)
        - offset: int (default 0)
        - state: str ('sale', 'done', 'cancel', etc.)

        Returns:
        {
            "success": true,
            "orders": [...],
            "total": 15
        }
        """
        try:
            params = request.jsonrequest or {}
            partner = request.env.user.partner_id

            # Validation pagination
            input_validator = request.env['input.validator']
            limit = input_validator.validate_positive_int(params.get('limit', 20), 'limit')
            offset = input_validator.validate_positive_int(params.get('offset', 0), 'offset')

            # Limiter pour éviter abus
            if limit > 100:
                limit = 100

            # Validation state (whitelist)
            state = params.get('state')
            allowed_states = ['sale', 'done', 'cancel', 'sent']
            if state and state not in allowed_states:
                state = None

            domain = [
                ('partner_id', '=', partner.id),
                ('state', '!=', 'draft'),  # Exclure les paniers
            ]

            if state:
                domain.append(('state', '=', state))

            orders = request.env['sale.order'].sudo().search(
                domain,
                limit=limit,
                offset=offset,
                order='date_order desc'
            )

            total = request.env['sale.order'].sudo().search_count(domain)

            orders_data = []
            for order in orders:
                orders_data.append({
                    'id': order.id,
                    'name': order.name,
                    'date_order': order.date_order.isoformat() if order.date_order else None,
                    'state': order.state,
                    'amount_total': order.amount_total,
                    'currency': {
                        'id': order.currency_id.id,
                        'symbol': order.currency_id.symbol,
                    },
                    'line_count': len(order.order_line),
                    'item_count': sum(line.product_uom_qty for line in order.order_line),
                })

            return self._success_response({
                'orders': orders_data,
                'total': total,
                'limit': limit,
                'offset': offset,
            })

        except Exception as e:
            return self._handle_error(e, "récupération des commandes")

    @http.route('/api/ecommerce/customer/orders/<int:order_id>', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
    def get_order(self, order_id, **kwargs):
        """
        Récupère le détail d'une commande avec vérification de propriété.

        Returns:
        {
            "success": true,
            "order": {...}
        }
        """
        try:
            # Validation order_id
            input_validator = request.env['input.validator']
            order_id = input_validator.validate_id(order_id, 'order_id')

            partner = request.env.user.partner_id

            # SÉCURITÉ: Vérifier que la commande appartient au client
            order = request.env['sale.order'].sudo().search([
                ('id', '=', order_id),
                ('partner_id', '=', partner.id),
            ], limit=1)

            if not order:
                return self._handle_error(
                    Exception('Commande non trouvée ou accès refusé'),
                    "récupération de la commande"
                )

            lines = []
            for line in order.order_line:
                lines.append({
                    'id': line.id,
                    'product_id': line.product_id.id,
                    'product_name': line.product_id.name,
                    'image_url': f'/web/image/product.product/{line.product_id.id}/image_128',
                    'quantity': line.product_uom_qty,
                    'price_unit': line.price_unit,
                    'price_subtotal': line.price_subtotal,
                    'price_total': line.price_total,
                })

            return self._success_response({
                'order': {
                    'id': order.id,
                    'name': order.name,
                    'date_order': order.date_order.isoformat() if order.date_order else None,
                    'state': order.state,
                    'lines': lines,
                    'amount_untaxed': order.amount_untaxed,
                    'amount_tax': order.amount_tax,
                    'amount_total': order.amount_total,
                    'currency': {
                        'id': order.currency_id.id,
                        'symbol': order.currency_id.symbol,
                    },
                    'partner_invoice': {
                        'name': order.partner_invoice_id.name,
                        'street': order.partner_invoice_id.street or '',
                        'city': order.partner_invoice_id.city or '',
                        'zip': order.partner_invoice_id.zip or '',
                    } if order.partner_invoice_id else None,
                    'partner_shipping': {
                        'name': order.partner_shipping_id.name,
                        'street': order.partner_shipping_id.street or '',
                        'city': order.partner_shipping_id.city or '',
                        'zip': order.partner_shipping_id.zip or '',
                    } if order.partner_shipping_id else None,
                }
            })

        except Exception as e:
            return self._handle_error(e, f"récupération de la commande {order_id}")

    @http.route('/api/ecommerce/customer/addresses', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
    def get_addresses(self, **kwargs):
        """
        Liste les adresses du client.

        Returns:
        {
            "addresses": [...]
        }
        """
        try:
            partner = request.env.user.partner_id

            # Récupérer toutes les adresses enfants
            addresses = request.env['res.partner'].sudo().search([
                ('parent_id', '=', partner.id),
                ('type', 'in', ['delivery', 'invoice', 'other'])
            ])

            # Inclure l'adresse principale
            all_addresses = [partner] + list(addresses)

            addresses_data = []
            for addr in all_addresses:
                addresses_data.append({
                    'id': addr.id,
                    'name': addr.name,
                    'type': addr.type if addr != partner else 'contact',
                    'street': addr.street or '',
                    'street2': addr.street2 or '',
                    'city': addr.city or '',
                    'zip': addr.zip or '',
                    'country_id': addr.country_id.id if addr.country_id else None,
                    'country_name': addr.country_id.name if addr.country_id else None,
                    'phone': addr.phone or '',
                    'is_main': addr == partner,
                })

            return self._success_response({
                'addresses': addresses_data
            })

        except Exception as e:
            return self._handle_error(e, "récupération des adresses")

    @http.route('/api/ecommerce/customer/addresses/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=10, window=300)  # 10 adresses max par 5 minutes
    def add_address(self, **kwargs):
        """
        Ajoute une nouvelle adresse avec validation stricte.

        Body JSON:
        {
            "name": "Domicile",
            "type": "delivery",
            "street": "123 Main St",
            ...
        }
        """
        try:
            params = request.jsonrequest
            partner = request.env.user.partner_id

            # SÉCURITÉ CRITIQUE: Valider avec PartnerValidator pour éviter mass assignment
            partner_validator = request.env['partner.validator']
            validated_address = partner_validator.validate_address_data(params)

            # Forcer parent_id pour sécurité
            validated_address['parent_id'] = partner.id

            # Créer l'adresse avec données validées seulement
            new_address = request.env['res.partner'].sudo().create(validated_address)

            _logger.info(f"Nouvelle adresse créée: {new_address.id} pour partner {partner.id}")

            return self._success_response(
                data={
                    'address': {
                        'id': new_address.id,
                        'name': new_address.name,
                        'type': new_address.type,
                        'street': new_address.street or '',
                        'city': new_address.city or '',
                        'zip': new_address.zip or '',
                    }
                },
                message='Adresse ajoutée'
            )

        except Exception as e:
            return self._handle_error(e, "ajout d'adresse")

    @http.route('/api/ecommerce/customer/addresses/<int:address_id>/update', type='json', auth='user', methods=['PUT', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
    def update_address(self, address_id, **kwargs):
        """
        Met à jour une adresse existante avec validation stricte.
        """
        try:
            params = request.jsonrequest
            partner = request.env.user.partner_id

            # Validation address_id
            input_validator = request.env['input.validator']
            address_id = input_validator.validate_id(address_id, 'address_id')

            # SÉCURITÉ: Vérifier que l'adresse appartient au client
            address = request.env['res.partner'].sudo().search([
                ('id', '=', address_id),
                '|',
                ('id', '=', partner.id),
                ('parent_id', '=', partner.id)
            ], limit=1)

            if not address:
                return self._handle_error(
                    Exception('Adresse non trouvée ou accès refusé'),
                    "mise à jour d'adresse"
                )

            # SÉCURITÉ CRITIQUE: Valider avec PartnerValidator au lieu d'utiliser params directement
            partner_validator = request.env['partner.validator']
            validated_data = partner_validator.validate_update_data(params, address.id)

            if validated_data:
                address.sudo().write(validated_data)
                _logger.info(f"Adresse {address_id} mise à jour")

            return self._success_response(
                message='Adresse mise à jour'
            )

        except Exception as e:
            return self._handle_error(e, "mise à jour d'adresse")

    @http.route('/api/ecommerce/customer/addresses/<int:address_id>/delete', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
    def delete_address(self, address_id, **kwargs):
        """
        Supprime une adresse avec vérifications de sécurité.
        """
        try:
            partner = request.env.user.partner_id

            # Validation address_id
            input_validator = request.env['input.validator']
            address_id = input_validator.validate_id(address_id, 'address_id')

            # SÉCURITÉ: On ne peut pas supprimer l'adresse principale
            if address_id == partner.id:
                return self._handle_error(
                    Exception('Impossible de supprimer l\'adresse principale'),
                    "suppression d'adresse"
                )

            # SÉCURITÉ: Vérifier que l'adresse appartient au client
            address = request.env['res.partner'].sudo().search([
                ('id', '=', address_id),
                ('parent_id', '=', partner.id)
            ], limit=1)

            if not address:
                return self._handle_error(
                    Exception('Adresse non trouvée ou accès refusé'),
                    "suppression d'adresse"
                )

            address.unlink()
            _logger.info(f"Adresse {address_id} supprimée")

            return self._success_response(
                message='Adresse supprimée'
            )

        except Exception as e:
            return self._handle_error(e, "suppression d'adresse")
