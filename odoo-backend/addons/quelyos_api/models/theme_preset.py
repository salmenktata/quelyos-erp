# -*- coding: utf-8 -*-
"""
Modèle Theme Preset pour la gestion des presets de thèmes prédéfinis.

Permet aux admins de créer des presets de thèmes que les clients peuvent
appliquer en un clic à leur boutique.
"""

import json
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from odoo.tools.translate import _


class QuelyosThemePreset(models.Model):
    _name = 'quelyos.theme.preset'
    _description = 'Preset de thème prédéfini'
    _order = 'sequence, name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Nom',
        required=True,
        help="Nom du preset (ex: Ocean, Sunset, Forest)"
    )
    code = fields.Char(
        string='Code unique',
        required=True,
        index=True,
        help="Identifiant unique du preset (ex: ocean, sunset)"
    )
    description = fields.Text(
        string='Description',
        help="Description courte du preset"
    )
    sequence = fields.Integer(
        string='Ordre',
        default=10,
        help="Ordre d'affichage (plus petit = premier)"
    )
    active = fields.Boolean(
        string='Actif',
        default=True,
        help="Si désactivé, le preset n'apparaît plus dans la liste"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # VISIBILITÉ
    # ═══════════════════════════════════════════════════════════════════════════

    public = fields.Boolean(
        string='Public',
        default=True,
        help="Si coché, visible par tous les tenants. Sinon, uniquement pour les tenants sélectionnés."
    )
    tenant_ids = fields.Many2many(
        'quelyos.tenant',
        string='Tenants autorisés',
        help="Tenants ayant accès à ce preset (si non public)"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COULEURS (13 CSS Variables)
    # ═══════════════════════════════════════════════════════════════════════════

    primary_color = fields.Char(
        string='Primaire',
        default='#4f46e5',
        required=True
    )
    primary_dark = fields.Char(
        string='Primaire Dark',
        default='#3730a3',
        required=True
    )
    primary_light = fields.Char(
        string='Primaire Light',
        default='#818cf8',
        required=True
    )
    secondary_color = fields.Char(
        string='Secondaire',
        default='#64748b',
        required=True
    )
    secondary_dark = fields.Char(
        string='Secondaire Dark',
        default='#475569',
        required=True
    )
    secondary_light = fields.Char(
        string='Secondaire Light',
        default='#94a3b8',
        required=True
    )
    accent_color = fields.Char(
        string='Accent',
        default='#f59e0b',
        required=True
    )
    background_color = fields.Char(
        string='Background',
        default='#ffffff',
        required=True
    )
    foreground_color = fields.Char(
        string='Foreground',
        default='#0f172a',
        required=True
    )
    muted_color = fields.Char(
        string='Muted',
        default='#f1f5f9',
        required=True
    )
    muted_foreground = fields.Char(
        string='Muted Foreground',
        default='#64748b',
        required=True
    )
    border_color = fields.Char(
        string='Border',
        default='#e2e8f0',
        required=True
    )
    ring_color = fields.Char(
        string='Ring',
        default='#4f46e5',
        required=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # TYPOGRAPHIE & OPTIONS
    # ═══════════════════════════════════════════════════════════════════════════

    font_family = fields.Selection(
        selection=[
            ('inter', 'Inter'),
            ('roboto', 'Roboto'),
            ('poppins', 'Poppins'),
            ('montserrat', 'Montserrat'),
            ('open-sans', 'Open Sans'),
            ('lato', 'Lato'),
        ],
        string='Police',
        default='inter',
        required=True
    )
    enable_dark_mode = fields.Boolean(
        string='Dark Mode Activé',
        default=True,
        help="Si coché, le dark mode est disponible"
    )
    default_dark = fields.Boolean(
        string='Dark par défaut',
        default=False,
        help="Si coché, le mode sombre est activé par défaut"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # PREVIEW
    # ═══════════════════════════════════════════════════════════════════════════

    thumbnail = fields.Binary(
        string='Miniature',
        help="Image de preview du preset",
        attachment=True
    )
    thumbnail_filename = fields.Char(
        string='Nom fichier miniature'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════
    @api.constrains('code')

    @api.constrains('code')
    def _check_code_unique(self):
        """Contrainte: Le code doit être unique !"""
        for record in self:
            # Chercher un doublon
            duplicate = self.search([
                ('code', '=', record.code),
                ('id', '!=', record.id)
            ], limit=1)

            if duplicate:
                raise ValidationError(_('Le code doit être unique !'))


    def _check_code(self):
        for preset in self:
            if not preset.code.isalnum() and '-' not in preset.code and '_' not in preset.code:
                raise ValidationError(
                    "Le code ne doit contenir que des lettres, chiffres, tirets ou underscores"
                )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES PUBLIQUES
    # ═══════════════════════════════════════════════════════════════════════════

    def to_frontend_config(self):
        """
        Convertit le preset en configuration pour le frontend.
        Retourne un dictionnaire compatible avec ThemePreset TypeScript.
        """
        self.ensure_one()

        return {
            'id': str(self.id),  # String pour compatibilité JS
            'code': self.code,
            'label': self.name,
            'description': self.description or '',
            'colors': {
                'primary': self.primary_color,
                'primaryDark': self.primary_dark,
                'primaryLight': self.primary_light,
                'secondary': self.secondary_color,
                'secondaryDark': self.secondary_dark,
                'secondaryLight': self.secondary_light,
                'accent': self.accent_color,
                'background': self.background_color,
                'foreground': self.foreground_color,
                'muted': self.muted_color,
                'mutedForeground': self.muted_foreground,
                'border': self.border_color,
                'ring': self.ring_color,
            },
            'fontFamily': self.font_family,
            'darkMode': {
                'enabled': self.enable_dark_mode,
                'defaultDark': self.default_dark,
            },
        }

    @api.model
    def get_presets_for_tenant(self, tenant_id):
        """
        Récupère les presets disponibles pour un tenant donné.
        Retourne les presets publics + les presets privés autorisés.
        """
        # Presets publics actifs
        public_presets = self.search([
            ('active', '=', True),
            ('public', '=', True)
        ], order='sequence, name')

        # Presets privés autorisés pour ce tenant
        private_presets = self.search([
            ('active', '=', True),
            ('public', '=', False),
            ('tenant_ids', 'in', [tenant_id])
        ], order='sequence, name')

        return public_presets | private_presets

    @api.model
    def create_default_presets(self):
        """
        Crée les presets par défaut si aucun n'existe.
        Appelé automatiquement lors de l'installation du module.
        """
        if self.search_count([]) > 0:
            return  # Des presets existent déjà

        defaults = [
            {
                'name': 'Le Sportif',
                'code': 'sportif',
                'description': 'Thème actuel, vert premium et contraste doux.',
                'sequence': 10,
                'primary_color': '#4f46e5',
                'primary_dark': '#3730a3',
                'primary_light': '#818cf8',
                'font_family': 'inter',
            },
            {
                'name': 'Ocean',
                'code': 'ocean',
                'description': 'Palette bleue, propre et moderne.',
                'sequence': 20,
                'primary_color': '#1d4ed8',
                'primary_dark': '#1e40af',
                'primary_light': '#3b82f6',
                'secondary_color': '#93c5fd',
                'secondary_dark': '#60a5fa',
                'secondary_light': '#bfdbfe',
                'accent_color': '#06b6d4',
                'font_family': 'roboto',
            },
            {
                'name': 'Sunset',
                'code': 'sunset',
                'description': 'Orange chaleureux, idéal pour lifestyle.',
                'sequence': 30,
                'primary_color': '#ea580c',
                'primary_dark': '#c2410c',
                'primary_light': '#fb923c',
                'secondary_color': '#fed7aa',
                'secondary_dark': '#fdba74',
                'secondary_light': '#ffedd5',
                'accent_color': '#ef4444',
                'background_color': '#ffffff',
                'foreground_color': '#111827',
                'muted_color': '#fff7ed',
                'muted_foreground': '#6b7280',
                'border_color': '#e5e7eb',
                'ring_color': '#ea580c',
                'font_family': 'poppins',
            },
        ]

        for data in defaults:
            self.create(data)
