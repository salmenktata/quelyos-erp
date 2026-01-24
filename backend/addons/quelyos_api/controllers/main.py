# -*- coding: utf-8 -*-
import json
import uuid
import logging
from odoo import http
from odoo.http import request, Response

_logger = logging.getLogger(__name__)


class QuelyosAPI(http.Controller):
    """API REST pour frontend e-commerce et backoffice"""

    # Odoo gère automatiquement le format JSON-RPC pour les routes type='json'
    # On n'a pas besoin d'un helper spécial, on retourne directement les dictionnaires

    def _get_params(self):
        """Extrait les paramètres de la requête JSON-RPC"""
        # Pour les routes type='json', les params sont dans request.params
        return request.params if hasattr(request, 'params') and request.params else {}

    def _create_session(self, uid):
        """Crée une session pour l'utilisateur et retourne le session_id"""
        # Le session_id Odoo est déjà créé par authenticate()
        # On retourne simplement le sid de la session HTTP
        return request.session.sid

    # ==================== AUTHENTICATION ====================

    @http.route('/api/ecommerce/auth/login', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def auth_login(self, **kwargs):
        """Authentification utilisateur"""
        try:
            params = self._get_params()
            email = params.get('email')
            password = params.get('password')

            if not email or not password:
                return self._jsonrpc_response(error={
                    'code': 400,
                    'message': 'Email and password are required'
                })

            # Rechercher l'utilisateur par email
            user = request.env['res.users'].sudo().search([
                ('login', '=', email)
            ], limit=1)

            if not user:
                return self._jsonrpc_response(error={
                    'code': 401,
                    'message': 'Invalid email or password'
                })

            # Vérifier le mot de passe et créer la session
            try:
                uid = request.session.authenticate(email, password)
                if not uid:
                    raise Exception('Authentication failed')

                # Recharger l'utilisateur après authentification
                user = request.env['res.users'].sudo().browse(uid)

            except Exception as e:
                _logger.error(f"Authentication error: {e}")
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }

            # Récupérer le session_id
            session_id = self._create_session(uid)

            # Récupérer les informations de l'utilisateur
            partner = user.partner_id
            user_data = {
                'id': partner.id,
                'name': partner.name,
                'email': partner.email or user.login,
                'phone': partner.phone or '',
            }

            return self._jsonrpc_response(result={
                'success': True,
                'session_id': session_id,
                'user': user_data
            })

        except Exception as e:
            _logger.error(f"Login error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/auth/logout', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def auth_logout(self, **kwargs):
        """Déconnexion utilisateur"""
        try:
            request.session.logout()
            return self._jsonrpc_response(result={'success': True})
        except Exception as e:
            _logger.error(f"Logout error: {e}")
            return self._jsonrpc_response(result={'success': True})  # Toujours retourner success

    @http.route('/api/ecommerce/auth/session', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def auth_session(self, **kwargs):
        """Vérifier la session courante"""
        try:
            if request.session.uid:
                user = request.env['res.users'].sudo().browse(request.session.uid)
                partner = user.partner_id

                return self._jsonrpc_response(result={
                    'authenticated': True,
                    'user': {
                        'id': partner.id,
                        'name': partner.name,
                        'email': partner.email or user.login,
                        'phone': partner.phone or '',
                    }
                })
            else:
                return self._jsonrpc_response(result={'authenticated': False})

        except Exception as e:
            _logger.error(f"Session check error: {e}")
            return self._jsonrpc_response(result={'authenticated': False})

    @http.route('/api/ecommerce/auth/register', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def auth_register(self, **kwargs):
        """Inscription nouvel utilisateur"""
        try:
            params = self._get_params()
            name = params.get('name')
            email = params.get('email')
            password = params.get('password')
            phone = params.get('phone', '')

            if not name or not email or not password:
                return self._jsonrpc_response(error={
                    'code': 400,
                    'message': 'Name, email and password are required'
                })

            # Vérifier si l'email existe déjà
            existing_user = request.env['res.users'].sudo().search([
                ('login', '=', email)
            ], limit=1)

            if existing_user:
                return self._jsonrpc_response(error={
                    'code': 400,
                    'message': 'Email already exists'
                })

            # Créer le partenaire
            partner = request.env['res.partner'].sudo().create({
                'name': name,
                'email': email,
                'phone': phone,
                'customer_rank': 1,
            })

            # Créer l'utilisateur
            user = request.env['res.users'].sudo().create({
                'name': name,
                'login': email,
                'password': password,
                'partner_id': partner.id,
                'groups_id': [(6, 0, [request.env.ref('base.group_portal').id])],
            })

            return self._jsonrpc_response(result={
                'success': True,
                'user': {
                    'id': partner.id,
                    'name': partner.name,
                    'email': partner.email,
                    'phone': partner.phone or '',
                }
            })

        except Exception as e:
            _logger.error(f"Registration error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    # ==================== PRODUCTS ====================

    @http.route('/api/ecommerce/products', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def get_products_list(self, **kwargs):
        """Liste des produits (GET via JSON-RPC)"""
        try:
            params = self._get_params()
            limit = int(params.get('limit', 20))
            offset = int(params.get('offset', 0))
            category_id = params.get('category_id')

            domain = [('sale_ok', '=', True)]
            if category_id:
                domain.append(('categ_id', '=', int(category_id)))

            products = request.env['product.template'].sudo().search(
                domain,
                limit=limit,
                offset=offset,
                order='name'
            )

            total = request.env['product.template'].sudo().search_count(domain)

            data = [{
                'id': p.id,
                'name': p.name,
                'price': p.list_price,
                'image': f'/web/image/product.template/{p.id}/image_1920' if p.image_1920 else None,
                'slug': p.name.lower().replace(' ', '-'),
                'category': {
                    'id': p.categ_id.id,
                    'name': p.categ_id.name,
                } if p.categ_id else None,
            } for p in products]

            return self._jsonrpc_response(result={
                'success': True,
                'data': {
                    'products': data,
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                }
            })

        except Exception as e:
            _logger.error(f"Get products error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/products/<int:product_id>', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def get_product_detail(self, product_id, **kwargs):
        """Détail d'un produit (GET via JSON-RPC)"""
        try:
            product = request.env['product.template'].sudo().browse(product_id)

            if not product.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Product not found'
                })

            data = {
                'id': product.id,
                'name': product.name,
                'description': product.description_sale or '',
                'price': product.list_price,
                'image': f'/web/image/product.template/{product.id}/image_1920' if product.image_1920 else None,
                'slug': product.name.lower().replace(' ', '-'),
                'category': {
                    'id': product.categ_id.id,
                    'name': product.categ_id.name,
                } if product.categ_id else None,
            }

            return self._jsonrpc_response(result={
                'success': True,
                'product': data
            })

        except Exception as e:
            _logger.error(f"Get product error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/products/create', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_product(self, **kwargs):
        """Créer un produit (admin)"""
        try:
            params = self._get_params()
            name = params.get('name')
            price = params.get('price', 0.0)
            description = params.get('description', '')
            category_id = params.get('category_id')

            if not name:
                return self._jsonrpc_response(error={
                    'code': 400,
                    'message': 'Product name is required'
                })

            # Vérifier les permissions (admin uniquement)
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            product_data = {
                'name': name,
                'list_price': float(price),
                'description_sale': description,
                'sale_ok': True,
                'purchase_ok': True,
            }

            if category_id:
                product_data['categ_id'] = int(category_id)

            product = request.env['product.template'].sudo().create(product_data)

            return self._jsonrpc_response(result={
                'success': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': product.list_price,
                }
            })

        except Exception as e:
            _logger.error(f"Create product error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/products/<int:product_id>/update', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def update_product(self, product_id, **kwargs):
        """Modifier un produit (admin)"""
        try:
            # Vérifier les permissions
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            product = request.env['product.template'].sudo().browse(product_id)

            if not product.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Product not found'
                })

            params = self._get_params()
            update_data = {}

            if 'name' in params:
                update_data['name'] = params['name']
            if 'price' in params:
                update_data['list_price'] = float(params['price'])
            if 'description' in params:
                update_data['description_sale'] = params['description']
            if 'category_id' in params:
                update_data['categ_id'] = int(params['category_id'])

            if update_data:
                product.write(update_data)

            return self._jsonrpc_response(result={
                'success': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': product.list_price,
                }
            })

        except Exception as e:
            _logger.error(f"Update product error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/products/<int:product_id>/delete', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def delete_product(self, product_id, **kwargs):
        """Supprimer un produit (admin)"""
        try:
            # Vérifier les permissions
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            product = request.env['product.template'].sudo().browse(product_id)

            if not product.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Product not found'
                })

            product.unlink()

            return self._jsonrpc_response(result={'success': True})

        except Exception as e:
            _logger.error(f"Delete product error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    # ==================== CATEGORIES ====================

    @http.route('/api/ecommerce/categories', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def get_categories_list(self, **kwargs):
        """Liste des catégories (GET via JSON-RPC)"""
        try:
            params = self._get_params()
            limit = int(params.get('limit', 100))
            offset = int(params.get('offset', 0))

            categories = request.env['product.category'].sudo().search(
                [],
                limit=limit,
                offset=offset,
                order='name'
            )

            data = [{
                'id': c.id,
                'name': c.name,
                'parent_id': c.parent_id.id if c.parent_id else None,
                'parent_name': c.parent_id.name if c.parent_id else None,
            } for c in categories]

            return self._jsonrpc_response(result={
                'success': True,
                'data': {
                    'categories': data
                }
            })

        except Exception as e:
            _logger.error(f"Get categories error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/categories/<int:category_id>', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def get_category_detail(self, category_id, **kwargs):
        """Détail d'une catégorie (GET via JSON-RPC)"""
        try:
            category = request.env['product.category'].sudo().browse(category_id)

            if not category.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Category not found'
                })

            return self._jsonrpc_response(result={
                'success': True,
                'category': {
                    'id': category.id,
                    'name': category.name,
                    'parent_id': category.parent_id.id if category.parent_id else None,
                    'parent_name': category.parent_id.name if category.parent_id else None,
                }
            })

        except Exception as e:
            _logger.error(f"Get category error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/categories/create', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def create_category(self, **kwargs):
        """Créer une catégorie (admin)"""
        try:
            # Vérifier les permissions
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            params = self._get_params()
            name = params.get('name')
            parent_id = params.get('parent_id')

            if not name:
                return self._jsonrpc_response(error={
                    'code': 400,
                    'message': 'Category name is required'
                })

            category_data = {'name': name}

            if parent_id:
                category_data['parent_id'] = int(parent_id)

            category = request.env['product.category'].sudo().create(category_data)

            return self._jsonrpc_response(result={
                'success': True,
                'category': {
                    'id': category.id,
                    'name': category.name,
                    'parent_id': category.parent_id.id if category.parent_id else None,
                }
            })

        except Exception as e:
            _logger.error(f"Create category error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/categories/<int:category_id>/update', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def update_category(self, category_id, **kwargs):
        """Modifier une catégorie (admin)"""
        try:
            # Vérifier les permissions
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            category = request.env['product.category'].sudo().browse(category_id)

            if not category.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Category not found'
                })

            params = self._get_params()
            update_data = {}

            if 'name' in params:
                update_data['name'] = params['name']
            if 'parent_id' in params:
                update_data['parent_id'] = int(params['parent_id']) if params['parent_id'] else False

            if update_data:
                category.write(update_data)

            return self._jsonrpc_response(result={
                'success': True,
                'category': {
                    'id': category.id,
                    'name': category.name,
                    'parent_id': category.parent_id.id if category.parent_id else None,
                }
            })

        except Exception as e:
            _logger.error(f"Update category error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })

    @http.route('/api/ecommerce/categories/<int:category_id>/delete', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def delete_category(self, category_id, **kwargs):
        """Supprimer une catégorie (admin)"""
        try:
            # Vérifier les permissions
            if not request.env.user.has_group('base.group_system'):
                return self._jsonrpc_response(error={
                    'code': 403,
                    'message': 'Insufficient permissions'
                })

            category = request.env['product.category'].sudo().browse(category_id)

            if not category.exists():
                return self._jsonrpc_response(error={
                    'code': 404,
                    'message': 'Category not found'
                })

            category.unlink()

            return self._jsonrpc_response(result={'success': True})

        except Exception as e:
            _logger.error(f"Delete category error: {e}")
            return self._jsonrpc_response(error={
                'code': 500,
                'message': str(e)
            })
