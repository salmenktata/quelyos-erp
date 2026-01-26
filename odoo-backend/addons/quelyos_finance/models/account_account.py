from odoo import models, fields, api


class AccountAccountExtension(models.Model):
    _inherit = 'account.account'

    # Champs custom pour Quelyos Finance
    x_institution = fields.Char(string='Institution bancaire')
    x_notes = fields.Text(string='Notes')
    x_account_number = fields.Char(string='Numéro de compte')
    x_is_shared = fields.Boolean(string='Compte partagé', default=False)
    x_status = fields.Selection([
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('archived', 'Archivé'),
    ], string='Statut Quelyos', default='active')
    x_portfolio_ids = fields.Many2many(
        'quelyos.portfolio',
        'quelyos_portfolio_account_rel',
        'account_id',
        'portfolio_id',
        string='Portefeuilles'
    )

    # Type de compte simplifié pour le frontend
    x_quelyos_type = fields.Selection([
        ('banque', 'Compte bancaire'),
        ('cash', 'Caisse'),
        ('cheques', 'Chèques'),
        ('traites', 'Traites'),
        ('carte', 'Carte de crédit'),
        ('epargne', 'Épargne'),
        ('investissement', 'Investissement'),
        ('pret', 'Prêt'),
    ], string='Type Quelyos', compute='_compute_quelyos_type', store=True)

    @api.depends('account_type')
    def _compute_quelyos_type(self):
        """Mappe le type de compte Odoo vers le type Quelyos"""
        mapping = {
            'asset_cash': 'banque',
            'asset_current': 'epargne',
            'asset_non_current': 'investissement',
            'liability_credit_card': 'carte',
            'liability_current': 'pret',
        }
        for account in self:
            account.x_quelyos_type = mapping.get(account.account_type, 'banque')

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'type': self.x_quelyos_type or 'banque',
            'balance': self.current_balance if hasattr(self, 'current_balance') else 0,
            'currency': self.currency_id.name if self.currency_id else 'EUR',
            'institution': self.x_institution or '',
            'accountNumber': self.x_account_number or '',
            'notes': self.x_notes or '',
            'status': self.x_status or 'active',
            'isArchived': self.x_status == 'archived',
            'portfolioIds': self.x_portfolio_ids.ids,
        }
