from odoo import models, fields, api


class QuelyosPaymentFlow(models.Model):
    _name = 'quelyos.payment.flow'
    _description = 'Flux de paiement'
    _order = 'name'

    name = fields.Char(string='Nom', required=True, index=True)
    flow_type = fields.Selection([
        ('cash', 'Espèces'),
        ('card', 'Carte bancaire'),
        ('check', 'Chèque'),
        ('transfer', 'Virement'),
        ('direct_debit', 'Prélèvement'),
        ('bill_of_exchange', 'Lettre de change'),
        ('other', 'Autre'),
    ], string='Type', required=True, default='transfer')
    account_id = fields.Many2one(
        'account.account',
        string='Compte associé',
        domain="[('account_type', 'in', ['asset_cash', 'liability_credit_card'])]"
    )
    is_active = fields.Boolean(string='Actif', default=True)
    is_default = fields.Boolean(string='Par défaut', default=False)
    reference = fields.Char(string='Référence')
    limit_amount = fields.Monetary(string='Montant limite', currency_field='currency_id')
    expires_at = fields.Date(string='Date d\'expiration')
    company_id = fields.Many2one(
        'res.company', string='Société',
        default=lambda self: self.env.company,
        required=True
    )
    currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        string='Devise'
    )

    @api.model
    def create(self, vals):
        # Si ce flux est défini comme par défaut, désactiver les autres
        if vals.get('is_default'):
            self.search([
                ('company_id', '=', vals.get('company_id', self.env.company.id)),
                ('is_default', '=', True)
            ]).write({'is_default': False})
        return super().create(vals)

    def write(self, vals):
        if vals.get('is_default'):
            self.search([
                ('company_id', '=', self.company_id.id),
                ('is_default', '=', True),
                ('id', '!=', self.id)
            ]).write({'is_default': False})
        return super().write(vals)

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.flow_type,
            'accountId': self.account_id.id if self.account_id else None,
            'isActive': self.is_active,
            'isDefault': self.is_default,
            'reference': self.reference or '',
            'limitAmount': self.limit_amount,
            'expiresAt': self.expires_at.isoformat() if self.expires_at else None,
        }
