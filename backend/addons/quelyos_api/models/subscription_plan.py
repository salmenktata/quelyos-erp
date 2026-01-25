# -*- coding: utf-8 -*-
from odoo import api, fields, models


class QuelyosSubscriptionPlan(models.Model):
    """Plan d'abonnement Quelyos (Starter, Pro, Enterprise)"""
    _name = 'quelyos.subscription.plan'
    _description = "Plan d'abonnement Quelyos"
    _order = 'display_order, id'

    name = fields.Char(string='Nom du plan', required=True, translate=True)
    code = fields.Selection([
        ('starter', 'Starter'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ], string='Code', required=True)
    description = fields.Text(string='Description', translate=True)

    # Tarifs
    price_monthly = fields.Float(string='Prix mensuel (€)', required=True, digits=(12, 2))
    price_yearly = fields.Float(string='Prix annuel (€)', required=True, digits=(12, 2))

    # Limites
    max_users = fields.Integer(string='Max utilisateurs', required=True, default=1)
    max_products = fields.Integer(string='Max produits', required=True, default=100)
    max_orders_per_year = fields.Integer(string='Max commandes/an', required=True, default=1000)

    # Support
    support_level = fields.Selection([
        ('email_48h', 'Email - 48h'),
        ('email_chat_24h', 'Email + Chat - 24h'),
        ('dedicated_2h', 'Dédié - 2h'),
    ], string='Niveau de support', required=True, default='email_48h')

    # Fonctionnalités (JSON stocké comme text)
    features = fields.Text(string='Fonctionnalités (JSON)')

    # Affichage
    is_popular = fields.Boolean(string='Plan populaire', default=False)
    display_order = fields.Integer(string='Ordre d\'affichage', default=10)
    active = fields.Boolean(string='Actif', default=True)

    # Stripe
    stripe_price_id_monthly = fields.Char(string='Stripe Price ID (Mensuel)')
    stripe_price_id_yearly = fields.Char(string='Stripe Price ID (Annuel)')

    # Computed
    subscription_count = fields.Integer(
        string='Nombre d\'abonnements',
        compute='_compute_subscription_count'
    )

    @api.depends('code')
    def _compute_subscription_count(self):
        """Compte le nombre d'abonnements actifs pour ce plan"""
        for plan in self:
            plan.subscription_count = self.env['quelyos.subscription'].search_count([
                ('plan_id', '=', plan.id),
                ('state', 'in', ['trial', 'active'])
            ])

    def get_features_list(self):
        """Retourne les fonctionnalités sous forme de liste Python"""
        self.ensure_one()
        if not self.features:
            return []
        import json
        try:
            return json.loads(self.features)
        except:
            return []

    def set_features_list(self, features_list):
        """Définit les fonctionnalités depuis une liste Python"""
        self.ensure_one()
        import json
        self.features = json.dumps(features_list, ensure_ascii=False)
