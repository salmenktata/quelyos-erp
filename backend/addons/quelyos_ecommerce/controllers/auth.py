# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceAuthController(BaseEcommerceController):
    """Controller pour l'authentification Portal avec sécurité renforcée."""

    @http.route('/api/ecommerce/auth/login', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=5, window=60)  # 5 tentatives par minute max
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

            # Validation des paramètres requis
            self._validate_required_params(params, ['login', 'password'])

            login = params.get('login')
            password = params.get('password')

            # Validation du format email
            input_validator = request.env['input.validator']
            try:
                login = input_validator.validate_email(login)
            except Exception:
                # Si validation échoue, on garde la valeur originale (peut être un login non-email)
                pass

            # Authentification Odoo
            uid = request.session.authenticate(request.db, login, password)

            if not uid:
                _logger.warning(f"Tentative de connexion échouée pour: {login}")
                return self._handle_error(
                    Exception("Identifiants invalides"),
                    "authentification"
                )

            # Récupérer les informations utilisateur
            user = request.env['res.users'].browse(uid)
            partner = user.partner_id

            # Vérifier que c'est un utilisateur Portal
            is_portal = user.has_group('base.group_portal')

            _logger.info(f"Connexion réussie pour: {login} (uid={uid})")

            return self._success_response({
                'user': {
                    'id': partner.id,
                    'name': partner.name,
                    'email': partner.email,
                    'phone': partner.phone or '',
                    'is_portal': is_portal,
                },
                'session_id': request.session.sid,
            })

        except Exception as e:
            return self._handle_error(e, "authentification")

    @http.route('/api/ecommerce/auth/logout', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
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

            return self._success_response(
                message='Déconnexion réussie'
            )

        except Exception as e:
            return self._handle_error(e, "déconnexion")

    @http.route('/api/ecommerce/auth/session', type='json', auth='public', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
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

                return self._success_response({
                    'authenticated': True,
                    'user': {
                        'id': partner.id,
                        'name': partner.name,
                        'email': partner.email,
                        'phone': partner.phone or '',
                        'is_portal': user.has_group('base.group_portal'),
                    },
                    'session_id': request.session.sid,
                })
            else:
                return self._success_response({
                    'authenticated': False,
                    'user': None,
                })

        except Exception as e:
            return self._handle_error(e, "vérification de session")

    @http.route('/api/ecommerce/auth/register', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=3, window=300)  # 3 inscriptions par 5 minutes max (protection spam)
    def register(self, **kwargs):
        """
        Inscrit un nouveau client Portal avec validation sécurisée.

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

            # Validation des paramètres requis
            self._validate_required_params(params, ['name', 'email', 'password'])

            password = params.get('password')

            # Validation du mot de passe
            input_validator = request.env['input.validator']
            password_str = input_validator.validate_string(
                password,
                field_name="Mot de passe",
                min_length=6,
                max_length=100,
                required=True
            )

            # Validation et filtrage des données partner avec PartnerValidator
            partner_validator = request.env['partner.validator']
            validated_data = partner_validator.validate_registration_data(params)

            email = validated_data['email']

            # Vérifier si l'email existe déjà (double vérification après PartnerValidator)
            existing_user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)
            if existing_user:
                _logger.warning(f"Tentative d'inscription avec email existant: {email}")
                return self._handle_error(
                    Exception("Un compte existe déjà avec cet email"),
                    "inscription"
                )

            # Créer le partner avec données validées
            partner = request.env['res.partner'].sudo().create(validated_data)

            # Créer l'utilisateur Portal
            portal_group = request.env.ref('base.group_portal')
            user = request.env['res.users'].sudo().create({
                'login': email,
                'password': password_str,
                'partner_id': partner.id,
                'groups_id': [(6, 0, [portal_group.id])],
            })

            _logger.info(f"Nouveau compte créé: {email} (partner_id={partner.id}, user_id={user.id})")

            # Auto-login après inscription
            uid = request.session.authenticate(request.db, email, password_str)

            if uid:
                return self._success_response(
                    data={
                        'user': {
                            'id': partner.id,
                            'name': partner.name,
                            'email': partner.email,
                            'phone': partner.phone or '',
                        },
                        'session_id': request.session.sid,
                    },
                    message='Inscription réussie'
                )
            else:
                _logger.warning(f"Inscription réussie mais échec auto-login pour: {email}")
                return self._success_response(
                    data={
                        'user': {
                            'id': partner.id,
                            'name': partner.name,
                            'email': partner.email,
                        }
                    },
                    message='Inscription réussie. Veuillez vous connecter.'
                )

        except Exception as e:
            return self._handle_error(e, "inscription")

    @http.route('/api/ecommerce/auth/reset-password', type='json', auth='public', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=3, window=300)  # 3 tentatives par 5 minutes
    def reset_password(self, **kwargs):
        """
        Envoie un email de réinitialisation de mot de passe.

        Body JSON:
        {
            "email": "user@example.com"
        }

        Note: Retourne toujours success pour ne pas révéler si un email existe (sécurité)
        """
        try:
            params = request.jsonrequest

            # Validation du paramètre email
            self._validate_required_params(params, ['email'])

            email = params.get('email')

            # Validation du format email
            input_validator = request.env['input.validator']
            email = input_validator.validate_email(email)

            # Chercher l'utilisateur
            user = request.env['res.users'].sudo().search([('login', '=', email)], limit=1)

            if user:
                # Créer le lien de réinitialisation
                user.action_reset_password()
                _logger.info(f"Email de réinitialisation envoyé à: {email}")
            else:
                # Log mais ne révèle pas que l'email n'existe pas
                _logger.info(f"Tentative de reset pour email inexistant: {email}")

            # Par sécurité, on retourne toujours success même si l'email n'existe pas
            return self._success_response(
                message='Si cet email existe, un lien de réinitialisation a été envoyé'
            )

        except Exception as e:
            return self._handle_error(e, "réinitialisation de mot de passe")
