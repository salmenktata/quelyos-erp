# -*- coding: utf-8 -*-
"""
Modèle Département RH pour la gestion de l'organigramme.

Permet de structurer l'entreprise en départements/services hiérarchiques.
Chaque département peut avoir un responsable et contenir des sous-départements.
"""

from odoo import models, fields, api


class HRDepartment(models.Model):
    _name = 'quelyos.hr.department'
    _description = 'Département RH'
    _order = 'sequence, name'
    _parent_name = 'parent_id'
    _parent_store = True
    _rec_name = 'complete_name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Nom',
        required=True,
        translate=True,
        help="Nom du département"
    )
    code = fields.Char(
        string='Code',
        index=True,
        help="Code unique du département (ex: IT, RH, COMPTA)"
    )
    complete_name = fields.Char(
        string='Nom complet',
        compute='_compute_complete_name',
        recursive=True,
        store=True,
        help="Nom complet avec hiérarchie"
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
    color = fields.Integer(
        string='Couleur',
        help="Couleur pour le kanban"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # HIÉRARCHIE
    # ═══════════════════════════════════════════════════════════════════════════

    parent_id = fields.Many2one(
        'quelyos.hr.department',
        string='Département parent',
        index=True,
        ondelete='cascade',
        help="Département parent dans la hiérarchie"
    )
    parent_path = fields.Char(
        index=True,
        unaccent=False
    )
    child_ids = fields.One2many(
        'quelyos.hr.department',
        'parent_id',
        string='Sous-départements',
        help="Liste des sous-départements"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # RESPONSABLE & MEMBRES
    # ═══════════════════════════════════════════════════════════════════════════

    manager_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Responsable',
        help="Responsable du département"
    )
    member_ids = fields.One2many(
        'quelyos.hr.employee',
        'department_id',
        string='Membres',
        help="Employés du département"
    )
    total_employee = fields.Integer(
        string='Nombre d\'employés',
        compute='_compute_total_employee',
        store=True,
        help="Nombre total d'employés dans le département"
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
        help="Tenant propriétaire du département"
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='tenant_id.company_id',
        store=True,
        help="Société associée"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # INFORMATIONS
    # ═══════════════════════════════════════════════════════════════════════════

    note = fields.Html(
        string='Notes',
        help="Description et notes sur le département"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('name', 'parent_id.complete_name')
    def _compute_complete_name(self):
        for department in self:
            if department.parent_id:
                department.complete_name = f"{department.parent_id.complete_name} / {department.name}"
            else:
                department.complete_name = department.name

    @api.depends('member_ids')
    def _compute_total_employee(self):
        for department in self:
            department.total_employee = len(department.member_ids.filtered(
                lambda e: e.state == 'active'
            ))

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('code_tenant_uniq', 'unique(code, tenant_id)',
         'Le code du département doit être unique par tenant !'),
    ]

    @api.constrains('parent_id')
    def _check_parent_id(self):
        if not self._check_recursion():
            raise models.ValidationError(
                'Erreur : Vous ne pouvez pas créer de hiérarchie circulaire !'
            )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_department_data(self):
        """Retourne les données du département pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code or '',
            'complete_name': self.complete_name,
            'parent_id': self.parent_id.id if self.parent_id else None,
            'parent_name': self.parent_id.name if self.parent_id else None,
            'manager_id': self.manager_id.id if self.manager_id else None,
            'manager_name': self.manager_id.name if self.manager_id else None,
            'total_employee': self.total_employee,
            'color': self.color,
            'active': self.active,
        }

    def get_tree_data(self):
        """Retourne les données hiérarchiques pour l'organigramme."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code or '',
            'manager': {
                'id': self.manager_id.id,
                'name': self.manager_id.name,
                'job': self.manager_id.job_id.name if self.manager_id.job_id else None,
                'image': self.manager_id.image_128 and self.manager_id.image_128.decode('utf-8') or None,
            } if self.manager_id else None,
            'total_employee': self.total_employee,
            'children': [child.get_tree_data() for child in self.child_ids.filtered('active')],
        }
