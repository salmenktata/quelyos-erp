# -*- coding: utf-8 -*-
"""
Modèle Poste/Fonction RH.

Définit les différents postes de l'entreprise avec leurs descriptions,
compétences requises et effectifs prévus.
"""

from odoo import models, fields, api


class HRJob(models.Model):
    _name = 'quelyos.hr.job'
    _description = 'Poste / Fonction'
    _order = 'sequence, name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Intitulé du poste',
        required=True,
        translate=True,
        help="Titre officiel du poste"
    )
    code = fields.Char(
        string='Code',
        index=True,
        help="Code unique du poste (ex: DEV-SR, MGR-HR)"
    )
    sequence = fields.Integer(
        string='Séquence',
        default=10,
        help="Ordre d'affichage"
    )
    active = fields.Boolean(
        string='Actif',
        default=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # DÉPARTEMENT
    # ═══════════════════════════════════════════════════════════════════════════

    department_id = fields.Many2one(
        'quelyos.hr.department',
        string='Département',
        help="Département auquel le poste est rattaché"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # DESCRIPTION DU POSTE
    # ═══════════════════════════════════════════════════════════════════════════

    description = fields.Html(
        string='Description du poste',
        help="Description détaillée des missions et responsabilités"
    )
    requirements = fields.Html(
        string='Compétences requises',
        help="Compétences, diplômes et expériences requis"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # EFFECTIFS
    # ═══════════════════════════════════════════════════════════════════════════

    expected_employees = fields.Integer(
        string='Effectif prévu',
        default=1,
        help="Nombre d'employés attendus pour ce poste"
    )
    no_of_employee = fields.Integer(
        string='Effectif actuel',
        compute='_compute_employees',
        store=True,
        help="Nombre actuel d'employés occupant ce poste"
    )
    no_of_recruitment = fields.Integer(
        string='Recrutements prévus',
        compute='_compute_employees',
        store=True,
        help="Nombre de postes à pourvoir"
    )
    employee_ids = fields.One2many(
        'quelyos.hr.employee',
        'job_id',
        string='Employés',
        help="Liste des employés occupant ce poste"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        index=True,
        help="Tenant propriétaire"
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='tenant_id.company_id',
        store=True,
        help="Société associée"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('employee_ids', 'employee_ids.state', 'expected_employees')
    def _compute_employees(self):
        for job in self:
            active_employees = job.employee_ids.filtered(lambda e: e.state == 'active')
            job.no_of_employee = len(active_employees)
            job.no_of_recruitment = max(0, job.expected_employees - job.no_of_employee)

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('name_tenant_uniq', 'unique(name, department_id, tenant_id)',
         'Un poste avec ce nom existe déjà dans ce département !'),
    ]

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_job_data(self):
        """Retourne les données du poste pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code or '',
            'department_id': self.department_id.id if self.department_id else None,
            'department_name': self.department_id.name if self.department_id else None,
            'description': self.description or '',
            'requirements': self.requirements or '',
            'expected_employees': self.expected_employees,
            'current_employees': self.no_of_employee,
            'open_positions': self.no_of_recruitment,
            'active': self.active,
        }
