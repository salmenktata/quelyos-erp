# -*- coding: utf-8 -*-
"""
Modele Contrat de Travail RH standalone pour Quelyos.

Modele custom independant de hr_contract (Enterprise).
Implemente la gestion des contrats de travail pour le module RH.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class QuelyosHRContract(models.Model):
    _name = 'quelyos.hr.contract'
    _description = 'Contrat de travail'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_start desc'

    # CHAMPS PRINCIPAUX

    name = fields.Char(
        string='Reference',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('New'),
        tracking=True
    )
    employee_id = fields.Many2one(
        'hr.employee',
        string='Employe',
        required=True,
        ondelete='cascade',
        tracking=True,
        index=True
    )
    department_id = fields.Many2one(
        'hr.department',
        string='Departement',
        tracking=True
    )
    job_id = fields.Many2one(
        'hr.job',
        string='Poste',
        tracking=True
    )

    # MULTI-TENANT

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        index=True
    )

    # TYPE DE CONTRAT

    contract_type = fields.Selection([
        ('cdi', 'CDI - Contrat a Duree Indeterminee'),
        ('cdd', 'CDD - Contrat a Duree Determinee'),
        ('stage', 'Stage'),
        ('interim', 'Interim'),
        ('apprenticeship', 'Apprentissage'),
        ('freelance', 'Freelance'),
    ], string='Type de contrat', required=True, default='cdi', tracking=True)

    # DATES

    date_start = fields.Date(
        string='Date de debut',
        required=True,
        tracking=True,
        default=fields.Date.today
    )
    date_end = fields.Date(
        string='Date de fin',
        tracking=True
    )
    trial_date_end = fields.Date(
        string='Fin periode essai',
        tracking=True
    )

    # REMUNERATION

    wage = fields.Monetary(
        string='Salaire',
        required=True,
        tracking=True,
        help="Salaire brut mensuel"
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
        ('quarterly', 'Trimestriel'),
        ('semi-annually', 'Semestriel'),
        ('annually', 'Annuel'),
        ('weekly', 'Hebdomadaire'),
        ('bi-weekly', 'Bi-hebdomadaire'),
        ('bi-monthly', 'Bi-mensuel'),
    ], string='Periodicite de paie', default='monthly', required=True)

    # TEMPS DE TRAVAIL

    hours_per_week = fields.Float(
        string='Heures/semaine',
        default=40.0,
        help="Duree hebdomadaire de travail (48h max en Tunisie)"
    )
    time_type = fields.Selection([
        ('full', 'Temps plein'),
        ('part', 'Temps partiel'),
    ], string='Type de temps', default='full')

    # ETAT

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('open', 'En cours'),
        ('close', 'Termine'),
        ('cancel', 'Annule'),
    ], string='Etat', default='draft', required=True, tracking=True)

    # NOTES ET AVANTAGES

    notes = fields.Text(string='Notes')
    advantages = fields.Text(
        string='Avantages',
        help="Avantages en nature, primes, tickets restaurant, etc."
    )

    # CONTRAINTES

    @api.constrains('contract_type', 'date_end')
    def _check_date_end_required(self):
        """La date de fin est obligatoire pour CDD/Stage/Interim."""
        for contract in self:
            if contract.contract_type in ('cdd', 'stage', 'interim') and not contract.date_end:
                raise ValidationError(_("La date de fin est obligatoire pour un %s !") % dict(
                    self._fields['contract_type'].selection).get(contract.contract_type))

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        """La date de fin doit etre apres la date de debut."""
        for contract in self:
            if contract.date_end and contract.date_start and contract.date_end < contract.date_start:
                raise ValidationError(_("La date de fin doit etre posterieure a la date de debut !"))

    # CRUD

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('name') or vals.get('name') == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code('quelyos.hr.contract') or 'CTR-0001'
        return super().create(vals_list)

    # ACTIONS

    def action_open(self):
        """Activer le contrat."""
        for contract in self:
            if contract.state == 'draft':
                contract.state = 'open'

    def action_close(self):
        """Cloturer le contrat."""
        for contract in self:
            if contract.state == 'open':
                contract.state = 'close'

    def action_cancel(self):
        """Annuler le contrat."""
        for contract in self:
            if contract.state in ('draft', 'open'):
                contract.state = 'cancel'

    def action_draft(self):
        """Remettre en brouillon."""
        for contract in self:
            if contract.state == 'cancel':
                contract.state = 'draft'

    # CRON

    @api.model
    def _cron_check_contract_expiry(self):
        """Cron pour detecter les contrats arrivant a expiration."""
        today = fields.Date.today()
        expiring_soon = self.search([
            ('state', '=', 'open'),
            ('date_end', '!=', False),
            ('date_end', '<=', fields.Date.add(today, days=30)),
            ('date_end', '>=', today),
        ])
        for contract in expiring_soon:
            contract.activity_schedule(
                'mail.mail_activity_data_todo',
                date_deadline=contract.date_end,
                summary=_("Contrat arrivant a expiration"),
                note=_("Le contrat de %s expire le %s.") % (
                    contract.employee_id.name,
                    contract.date_end
                ),
            )
        expired = self.search([
            ('state', '=', 'open'),
            ('date_end', '!=', False),
            ('date_end', '<', today),
        ])
        expired.write({'state': 'close'})

    # METHODES API

    def get_contract_data(self):
        """Retourne les donnees du contrat pour l'API."""
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
            'notes': self.notes or '',
            'advantages': self.advantages or '',
        }
