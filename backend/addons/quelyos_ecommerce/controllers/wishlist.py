# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceWishlistController(BaseEcommerceController):
    """Controller pour la wishlist avec sécurité renforcée."""

    @http.route('/api/ecommerce/wishlist', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)
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

            return self._success_response(result)

        except Exception as e:
            return self._handle_error(e, "récupération de la wishlist")

    @http.route('/api/ecommerce/wishlist/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
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

            # Validation product_id
            self._validate_required_params(params, ['product_id'])

            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(params.get('product_id'), 'product_id')

            partner = request.env.user.partner_id
            result = request.env['product.wishlist'].sudo().add_to_wishlist(partner.id, product_id)

            _logger.info(f"Produit {product_id} ajouté à la wishlist de {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "ajout à la wishlist")

    @http.route('/api/ecommerce/wishlist/remove/<int:product_id>', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
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
            # Validation product_id
            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(product_id, 'product_id')

            partner = request.env.user.partner_id
            result = request.env['product.wishlist'].sudo().remove_from_wishlist(partner.id, product_id)

            _logger.info(f"Produit {product_id} retiré de la wishlist de {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "suppression de la wishlist")

    @http.route('/api/ecommerce/wishlist/check/<int:product_id>', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)
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
            # Validation product_id
            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(product_id, 'product_id')

            partner = request.env.user.partner_id
            in_wishlist = request.env['product.wishlist'].sudo().is_in_wishlist(partner.id, product_id)

            return self._success_response({
                'in_wishlist': in_wishlist
            })

        except Exception as e:
            return self._handle_error(e, "vérification de la wishlist")


class EcommerceComparisonController(BaseEcommerceController):
    """Controller pour le comparateur de produits avec sécurité renforcée."""

    @http.route('/api/ecommerce/comparison', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)
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

            return self._success_response(result)

        except Exception as e:
            return self._handle_error(e, "récupération du comparateur")

    @http.route('/api/ecommerce/comparison/add', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
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

            # Validation product_id
            self._validate_required_params(params, ['product_id'])

            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(params.get('product_id'), 'product_id')

            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().add_to_comparison(partner.id, product_id)

            _logger.info(f"Produit {product_id} ajouté au comparateur de {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "ajout au comparateur")

    @http.route('/api/ecommerce/comparison/remove/<int:product_id>', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
    def remove_from_comparison(self, product_id, **kwargs):
        """
        Retire un produit du comparateur.
        """
        try:
            # Validation product_id
            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(product_id, 'product_id')

            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().remove_from_comparison(partner.id, product_id)

            _logger.info(f"Produit {product_id} retiré du comparateur de {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "suppression du comparateur")

    @http.route('/api/ecommerce/comparison/clear', type='json', auth='user', methods=['DELETE', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=10, window=60)
    def clear_comparison(self, **kwargs):
        """
        Vide complètement le comparateur.
        """
        try:
            partner = request.env.user.partner_id
            result = request.env['product.comparison'].sudo().clear_comparison(partner.id)

            _logger.info(f"Comparateur vidé pour {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "vidage du comparateur")
