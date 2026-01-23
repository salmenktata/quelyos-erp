# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EcommerceCustomerController(http.Controller):
    """Controller pour l'espace client."""

    @http.route('/api/ecommerce/customer/profile', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
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

            return {
                'success': True,
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
                },
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération du profil: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/profile/update', type='json', auth='user', methods=['PUT', 'POST'], csrf=False, cors='*')
    def update_profile(self, **kwargs):
        """
        Met à jour le profil du client.

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

            # Champs autorisés à la modification
            allowed_fields = [
                'name', 'phone', 'mobile', 'street', 'street2',
                'city', 'zip', 'country_id', 'state_id'
            ]

            update_vals = {k: v for k, v in params.items() if k in allowed_fields}

            if update_vals:
                partner.write(update_vals)

            return {
                'success': True,
                'message': 'Profil mis à jour',
                'profile': self.get_profile()['profile'],
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la mise à jour du profil: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/orders', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
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

            limit = params.get('limit', 20)
            offset = params.get('offset', 0)
            state = params.get('state')

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

            return {
                'success': True,
                'orders': orders_data,
                'total': total,
                'limit': limit,
                'offset': offset,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des commandes: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/orders/<int:order_id>', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_order(self, order_id, **kwargs):
        """
        Récupère le détail d'une commande.

        Returns:
        {
            "success": true,
            "order": {...}
        }
        """
        try:
            partner = request.env.user.partner_id
            order = request.env['sale.order'].sudo().search([
                ('id', '=', order_id),
                ('partner_id', '=', partner.id),
            ], limit=1)

            if not order:
                return {
                    'success': False,
                    'error': 'Commande non trouvée',
                }

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

            return {
                'success': True,
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
                },
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération de la commande {order_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/addresses', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
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

            return {
                'success': True,
                'addresses': addresses_data,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des adresses: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/addresses/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def add_address(self, **kwargs):
        """
        Ajoute une nouvelle adresse.

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

            # Créer l'adresse
            new_address = request.env['res.partner'].sudo().create({
                **params,
                'parent_id': partner.id,
            })

            return {
                'success': True,
                'message': 'Adresse ajoutée',
                'address': {
                    'id': new_address.id,
                    'name': new_address.name,
                    'type': new_address.type,
                    'street': new_address.street or '',
                    'city': new_address.city or '',
                    'zip': new_address.zip or '',
                },
            }

        except Exception as e:
            _logger.error(f"Erreur lors de l'ajout d'adresse: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/addresses/<int:address_id>/update', type='json', auth='user', methods=['PUT', 'POST'], csrf=False, cors='*')
    def update_address(self, address_id, **kwargs):
        """
        Met à jour une adresse existante.
        """
        try:
            params = request.jsonrequest
            partner = request.env.user.partner_id

            # Vérifier que l'adresse appartient au client
            address = request.env['res.partner'].sudo().search([
                ('id', '=', address_id),
                '|',
                ('id', '=', partner.id),
                ('parent_id', '=', partner.id)
            ], limit=1)

            if not address:
                return {
                    'success': False,
                    'error': 'Adresse non trouvée',
                }

            address.write(params)

            return {
                'success': True,
                'message': 'Adresse mise à jour',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la mise à jour d'adresse: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/customer/addresses/<int:address_id>/delete', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def delete_address(self, address_id, **kwargs):
        """
        Supprime une adresse.
        """
        try:
            partner = request.env.user.partner_id

            # On ne peut pas supprimer l'adresse principale
            if address_id == partner.id:
                return {
                    'success': False,
                    'error': 'Impossible de supprimer l\'adresse principale',
                }

            address = request.env['res.partner'].sudo().search([
                ('id', '=', address_id),
                ('parent_id', '=', partner.id)
            ], limit=1)

            if not address:
                return {
                    'success': False,
                    'error': 'Adresse non trouvée',
                }

            address.unlink()

            return {
                'success': True,
                'message': 'Adresse supprimée',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la suppression d'adresse: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
