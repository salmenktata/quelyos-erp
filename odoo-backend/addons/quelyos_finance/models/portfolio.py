from odoo import models, fields, api


class QuelyosPortfolio(models.Model):
    _name = 'quelyos.portfolio'
    _description = 'Portefeuille de comptes'
    _order = 'name'

    name = fields.Char(string='Nom', required=True, index=True)
    description = fields.Text(string='Description')
    status = fields.Selection([
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
    ], string='Statut', default='active', required=True)
    account_ids = fields.Many2many(
        'account.account',
        'quelyos_portfolio_account_rel',
        'portfolio_id',
        'account_id',
        string='Comptes'
    )
    company_id = fields.Many2one(
        'res.company', string='Société',
        default=lambda self: self.env.company,
        required=True
    )
    active = fields.Boolean(default=True)

    # Champs calculés
    total_balance = fields.Monetary(
        string='Solde total',
        compute='_compute_total_balance',
        currency_field='currency_id'
    )
    currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        string='Devise'
    )
    account_count = fields.Integer(
        string='Nombre de comptes',
        compute='_compute_account_count'
    )

    @api.depends('account_ids')
    def _compute_account_count(self):
        for portfolio in self:
            portfolio.account_count = len(portfolio.account_ids)

    @api.depends('account_ids')
    def _compute_total_balance(self):
        for portfolio in self:
            # Calcul du solde total des comptes du portefeuille
            total = 0.0
            for account in portfolio.account_ids:
                # Utiliser la balance du compte
                total += account.current_balance if hasattr(account, 'current_balance') else 0.0
            portfolio.total_balance = total

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'status': self.status,
            'accountIds': self.account_ids.ids,
            'accountCount': self.account_count,
            'totalBalance': self.total_balance,
            'currency': self.currency_id.name if self.currency_id else 'EUR',
        }
