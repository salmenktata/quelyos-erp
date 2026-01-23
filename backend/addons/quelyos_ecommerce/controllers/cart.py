# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EcommerceCartController(http.Controller):
    """Controller pour l'API Panier."""

    def _get_cart(self):
        """Récupère ou crée le panier actif."""
        if request.session.uid:
            # Utilisateur authentifié
            partner = request.env.user.partner_id
            cart = request.env['sale.order'].sudo().get_or_create_cart(
                partner_id=partner.id
            )
        else:
            # Utilisateur invité (session ID)
            session_id = request.session.sid
            cart = request.env['sale.order'].sudo().get_or_create_cart(
                session_id=session_id
            )

        return cart

    @http.route('/api/ecommerce/cart', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_cart(self, **kwargs):
        """
        Récupère le panier actuel.

        Returns:
        {
            "success": true,
            "cart": {
                "id": 123,
                "lines": [...],
                "amount_total": 150.00,
                ...
            }
        }
        """
        try:
            cart = self._get_cart()

            if not cart:
                return {
                    'success': True,
                    'cart': {
                        'id': None,
                        'lines': [],
                        'amount_total': 0,
                        'amount_untaxed': 0,
                        'amount_tax': 0,
                        'line_count': 0,
                        'item_count': 0,
                    },
                }

            return {
                'success': True,
                'cart': cart.get_cart_data(),
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération du panier: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/cart/add', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def add_to_cart(self, **kwargs):
        """
        Ajoute un produit au panier.

        Body JSON:
        {
            "product_id": 123,
            "quantity": 2
        }

        Returns:
        {
            "success": true,
            "cart": {...},
            "message": "Produit ajouté au panier"
        }
        """
        try:
            params = request.jsonrequest
            product_id = params.get('product_id')
            quantity = params.get('quantity', 1)

            if not product_id:
                return {
                    'success': False,
                    'error': 'product_id requis',
                }

            # Vérifier que le produit existe
            product = request.env['product.product'].sudo().browse(product_id)
            if not product.exists():
                return {
                    'success': False,
                    'error': 'Produit non trouvé',
                }

            # Vérifier stock disponible
            if product.type == 'product':
                if product.qty_available < quantity:
                    return {
                        'success': False,
                        'error': f'Stock insuffisant. Disponible: {int(product.qty_available)}',
                    }

            # Récupérer ou créer le panier
            cart = self._get_cart()

            # Ajouter la ligne
            cart_data = cart.add_cart_line(product_id, quantity)

            return {
                'success': True,
                'cart': cart_data,
                'message': 'Produit ajouté au panier',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de l'ajout au panier: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/cart/update/<int:line_id>', type='json', auth='public', methods=['PUT', 'POST'], csrf=False, cors='*')
    def update_cart_line(self, line_id, **kwargs):
        """
        Met à jour la quantité d'une ligne du panier.

        Body JSON:
        {
            "quantity": 3
        }

        Returns:
        {
            "success": true,
            "cart": {...}
        }
        """
        try:
            params = request.jsonrequest
            quantity = params.get('quantity')

            if quantity is None:
                return {
                    'success': False,
                    'error': 'quantity requise',
                }

            if quantity < 0:
                return {
                    'success': False,
                    'error': 'La quantité doit être positive',
                }

            # Récupérer le panier
            cart = self._get_cart()

            if not cart:
                return {
                    'success': False,
                    'error': 'Panier non trouvé',
                }

            # Vérifier que la ligne appartient au panier
            line = cart.order_line.filtered(lambda l: l.id == line_id)
            if not line:
                return {
                    'success': False,
                    'error': 'Ligne non trouvée dans le panier',
                }

            # Vérifier stock si augmentation de quantité
            if quantity > line.product_uom_qty:
                if line.product_id.type == 'product':
                    needed = quantity - line.product_uom_qty
                    if line.product_id.qty_available < needed:
                        return {
                            'success': False,
                            'error': f'Stock insuffisant. Disponible: {int(line.product_id.qty_available)}',
                        }

            # Mettre à jour la quantité
            cart_data = cart.update_cart_line(line_id, quantity)

            message = 'Ligne supprimée' if quantity == 0 else 'Quantité mise à jour'

            return {
                'success': True,
                'cart': cart_data,
                'message': message,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la mise à jour du panier: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/cart/remove/<int:line_id>', type='json', auth='public', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def remove_cart_line(self, line_id, **kwargs):
        """
        Supprime une ligne du panier.

        Returns:
        {
            "success": true,
            "cart": {...},
            "message": "Ligne supprimée"
        }
        """
        try:
            cart = self._get_cart()

            if not cart:
                return {
                    'success': False,
                    'error': 'Panier non trouvé',
                }

            # Supprimer la ligne
            cart_data = cart.remove_cart_line(line_id)

            return {
                'success': True,
                'cart': cart_data,
                'message': 'Produit retiré du panier',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la suppression de la ligne: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/cart/clear', type='json', auth='public', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def clear_cart(self, **kwargs):
        """
        Vide complètement le panier.

        Returns:
        {
            "success": true,
            "message": "Panier vidé"
        }
        """
        try:
            cart = self._get_cart()

            if cart:
                cart.clear_cart()

            return {
                'success': True,
                'message': 'Panier vidé',
                'cart': {
                    'id': None,
                    'lines': [],
                    'amount_total': 0,
                    'line_count': 0,
                    'item_count': 0,
                },
            }

        except Exception as e:
            _logger.error(f"Erreur lors du vidage du panier: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/cart/count', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_cart_count(self, **kwargs):
        """
        Retourne le nombre d'articles dans le panier (rapide).

        Returns:
        {
            "success": true,
            "count": 5
        }
        """
        try:
            cart = self._get_cart()

            if not cart:
                return {
                    'success': True,
                    'count': 0,
                }

            count = sum(line.product_uom_qty for line in cart.order_line)

            return {
                'success': True,
                'count': int(count),
            }

        except Exception as e:
            _logger.error(f"Erreur lors du comptage du panier: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'count': 0,
            }
