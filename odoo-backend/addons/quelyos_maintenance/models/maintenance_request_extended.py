# -*- coding: utf-8 -*-
"""Extension maintenance.request avec coûts et durée"""

from odoo import models, fields, api


class MaintenanceRequestExtended(models.Model):
    _inherit = 'maintenance.request'

    # Coûts
    labor_cost = fields.Float(string='Coût Main d\'Oeuvre')
    parts_cost = fields.Float(string='Coût Pièces')
    total_cost = fields.Float(string='Coût Total', compute='_compute_total_cost', store=True)
    
    # Durée
    actual_duration_hours = fields.Float(string='Durée Réelle (h)')
    planned_duration_hours = fields.Float(string='Durée Prévue (h)')
    
    # Priorité étendue
    is_emergency = fields.Boolean(string='Urgence', default=False)
    downtime_impact = fields.Selection([
        ('none', 'Aucun'),
        ('partial', 'Partiel'),
        ('total', 'Arrêt Total'),
    ], string='Impact Production', default='none')
    
    @api.depends('labor_cost', 'parts_cost')
    def _compute_total_cost(self):
        """Calcule coût total intervention"""
        for request in self:
            request.total_cost = request.labor_cost + request.parts_cost
