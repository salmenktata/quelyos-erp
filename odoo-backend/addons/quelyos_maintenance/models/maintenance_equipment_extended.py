# -*- coding: utf-8 -*-
"""Extension maintenance.equipment avec KPI MTBF/MTTR"""

from odoo import models, fields, api


class MaintenanceEquipmentExtended(models.Model):
    _inherit = 'maintenance.equipment'

    # KPI Performance
    mtbf_hours = fields.Float(string='MTBF (heures)', help="Temps moyen entre pannes")
    mttr_hours = fields.Float(string='MTTR (heures)', help="Temps moyen réparation")
    uptime_percentage = fields.Float(string='Disponibilité %', help="% temps opérationnel")
    
    # Métier
    is_critical = fields.Boolean(string='Équipement Critique', default=False)
    serial_number = fields.Char(string='Numéro de Série')
    purchase_date = fields.Date(string='Date Achat')
    warranty_end_date = fields.Date(string='Fin Garantie')
    
    # Statistiques
    failure_count = fields.Integer(string='Nombre Pannes', compute='_compute_failure_count', store=True)
    last_failure_date = fields.Datetime(string='Dernière Panne', compute='_compute_failure_count', store=True)
    next_preventive_date = fields.Date(string='Prochaine Maintenance Préventive')
    
    @api.depends('maintenance_ids', 'maintenance_ids.maintenance_type')
    def _compute_failure_count(self):
        """Compte les pannes correctives"""
        for equipment in self:
            failures = equipment.maintenance_ids.filtered(lambda r: r.maintenance_type == 'corrective')
            equipment.failure_count = len(failures)
            equipment.last_failure_date = failures.sorted('create_date', reverse=True)[0].create_date if failures else False
