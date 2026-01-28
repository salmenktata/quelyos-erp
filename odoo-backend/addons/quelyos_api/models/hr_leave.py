# -*- coding: utf-8 -*-
"""
Modèle Demandes de Congés RH.

Gère les demandes de congés des employés avec workflow d'approbation.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import timedelta
import math


class HRLeave(models.Model):
    _name = 'quelyos.hr.leave'
    _description = 'Demande de Congé'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'date_from desc'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Description',
        compute='_compute_name',
        store=True
    )
    reference = fields.Char(
        string='Référence',
        readonly=True,
        copy=False,
        default='Nouveau'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # EMPLOYÉ & TYPE
    # ═══════════════════════════════════════════════════════════════════════════

    employee_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Employé',
        required=True,
        tracking=True,
        domain="[('tenant_id', '=', tenant_id), ('state', '=', 'active')]"
    )
    department_id = fields.Many2one(
        'quelyos.hr.department',
        string='Département',
        related='employee_id.department_id',
        store=True
    )
    leave_type_id = fields.Many2one(
        'quelyos.hr.leave.type',
        string='Type de congé',
        required=True,
        tracking=True,
        domain="[('tenant_id', '=', tenant_id), ('active', '=', True)]"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # DATES
    # ═══════════════════════════════════════════════════════════════════════════

    date_from = fields.Datetime(
        string='Date de début',
        required=True,
        tracking=True
    )
    date_to = fields.Datetime(
        string='Date de fin',
        required=True,
        tracking=True
    )
    number_of_days = fields.Float(
        string='Nombre de jours',
        compute='_compute_number_of_days',
        store=True,
        tracking=True
    )
    request_unit_half = fields.Boolean(
        string='Demi-journée',
        default=False
    )
    request_date_from_period = fields.Selection([
        ('am', 'Matin'),
        ('pm', 'Après-midi'),
    ], string='Période début')

    # ═══════════════════════════════════════════════════════════════════════════
    # STATUT
    # ═══════════════════════════════════════════════════════════════════════════

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('confirm', 'À approuver'),
        ('validate1', 'Validé Manager'),
        ('validate', 'Approuvé'),
        ('refuse', 'Refusé'),
        ('cancel', 'Annulé'),
    ], string='État', default='draft', tracking=True, required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # APPROBATION
    # ═══════════════════════════════════════════════════════════════════════════

    manager_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Manager',
        related='employee_id.parent_id',
        store=True
    )
    first_approver_id = fields.Many2one(
        'res.users',
        string='Premier approbateur'
    )
    second_approver_id = fields.Many2one(
        'res.users',
        string='Second approbateur'
    )
    validated_date = fields.Datetime(
        string='Date validation'
    )
    refused_date = fields.Datetime(
        string='Date refus'
    )
    refuse_reason = fields.Text(
        string='Motif de refus'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # NOTES & PIÈCES JOINTES
    # ═══════════════════════════════════════════════════════════════════════════

    notes = fields.Text(
        string='Motif / Notes',
        tracking=True
    )
    attachment_ids = fields.Many2many(
        'ir.attachment',
        'hr_leave_attachment_rel',
        'leave_id',
        'attachment_id',
        string='Justificatifs'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # INFORMATIONS CALCULÉES
    # ═══════════════════════════════════════════════════════════════════════════

    can_approve = fields.Boolean(
        string='Peut approuver',
        compute='_compute_can_approve'
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
    # COMPUTED
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('employee_id', 'leave_type_id', 'date_from', 'date_to')
    def _compute_name(self):
        for leave in self:
            if leave.employee_id and leave.leave_type_id:
                leave.name = f"{leave.employee_id.name} - {leave.leave_type_id.name}"
            else:
                leave.name = _("Nouvelle demande")

    @api.depends('date_from', 'date_to', 'request_unit_half')
    def _compute_number_of_days(self):
        for leave in self:
            if leave.date_from and leave.date_to:
                if leave.request_unit_half:
                    leave.number_of_days = 0.5
                else:
                    # Calculer les jours ouvrés
                    delta = leave.date_to - leave.date_from
                    total_days = delta.days + 1
                    # Simplification : on compte tous les jours
                    # TODO: Exclure weekends et jours fériés
                    leave.number_of_days = total_days
            else:
                leave.number_of_days = 0

    def _compute_can_approve(self):
        for leave in self:
            leave.can_approve = False
            # TODO: Logique de permission basée sur le manager

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('date_from', 'date_to')
    def _check_dates(self):
        for leave in self:
            if leave.date_from and leave.date_to and leave.date_from > leave.date_to:
                raise ValidationError(_("La date de fin doit être postérieure à la date de début !"))

    @api.constrains('date_from', 'date_to', 'employee_id', 'state')
    def _check_no_overlap(self):
        for leave in self:
            if leave.state in ('refuse', 'cancel'):
                continue
            domain = [
                ('id', '!=', leave.id),
                ('employee_id', '=', leave.employee_id.id),
                ('state', 'not in', ('refuse', 'cancel')),
                ('date_from', '<=', leave.date_to),
                ('date_to', '>=', leave.date_from),
            ]
            overlapping = self.search_count(domain)
            if overlapping:
                raise ValidationError(_("Cette demande chevauche une autre demande de congé !"))

    @api.constrains('leave_type_id', 'number_of_days')
    def _check_allocation(self):
        for leave in self:
            if leave.state in ('draft', 'refuse', 'cancel'):
                continue
            leave_type = leave.leave_type_id
            if leave_type.requires_allocation:
                # Vérifier le solde
                allocated = sum(leave.employee_id.allocation_ids.filtered(
                    lambda a: a.leave_type_id == leave_type and a.state == 'validate'
                ).mapped('number_of_days'))
                taken = sum(self.search([
                    ('employee_id', '=', leave.employee_id.id),
                    ('leave_type_id', '=', leave_type.id),
                    ('state', '=', 'validate'),
                    ('id', '!=', leave.id),
                ]).mapped('number_of_days'))
                remaining = allocated - taken
                if leave.number_of_days > remaining:
                    raise ValidationError(_(
                        "Solde insuffisant ! Disponible : %.1f jours, Demandé : %.1f jours"
                    ) % (remaining, leave.number_of_days))

    # ═══════════════════════════════════════════════════════════════════════════
    # CRUD
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'Nouveau') == 'Nouveau':
                vals['reference'] = self.env['ir.sequence'].next_by_code('quelyos.hr.leave') or 'DEM-0001'
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # ACTIONS WORKFLOW
    # ═══════════════════════════════════════════════════════════════════════════

    def action_confirm(self):
        """Soumettre la demande."""
        for leave in self:
            if leave.state != 'draft':
                raise UserError(_("Seules les demandes en brouillon peuvent être soumises !"))
            # Vérifier justificatif si requis
            if leave.leave_type_id.requires_attachment and not leave.attachment_ids:
                raise UserError(_("Un justificatif est requis pour ce type de congé !"))
            # Vérifier préavis
            if leave.leave_type_id.min_notice_days:
                min_date = fields.Datetime.now() + timedelta(days=leave.leave_type_id.min_notice_days)
                if leave.date_from < min_date:
                    raise UserError(_(
                        "Un préavis de %d jours est requis pour ce type de congé !"
                    ) % leave.leave_type_id.min_notice_days)
            leave.state = 'confirm'

    def action_approve(self):
        """Approuver la demande (premier niveau)."""
        for leave in self:
            if leave.state not in ('confirm',):
                raise UserError(_("Cette demande ne peut pas être approuvée !"))
            validation_type = leave.leave_type_id.validation_type
            if validation_type in ('no_validation', 'manager'):
                leave.write({
                    'state': 'validate',
                    'first_approver_id': self.env.user.id,
                    'validated_date': fields.Datetime.now(),
                })
            else:
                leave.write({
                    'state': 'validate1',
                    'first_approver_id': self.env.user.id,
                })

    def action_validate(self):
        """Validation finale (second niveau)."""
        for leave in self:
            if leave.state != 'validate1':
                raise UserError(_("Cette demande ne peut pas être validée !"))
            leave.write({
                'state': 'validate',
                'second_approver_id': self.env.user.id,
                'validated_date': fields.Datetime.now(),
            })

    def action_refuse(self, reason=None):
        """Refuser la demande."""
        for leave in self:
            if leave.state not in ('confirm', 'validate1'):
                raise UserError(_("Cette demande ne peut pas être refusée !"))
            leave.write({
                'state': 'refuse',
                'refuse_reason': reason,
                'refused_date': fields.Datetime.now(),
            })

    def action_cancel(self):
        """Annuler la demande."""
        for leave in self:
            if leave.state == 'validate' and leave.date_from <= fields.Datetime.now():
                raise UserError(_("Impossible d'annuler une demande déjà en cours !"))
            leave.state = 'cancel'

    def action_draft(self):
        """Remettre en brouillon."""
        for leave in self:
            if leave.state not in ('confirm', 'refuse', 'cancel'):
                raise UserError(_("Cette demande ne peut pas être remise en brouillon !"))
            leave.state = 'draft'

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_leave_data(self):
        """Retourne les données de la demande pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'reference': self.reference,
            'name': self.name,
            'employee_id': self.employee_id.id,
            'employee_name': self.employee_id.name,
            'department_name': self.department_id.name if self.department_id else None,
            'leave_type_id': self.leave_type_id.id,
            'leave_type_name': self.leave_type_id.name,
            'leave_type_code': self.leave_type_id.code,
            'leave_type_color': self.leave_type_id.color,
            'date_from': self.date_from.isoformat() if self.date_from else None,
            'date_to': self.date_to.isoformat() if self.date_to else None,
            'number_of_days': self.number_of_days,
            'request_unit_half': self.request_unit_half,
            'state': self.state,
            'state_label': dict(self._fields['state'].selection).get(self.state),
            'notes': self.notes or '',
            'manager_name': self.manager_id.name if self.manager_id else None,
            'first_approver': self.first_approver_id.name if self.first_approver_id else None,
            'validated_date': self.validated_date.isoformat() if self.validated_date else None,
            'refuse_reason': self.refuse_reason or '',
            'has_attachments': bool(self.attachment_ids),
            'attachment_count': len(self.attachment_ids),
        }

    @api.model
    def get_calendar_data(self, tenant_id, date_from, date_to, department_id=None):
        """Retourne les congés pour l'affichage calendrier."""
        domain = [
            ('tenant_id', '=', tenant_id),
            ('state', 'in', ('confirm', 'validate1', 'validate')),
            ('date_from', '<=', date_to),
            ('date_to', '>=', date_from),
        ]
        if department_id:
            domain.append(('department_id', '=', department_id))

        leaves = self.search(domain)
        return [{
            'id': leave.id,
            'title': f"{leave.employee_id.name} - {leave.leave_type_id.code}",
            'start': leave.date_from.isoformat(),
            'end': leave.date_to.isoformat(),
            'color': leave.leave_type_id.color,
            'employee_id': leave.employee_id.id,
            'employee_name': leave.employee_id.name,
            'leave_type': leave.leave_type_id.name,
            'state': leave.state,
            'days': leave.number_of_days,
        } for leave in leaves]

    @api.model
    def get_pending_approvals(self, tenant_id, manager_employee_id=None):
        """Retourne les demandes en attente d'approbation."""
        domain = [
            ('tenant_id', '=', tenant_id),
            ('state', 'in', ('confirm', 'validate1')),
        ]
        if manager_employee_id:
            domain.append(('manager_id', '=', manager_employee_id))

        leaves = self.search(domain, order='date_from')
        return [leave.get_leave_data() for leave in leaves]
