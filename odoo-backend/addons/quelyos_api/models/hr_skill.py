# -*- coding: utf-8 -*-
"""
Modèle pour les compétences RH.
"""
from odoo import models, fields, api


class HRSkillType(models.Model):
    """Catégorie de compétences (Technique, Soft skills, Langues, etc.)"""
    _name = 'quelyos.hr.skill.type'
    _description = 'Type de compétence'
    _order = 'sequence, name'

    name = fields.Char('Nom', required=True)
    sequence = fields.Integer('Séquence', default=10)
    color = fields.Char('Couleur', default='#6366f1')
    tenant_id = fields.Many2one('quelyos.tenant', string='Tenant', required=True, ondelete='cascade')
    skill_ids = fields.One2many('quelyos.hr.skill', 'skill_type_id', string='Compétences')
    active = fields.Boolean('Actif', default=True)

    def get_type_data(self):
        """Retourne les données pour le frontend"""
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'skill_count': len(self.skill_ids.filtered('active')),
        }


class HRSkill(models.Model):
    """Compétence individuelle"""
    _name = 'quelyos.hr.skill'
    _description = 'Compétence'
    _order = 'skill_type_id, name'

    name = fields.Char('Nom', required=True)
    description = fields.Text('Description')
    skill_type_id = fields.Many2one('quelyos.hr.skill.type', string='Type', required=True, ondelete='cascade')
    tenant_id = fields.Many2one('quelyos.tenant', string='Tenant', required=True, ondelete='cascade')
    active = fields.Boolean('Actif', default=True)

    def get_skill_data(self):
        """Retourne les données pour le frontend"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'skill_type_id': self.skill_type_id.id,
            'skill_type_name': self.skill_type_id.name,
            'skill_type_color': self.skill_type_id.color,
        }


class HREmployeeSkill(models.Model):
    """Extension du modèle Compétences employé natif Odoo."""
    _inherit = 'hr.employee.skill'

    # Extension pour lier aux compétences Quelyos
    quelyos_skill_id = fields.Many2one(
        'quelyos.hr.skill',
        string='Compétence Quelyos',
        ondelete='cascade',
        help="Lien vers la compétence Quelyos (optionnel)"
    )
    quelyos_skill_type_id = fields.Many2one(
        'quelyos.hr.skill.type',
        related='quelyos_skill_id.skill_type_id',
        store=True
    )
    tenant_id = fields.Many2one(
        'quelyos.tenant',
        related='employee_id.tenant_id',
        store=True
    )

    def get_employee_skill_data(self):
        """Retourne les données pour le frontend (compatible natif + Quelyos)."""
        self.ensure_one()
        # Utiliser les champs natifs Odoo hr_skills
        data = {
            'id': self.id,
            'employee_id': self.employee_id.id,
            'skill_id': self.skill_id.id,
            'skill_name': self.skill_id.name,
            'skill_type_id': self.skill_type_id.id if self.skill_type_id else None,
            'skill_type_name': self.skill_type_id.name if self.skill_type_id else None,
            'skill_level_id': self.skill_level_id.id if self.skill_level_id else None,
            'skill_level_name': self.skill_level_id.name if self.skill_level_id else None,
            'level_progress': self.level_progress,
        }
        # Ajouter les champs Quelyos si disponibles
        if self.quelyos_skill_id:
            data['quelyos_skill_id'] = self.quelyos_skill_id.id
            data['quelyos_skill_type_color'] = self.quelyos_skill_type_id.color if self.quelyos_skill_type_id else None
        return data
