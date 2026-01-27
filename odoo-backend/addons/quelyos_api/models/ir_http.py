# -*- coding: utf-8 -*-
"""
Override de ir.http pour sécuriser l'accès à Odoo.
Bloque toutes les routes backend pour les utilisateurs non authentifiés.
"""
import logging
import os
from odoo import models
from odoo.http import request
from werkzeug.utils import redirect as werkzeug_redirect
from werkzeug.exceptions import Forbidden
from ..config import get_cors_headers, is_origin_allowed

_logger = logging.getLogger(__name__)

FRONTEND_LOGIN_URL = os.environ.get('FRONTEND_LOGIN_URL', 'http://localhost:3000/superadmin/login')

# Routes publiques autorisées (API e-commerce, assets, auth, etc.)
PUBLIC_ROUTES = [
    '/api/ecommerce/',
    '/api/auth/sso-redirect',
    '/api/auth/passkey-login',  # Passkey SSO endpoint
    '/api/auth/passkey/start',  # Passkey start with CORS
    '/auth/passkey-page',  # Passkey login page
    '/web/session/authenticate',  # Nécessaire pour le SSO
    '/web/session/get_session_info',
    '/auth/passkey/',  # Passkey auth
    '/web/image',
    '/web/content',
    '/web/assets',
    '/web/static',
    '/website/image',
    '/web/health',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
]

# Routes explicitement bloquées (même pour les admins non-superuser)
BLOCKED_ROUTES = [
    '/web/database/selector',
    '/web/database/manager',
    '/web/database/create',
    '/web/database/drop',
    '/web/database/backup',
    '/web/database/restore',
    '/web/database/duplicate',
    '/web/database/change_password',
    '/web/database/list',
]


class IrHttpSecure(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _dispatch(cls, endpoint):
        """
        Override de _dispatch pour bloquer les accès non autorisés.
        """
        path = request.httprequest.path

        # Gérer les requêtes OPTIONS (CORS preflight)
        if request.httprequest.method == 'OPTIONS':
            origin = request.httprequest.headers.get('Origin', '')
            if is_origin_allowed(origin):
                cors_headers = get_cors_headers(origin)
                return request.make_response('', headers=list(cors_headers.items()))

        # Bloquer les routes de gestion de base de données
        for blocked in BLOCKED_ROUTES:
            if path.startswith(blocked):
                _logger.warning(f"BLOCKED database route: {path} from {request.httprequest.remote_addr}")
                return werkzeug_redirect(FRONTEND_LOGIN_URL, code=302)

        # Autoriser les routes publiques
        for public in PUBLIC_ROUTES:
            if path.startswith(public):
                return super()._dispatch(endpoint)

        # Pour les routes backend (/web, /odoo, /), vérifier l'authentification
        backend_prefixes = ['/', '/web', '/odoo']
        is_backend = any(path == p or path.startswith(p + '/') for p in backend_prefixes)

        if is_backend and not path.startswith('/api/'):
            # Vérifier si l'utilisateur est authentifié
            if not request.session.uid:
                # Autoriser POST vers /web/login (SSO et Passkey)
                if path == '/web/login' and request.httprequest.method == 'POST':
                    _logger.info(f"Allowing POST to /web/login for SSO/Passkey auth")
                    return super()._dispatch(endpoint)

                _logger.info(f"Unauthenticated access to {path}, redirecting to frontend")
                return werkzeug_redirect(FRONTEND_LOGIN_URL, code=302)

        return super()._dispatch(endpoint)

    @classmethod
    def _post_dispatch(cls, response):
        """
        Override de _post_dispatch pour ajouter les headers CORS à toutes les réponses.
        Cette méthode est appelée après la conversion du résultat en Response HTTP.
        """
        # Appeler d'abord la méthode parent
        response = super()._post_dispatch(response)

        # Vérifier que la réponse existe et a des headers
        if not response or not hasattr(response, 'headers'):
            return response

        # Remplacer les headers CORS si l'origine est autorisée
        origin = request.httprequest.headers.get('Origin', '')
        if origin and is_origin_allowed(origin):
            # Supprimer les headers CORS par défaut d'Odoo (wildcard *)
            response.headers.pop('Access-Control-Allow-Origin', None)
            response.headers.pop('Access-Control-Allow-Methods', None)
            response.headers.pop('Access-Control-Allow-Headers', None)
            response.headers.pop('Access-Control-Max-Age', None)

            # Ajouter nos headers CORS spécifiques
            cors_headers = get_cors_headers(origin)
            for key, value in cors_headers.items():
                response.headers[key] = value

            _logger.debug(f"CORS headers applied for origin: {origin}")

        return response
