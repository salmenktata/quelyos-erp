import json
from datetime import datetime, timedelta
from odoo import http
from odoo.http import request, Response


class QuelyosAPIController(http.Controller):
    """Main API controller for Quelyos ERP."""

    def _json_response(self, data, status=200):
        """Return a JSON response."""
        return Response(
            json.dumps(data),
            status=status,
            mimetype='application/json'
        )

    def _error_response(self, message, code, status=400):
        """Return an error response."""
        return self._json_response({
            'error': message,
            'code': code,
            'timestamp': datetime.utcnow().isoformat(),
        }, status=status)

    # ==================== Health Check ====================

    @http.route('/api/v1/health', type='http', auth='public', methods=['GET'], csrf=False)
    def health_check(self, **kwargs):
        """Health check endpoint."""
        return self._json_response({
            'status': 'healthy',
            'service': 'quelyos-api',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat(),
        })

    # ==================== Products ====================

    @http.route('/api/v1/products', type='http', auth='public', methods=['GET'], csrf=False)
    def list_products(self, **kwargs):
        """
        GET /api/v1/products
        Query params: limit, offset, category, search
        """
        try:
            limit = int(kwargs.get('limit', 20))
            offset = int(kwargs.get('offset', 0))
            category = kwargs.get('category')
            search = kwargs.get('search')

            domain = [('sale_ok', '=', True), ('active', '=', True)]

            if category:
                domain.append(('categ_id.name', 'ilike', category))
            if search:
                domain.append(('name', 'ilike', search))

            Product = request.env['product.product'].sudo()
            products = Product.search(domain, limit=limit, offset=offset, order='name asc')
            total = Product.search_count(domain)

            data = []
            for product in products:
                data.append({
                    'id': product.id,
                    'name': product.name,
                    'description': product.description_sale or '',
                    'price': product.list_price,
                    'currency': product.currency_id.name,
                    'stock': product.qty_available,
                    'sku': product.default_code or '',
                    'barcode': product.barcode or '',
                    'category': product.categ_id.name if product.categ_id else '',
                    'image_url': f'/web/image/product.product/{product.id}/image_512',
                })

            return self._json_response({
                'data': data,
                'meta': {
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                    'has_more': offset + limit < total,
                }
            })

        except Exception as e:
            return self._error_response(str(e), 'INTERNAL_ERROR', 500)

    @http.route('/api/v1/products/<int:product_id>', type='http', auth='public', methods=['GET'], csrf=False)
    def get_product(self, product_id, **kwargs):
        """
        GET /api/v1/products/:id
        Get single product details.
        """
        try:
            product = request.env['product.product'].sudo().browse(product_id)

            if not product.exists():
                return self._error_response('Product not found', 'NOT_FOUND', 404)

            # Get variants if template has multiple
            variants = []
            if product.product_tmpl_id.product_variant_count > 1:
                for variant in product.product_tmpl_id.product_variant_ids:
                    variants.append({
                        'id': variant.id,
                        'name': variant.name,
                        'sku': variant.default_code or '',
                        'price': variant.list_price,
                        'stock': variant.qty_available,
                        'attributes': [
                            {
                                'name': attr.attribute_id.name,
                                'value': attr.name,
                            }
                            for attr in variant.product_template_attribute_value_ids
                        ]
                    })

            return self._json_response({
                'data': {
                    'id': product.id,
                    'name': product.name,
                    'description': product.description_sale or '',
                    'description_full': product.description or '',
                    'price': product.list_price,
                    'currency': product.currency_id.name,
                    'stock': product.qty_available,
                    'sku': product.default_code or '',
                    'barcode': product.barcode or '',
                    'category': {
                        'id': product.categ_id.id,
                        'name': product.categ_id.name,
                    } if product.categ_id else None,
                    'image_url': f'/web/image/product.product/{product.id}/image_1024',
                    'variants': variants,
                }
            })

        except Exception as e:
            return self._error_response(str(e), 'INTERNAL_ERROR', 500)

    # ==================== Categories ====================

    @http.route('/api/v1/categories', type='http', auth='public', methods=['GET'], csrf=False)
    def list_categories(self, **kwargs):
        """
        GET /api/v1/categories
        List all product categories.
        """
        try:
            categories = request.env['product.category'].sudo().search([])

            data = []
            for cat in categories:
                data.append({
                    'id': cat.id,
                    'name': cat.name,
                    'parent_id': cat.parent_id.id if cat.parent_id else None,
                    'parent_name': cat.parent_id.name if cat.parent_id else None,
                })

            return self._json_response({'data': data})

        except Exception as e:
            return self._error_response(str(e), 'INTERNAL_ERROR', 500)
