# -*- coding: utf-8 -*-
"""
Contrôleur API pour la gestion des presets de thèmes.

Endpoints:
- GET /api/ecommerce/theme-presets : Liste des presets disponibles (public)
- POST /api/ecommerce/theme-presets/create : Création (admin)
- PUT /api/ecommerce/theme-presets/<id>/update : Modification (admin)
- DELETE /api/ecommerce/theme-presets/<id>/delete : Suppression (admin)
"""

import json
import logging
from odoo import http
from odoo.http import request
from .base import BaseController

_logger = logging.getLogger(__name__)


class ThemePresetController(BaseController):
    """Contrôleur pour la gestion des presets de thèmes"""

    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS PUBLICS
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route(
        '/api/ecommerce/theme-presets',
        type='http',
        auth='public',
        methods=['GET', 'OPTIONS'],
        csrf=False,
        cors='*'
    )
    def list_presets(self, **kwargs):
        """
        Liste les presets de thèmes disponibles.
        Endpoint public utilisé par le dashboard client.

        Query params:
            tenant_id (optionnel): Si fourni, retourne aussi les presets privés du tenant

        Returns:
            {success: true, presets: ThemePreset[]}
        """
        if request.httprequest.method == 'OPTIONS':
            return self._preflight_response()

        try:
            tenant_id = kwargs.get('tenant_id')

            # SUDO justifié : Endpoint public doit lister les presets accessibles à tous
            # sans vérification droits utilisateur (pas d'auth requise).
            # Sécurité : Filtrage strict sur (public=True) ou tenant_id validé
            ThemePreset = request.env['quelyos.theme.preset'].sudo()

            if tenant_id:
                # Récupérer presets publics + privés autorisés
                try:
                    tenant_id = int(tenant_id)
                    presets = ThemePreset.get_presets_for_tenant(tenant_id)
                except ValueError:
                    # tenant_id invalide, retourner seulement publics
                    presets = ThemePreset.search([
                        ('active', '=', True),
                        ('public', '=', True)
                    ], order='sequence, name')
            else:
                # Seulement les presets publics
                presets = ThemePreset.search([
                    ('active', '=', True),
                    ('public', '=', True)
                ], order='sequence, name')

            # Convertir en config frontend
            presets_data = [preset.to_frontend_config() for preset in presets]

            return request.make_json_response({
                'success': True,
                'presets': presets_data,
                'total': len(presets_data)
            })

        except Exception as e:
            _logger.error(f"Error listing theme presets: {e}")
            return request.make_json_response({
                'success': False,
                'error': 'Erreur serveur',
                'error_code': 'SERVER_ERROR'
            }, status=500)

    # ═══════════════════════════════════════════════════════════════════════════
    # ENDPOINTS ADMIN (CRUD)
    # ═══════════════════════════════════════════════════════════════════════════

    @http.route(
        '/api/ecommerce/theme-presets/create',
        type='http',
        auth='public',
        methods=['POST', 'OPTIONS'],
        csrf=False,
        cors='*'
    )
    def create_preset(self, **kwargs):
        """
        Crée un nouveau preset de thème (admin seulement).

        Body JSON:
            name: Nom du preset
            code: Code unique
            description: Description
            colors: { primary, primaryDark, ... }
            fontFamily: Font à utiliser
            darkMode: { enabled, defaultDark }
            public: Boolean (visible par tous)
            tenantIds: Array (si non public)

        Returns:
            {success: true, preset: ThemePreset}
        """
        if request.httprequest.method == 'OPTIONS':
            return self._preflight_response()

        try:
            # Authentification admin requise
            error = self._authenticate_from_header()
            if error:
                return request.make_json_response(error, status=401)

            user = request.env.user
            if not user.has_group('base.group_system'):
                return request.make_json_response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs',
                    'error_code': 'FORBIDDEN'
                }, status=403)

            # Récupérer les données
            data = self._get_http_params()

            if not data.get('name') or not data.get('code'):
                return request.make_json_response({
                    'success': False,
                    'error': 'Champs name et code requis',
                    'error_code': 'MISSING_FIELDS'
                }, status=400)

            # Préparer les valeurs
            values = self._prepare_preset_values(data)

            # SUDO justifié : Après vérification has_group('base.group_system') ci-dessus,
            # sudo() nécessaire pour créer records sans contraintes ACL spécifiques.
            # Sécurité : Authentification admin validée (ligne 124-134)
            # Créer le preset
            ThemePreset = request.env['quelyos.theme.preset'].sudo()
            preset = ThemePreset.create(values)

            _logger.info(f"Theme preset created: {preset.code} by {user.login}")

            return request.make_json_response({
                'success': True,
                'preset': preset.to_frontend_config()
            })

        except Exception as e:
            _logger.error(f"Error creating theme preset: {e}")
            return request.make_json_response({
                'success': False,
                'error': str(e) if request.env.user.has_group('base.group_system') else 'Erreur lors de la création',
                'error_code': 'CREATE_ERROR'
            }, status=500)

    @http.route(
        '/api/ecommerce/theme-presets/<int:preset_id>/update',
        type='http',
        auth='public',
        methods=['PUT', 'POST', 'OPTIONS'],
        csrf=False,
        cors='*'
    )
    def update_preset(self, preset_id, **kwargs):
        """
        Met à jour un preset de thème (admin seulement).

        Returns:
            {success: true, preset: ThemePreset}
        """
        if request.httprequest.method == 'OPTIONS':
            return self._preflight_response()

        try:
            # Authentification admin requise
            error = self._authenticate_from_header()
            if error:
                return request.make_json_response(error, status=401)

            user = request.env.user
            if not user.has_group('base.group_system'):
                return request.make_json_response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs',
                    'error_code': 'FORBIDDEN'
                }, status=403)

            # SUDO justifié : Après vérification has_group('base.group_system') ci-dessus.
            # Nécessaire pour accéder au record sans contraintes ACL lors de l'update.
            # Sécurité : Admin validé (ligne 199-204)
            # Trouver le preset
            preset = request.env['quelyos.theme.preset'].sudo().browse(preset_id)
            if not preset.exists():
                return request.make_json_response({
                    'success': False,
                    'error': 'Preset non trouvé',
                    'error_code': 'NOT_FOUND'
                }, status=404)

            # Récupérer et préparer les données
            data = self._get_http_params()
            values = self._prepare_preset_values(data, update=True)

            # Mettre à jour
            preset.write(values)

            _logger.info(f"Theme preset updated: {preset.code} by {user.login}")

            return request.make_json_response({
                'success': True,
                'preset': preset.to_frontend_config()
            })

        except Exception as e:
            _logger.error(f"Error updating theme preset: {e}")
            return request.make_json_response({
                'success': False,
                'error': 'Erreur lors de la mise à jour',
                'error_code': 'UPDATE_ERROR'
            }, status=500)

    @http.route(
        '/api/ecommerce/theme-presets/<int:preset_id>/delete',
        type='http',
        auth='public',
        methods=['DELETE', 'POST', 'OPTIONS'],
        csrf=False,
        cors='*'
    )
    def delete_preset(self, preset_id, **kwargs):
        """
        Supprime un preset de thème (admin seulement).

        Returns:
            {success: true, message: string}
        """
        if request.httprequest.method == 'OPTIONS':
            return self._preflight_response()

        try:
            # Authentification admin requise
            error = self._authenticate_from_header()
            if error:
                return request.make_json_response(error, status=401)

            user = request.env.user
            if not user.has_group('base.group_system'):
                return request.make_json_response({
                    'success': False,
                    'error': 'Accès réservé aux administrateurs',
                    'error_code': 'FORBIDDEN'
                }, status=403)

            # SUDO justifié : Après vérification has_group('base.group_system') ci-dessus.
            # Nécessaire pour supprimer le record sans contraintes ACL.
            # Sécurité : Admin validé (ligne 265-270)
            # Trouver le preset
            preset = request.env['quelyos.theme.preset'].sudo().browse(preset_id)
            if not preset.exists():
                return request.make_json_response({
                    'success': False,
                    'error': 'Preset non trouvé',
                    'error_code': 'NOT_FOUND'
                }, status=404)

            code = preset.code
            preset.unlink()

            _logger.info(f"Theme preset deleted: {code} by {user.login}")

            return request.make_json_response({
                'success': True,
                'message': 'Preset supprimé avec succès'
            })

        except Exception as e:
            _logger.error(f"Error deleting theme preset: {e}")
            return request.make_json_response({
                'success': False,
                'error': 'Erreur lors de la suppression',
                'error_code': 'DELETE_ERROR'
            }, status=500)

    # ═══════════════════════════════════════════════════════════════════════════
    # HELPERS
    # ═══════════════════════════════════════════════════════════════════════════

    def _prepare_preset_values(self, data, update=False):
        """
        Prépare les valeurs pour create/update d'un preset.
        Gère la conversion frontend (camelCase) → backend (snake_case).
        """
        values = {}

        # Champs simples
        if 'name' in data:
            values['name'] = data['name']
        if 'code' in data and not update:  # Code non modifiable en update
            values['code'] = data['code']
        if 'description' in data:
            values['description'] = data['description']
        if 'sequence' in data:
            values['sequence'] = int(data['sequence'])
        if 'active' in data:
            values['active'] = bool(data['active'])
        if 'public' in data:
            values['public'] = bool(data['public'])

        # Couleurs (accepter camelCase ou snake_case)
        colors = data.get('colors', {})
        if colors:
            color_mapping = {
                'primary': 'primary_color',
                'primaryDark': 'primary_dark',
                'primaryLight': 'primary_light',
                'secondary': 'secondary_color',
                'secondaryDark': 'secondary_dark',
                'secondaryLight': 'secondary_light',
                'accent': 'accent_color',
                'background': 'background_color',
                'foreground': 'foreground_color',
                'muted': 'muted_color',
                'mutedForeground': 'muted_foreground',
                'border': 'border_color',
                'ring': 'ring_color',
            }
            for camel_key, snake_key in color_mapping.items():
                if camel_key in colors:
                    values[snake_key] = colors[camel_key]

        # Ou couleurs direct snake_case
        for key in ['primary_color', 'primary_dark', 'primary_light',
                    'secondary_color', 'secondary_dark', 'secondary_light',
                    'accent_color', 'background_color', 'foreground_color',
                    'muted_color', 'muted_foreground', 'border_color', 'ring_color']:
            if key in data:
                values[key] = data[key]

        # Typographie
        if 'fontFamily' in data:
            values['font_family'] = data['fontFamily']
        elif 'font_family' in data:
            values['font_family'] = data['font_family']

        # Dark mode
        dark_mode = data.get('darkMode', {})
        if dark_mode:
            if 'enabled' in dark_mode:
                values['enable_dark_mode'] = bool(dark_mode['enabled'])
            if 'defaultDark' in dark_mode:
                values['default_dark'] = bool(dark_mode['defaultDark'])

        # Ou dark mode direct
        if 'enable_dark_mode' in data:
            values['enable_dark_mode'] = bool(data['enable_dark_mode'])
        if 'default_dark' in data:
            values['default_dark'] = bool(data['default_dark'])

        # Tenants autorisés (si non public)
        if 'tenantIds' in data and isinstance(data['tenantIds'], list):
            values['tenant_ids'] = [(6, 0, data['tenantIds'])]  # Replace all

        return values
