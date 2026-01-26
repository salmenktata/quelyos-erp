from odoo import models, fields, api
from datetime import date, timedelta


class QuelyosBudget(models.Model):
    _name = 'quelyos.budget'
    _description = 'Budget Quelyos'
    _order = 'name'

    name = fields.Char(string='Nom', required=True, index=True)
    amount = fields.Monetary(string='Montant budgété', required=True, currency_field='currency_id')
    period = fields.Selection([
        ('weekly', 'Hebdomadaire'),
        ('biweekly', 'Bi-hebdomadaire'),
        ('monthly', 'Mensuel'),
        ('quarterly', 'Trimestriel'),
        ('yearly', 'Annuel'),
        ('custom', 'Personnalisé'),
    ], string='Période', required=True, default='monthly')
    start_date = fields.Date(string='Date de début')
    end_date = fields.Date(string='Date de fin')
    start_day = fields.Integer(string='Jour de début', default=1, help='Jour du mois pour le début de période')
    category_id = fields.Many2one('quelyos.category', string='Catégorie', ondelete='set null')
    portfolio_id = fields.Many2one('quelyos.portfolio', string='Portefeuille', ondelete='set null')
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
    active = fields.Boolean(default=True)

    # Champs calculés
    current_spending = fields.Monetary(
        string='Dépenses actuelles',
        compute='_compute_spending',
        currency_field='currency_id'
    )
    remaining = fields.Monetary(
        string='Restant',
        compute='_compute_spending',
        currency_field='currency_id'
    )
    percentage_used = fields.Float(
        string='% utilisé',
        compute='_compute_spending'
    )
    status = fields.Selection([
        ('on_track', 'En bonne voie'),
        ('warning', 'Attention'),
        ('exceeded', 'Dépassé'),
    ], string='Statut', compute='_compute_spending')

    def _get_period_dates(self):
        """Retourne les dates de début et fin de la période actuelle"""
        today = date.today()

        if self.period == 'weekly':
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
        elif self.period == 'biweekly':
            start = today - timedelta(days=today.weekday() + 7 if today.day > 15 else today.weekday())
            end = start + timedelta(days=13)
        elif self.period == 'monthly':
            start = today.replace(day=self.start_day or 1)
            if start > today:
                start = (start - timedelta(days=32)).replace(day=self.start_day or 1)
            next_month = start + timedelta(days=32)
            end = next_month.replace(day=self.start_day or 1) - timedelta(days=1)
        elif self.period == 'quarterly':
            quarter = (today.month - 1) // 3
            start = today.replace(month=quarter * 3 + 1, day=1)
            end = (start + timedelta(days=93)).replace(day=1) - timedelta(days=1)
        elif self.period == 'yearly':
            start = today.replace(month=1, day=1)
            end = today.replace(month=12, day=31)
        else:  # custom
            start = self.start_date or today.replace(day=1)
            end = self.end_date or today

        return start, end

    @api.depends('amount', 'category_id', 'period')
    def _compute_spending(self):
        for budget in self:
            start_date, end_date = budget._get_period_dates()

            # Calculer les dépenses depuis account.move.line
            domain = [
                ('company_id', '=', budget.company_id.id),
                ('date', '>=', start_date),
                ('date', '<=', end_date),
                ('parent_state', '=', 'posted'),
            ]

            if budget.category_id:
                domain.append(('analytic_distribution', 'ilike', str(budget.category_id.id)))

            move_lines = self.env['account.move.line'].search(domain)
            total_debit = sum(move_lines.mapped('debit'))

            budget.current_spending = total_debit
            budget.remaining = budget.amount - total_debit
            budget.percentage_used = (total_debit / budget.amount * 100) if budget.amount else 0

            if budget.percentage_used >= 100:
                budget.status = 'exceeded'
            elif budget.percentage_used >= 80:
                budget.status = 'warning'
            else:
                budget.status = 'on_track'

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'amount': self.amount,
            'period': self.period,
            'startDate': self.start_date.isoformat() if self.start_date else None,
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'categoryId': self.category_id.id if self.category_id else None,
            'categoryName': self.category_id.name if self.category_id else None,
            'portfolioId': self.portfolio_id.id if self.portfolio_id else None,
            'currentSpending': self.current_spending,
            'spent': self.current_spending,  # Alias
            'remaining': self.remaining,
            'percentageUsed': self.percentage_used,
            'status': self.status,
        }
