# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class QuelyosSubscription(models.Model):
    """Abonnement client Quelyos"""
    _name = 'quelyos.subscription'
    _description = 'Abonnement client Quelyos'
    _inherit = ['mail.thread', 'mail.activity.mixin', 'subscription.quota.mixin']
    _order = 'create_date desc, id desc'

    name = fields.Char(string='Référence', required=True, copy=False, readonly=True, default=lambda self: _('Nouveau'))
    partner_id = fields.Many2one('res.partner', string='Client', required=True, ondelete='restrict', tracking=True)
    company_id = fields.Many2one('res.company', string='Société', default=lambda self: self.env.company)

    # Plan
    plan_id = fields.Many2one('quelyos.subscription.plan', string='Plan', required=True, ondelete='restrict', tracking=True)
    plan_code = fields.Selection(related='plan_id.code', string='Code plan', store=True, readonly=True)

    # État
    state = fields.Selection([
        ('trial', 'Période d\'essai'),
        ('active', 'Actif'),
        ('past_due', 'Paiement en retard'),
        ('cancelled', 'Annulé'),
        ('expired', 'Expiré'),
    ], string='État', default='trial', required=True, tracking=True)

    billing_cycle = fields.Selection([
        ('monthly', 'Mensuel'),
        ('yearly', 'Annuel'),
    ], string='Cycle de facturation', required=True, default='monthly', tracking=True)

    # Dates
    start_date = fields.Date(string='Date de début', required=True, default=fields.Date.today, tracking=True)
    trial_end_date = fields.Date(string='Fin de la période d\'essai')
    next_billing_date = fields.Date(string='Prochaine facturation')
    end_date = fields.Date(string='Date de fin')

    # Quotas et utilisation (copiés du plan à la création)
    max_users = fields.Integer(string='Max utilisateurs', required=True)
    max_products = fields.Integer(string='Max produits', required=True)
    max_orders_per_year = fields.Integer(string='Max commandes/an', required=True)

    # Utilisation actuelle (mis à jour par cron ou trigger)
    current_users_count = fields.Integer(string='Utilisateurs actuels', default=0)
    current_products_count = fields.Integer(string='Produits actuels', default=0)
    current_orders_count = fields.Integer(string='Commandes cette année', default=0)

    # Pourcentages d'utilisation (computed)
    users_usage_percentage = fields.Float(
        string='% utilisation utilisateurs',
        compute='_compute_usage_percentages',
        store=True
    )
    products_usage_percentage = fields.Float(
        string='% utilisation produits',
        compute='_compute_usage_percentages',
        store=True
    )
    orders_usage_percentage = fields.Float(
        string='% utilisation commandes',
        compute='_compute_usage_percentages',
        store=True
    )

    # Stripe
    stripe_subscription_id = fields.Char(string='Stripe Subscription ID')
    stripe_customer_id = fields.Char(string='Stripe Customer ID')

    @api.model
    def create(self, vals):
        """Génère une référence automatique et copie les limites du plan"""
        if vals.get('name', _('Nouveau')) == _('Nouveau'):
            vals['name'] = self.env['ir.sequence'].next_by_code('quelyos.subscription') or _('Nouveau')

        # Copier les limites du plan
        if vals.get('plan_id'):
            plan = self.env['quelyos.subscription.plan'].browse(vals['plan_id'])
            if 'max_users' not in vals:
                vals['max_users'] = plan.max_users
            if 'max_products' not in vals:
                vals['max_products'] = plan.max_products
            if 'max_orders_per_year' not in vals:
                vals['max_orders_per_year'] = plan.max_orders_per_year

        # Définir les dates par défaut pour la période d'essai
        if vals.get('state') == 'trial' and not vals.get('trial_end_date'):
            start = fields.Date.from_string(vals.get('start_date') or fields.Date.today())
            vals['trial_end_date'] = fields.Date.to_string(start + timedelta(days=14))

        return super().create(vals)

    @api.depends('current_users_count', 'max_users', 'current_products_count', 'max_products', 'current_orders_count', 'max_orders_per_year')
    def _compute_usage_percentages(self):
        """Calcule les pourcentages d'utilisation"""
        for subscription in self:
            subscription.users_usage_percentage = (
                (subscription.current_users_count / subscription.max_users * 100)
                if subscription.max_users > 0 else 0
            )
            subscription.products_usage_percentage = (
                (subscription.current_products_count / subscription.max_products * 100)
                if subscription.max_products > 0 else 0
            )
            subscription.orders_usage_percentage = (
                (subscription.current_orders_count / subscription.max_orders_per_year * 100)
                if subscription.max_orders_per_year > 0 else 0
            )

    def update_usage_counts(self):
        """Met à jour les compteurs d'utilisation depuis la base de données"""
        for subscription in self:
            partner = subscription.partner_id

            # Compter les utilisateurs (res.users liés au partner)
            subscription.current_users_count = self.env['res.users'].search_count([
                ('partner_id', '=', partner.id),
                ('active', '=', True)
            ])

            # Compter les produits (product.template du partner/company)
            subscription.current_products_count = self.env['product.template'].search_count([
                ('active', '=', True),
                '|', ('create_uid.partner_id', '=', partner.id),
                     ('company_id', '=', subscription.company_id.id)
            ])

            # Compter les commandes de l'année en cours
            current_year = datetime.now().year
            subscription.current_orders_count = self.env['sale.order'].search_count([
                ('partner_id', '=', partner.id),
                ('date_order', '>=', f'{current_year}-01-01'),
                ('date_order', '<=', f'{current_year}-12-31'),
                ('state', 'in', ['sale', 'done'])
            ])

    def check_quota(self, resource_type):
        """
        Vérifie si le quota d'une ressource est atteint
        :param resource_type: 'users', 'products' ou 'orders'
        :return: dict avec current, limit, is_limit_reached, percentage
        """
        self.ensure_one()
        self.update_usage_counts()

        quota_map = {
            'users': (self.current_users_count, self.max_users),
            'products': (self.current_products_count, self.max_products),
            'orders': (self.current_orders_count, self.max_orders_per_year),
        }

        if resource_type not in quota_map:
            raise ValidationError(_("Type de ressource invalide: %s") % resource_type)

        current, limit = quota_map[resource_type]
        percentage = (current / limit * 100) if limit > 0 else 0

        return {
            'current': current,
            'limit': limit,
            'is_limit_reached': current >= limit,
            'percentage': percentage,
        }

    def action_activate(self):
        """Activer l'abonnement"""
        self.write({'state': 'active'})

    def action_cancel(self):
        """Annuler l'abonnement"""
        self.write({'state': 'cancelled', 'end_date': fields.Date.today()})

    def action_expire(self):
        """Expirer l'abonnement"""
        self.write({'state': 'expired', 'end_date': fields.Date.today()})

    def _cron_check_trial_expiry(self):
        """Cron: Vérifier les périodes d'essai expirées"""
        today = fields.Date.today()
        expired_trials = self.search([
            ('state', '=', 'trial'),
            ('trial_end_date', '<', today)
        ])
        expired_trials.action_expire()

    def _cron_update_all_usage(self):
        """Cron: Mettre à jour l'utilisation de tous les abonnements actifs"""
        active_subscriptions = self.search([
            ('state', 'in', ['trial', 'active'])
        ])
        active_subscriptions.update_usage_counts()
