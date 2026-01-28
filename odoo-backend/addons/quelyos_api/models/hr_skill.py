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
    """Compétence d'un employé avec niveau"""
    _name = 'quelyos.hr.employee.skill'
    _description = 'Compétence employé'
    _order = 'skill_type_id, skill_id'

    employee_id = fields.Many2one('quelyos.hr.employee', string='Employé', required=True, ondelete='cascade')
    skill_id = fields.Many2one('quelyos.hr.skill', string='Compétence', required=True, ondelete='cascade')
    skill_type_id = fields.Many2one('quelyos.hr.skill.type', related='skill_id.skill_type_id', store=True)
    skill_level = fields.Selection([
        ('0', 'Débutant'),
        ('1', 'Intermédiaire'),
        ('2', 'Confirmé'),
        ('3', 'Expert'),
    ], string='Niveau', default='1', required=True)
    level_progress = fields.Integer('Progression (%)', default=50,
        help='Progression vers le niveau supérieur (0-100)')
    tenant_id = fields.Many2one('quelyos.tenant', related='employee_id.tenant_id', store=True)

    _sql_constraints = [
        ('employee_skill_uniq', 'unique(employee_id, skill_id)', 'Une compétence ne peut être attribuée qu\'une fois par employé'),
    ]

    def get_employee_skill_data(self):
        """Retourne les données pour le frontend"""
        return {
            'id': self.id,
            'employee_id': self.employee_id.id,
            'skill_id': self.skill_id.id,
            'skill_name': self.skill_id.name,
            'skill_type_id': self.skill_type_id.id,
            'skill_type_name': self.skill_type_id.name,
            'skill_type_color': self.skill_type_id.color,
            'level': self.skill_level,
            'level_label': dict(self._fields['skill_level'].selection).get(self.skill_level),
            'level_progress': self.level_progress,
        }
