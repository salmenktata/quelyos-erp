# -*- coding: utf-8 -*-
"""
Modèle Allocations de Congés RH.

Gère les droits à congés alloués aux employés.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class HRLeaveAllocation(models.Model):
    _name = 'quelyos.hr.leave.allocation'
    _description = 'Allocation de Congé'
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
        domain="[('tenant_id', '=', tenant_id), ('requires_allocation', '=', True)]"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ALLOCATION
    # ═══════════════════════════════════════════════════════════════════════════

    number_of_days = fields.Float(
        string='Jours alloués',
        required=True,
        tracking=True,
        help="Nombre de jours de congé alloués"
    )
    allocation_type = fields.Selection([
        ('regular', 'Allocation régulière'),
        ('accrual', 'Acquisition progressive'),
        ('adjustment', 'Ajustement'),
    ], string='Type', default='regular', required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # PÉRIODE DE VALIDITÉ
    # ═══════════════════════════════════════════════════════════════════════════

    date_from = fields.Date(
        string='Date début validité',
        required=True,
        default=lambda self: fields.Date.today().replace(month=1, day=1),
        tracking=True
    )
    date_to = fields.Date(
        string='Date fin validité',
        required=True,
        default=lambda self: fields.Date.today().replace(month=12, day=31),
        tracking=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # SOLDES CALCULÉS
    # ═══════════════════════════════════════════════════════════════════════════

    leaves_taken = fields.Float(
        string='Jours pris',
        compute='_compute_leaves',
        store=True,
        help="Jours déjà utilisés"
    )
    remaining_leaves = fields.Float(
        string='Solde restant',
        compute='_compute_leaves',
        store=True,
        help="Jours restants"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # STATUT
    # ═══════════════════════════════════════════════════════════════════════════

    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('validate', 'Validé'),
        ('cancel', 'Annulé'),
    ], string='État', default='draft', tracking=True, required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # NOTES
    # ═══════════════════════════════════════════════════════════════════════════

    notes = fields.Text(
        string='Notes'
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
        for allocation in self:
            if allocation.employee_id and allocation.leave_type_id:
                year = allocation.date_from.year if allocation.date_from else ''
                allocation.name = f"{allocation.employee_id.name} - {allocation.leave_type_id.name} {year}"
            else:
                allocation.name = _("Nouvelle allocation")

    @api.depends('number_of_days', 'employee_id', 'leave_type_id', 'date_from', 'date_to', 'state')
    def _compute_leaves(self):
        Leave = self.env['quelyos.hr.leave']
        for allocation in self:
            if allocation.state != 'validate':
                allocation.leaves_taken = 0
                allocation.remaining_leaves = allocation.number_of_days
                continue

            # Calculer les jours pris pour cette allocation
            domain = [
                ('employee_id', '=', allocation.employee_id.id),
                ('leave_type_id', '=', allocation.leave_type_id.id),
                ('state', '=', 'validate'),
                ('date_from', '>=', allocation.date_from),
                ('date_to', '<=', allocation.date_to),
            ]
            leaves = Leave.search(domain)
            taken = sum(leaves.mapped('number_of_days'))
            allocation.leaves_taken = taken
            allocation.remaining_leaves = allocation.number_of_days - taken

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('date_from', 'date_to')
    def _check_dates(self):
        for allocation in self:
            if allocation.date_from > allocation.date_to:
                raise ValidationError(_("La date de fin doit être postérieure à la date de début !"))

    @api.constrains('number_of_days')
    def _check_number_of_days(self):
        for allocation in self:
            if allocation.number_of_days <= 0:
                raise ValidationError(_("Le nombre de jours doit être positif !"))

    # ═══════════════════════════════════════════════════════════════════════════
    # CRUD
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'Nouveau') == 'Nouveau':
                vals['reference'] = self.env['ir.sequence'].next_by_code('quelyos.hr.leave.allocation') or 'ALLOC-0001'
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # ACTIONS
    # ═══════════════════════════════════════════════════════════════════════════

    def action_validate(self):
        """Valider l'allocation."""
        self.write({'state': 'validate'})

    def action_cancel(self):
        """Annuler l'allocation."""
        self.write({'state': 'cancel'})

    def action_draft(self):
        """Remettre en brouillon."""
        self.write({'state': 'draft'})

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES BULK
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model
    def create_yearly_allocations(self, tenant_id, leave_type_id, number_of_days, year=None):
        """Créer des allocations annuelles pour tous les employés actifs."""
        if not year:
            year = fields.Date.today().year

        date_from = fields.Date.today().replace(year=year, month=1, day=1)
        date_to = fields.Date.today().replace(year=year, month=12, day=31)

        employees = self.env['quelyos.hr.employee'].search([
            ('tenant_id', '=', tenant_id),
            ('state', '=', 'active'),
        ])

        allocations = []
        for employee in employees:
            # Vérifier si allocation existe déjà
            existing = self.search([
                ('employee_id', '=', employee.id),
                ('leave_type_id', '=', leave_type_id),
                ('date_from', '=', date_from),
                ('date_to', '=', date_to),
            ], limit=1)
            if not existing:
                allocations.append({
                    'employee_id': employee.id,
                    'leave_type_id': leave_type_id,
                    'number_of_days': number_of_days,
                    'date_from': date_from,
                    'date_to': date_to,
                    'tenant_id': tenant_id,
                    'state': 'validate',
                    'allocation_type': 'regular',
                })

        if allocations:
            self.create(allocations)
        return len(allocations)

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_allocation_data(self):
        """Retourne les données de l'allocation pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'reference': self.reference,
            'name': self.name,
            'employee_id': self.employee_id.id,
            'employee_name': self.employee_id.name,
            'leave_type_id': self.leave_type_id.id,
            'leave_type_name': self.leave_type_id.name,
            'leave_type_code': self.leave_type_id.code,
            'number_of_days': self.number_of_days,
            'leaves_taken': self.leaves_taken,
            'remaining_leaves': self.remaining_leaves,
            'date_from': self.date_from.isoformat() if self.date_from else None,
            'date_to': self.date_to.isoformat() if self.date_to else None,
            'allocation_type': self.allocation_type,
            'state': self.state,
            'notes': self.notes or '',
        }

    @api.model
    def get_employee_balances(self, tenant_id, employee_id):
        """Retourne tous les soldes de congés d'un employé."""
        today = fields.Date.today()
        allocations = self.search([
            ('tenant_id', '=', tenant_id),
            ('employee_id', '=', employee_id),
            ('state', '=', 'validate'),
            ('date_from', '<=', today),
            ('date_to', '>=', today),
        ])

        # Grouper par type de congé
        balances = {}
        for alloc in allocations:
            lt_id = alloc.leave_type_id.id
            if lt_id not in balances:
                balances[lt_id] = {
                    'leave_type_id': lt_id,
                    'leave_type_name': alloc.leave_type_id.name,
                    'leave_type_code': alloc.leave_type_id.code,
                    'allocated': 0,
                    'taken': 0,
                    'remaining': 0,
                }
            balances[lt_id]['allocated'] += alloc.number_of_days
            balances[lt_id]['taken'] += alloc.leaves_taken
            balances[lt_id]['remaining'] += alloc.remaining_leaves

        return list(balances.values())

    @api.model
    def get_department_summary(self, tenant_id, department_id=None):
        """Résumé des allocations par département."""
        today = fields.Date.today()
        domain = [
            ('tenant_id', '=', tenant_id),
            ('state', '=', 'validate'),
            ('date_from', '<=', today),
            ('date_to', '>=', today),
        ]
        if department_id:
            domain.append(('department_id', '=', department_id))

        allocations = self.search(domain)

        summary = {}
        for alloc in allocations:
            dept_id = alloc.department_id.id if alloc.department_id else 0
            dept_name = alloc.department_id.name if alloc.department_id else 'Non assigné'

            if dept_id not in summary:
                summary[dept_id] = {
                    'department_id': dept_id or None,
                    'department_name': dept_name,
                    'total_allocated': 0,
                    'total_taken': 0,
                    'total_remaining': 0,
                    'employees_count': set(),
                }
            summary[dept_id]['total_allocated'] += alloc.number_of_days
            summary[dept_id]['total_taken'] += alloc.leaves_taken
            summary[dept_id]['total_remaining'] += alloc.remaining_leaves
            summary[dept_id]['employees_count'].add(alloc.employee_id.id)

        # Convertir les sets en counts
        for dept_data in summary.values():
            dept_data['employees_count'] = len(dept_data['employees_count'])

        return list(summary.values())
