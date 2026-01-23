# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import json
import logging

_logger = logging.getLogger(__name__)


class EcommerceAuthController(http.Controller):
    """Controller pour l'authentification Portal."""

    @http.route('/api/ecommerce/auth/login', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def login(self, **kwargs):
        """
        Authentifie un utilisateur via le Portal Odoo.

        Body JSON:
        {
            "login": "user@example.com",
            "password": "password123"
        }

        Returns:
        {
            "success": true,
            "user": {
                "id": 123,
                "name": "John Doe",
                "email": "user@example.com",
                "is_portal": true
            },
            "session_id": "..."
        }
        """
        try:
            params = request.jsonrequest
            login = params.get('login')
            password = params.get('password')

            if not login or not password:
                return {
                    'success': False,
                    'error': 'Login et password requis',
                }

            # Authentification Odoo
            uid = request.session.authenticate(request.db, login, password)

            if not uid:
                return {
                    'success': False,
                    'error': 'Identifiants invalides',
                }

            # Récupérer les informations utilisateur
            user = request.env['res.users'].browse(uid)
            partner = user.partner_id

            # Vérifier que c'est un utilisateur Portal
            is_portal = user.has_group('base.group_portal')

            return {
                'success': True,
                'user': {
                    'id': partner.id,
                    'name': partner.name,
                    'email': partner.email,
                    'phone': partner.phone or '',
                    'is_portal': is_portal,
                },
                'session_id': request.session.sid,
            }

        except Exception as e:
            _logger.error(f"Erreur lors du login: {str(e)}")
            return {
                'success': False,
                'error': 'Erreur lors de l\'authentification',
            }

    @http.route('/api/ecommerce/auth/logout', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    def logout(self, **kwargs):
        """
        Déconnecte l'utilisateur actuel.

        Returns:
        {
            "success": true,
            "message": "Déconnexion réussie"
        }
        """
        try:
            request.session.logout(keep_db=True)
            return {
                'success': True,
                'message': 'Déconnexion réussie',
            }
        except Exception as e:
            _logger.error(f"Erreur lors du logout: {str(e)}")
            return {
                'success': False,
                'error': 'Erreur lors de la déconnexion',
            }

    @http.route('/api/ecommerce/auth/session', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    def check_session(self, **kwargs):
        """
        Vérifie la validité de la session actuelle.

        Returns:
        {
            "authenticated": true,
            "user": {
                "id": 123,
                "name": "John Doe",
                "email": "user@example.com"
            }
        }
        """
        try:
            if request.session.uid:
                user = request.env['res.users'].browse(request.session.uid)
                partner = user.partner_id

                return {
                    'authenticated': True,
                    'user': {
                        'id': partner.id,
                        'name': partner.name,
                        'email': partner.email,
                        'phone': partner.phone or '',
                        'is_portal': user.has_group('base.group_portal'),
                    },
                    'session_id': request.session.sid,
                }
            else:
                return {
                    'authenticated': False,
                    'user': None,
                }

        except Exception as e:
            _logger.error(f"Erreur lors de la vérification de session: {str(e)}")
            return {
                'authenticated': False,
                'error': str(e),
            }

    @http.route('/api/ecommerce/auth/register', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def register(self, **kwargs):
        """
        Inscrit un nouveau client Portal.

        Body JSON:
        {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+33612345678",
            "password": "password123"
        }

        Returns:
        {
            "success": true,
            "user": {...},
            "message": "Inscription réussie"
        }
        """
        try:
            params = request.jsonrequest
            name = params.get('name')
            email = params.get('email')
            phone = params.get('phone', '')
            password = params.get('password')

            # Validation
            if not all([name, email, password]):
                return {
                    'success': False,
                    'error': 'Nom, email et mot de passe requis',
                }

            # Vérifier si l'email existe déjà
            existing_user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
            if existing_user:
                return {
                    'success': False,
                    'error': 'Un compte existe déjà avec cet email',
                }

            # Créer le partner
            partner = request.env['res.partner'].sudo().create({
                'name': name,
                'email': email,
                'phone': phone,
            })

            # Créer l'utilisateur Portal
            user = request.env['res.users'].sudo().create({
                'login': email,
                'password': password,
                'partner_id': partner.id,
                'groups_id': [(6, 0, [request.env.ref('base.group_portal').id])],
            })

            # Auto-login après inscription
            uid = request.session.authenticate(request.db, email, password)

            if uid:
                return {
                    'success': True,
                    'user': {
                        'id': partner.id,
                        'name': partner.name,
                        'email': partner.email,
                        'phone': partner.phone or '',
                    },
                    'message': 'Inscription réussie',
                    'session_id': request.session.sid,
                }
            else:
                return {
                    'success': False,
                    'error': 'Inscription réussie mais échec de connexion automatique',
                }

        except Exception as e:
            _logger.error(f"Erreur lors de l'inscription: {str(e)}")
            return {
                'success': False,
                'error': f'Erreur lors de l\'inscription: {str(e)}',
            }

    @http.route('/api/ecommerce/auth/reset-password', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    def reset_password(self, **kwargs):
        """
        Envoie un email de réinitialisation de mot de passe.

        Body JSON:
        {
            "email": "user@example.com"
        }
        """
        try:
            params = request.jsonrequest
            email = params.get('email')

            if not email:
                return {
                    'success': False,
                    'error': 'Email requis',
                }

            # Chercher l'utilisateur
            user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)

            if not user:
                # Par sécurité, on retourne toujours success même si l'email n'existe pas
                return {
                    'success': True,
                    'message': 'Si cet email existe, un lien de réinitialisation a été envoyé',
                }

            # Créer le lien de réinitialisation
            user.action_reset_password()

            return {
                'success': True,
                'message': 'Un email de réinitialisation a été envoyé',
            }

        except Exception as e:
            _logger.error(f"Erreur lors de la réinitialisation: {str(e)}")
            return {
                'success': False,
                'error': 'Erreur lors de la réinitialisation',
            }
