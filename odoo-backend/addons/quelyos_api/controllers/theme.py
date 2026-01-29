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

import json
import logging
from odoo import http, fields
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


    # ═══════════════════════════════════════════════════════════════════════════
    # AI THEME GENERATION
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/themes/generate', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def generate_theme_ai(self, prompt):
        """
        Génère un thème complet via Claude API basé sur un prompt utilisateur.

        Args:
            prompt (str): Description du thème souhaité par l'utilisateur

        Returns:
            dict: {
                success: bool,
                theme: ThemeConfig complète,
                error: str (si échec)
            }
        """
        try:
            import json
            import anthropic

            if not prompt or not prompt.strip():
                return {
                    'success': False,
                    'error': 'Le prompt ne peut pas être vide'
                }

            # Récupérer clé API Claude depuis paramètres système
            api_key = request.env['ir.config_parameter'].sudo().get_param('quelyos.claude_api_key')

            if not api_key:
                return {
                    'success': False,
                    'error': 'Clé API Claude non configurée. Veuillez configurer la clé dans Paramètres > Technique > Paramètres Système (quelyos.claude_api_key).'
                }

            # System prompt pour guider Claude
            system_prompt = """Tu es un expert en design web et e-commerce spécialisé dans la création de thèmes visuels.

Ton rôle : générer une configuration de thème complète au format JSON basée sur la description utilisateur.

Structure JSON attendue :
{
  "name": "Nom du thème",
  "category": "fashion|tech|food|beauty|sports|home|general",
  "description": "Description courte du thème",
  "version": "1.0",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#ffffff",
    "text": "#1e293b",
    "muted": "#94a3b8"
  },
  "typography": {
    "headings": "Police Google Fonts (ex: Playfair Display)",
    "body": "Police Google Fonts (ex: Inter)"
  },
  "layouts": {
    "homepage": {
      "sections": [
        {
          "type": "hero-slider|featured-products|newsletter|testimonials|faq|trust-badges",
          "variant": "voir variantes ci-dessous",
          "config": { "limit": 8 }
        }
      ]
    },
    "productPage": {
      "layout": "standard|sidebar-left|sidebar-right",
      "gallery": { "type": "standard|zoom|carousel" },
      "sections": []
    },
    "categoryPage": {
      "layout": "sidebar-left|sidebar-right|fullwidth",
      "grid": "2cols|3cols|4cols",
      "filters": ["price", "category", "color", "size"]
    }
  },
  "components": {
    "productCard": "standard|minimal|detailed",
    "header": "standard|transparent|sticky",
    "footer": "standard|minimal|columns",
    "buttons": "standard|rounded|square"
  },
  "spacing": {
    "sectionPadding": "small|medium|large",
    "containerWidth": "1280px|1440px|1600px"
  }
}

Sections disponibles et leurs variantes :
- hero-slider : fullscreen-autoplay, split-screen, minimal
- featured-products : grid-4cols, carousel, masonry
- newsletter : centered, minimal
- testimonials : carousel, grid
- faq : accordion, tabs
- trust-badges : icons, logos

Choisis des couleurs harmonieuses adaptées à la catégorie du thème.
Choisis des polices Google Fonts appropriées (headings différent de body pour contraste).
Compose 3-5 sections pour la homepage selon le type de boutique.

IMPORTANT : Réponds UNIQUEMENT avec le JSON, sans texte explicatif ni markdown."""

            # Appel Claude API
            client = anthropic.Anthropic(api_key=api_key)

            message = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=2048,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": f"Génère un thème e-commerce complet pour : {prompt}"
                    }
                ]
            )

            # Extraire texte de la réponse
            response_text = message.content[0].text.strip()

            # Nettoyer markdown code blocks si présents
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                # Supprimer première ligne (```json ou ```)
                lines = lines[1:]
                # Supprimer dernière ligne (```)
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                response_text = '\n'.join(lines).strip()

            # Parser JSON
            theme_config = json.loads(response_text)

            # Ajouter ID temporaire
            theme_config['id'] = 'ai-generated'

            _logger.info(f"AI theme generated successfully: {theme_config.get('name')}")

            return {
                'success': True,
                'theme': theme_config
            }

        except Exception as e:
            error_msg = str(e)
            _logger.error(f"Error generating AI theme: {error_msg}")

            # Messages d'erreur plus explicites
            if 'anthropic' in error_msg.lower():
                error_msg = "Erreur d'appel à l'API Claude. Vérifiez la clé API."
            elif 'json' in error_msg.lower():
                error_msg = "L'IA a retourné un format invalide. Réessayez avec un prompt plus clair."

            return {
                'success': False,
                'error': error_msg
            }


    # ═══════════════════════════════════════════════════════════════════════════
    # MARKETPLACE ENDPOINTS
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/themes/marketplace', auth='public', type='jsonrpc', methods=['POST'], csrf=False)
    def get_marketplace_themes(self, category=None, is_premium=None, sort='popular'):
        """
        Liste thèmes marketplace disponibles

        Args:
            category (str, optional): Filtrer par catégorie
            is_premium (bool, optional): Filtrer premium/gratuit
            sort (str): Tri (popular, recent, rating)

        Returns:
            dict: { success: bool, themes: list }
        """
        try:
            domain = [
                ('active', '=', True),
                ('is_public', '=', True),
                ('is_marketplace', '=', True),
            ]

            if category:
                domain.append(('category', '=', category))

            if is_premium is not None:
                domain.append(('is_premium', '=', is_premium))

            # Order
            order_map = {
                'popular': 'downloads desc',
                'recent': 'create_date desc',
                'rating': 'rating desc',
            }
            order = order_map.get(sort, 'downloads desc')

            themes = request.env['quelyos.theme'].sudo().search(domain, order=order)

            themes_data = []
            for theme in themes:
                themes_data.append({
                    'id': theme.code,
                    'name': theme.name,
                    'description': theme.description,
                    'category': theme.category,
                    'thumbnail': theme.thumbnail,
                    'designer': {
                        'id': theme.designer_id.id if theme.designer_id else None,
                        'name': theme.designer_id.display_name if theme.designer_id else 'Quelyos',
                        'avatar': theme.designer_id.avatar if theme.designer_id else None,
                    },
                    'is_premium': theme.is_premium,
                    'price': theme.price,
                    'rating': theme.rating,
                    'downloads': theme.downloads,
                    'reviews_count': theme.review_count,
                })

            return {
                'success': True,
                'themes': themes_data
            }

        except Exception as e:
            _logger.error(f"Error fetching marketplace themes: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }


    @http.route('/api/themes/submissions', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def create_submission(self, name, description, category, config_json, is_premium=False, price=0.0):
        """
        Soumettre un thème pour review

        Args:
            name (str): Nom du thème
            description (str): Description
            category (str): Catégorie
            config_json (str): Configuration JSON
            is_premium (bool): Premium ou gratuit
            price (float): Prix si premium

        Returns:
            dict: { success: bool, submission_id: int }
        """
        try:
            # Vérifier si user a profil designer
            designer = request.env['quelyos.theme.designer'].sudo().search([
                ('user_id', '=', request.env.user.id)
            ], limit=1)

            if not designer:
                # Créer profil designer automatiquement
                designer = request.env['quelyos.theme.designer'].sudo().create({
                    'user_id': request.env.user.id,
                    'display_name': request.env.user.name,
                    'email': request.env.user.email,
                    'status': 'pending',
                })

            # Créer soumission
            submission = request.env['quelyos.theme.submission'].sudo().create({
                'designer_id': designer.id,
                'name': name,
                'description': description,
                'category': category,
                'config_json': config_json,
                'is_premium': is_premium,
                'price': price if is_premium else 0.0,
                'status': 'submitted',
                'submit_date': fields.Datetime.now(),
            })

            _logger.info(f"Theme submission created: {name} by {designer.display_name}")

            return {
                'success': True,
                'submission_id': submission.id
            }

        except Exception as e:
            _logger.error(f"Error creating theme submission: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


    @http.route('/api/themes/submissions/my', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def get_my_submissions(self):
        """
        Liste soumissions de l'utilisateur courant

        Returns:
            dict: { success: bool, submissions: list }
        """
        try:
            designer = request.env['quelyos.theme.designer'].sudo().search([
                ('user_id', '=', request.env.user.id)
            ], limit=1)

            if not designer:
                return {
                    'success': True,
                    'submissions': []
                }

            submissions = designer.submission_ids

            submissions_data = []
            for submission in submissions:
                submissions_data.append({
                    'id': submission.id,
                    'name': submission.name,
                    'description': submission.description,
                    'category': submission.category,
                    'status': submission.status,
                    'is_premium': submission.is_premium,
                    'price': submission.price,
                    'sales_count': submission.sales_count,
                    'total_revenue': submission.total_revenue,
                    'designer_revenue': submission.designer_revenue,
                    'average_rating': submission.average_rating,
                    'submit_date': submission.submit_date.isoformat() if submission.submit_date else None,
                    'approval_date': submission.approval_date.isoformat() if submission.approval_date else None,
                    'rejection_reason': submission.rejection_reason,
                })

            return {
                'success': True,
                'submissions': submissions_data
            }

        except Exception as e:
            _logger.error(f"Error fetching user submissions: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }


    @http.route('/api/themes/<int:theme_id>/purchase', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def purchase_theme(self, theme_id, tenant_id, payment_method='stripe'):
        """
        Acheter un thème pour un tenant

        Args:
            theme_id (int): ID du thème
            tenant_id (int): ID du tenant
            payment_method (str): Méthode paiement (stripe, paypal, free)

        Returns:
            dict: { success: bool, purchase_id: int, payment_url: str }
        """
        try:
            theme = request.env['quelyos.theme'].sudo().browse(theme_id)

            if not theme.exists():
                return {
                    'success': False,
                    'error': 'Theme not found'
                }

            # Vérifier si déjà acheté
            existing_purchase = request.env['quelyos.theme.purchase'].sudo().search([
                ('theme_id', '=', theme_id),
                ('tenant_id', '=', tenant_id),
                ('status', '=', 'completed'),
            ], limit=1)

            if existing_purchase:
                return {
                    'success': False,
                    'error': 'Theme already purchased'
                }

            # Si gratuit, acheter directement
            if not theme.is_premium or theme.price == 0:
                purchase = request.env['quelyos.theme.purchase'].sudo().create({
                    'submission_id': theme.designer_id.submission_ids.filtered(lambda s: s.theme_id == theme).id if theme.designer_id else False,
                    'tenant_id': tenant_id,
                    'user_id': request.env.user.id,
                    'amount': 0.0,
                    'payment_method': 'free',
                    'status': 'completed',
                    'completion_date': fields.Datetime.now(),
                })

                return {
                    'success': True,
                    'purchase_id': purchase.id,
                    'payment_url': None
                }

            # Si payant, créer purchase en attente
            purchase = request.env['quelyos.theme.purchase'].sudo().create({
                'submission_id': theme.designer_id.submission_ids.filtered(lambda s: s.theme_id == theme).id if theme.designer_id else False,
                'tenant_id': tenant_id,
                'user_id': request.env.user.id,
                'amount': theme.price,
                'payment_method': payment_method,
                'status': 'pending',
            })

            # TODO: Intégrer Stripe/PayPal pour payment_url

            return {
                'success': True,
                'purchase_id': purchase.id,
                'payment_url': '/payment/stripe/checkout'  # TODO
            }

        except Exception as e:
            _logger.error(f"Error purchasing theme: {str(e)}")
            return {
                'success': False,
                'error': 'Internal server error'
            }


    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS ADMIN - Import thèmes
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route('/api/themes/import-json', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def import_theme_from_json(self, theme_json, is_public=True):
        """
        Importer un thème depuis une configuration JSON
        (ADMIN UNIQUEMENT)

        Args:
            theme_json (dict): Configuration JSON du thème
            is_public (bool): Thème public ou privé

        Returns:
            dict: { success: bool, theme_id: int }
        """
        try:
            # Vérifier droits admin
            if not request.env.user.has_group('base.group_system'):
                _logger.warning(f"Non-admin user {request.env.user.login} attempted to import theme")
                return {
                    'success': False,
                    'error': 'Admin rights required'
                }

            # Valider champs requis
            required_fields = ['id', 'name', 'category', 'colors', 'typography', 'layouts']
            for field in required_fields:
                if field not in theme_json:
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }

            # Vérifier si thème existe déjà
            existing_theme = request.env['quelyos.theme'].sudo().search([
                ('code', '=', theme_json['id'])
            ], limit=1)

            if existing_theme:
                _logger.info(f"Theme {theme_json['id']} already exists, updating...")
                # Mettre à jour configuration
                existing_theme.write({
                    'config_json': json.dumps(theme_json),
                    'name': theme_json.get('name', existing_theme.name),
                    'description': theme_json.get('description', existing_theme.description),
                })
                return {
                    'success': True,
                    'theme_id': existing_theme.id,
                    'updated': True
                }

            # Créer nouveau thème
            theme = request.env['quelyos.theme'].sudo().create({
                'code': theme_json['id'],
                'name': theme_json['name'],
                'description': theme_json.get('description', ''),
                'category': theme_json['category'],
                'version': theme_json.get('version', '1.0.0'),
                'config_json': json.dumps(theme_json),
                'is_public': is_public,
                'is_premium': False,  # Les thèmes importés sont gratuits par défaut
                'price': 0.0,
                'is_marketplace': False,  # Thèmes officiels Quelyos
                'active': True,
            })

            _logger.info(f"Theme imported successfully: {theme.name} (ID: {theme.id})")

            return {
                'success': True,
                'theme_id': theme.id,
                'updated': False
            }

        except Exception as e:
            _logger.error(f"Error importing theme from JSON: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


    @http.route('/api/themes/import-batch', auth='user', type='jsonrpc', methods=['POST'], csrf=False)
    def import_themes_batch(self, themes, is_public=True):
        """
        Importer plusieurs thèmes en batch depuis configurations JSON
        (ADMIN UNIQUEMENT)

        Args:
            themes (list): Liste de configurations JSON
            is_public (bool): Thèmes publics ou privés

        Returns:
            dict: { success: bool, imported: int, updated: int, errors: list }
        """
        try:
            # Vérifier droits admin
            if not request.env.user.has_group('base.group_system'):
                return {
                    'success': False,
                    'error': 'Admin rights required'
                }

            imported_count = 0
            updated_count = 0
            errors = []

            for theme_json in themes:
                result = self.import_theme_from_json(theme_json, is_public)

                if result.get('success'):
                    if result.get('updated'):
                        updated_count += 1
                    else:
                        imported_count += 1
                else:
                    errors.append({
                        'theme': theme_json.get('id', 'unknown'),
                        'error': result.get('error')
                    })

            _logger.info(f"Batch import completed: {imported_count} imported, {updated_count} updated, {len(errors)} errors")

            return {
                'success': True,
                'imported': imported_count,
                'updated': updated_count,
                'errors': errors
            }

        except Exception as e:
            _logger.error(f"Error in batch import: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
