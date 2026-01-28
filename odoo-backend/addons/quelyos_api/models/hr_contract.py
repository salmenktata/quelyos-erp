# -*- coding: utf-8 -*-
"""
Modèle Contrat de Travail RH.

Gère les contrats des employés : CDI, CDD, Stage, Intérim.
Inclut salaire, période d'essai, dates de validité.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class HRContract(models.Model):
    _name = 'quelyos.hr.contract'
    _description = 'Contrat de Travail'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Référence',
        required=True,
        copy=False,
        readonly=True,
        default='Nouveau',
        tracking=True,
        help="Référence unique du contrat"
    )
    active = fields.Boolean(
        string='Actif',
        default=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # EMPLOYÉ & POSTE
    # ═══════════════════════════════════════════════════════════════════════════

    employee_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Employé',
        required=True,
        tracking=True,
        domain="[('tenant_id', '=', tenant_id)]"
    )
    department_id = fields.Many2one(
        'quelyos.hr.department',
        string='Département',
        tracking=True,
        domain="[('tenant_id', '=', tenant_id)]"
    )
    job_id = fields.Many2one(
        'quelyos.hr.job',
        string='Poste',
        tracking=True,
        domain="[('tenant_id', '=', tenant_id)]"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # TYPE DE CONTRAT
    # ═══════════════════════════════════════════════════════════════════════════

    contract_type = fields.Selection([
        ('cdi', 'CDI - Contrat à Durée Indéterminée'),
        ('cdd', 'CDD - Contrat à Durée Déterminée'),
        ('stage', 'Stage'),
        ('interim', 'Intérim'),
        ('apprenticeship', 'Apprentissage'),
        ('freelance', 'Freelance'),
    ], string='Type de contrat', required=True, default='cdi', tracking=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # DATES
    # ═══════════════════════════════════════════════════════════════════════════

    date_start = fields.Date(
        string='Date de début',
        required=True,
        tracking=True,
        help="Date de prise d'effet du contrat"
    )
    date_end = fields.Date(
        string='Date de fin',
        tracking=True,
        help="Date de fin du contrat (obligatoire pour CDD/Stage)"
    )
    trial_date_end = fields.Date(
        string='Fin période d\'essai',
        tracking=True,
        help="Date de fin de la période d'essai"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # RÉMUNÉRATION
    # ═══════════════════════════════════════════════════════════════════════════

    wage = fields.Monetary(
        string='Salaire brut',
        required=True,
        tracking=True,
        help="Salaire brut selon la périodicité"
    )
    wage_type = fields.Selection([
        ('monthly', 'Mensuel'),
        ('hourly', 'Horaire'),
    ], string='Type de salaire', default='monthly', required=True)

    currency_id = fields.Many2one(
        'res.currency',
        string='Devise',
        default=lambda self: self.env.company.currency_id,
        required=True
    )

    schedule_pay = fields.Selection([
        ('monthly', 'Mensuel'),
        ('bi-monthly', 'Bimensuel'),
        ('weekly', 'Hebdomadaire'),
    ], string='Périodicité de paie', default='monthly', required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # TEMPS DE TRAVAIL
    # ═══════════════════════════════════════════════════════════════════════════

    hours_per_week = fields.Float(
        string='Heures/semaine',
        default=40.0,
        help="Durée hebdomadaire de travail"
    )
    time_type = fields.Selection([
        ('full', 'Temps plein'),
        ('part', 'Temps partiel'),
    ], string='Type de temps', default='full')

    # ═══════════════════════════════════════════════════════════════════════════
    # STATUT
    # ═══════════════════════════════════════════════════════════════════════════

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('open', 'En cours'),
        ('close', 'Expiré'),
        ('cancel', 'Annulé'),
    ], string='État', default='draft', tracking=True, required=True)

    kanban_state = fields.Selection([
        ('normal', 'En attente'),
        ('done', 'Prêt'),
        ('blocked', 'Bloqué'),
    ], string='État Kanban', default='normal')

    # ═══════════════════════════════════════════════════════════════════════════
    # NOTES
    # ═══════════════════════════════════════════════════════════════════════════

    notes = fields.Html(
        string='Notes',
        help="Informations complémentaires sur le contrat"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # AVANTAGES
    # ═══════════════════════════════════════════════════════════════════════════

    advantages = fields.Text(
        string='Avantages',
        help="Avantages en nature, primes, etc."
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        index=True
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='tenant_id.company_id',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for contract in self:
            if contract.date_end and contract.date_start > contract.date_end:
                raise ValidationError(_("La date de fin doit être postérieure à la date de début !"))

    @api.constrains('contract_type', 'date_end')
    def _check_date_end_required(self):
        for contract in self:
            if contract.contract_type in ('cdd', 'stage', 'interim') and not contract.date_end:
                raise ValidationError(_("La date de fin est obligatoire pour un %s !") % dict(
                    self._fields['contract_type'].selection).get(contract.contract_type))

    # ═══════════════════════════════════════════════════════════════════════════
    # CRUD
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', 'Nouveau') == 'Nouveau':
                vals['name'] = self.env['ir.sequence'].next_by_code('quelyos.hr.contract') or 'CTR-0001'
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # ACTIONS
    # ═══════════════════════════════════════════════════════════════════════════

    def action_open(self):
        """Passer le contrat en cours."""
        for contract in self:
            contract.state = 'open'
            # Mettre à jour l'employé
            contract.employee_id.write({
                'department_id': contract.department_id.id,
                'job_id': contract.job_id.id,
            })

    def action_close(self):
        """Clôturer le contrat."""
        self.write({'state': 'close'})

    def action_cancel(self):
        """Annuler le contrat."""
        self.write({'state': 'cancel'})

    def action_draft(self):
        """Remettre en brouillon."""
        self.write({'state': 'draft'})

    # ═══════════════════════════════════════════════════════════════════════════
    # CRON
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model
    def _cron_check_contract_expiry(self):
        """Cron pour détecter les contrats arrivant à expiration."""
        today = fields.Date.today()
        # Contrats expirant dans 30 jours
        expiring_soon = self.search([
            ('state', '=', 'open'),
            ('date_end', '!=', False),
            ('date_end', '<=', fields.Date.add(today, days=30)),
            ('date_end', '>=', today),
        ])
        for contract in expiring_soon:
            # Créer une activité de suivi
            contract.activity_schedule(
                'mail.mail_activity_data_todo',
                date_deadline=contract.date_end,
                summary=_("Contrat arrivant à expiration"),
                note=_("Le contrat de %s expire le %s.") % (
                    contract.employee_id.name,
                    contract.date_end
                ),
            )

        # Contrats expirés
        expired = self.search([
            ('state', '=', 'open'),
            ('date_end', '!=', False),
            ('date_end', '<', today),
        ])
        expired.action_close()

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_contract_data(self):
        """Retourne les données du contrat pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'employee_id': self.employee_id.id,
            'employee_name': self.employee_id.name,
            'department_id': self.department_id.id if self.department_id else None,
            'department_name': self.department_id.name if self.department_id else None,
            'job_id': self.job_id.id if self.job_id else None,
            'job_title': self.job_id.name if self.job_id else None,
            'contract_type': self.contract_type,
            'contract_type_label': dict(self._fields['contract_type'].selection).get(self.contract_type),
            'date_start': self.date_start.isoformat() if self.date_start else None,
            'date_end': self.date_end.isoformat() if self.date_end else None,
            'trial_date_end': self.trial_date_end.isoformat() if self.trial_date_end else None,
            'wage': self.wage,
            'wage_type': self.wage_type,
            'currency': self.currency_id.name,
            'schedule_pay': self.schedule_pay,
            'hours_per_week': self.hours_per_week,
            'time_type': self.time_type,
            'state': self.state,
            'state_label': dict(self._fields['state'].selection).get(self.state),
            'notes': self.notes or '',
            'advantages': self.advantages or '',
        }
