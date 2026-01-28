# -*- coding: utf-8 -*-
"""
Modèle pour les objectifs RH.
"""
from odoo import models, fields, api
from datetime import date


class HRGoal(models.Model):
    """Objectif individuel d'un employé"""
    _name = 'quelyos.hr.goal'
    _description = 'Objectif'
    _order = 'deadline, priority desc, id desc'

    name = fields.Char('Titre', required=True)
    description = fields.Text('Description')
    employee_id = fields.Many2one('quelyos.hr.employee', string='Employé', required=True, ondelete='cascade')
    manager_id = fields.Many2one('quelyos.hr.employee', string='Responsable',
        related='employee_id.parent_id', store=True)

    # Période et deadline
    period_start = fields.Date('Début période')
    deadline = fields.Date('Échéance', required=True)

    # Progression
    progress = fields.Integer('Progression (%)', default=0)
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('in_progress', 'En cours'),
        ('done', 'Atteint'),
        ('cancelled', 'Annulé'),
    ], string='Statut', default='draft', required=True)

    # Priorité et type
    priority = fields.Selection([
        ('0', 'Normal'),
        ('1', 'Important'),
        ('2', 'Critique'),
    ], string='Priorité', default='0')
    goal_type = fields.Selection([
        ('performance', 'Performance'),
        ('development', 'Développement'),
        ('project', 'Projet'),
        ('other', 'Autre'),
    ], string='Type', default='performance')

    # Mesure
    target_value = fields.Float('Valeur cible')
    current_value = fields.Float('Valeur actuelle')
    unit = fields.Char('Unité', help='Ex: %, €, unités...')

    # Lien évaluation
    appraisal_id = fields.Many2one('quelyos.hr.appraisal', string='Évaluation liée')

    # Multi-tenant
    tenant_id = fields.Many2one('quelyos.tenant', related='employee_id.tenant_id', store=True)

    # Notes
    notes = fields.Text('Notes / Commentaires')

    @api.onchange('current_value', 'target_value')
    def _onchange_values(self):
        """Calcule la progression automatiquement"""
        if self.target_value and self.target_value > 0:
            self.progress = min(100, int((self.current_value / self.target_value) * 100))

    def action_start(self):
        """Démarre l'objectif"""
        self.write({'state': 'in_progress'})

    def action_complete(self):
        """Marque comme atteint"""
        self.write({'state': 'done', 'progress': 100})

    def action_cancel(self):
        """Annule l'objectif"""
        self.write({'state': 'cancelled'})

    def get_goal_data(self):
        """Retourne les données pour le frontend"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'employee_id': self.employee_id.id,
            'employee_name': self.employee_id.name,
            'manager_id': self.manager_id.id if self.manager_id else None,
            'manager_name': self.manager_id.name if self.manager_id else None,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'is_overdue': self.deadline and self.deadline < date.today() and self.state == 'in_progress',
            'progress': self.progress,
            'state': self.state,
            'state_label': dict(self._fields['state'].selection).get(self.state),
            'priority': self.priority,
            'priority_label': dict(self._fields['priority'].selection).get(self.priority),
            'goal_type': self.goal_type,
            'goal_type_label': dict(self._fields['goal_type'].selection).get(self.goal_type),
            'target_value': self.target_value,
            'current_value': self.current_value,
            'unit': self.unit or '',
            'appraisal_id': self.appraisal_id.id if self.appraisal_id else None,
            'notes': self.notes or '',
        }
