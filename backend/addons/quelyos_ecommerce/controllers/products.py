# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EcommerceProductsController(http.Controller):
    """Controller pour l'API Produits."""

    @http.route('/api/ecommerce/products', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_products(self, **kwargs):
        """
        Liste les produits avec filtres et pagination.

        Query params:
        - category_id: int
        - search: str
        - price_min: float
        - price_max: float
        - is_featured: bool
        - is_new: bool
        - is_bestseller: bool
        - attribute_value_ids: list[int]
        - limit: int (default 24)
        - offset: int (default 0)
        - sort: str ('name', 'price_asc', 'price_desc', 'newest')

        Returns:
        {
            "products": [...],
            "total": 150,
            "facets": {
                "categories": [...],
                "attributes": [...],
                "price_range": {"min": 0, "max": 1000}
            }
        }
        """
        try:
            params = kwargs or {}

            # Get configuration
            config = request.env['ecommerce.config'].sudo().get_config()

            # Build filters dict
            filters = {}
            if params.get('category_id'):
                filters['category_id'] = params['category_id']
            if params.get('price_min') is not None:
                filters['price_min'] = params['price_min']
            if params.get('price_max') is not None:
                filters['price_max'] = params['price_max']
            if params.get('attribute_value_ids'):
                filters['attribute_value_ids'] = params['attribute_value_ids']
            if params.get('is_featured'):
                filters['is_featured'] = params['is_featured']
            if params.get('is_new'):
                filters['is_new'] = params['is_new']
            if params.get('is_bestseller'):
                filters['is_bestseller'] = params['is_bestseller']

            # Pagination
            limit = params.get('limit', config.get('products_per_page', 24))
            offset = params.get('offset', 0)

            # Search query
            search = params.get('search', '')

            # Sort order
            sort = params.get('sort', 'name')
            order = 'name'
            if sort == 'price_asc':
                order = 'list_price ASC'
            elif sort == 'price_desc':
                order = 'list_price DESC'
            elif sort == 'newest':
                order = 'create_date DESC'
            elif sort == 'popular':
                order = 'view_count DESC'
            elif sort == 'featured':
                order = 'featured_order ASC, create_date DESC'

            # Use product service
            product_service = request.env['product.service'].sudo()
            result = product_service.get_products_with_facets(
                filters=filters,
                limit=limit,
                offset=offset,
                search=search,
                order=order
            )

            return {
                'success': True,
                'products': result['products'],
                'total': result['total'],
                'facets': result['facets'],
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des produits: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/products/<int:product_id>', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_product(self, product_id, **kwargs):
        """
        Récupère le détail d'un produit par ID.

        Returns: Product data with variants
        """
        try:
            product = request.env['product.template'].sudo().browse(product_id)

            if not product.exists():
                return {
                    'success': False,
                    'error': 'Produit non trouvé',
                }

            # Incrémenter le compteur de vues
            product.increment_view_count()

            return {
                'success': True,
                'product': product.get_api_data(include_variants=True),
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération du produit {product_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/products/slug/<string:slug>', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_product_by_slug(self, slug, **kwargs):
        """
        Récupère le détail d'un produit par slug (pour URLs SEO).

        Returns: Product data with variants
        """
        try:
            product = request.env['product.template'].sudo().search([('slug', '=', slug)], limit=1)

            if not product:
                return {
                    'success': False,
                    'error': 'Produit non trouvé',
                }

            # Incrémenter le compteur de vues
            product.increment_view_count()

            return {
                'success': True,
                'product': product.get_api_data(include_variants=True),
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération du produit {slug}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/categories', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_categories(self, **kwargs):
        """
        Liste toutes les catégories de produits.

        Returns:
        {
            "categories": [
                {
                    "id": 1,
                    "name": "Electronics",
                    "parent_id": null,
                    "child_count": 3,
                    "product_count": 25
                }
            ]
        }
        """
        try:
            categories = request.env['product.category'].sudo().search([])

            categories_data = []
            for cat in categories:
                # Compter les produits dans cette catégorie
                product_count = request.env['product.template'].sudo().search_count([
                    ('categ_id', '=', cat.id),
                    ('sale_ok', '=', True)
                ])

                categories_data.append({
                    'id': cat.id,
                    'name': cat.name,
                    'parent_id': cat.parent_id.id if cat.parent_id else None,
                    'parent_name': cat.parent_id.name if cat.parent_id else None,
                    'child_count': len(cat.child_id),
                    'product_count': product_count,
                })

            return {
                'success': True,
                'categories': categories_data,
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des catégories: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/categories/<int:category_id>/products', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_category_products(self, category_id, **kwargs):
        """
        Liste les produits d'une catégorie spécifique.
        """
        try:
            params = kwargs or {}
            params['category_id'] = category_id
            return self.get_products(**params)

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des produits de la catégorie {category_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/products/featured', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def get_featured_products(self, **kwargs):
        """
        Récupère les produits mis en avant pour la page d'accueil.

        Query params:
        - limit: int (default 8)
        """
        try:
            params = kwargs or {}
            limit = params.get('limit', 8)

            products = request.env['product.template'].sudo().search([
                ('is_featured', '=', True),
                ('sale_ok', '=', True)
            ], limit=limit, order='featured_order, name')

            products_data = [p.get_api_data(include_variants=False) for p in products]

            return {
                'success': True,
                'products': products_data,
                'total': len(products),
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la récupération des produits featured: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }

