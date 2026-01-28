# -*- coding: utf-8 -*-
"""
Extension du modèle Poste/Fonction RH natif Odoo.

Ajoute le support multi-tenant et les méthodes API pour le frontend React.
Hérite de hr.job pour bénéficier de toutes les fonctionnalités natives.
"""

from odoo import models, fields, api


class HRJob(models.Model):
    _inherit = 'hr.job'

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT (Extension Quelyos)
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        ondelete='cascade',
        index=True,
        help="Tenant propriétaire"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CHAMPS ADDITIONNELS
    # ═══════════════════════════════════════════════════════════════════════════

    code = fields.Char(
        string='Code',
        index=True,
        help="Code unique du poste (ex: DEV-SR, MGR-HR)"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('name_tenant_uniq', 'unique(name, department_id, tenant_id)',
         'Un poste avec ce nom existe déjà dans ce département !'),
    ]

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API (pour frontend React)
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
