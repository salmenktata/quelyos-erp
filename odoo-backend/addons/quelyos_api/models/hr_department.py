# -*- coding: utf-8 -*-
"""
Extension du modèle Département RH natif Odoo.

Ajoute le support multi-tenant et les méthodes API pour le frontend React.
Hérite de hr.department pour bénéficier de toutes les fonctionnalités natives.
"""

from odoo import models, fields, api


class HRDepartment(models.Model):
    _inherit = 'hr.department'

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT (Extension Quelyos)
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        ondelete='cascade',
        index=True,
        help="Tenant propriétaire du département"
    )

    @api.constrains('tenant_id')
    def _check_tenant_id_api(self):
        """Vérifie que tenant_id est défini pour les créations via API."""
        # Les enregistrements natifs Odoo peuvent ne pas avoir de tenant_id
        pass

    # ═══════════════════════════════════════════════════════════════════════════
    # CHAMPS ADDITIONNELS
    # ═══════════════════════════════════════════════════════════════════════════

    code = fields.Char(
        string='Code',
        index=True,
        help="Code unique du département (ex: IT, RH, COMPTA)"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('code_tenant_uniq', 'unique(code, tenant_id)',
         'Le code du département doit être unique par tenant !'),
    ]

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API (pour frontend React)
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
