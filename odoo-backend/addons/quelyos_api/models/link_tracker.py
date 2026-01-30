# -*- coding: utf-8 -*-
from odoo import models, fields, api
import secrets
import hashlib
from urllib.parse import urlparse


class LinkTracker(models.Model):
    """
    Suivi des clics sur les liens dans les campagnes marketing.
    Compatible avec traçabilité email standard.
    """
    _name = 'quelyos.link.tracker'
    _description = 'Link Tracker (Suivi des clics)'
    _order = 'create_date desc'

    name = fields.Char(
        string='Nom du lien',
        compute='_compute_name',
        store=True
    )

    # URL cible
    url = fields.Char(
        string='URL cible',
        required=True,
        help='URL de destination vers laquelle rediriger'
    )

    # Token unique pour redirection
    token = fields.Char(
        string='Token',
        required=True,
        index=True,
        readonly=True,
        help='Token unique pour /r/<token>'
    )

    # Campagne associée
    campaign_id = fields.Many2one(
        'quelyos.marketing.campaign',
        string='Campagne',
        ondelete='cascade',
        help='Campagne email contenant ce lien'
    )

    # Statistiques
    click_count = fields.Integer(
        string='Nombre de clics',
        default=0,
        readonly=True
    )

    unique_click_count = fields.Integer(
        string='Clics uniques',
        compute='_compute_unique_clicks',
        store=True
    )

    last_click_date = fields.Datetime(
        string='Dernier clic',
        readonly=True
    )

    # Relations
    click_ids = fields.One2many(
        'quelyos.link.tracker.click',
        'link_id',
        string='Clics',
        readonly=True
    )

    # Métadonnées
    active = fields.Boolean(default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        default=lambda self: self.env.company
    )

    _sql_constraints = [
        ('token_unique', 'UNIQUE(token)',
         'Le token doit être unique'),
    ]

    @api.depends('url')
    def _compute_name(self):
        """Générer nom basé sur URL"""
        for record in self:
            if record.url:
                parsed = urlparse(record.url)
                domain = parsed.netloc or 'unknown'
                path = parsed.path[:30] if parsed.path else '/'
                record.name = f"{domain}{path}"
            else:
                record.name = "Lien sans URL"

    @api.depends('click_ids')
    def _compute_unique_clicks(self):
        """Compter clics uniques (par IP ou session)"""
        for record in self:
            if record.click_ids:
                unique_ips = set(record.click_ids.mapped('ip_address'))
                record.unique_click_count = len(unique_ips)
            else:
                record.unique_click_count = 0

    @api.model
    def create(self, vals):
        """Générer token unique lors de la création"""
        if not vals.get('token'):
            vals['token'] = self._generate_token(vals.get('url', ''))
        return super().create(vals)

    def _generate_token(self, url):
        """Générer token sécurisé pour /r/<token>"""
        random_part = secrets.token_urlsafe(12)
        url_hash = hashlib.sha256(url.encode()).hexdigest()[:6]
        return f"{url_hash}_{random_part}"

    @api.model
    def get_or_create_link(self, url, campaign_id=None):
        """
        Récupérer ou créer un lien tracké pour une URL.
        Réutilise le même token si URL déjà trackée dans la même campagne.
        """
        # Chercher lien existant
        domain = [('url', '=', url)]
        if campaign_id:
            domain.append(('campaign_id', '=', campaign_id))

        existing = self.search(domain, limit=1)
        if existing:
            return existing

        # Créer nouveau lien
        return self.create({
            'url': url,
            'campaign_id': campaign_id,
        })

    def register_click(self, ip_address=None, user_agent=None, referer=None):
        """Enregistrer un clic sur ce lien"""
        self.ensure_one()

        Click = self.env['quelyos.link.tracker.click'].sudo()
        click = Click.create({
            'link_id': self.id,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'referer': referer,
        })

        # Mettre à jour stats du lien
        self.write({
            'click_count': self.click_count + 1,
            'last_click_date': fields.Datetime.now(),
        })

        # Incrémenter stats_clicked de la campagne
        if self.campaign_id:
            self.campaign_id.write({
                'stats_clicked': self.campaign_id.stats_clicked + 1
            })

        return click

    def get_redirect_url(self, base_url):
        """Générer URL de redirection trackée"""
        self.ensure_one()
        return f"{base_url}/r/{self.token}"

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'token': self.token,
            'campaign_id': self.campaign_id.id if self.campaign_id else None,
            'campaign_name': self.campaign_id.name if self.campaign_id else None,
            'click_count': self.click_count,
            'unique_click_count': self.unique_click_count,
            'last_click_date': self.last_click_date.isoformat() if self.last_click_date else None,
            'create_date': self.create_date.isoformat() if self.create_date else None,
        }


class LinkTrackerClick(models.Model):
    """Enregistrement individuel de chaque clic sur un lien tracké"""
    _name = 'quelyos.link.tracker.click'
    _description = 'Link Tracker Click'
    _order = 'create_date desc'

    link_id = fields.Many2one(
        'quelyos.link.tracker',
        string='Lien',
        required=True,
        ondelete='cascade',
        index=True
    )

    # Métadonnées du clic
    ip_address = fields.Char(
        string='Adresse IP',
        help='IP du visiteur'
    )

    user_agent = fields.Char(
        string='User Agent',
        help='Navigateur/appareil du visiteur'
    )

    referer = fields.Char(
        string='Referer',
        help='Page depuis laquelle le clic provient'
    )

    # Géolocalisation (optionnel, peut être ajouté plus tard)
    country_code = fields.Char(
        string='Pays',
        size=2,
        help='Code ISO pays (ex: FR, TN)'
    )

    city = fields.Char(string='Ville')

    # Timestamp
    click_date = fields.Datetime(
        string='Date du clic',
        default=fields.Datetime.now,
        readonly=True
    )

    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='link_id.company_id',
        store=True
    )

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'link_id': self.link_id.id,
            'link_url': self.link_id.url,
            'ip_address': self.ip_address or 'Unknown',
            'user_agent': self.user_agent or 'Unknown',
            'referer': self.referer or '',
            'country_code': self.country_code or '',
            'city': self.city or '',
            'click_date': self.click_date.isoformat() if self.click_date else None,
        }
