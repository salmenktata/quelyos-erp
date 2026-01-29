# -*- coding: utf-8 -*-
"""
Modèle Theme pour le Theme Engine propriétaire.

Stocke des configurations JSON complètes de thèmes (layouts, sections, variants).
Différent de theme_preset.py qui ne gère que des couleurs CSS.
"""

import json
import logging
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


class QuelyosTheme(models.Model):
    _name = 'quelyos.theme'
    _description = 'Theme Configuration (Theme Engine)'
    _order = 'sequence, name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    code = fields.Char(
        string='Code',
        required=True,
        index=True,
        help="Identifiant unique (ex: fashion-luxury)"
    )
    name = fields.Char(
        string='Nom',
        required=True,
        translate=True,
        help="Nom d'affichage du thème"
    )
    description = fields.Text(
        string='Description',
        translate=True,
        help="Description courte du thème"
    )
    category = fields.Selection(
        selection=[
            ('fashion', 'Mode'),
            ('tech', 'High-Tech'),
            ('food', 'Alimentaire'),
            ('beauty', 'Beauté'),
            ('sports', 'Sports'),
            ('home', 'Maison'),
            ('general', 'Général'),
        ],
        string='Catégorie',
        required=True,
        default='general',
        index=True,
        help="Catégorie du thème pour filtrage"
    )
    sequence = fields.Integer(
        string='Ordre',
        default=10,
        help="Ordre d'affichage dans la galerie"
    )
    active = fields.Boolean(
        string='Actif',
        default=True,
        help="Si désactivé, le thème n'apparaît plus"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONFIGURATION THEME
    # ═══════════════════════════════════════════════════════════════════════════

    config_json = fields.Text(
        string='Configuration JSON',
        required=True,
        help="Configuration complète du thème (layouts, sections, colors, typography)"
    )
    version = fields.Char(
        string='Version',
        default='1.0.0',
        help="Version du thème (semver)"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # VISIBILITÉ & MONÉTISATION
    # ═══════════════════════════════════════════════════════════════════════════

    is_public = fields.Boolean(
        string='Public',
        default=True,
        help="Si false, uniquement visible par tenants autorisés"
    )
    is_premium = fields.Boolean(
        string='Premium',
        default=False,
        help="Thème payant (nécessite achat)"
    )
    price = fields.Float(
        string='Prix (TND)',
        default=0.0,
        help="Prix du thème (0 = gratuit)"
    )
    tenant_ids = fields.Many2many(
        comodel_name='quelyos.tenant',
        relation='quelyos_theme_tenant_access_rel',
        column1='theme_id',
        column2='tenant_id',
        string='Tenants Autorisés',
        help="Si non public, seuls ces tenants peuvent utiliser ce thème"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉDIAS
    # ═══════════════════════════════════════════════════════════════════════════

    thumbnail = fields.Binary(
        string='Miniature',
        attachment=True,
        help="Image de prévisualisation (400x300px recommandé)"
    )
    preview_url = fields.Char(
        string='URL Preview',
        help="URL de démonstration live du thème"
    )
    screenshot_ids = fields.One2many(
        comodel_name='quelyos.theme.screenshot',
        inverse_name='theme_id',
        string='Screenshots',
        help="Captures d'écran du thème"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTRIQUES
    # ═══════════════════════════════════════════════════════════════════════════

    downloads = fields.Integer(
        string='Téléchargements',
        default=0,
        readonly=True,
        help="Nombre de fois que le thème a été activé"
    )
    rating = fields.Float(
        string='Note Moyenne',
        compute='_compute_rating',
        store=True,
        help="Note moyenne basée sur les reviews"
    )
    review_count = fields.Integer(
        string='Nombre Reviews',
        compute='_compute_rating',
        store=True
    )
    review_ids = fields.One2many(
        comodel_name='quelyos.theme.review',
        inverse_name='theme_id',
        string='Reviews'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Le code du thème doit être unique !'),
    ]

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('review_ids.rating')
    def _compute_rating(self):
        for theme in self:
            if theme.review_ids:
                theme.rating = sum(theme.review_ids.mapped('rating')) / len(theme.review_ids)
                theme.review_count = len(theme.review_ids)
            else:
                theme.rating = 0.0
                theme.review_count = 0

    # ═══════════════════════════════════════════════════════════════════════════
    # VALIDATION
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('config_json')
    def _check_config_json(self):
        """Valide que config_json est un JSON valide"""
        for record in self:
            if record.config_json:
                try:
                    config = json.loads(record.config_json)

                    # Vérifier champs obligatoires
                    required_fields = ['id', 'name', 'category', 'colors', 'typography', 'layouts', 'components', 'spacing']
                    for field in required_fields:
                        if field not in config:
                            raise ValidationError(_(
                                "Configuration JSON invalide : champ '%s' manquant"
                            ) % field)

                    # Vérifier que l'ID correspond au code
                    if config.get('id') != record.code:
                        raise ValidationError(_(
                            "L'ID dans le JSON (%s) doit correspondre au code du thème (%s)"
                        ) % (config.get('id'), record.code))

                except json.JSONDecodeError as e:
                    raise ValidationError(_(
                        "Configuration JSON invalide : %s"
                    ) % str(e))

    @api.constrains('code')
    def _check_code_format(self):
        """Valide le format du code (kebab-case)"""
        import re
        for record in self:
            if record.code:
                if not re.match(r'^[a-z0-9-]+$', record.code):
                    raise ValidationError(_(
                        "Le code doit être en kebab-case (lettres minuscules, chiffres et tirets uniquement)"
                    ))

    @api.constrains('price')
    def _check_price(self):
        """Valide que le prix est >= 0"""
        for record in self:
            if record.price < 0:
                raise ValidationError(_("Le prix ne peut pas être négatif"))

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES PUBLIQUES
    # ═══════════════════════════════════════════════════════════════════════════

    def get_theme_config(self):
        """
        Retourne la configuration JSON du thème sous forme de dict Python
        Utilisé par l'endpoint API
        """
        self.ensure_one()

        try:
            config = json.loads(self.config_json)
            return {
                'success': True,
                'theme': {
                    'id': self.code,
                    'name': self.name,
                    'description': self.description,
                    'category': self.category,
                    'version': self.version,
                    'is_premium': self.is_premium,
                    'price': self.price,
                    'rating': self.rating,
                    'downloads': self.downloads,
                    'config': config,
                }
            }
        except json.JSONDecodeError:
            return {
                'success': False,
                'error': 'Invalid JSON configuration'
            }

    def action_increment_downloads(self):
        """Incrémente le compteur de téléchargements"""
        self.ensure_one()
        self.sudo().write({'downloads': self.downloads + 1})

    def action_preview(self):
        """Ouvre l'URL de preview dans un nouvel onglet"""
        self.ensure_one()
        if not self.preview_url:
            raise UserError(_("Aucune URL de preview configurée pour ce thème"))

        return {
            'type': 'ir.actions.act_url',
            'url': self.preview_url,
            'target': 'new',
        }

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model
    def api_list_themes(self, category=None, limit=50, offset=0, tenant_id=None):
        """
        Liste les thèmes disponibles (pour endpoint API)

        Args:
            category (str): Filtrer par catégorie
            limit (int): Nombre max de résultats
            offset (int): Offset pour pagination
            tenant_id (int): ID tenant pour vérifier accès

        Returns:
            dict: Liste des thèmes avec métadonnées
        """
        domain = [('active', '=', True)]

        # Filtre catégorie
        if category:
            domain.append(('category', '=', category))

        # Filtre visibilité (public OU autorisé pour le tenant)
        if tenant_id:
            domain = ['&'] + domain + ['|', ('is_public', '=', True), ('tenant_ids', 'in', [tenant_id])]
        else:
            domain.append(('is_public', '=', True))

        # Recherche
        themes = self.search(domain, limit=limit, offset=offset, order='sequence, name')
        total = self.search_count(domain)

        return {
            'success': True,
            'themes': [{
                'id': theme.code,
                'name': theme.name,
                'description': theme.description,
                'category': theme.category,
                'is_premium': theme.is_premium,
                'price': theme.price,
                'rating': theme.rating,
                'review_count': theme.review_count,
                'downloads': theme.downloads,
                'thumbnail': f'/web/image/quelyos.theme/{theme.id}/thumbnail' if theme.thumbnail else None,
                'preview_url': theme.preview_url,
            } for theme in themes],
            'total': total,
            'limit': limit,
            'offset': offset,
        }


class QuelyosThemeScreenshot(models.Model):
    """Screenshots de thèmes pour la galerie"""
    _name = 'quelyos.theme.screenshot'
    _description = 'Screenshot Theme'
    _order = 'sequence'

    theme_id = fields.Many2one(
        comodel_name='quelyos.theme',
        string='Theme',
        required=True,
        ondelete='cascade'
    )
    sequence = fields.Integer(string='Ordre', default=10)
    name = fields.Char(string='Nom', help="Ex: Homepage, Product Page")
    image = fields.Binary(string='Image', required=True, attachment=True)


class QuelyosThemeReview(models.Model):
    """Reviews de thèmes par les utilisateurs"""
    _name = 'quelyos.theme.review'
    _description = 'Review Theme'
    _order = 'create_date desc'

    theme_id = fields.Many2one(
        comodel_name='quelyos.theme',
        string='Theme',
        required=True,
        ondelete='cascade',
        index=True
    )
    tenant_id = fields.Many2one(
        comodel_name='quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade'
    )
    user_id = fields.Many2one(
        comodel_name='res.users',
        string='Utilisateur',
        required=True,
        default=lambda self: self.env.user
    )
    rating = fields.Integer(
        string='Note',
        required=True,
        help="Note de 1 à 5"
    )
    title = fields.Char(string='Titre')
    comment = fields.Text(string='Commentaire')

    _sql_constraints = [
        ('rating_range', 'CHECK(rating >= 1 AND rating <= 5)', 'La note doit être entre 1 et 5'),
        ('unique_review', 'UNIQUE(theme_id, tenant_id)', 'Un seul avis par tenant par thème'),
    ]
