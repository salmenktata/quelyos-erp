# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EcommerceWishlistController(http.Controller):
    """Controller pour la wishlist."""

    @http.route('/api/ecommerce/wishlist', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_wishlist(self, **kwargs):
        """
        Récupère toute la wishlist du client.

        Returns:
        {
            "success": true,
            "count": 5,
            "items": [...]
        }
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.wishlist'].sudo().get_partner_wishlist(partner.id)

            return {
                'success': True,
                **result,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération de la wishlist: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/wishlist/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def add_to_wishlist(self, **kwargs):
        """
        Ajoute un produit à la wishlist.

        Body JSON:
        {
            "product_id": 123
        }

        Returns:
        {
            "success": true,
            "message": "Produit ajouté à la wishlist"
        }
        """
        try:
            params = request.jsonrequest
            product_id = params.get('product_id')

            if not product_id:
                return {
                    'success': False,
                    'error': 'product_id requis',
                }

            partner = request.env.user.partner_id
            result = request.env['product.wishlist'].sudo().add_to_wishlist(partner.id, product_id)

            return result

        except Exception as e:
            _logger.error(f"Erreur lors de l'ajout à la wishlist: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/wishlist/remove/<int:product_id>', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def remove_from_wishlist(self, product_id, **kwargs):
        """
        Retire un produit de la wishlist.

        Returns:
        {
            "success": true,
            "message": "Produit retiré de la wishlist"
        }
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.wishlist'].sudo().remove_from_wishlist(partner.id, product_id)

            return result

        except Exception as e:
            _logger.error(f"Erreur lors de la suppression de la wishlist: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/wishlist/check/<int:product_id>', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    def check_in_wishlist(self, product_id, **kwargs):
        """
        Vérifie si un produit est dans la wishlist.

        Returns:
        {
            "success": true,
            "in_wishlist": true
        }
        """
        try:
            partner = request.env.user.partner_id
            in_wishlist = request.env['product.wishlist'].sudo().is_in_wishlist(partner.id, product_id)

            return {
                'success': True,
                'in_wishlist': in_wishlist,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la vérification de la wishlist: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }


class EcommerceComparisonController(http.Controller):
    """Controller pour le comparateur de produits."""

    @http.route('/api/ecommerce/comparison', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_comparison(self, **kwargs):
        """
        Récupère tous les produits dans le comparateur.

        Returns:
        {
            "success": true,
            "count": 3,
            "max_items": 4,
            "products": [...]
        }
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().get_partner_comparison(partner.id)

            return {
                'success': True,
                **result,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération du comparateur: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/comparison/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def add_to_comparison(self, **kwargs):
        """
        Ajoute un produit au comparateur.

        Body JSON:
        {
            "product_id": 123
        }
        """
        try:
            params = request.jsonrequest
            product_id = params.get('product_id')

            if not product_id:
                return {
                    'success': False,
                    'error': 'product_id requis',
                }

            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().add_to_comparison(partner.id, product_id)

            return result

        except Exception as e:
            _logger.error(f"Erreur lors de l'ajout au comparateur: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/comparison/remove/<int:product_id>', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def remove_from_comparison(self, product_id, **kwargs):
        """
        Retire un produit du comparateur.
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().remove_from_comparison(partner.id, product_id)

            return result

        except Exception as e:
            _logger.error(f"Erreur lors de la suppression du comparateur: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/comparison/clear', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    def clear_comparison(self, **kwargs):
        """
        Vide complètement le comparateur.
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().clear_comparison(partner.id)

            return result

        except Exception as e:
            _logger.error(f"Erreur lors du vidage du comparateur: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }
