# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceReviewsController(BaseEcommerceController):
    """Controller pour les avis produits avec sécurité renforcée."""

    @http.route('/api/ecommerce/products/<int:product_id>/reviews', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=100, window=60)
    def get_product_reviews(self, product_id, limit=10, offset=0, rating_filter=None, **kwargs):
        """
        Récupère les avis d'un produit.

        Query params:
        - limit: Nombre d'avis (défaut 10)
        - offset: Pagination
        - rating_filter: Filtrer par note (1-5)

        Returns:
        {
            "success": true,
            "reviews": [...],
            "total": 42,
            "avg_rating": 4.2,
            "review_count": 42,
            "distribution": {5: 20, 4: 15, 3: 5, 2: 1, 1: 1}
        }
        """
        try:
            # Validation product_id
            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(product_id, 'product_id')

            # Validation pagination
            limit = input_validator.validate_positive_int(limit, 'limit')
            offset = input_validator.validate_positive_int(offset, 'offset')

            # Limiter pour éviter abus
            if limit > 100:
                limit = 100

            # Validation rating_filter (whitelist 1-5)
            if rating_filter:
                rating_filter = input_validator.validate_positive_int(rating_filter, 'rating_filter')
                if rating_filter < 1 or rating_filter > 5:
                    rating_filter = None

            product = request.env['product.template'].sudo().browse(product_id)

            if not product.exists():
                return self._handle_error(
                    Exception('Produit non trouvé'),
                    "récupération avis"
                )

            reviews_data = product.get_reviews_data(
                limit=limit,
                offset=offset,
                rating_filter=rating_filter
            )

            return self._success_response(reviews_data)

        except Exception as e:
            return self._handle_error(e, "récupération avis")

    @http.route('/api/ecommerce/reviews/submit', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=5, window=3600)  # 5 avis par heure max (protection spam)
    def submit_review(self, **kwargs):
        """
        Soumet un nouvel avis produit.

        Body JSON:
        {
            "product_id": 123,
            "rating": 5,
            "title": "Excellent produit",
            "comment": "Je recommande...",
            "order_id": 456  // optionnel
        }

        Returns:
        {
            "success": true,
            "message": "Merci pour votre avis",
            "review": {...}
        }
        """
        try:
            params = request.jsonrequest

            # Validation paramètres requis
            self._validate_required_params(params, ['product_id', 'rating', 'title', 'comment'])

            partner = request.env.user.partner_id

            # Validation et normalisation
            input_validator = request.env['input.validator']

            product_id = input_validator.validate_id(params.get('product_id'), 'product_id')

            # Validation rating (1-5)
            rating = input_validator.validate_positive_int(params.get('rating'), 'rating')
            if rating < 1 or rating > 5:
                return self._handle_error(
                    Exception('La note doit être entre 1 et 5'),
                    "soumission avis"
                )

            # Validation title et comment avec sanitization
            title = input_validator.validate_string(
                params.get('title'),
                field_name='title',
                min_length=3,
                max_length=200,
                required=True
            )

            comment = input_validator.validate_string(
                params.get('comment'),
                field_name='comment',
                min_length=10,
                max_length=5000,
                required=True
            )

            # Sanitize HTML dans le commentaire
            comment = input_validator.sanitize_html(comment)

            # Validation order_id optionnel
            order_id = params.get('order_id')
            if order_id:
                order_id = input_validator.validate_id(order_id, 'order_id')

            # Vérifier que le produit existe
            product = request.env['product.product'].sudo().browse(product_id)
            if not product.exists():
                return self._handle_error(
                    Exception('Produit non trouvé'),
                    "soumission avis"
                )

            # Créer l'avis
            result = request.env['product.review'].sudo().create_review(
                product_id=product_id,
                rating=rating,
                title=title,
                comment=comment,
                partner_id=partner.id,
                order_id=order_id,
            )

            _logger.info(f"Nouvel avis créé pour produit {product_id} par {partner.id}")

            return result

        except Exception as e:
            return self._handle_error(e, "soumission avis")

    @http.route('/api/ecommerce/reviews/<int:review_id>/helpful', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)  # Protection spam "helpful"
    def mark_review_helpful(self, review_id, **kwargs):
        """
        Marque un avis comme "utile".

        Returns:
        {
            "success": true,
            "helpful_count": 5
        }
        """
        try:
            # Validation review_id
            input_validator = request.env['input.validator']
            review_id = input_validator.validate_id(review_id, 'review_id')

            review = request.env['product.review'].sudo().browse(review_id)

            if not review.exists():
                return self._handle_error(
                    Exception('Avis non trouvé'),
                    "mark helpful"
                )

            if review.state != 'approved':
                return self._handle_error(
                    Exception('Avis non approuvé'),
                    "mark helpful"
                )

            review.action_mark_helpful()

            _logger.info(f"Avis {review_id} marqué utile (total: {review.helpful_count})")

            return self._success_response({
                'helpful_count': review.helpful_count
            })

        except Exception as e:
            return self._handle_error(e, "mark helpful")

    @http.route('/api/ecommerce/customer/reviews', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=50, window=60)
    def get_customer_reviews(self, **kwargs):
        """
        Récupère les avis du client connecté.

        Returns:
        {
            "success": true,
            "reviews": [...]
        }
        """
        try:
            partner = request.env.user.partner_id

            # SÉCURITÉ: Récupérer seulement les avis de ce client
            reviews = request.env['product.review'].sudo().search([
                ('partner_id', '=', partner.id)
            ], order='create_date desc')

            return self._success_response({
                'reviews': [review.get_api_data() for review in reviews]
            })

        except Exception as e:
            return self._handle_error(e, "récupération avis client")
