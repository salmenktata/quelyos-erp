# -*- coding: utf-8 -*-
"""
Controller Theme Engine - Endpoints API pour la gestion des thèmes.

Endpoints disponibles :
- GET /api/themes/<code>                    : Récupérer un thème par code
- GET /api/themes                           : Lister les thèmes disponibles
- GET /api/tenants/<id>/theme               : Récupérer le thème actif d'un tenant
- POST /api/tenants/<id>/theme/set          : Activer un thème pour un tenant
- POST /api/themes/<id>/review              : Ajouter un avis sur un thème
"""

import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class ThemeController(http.Controller):
    """Controller pour la gestion des thèmes via API"""

    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS PUBLICS - Récupération thèmes
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/themes/<string:theme_code>', auth='public', type='jsonrpc', methods=['POST'], csrf=False)
    def get_theme(self, theme_code):
        """
        Récupère la configuration complète d'un thème par son code.

        Args:
            theme_code (str): Code unique du thème (ex: fashion-luxury)

        Returns:
            dict: {
                success: bool,
                theme: {
                    id, name, description, category, version,
                    is_premium, price, rating, downloads, config
                }
            }
        """
        try:
            theme = request.env['quelyos.theme'].sudo().search([
                ('code', '=', theme_code),
                ('active', '=', True)
            ], limit=1)

            if not theme:
                return {
                    'success': False,
                    'error': f'Theme "{theme_code}" not found'
                }

            return theme.get_theme_config()

        except Exception as e:
            _logger.error(f"Error fetching theme {theme_code}: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }

    @http.route('/api/themes', auth='public', type='jsonrpc', methods=['POST'], csrf=False)
    def list_themes(self, category=None, limit=50, offset=0, tenant_id=None):
        """
        Liste les thèmes disponibles avec filtres et pagination.

        Args:
            category (str, optional): Filtrer par catégorie
            limit (int): Nombre max de résultats (default: 50)
            offset (int): Offset pour pagination (default: 0)
            tenant_id (int, optional): ID tenant pour vérifier accès privé

        Returns:
            dict: {
                success: bool,
                themes: [{ id, name, description, category, is_premium, price, rating, thumbnail }],
                total: int,
                limit: int,
                offset: int
            }
        """
        try:
            return request.env['quelyos.theme'].sudo().api_list_themes(
                category=category,
                limit=limit,
                offset=offset,
                tenant_id=tenant_id
            )

        except Exception as e:
            _logger.error(f"Error listing themes: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }

    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS TENANT - Gestion thème actif
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/tenants/<int:tenant_id>/theme', auth='public', type='jsonrpc', methods=['POST'], csrf=False)
    def get_tenant_theme(self, tenant_id):
        """
        Récupère le thème actif d'un tenant (avec overrides appliqués).

        Args:
            tenant_id (int): ID du tenant

        Returns:
            dict: Configuration complète du thème actif
        """
        try:
            tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)

            if not tenant.exists():
                return {
                    'success': False,
                    'error': 'Tenant not found'
                }

            return tenant.get_active_theme_config()

        except Exception as e:
            _logger.error(f"Error fetching tenant theme: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }

    @http.route('/api/tenants/<int:tenant_id>/theme/set', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def set_tenant_theme(self, tenant_id, theme_code):
        """
        Active un thème pour un tenant.
        Vérifie les droits d'accès (public ou acheté si premium).

        Args:
            tenant_id (int): ID du tenant
            theme_code (str): Code du thème à activer

        Returns:
            dict: {
                success: bool,
                theme_code: str (si succès),
                error: str (si échec)
            }
        """
        try:
            tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)

            if not tenant.exists():
                return {
                    'success': False,
                    'error': 'Tenant not found'
                }

            # Vérifier que l'utilisateur a accès à ce tenant
            # TODO: Ajouter vérification permissions
            # if not request.env.user.has_access_to_tenant(tenant_id):
            #     return {'success': False, 'error': 'Access denied'}

            result = tenant.action_set_theme(theme_code)
            return result

        except Exception as e:
            _logger.error(f"Error setting tenant theme: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }

    @http.route('/api/tenants/<int:tenant_id>/theme/overrides', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def set_theme_overrides(self, tenant_id, overrides):
        """
        Définit les overrides JSON pour personnaliser le thème actif.

        Args:
            tenant_id (int): ID du tenant
            overrides (dict): Overrides JSON (partiel)

        Returns:
            dict: Success status
        """
        try:
            import json

            tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)

            if not tenant.exists():
                return {
                    'success': False,
                    'error': 'Tenant not found'
                }

            # Valider que overrides est un dict valide
            if not isinstance(overrides, dict):
                return {
                    'success': False,
                    'error': 'Overrides must be a valid JSON object'
                }

            # Sauvegarder les overrides
            tenant.sudo().write({
                'theme_overrides': json.dumps(overrides)
            })

            return {
                'success': True,
                'message': 'Theme overrides saved'
            }

        except Exception as e:
            _logger.error(f"Error setting theme overrides: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }

    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS REVIEWS - Avis sur thèmes
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/themes/<int:theme_id>/review', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def add_theme_review(self, theme_id, rating, title=None, comment=None, tenant_id=None):
        """
        Ajoute un avis sur un thème.

        Args:
            theme_id (int): ID du thème
            rating (int): Note de 1 à 5
            title (str, optional): Titre de l'avis
            comment (str, optional): Commentaire
            tenant_id (int, optional): ID du tenant (si multi-tenant)

        Returns:
            dict: Success status
        """
        try:
            theme = request.env['quelyos.theme'].sudo().browse(theme_id)

            if not theme.exists():
                return {
                    'success': False,
                    'error': 'Theme not found'
                }

            # Vérifier que rating est valide
            if not (1 <= rating <= 5):
                return {
                    'success': False,
                    'error': 'Rating must be between 1 and 5'
                }

            # Créer la review
            review_vals = {
                'theme_id': theme.id,
                'user_id': request.env.user.id,
                'rating': rating,
                'title': title,
                'comment': comment,
            }

            if tenant_id:
                tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)
                if tenant.exists():
                    review_vals['tenant_id'] = tenant.id

            request.env['quelyos.theme.review'].sudo().create(review_vals)

            return {
                'success': True,
                'message': 'Review added successfully'
            }

        except Exception as e:
            _logger.error(f"Error adding theme review: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/api/themes/<int:theme_id>/reviews', auth='public', type='jsonrpc', methods=['POST'], csrf=False)
    def get_theme_reviews(self, theme_id, limit=10, offset=0):
        """
        Récupère les avis d'un thème.

        Args:
            theme_id (int): ID du thème
            limit (int): Nombre max de résultats
            offset (int): Offset pour pagination

        Returns:
            dict: Liste des reviews
        """
        try:
            theme = request.env['quelyos.theme'].sudo().browse(theme_id)

            if not theme.exists():
                return {
                    'success': False,
                    'error': 'Theme not found'
                }

            reviews = request.env['quelyos.theme.review'].sudo().search([
                ('theme_id', '=', theme.id)
            ], limit=limit, offset=offset, order='create_date desc')

            return {
                'success': True,
                'reviews': [{
                    'id': review.id,
                    'rating': review.rating,
                    'title': review.title,
                    'comment': review.comment,
                    'user_name': review.user_id.name,
                    'create_date': review.create_date.isoformat() if review.create_date else None,
                } for review in reviews],
                'total': theme.review_count,
            }

        except Exception as e:
            _logger.error(f"Error fetching theme reviews: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }
