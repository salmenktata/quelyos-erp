# -*- coding: utf-8 -*-
"""Extension maintenance.equipment avec KPI MTBF/MTTR"""

from odoo import models, fields, api


class MaintenanceEquipmentExtended(models.Model):
    _inherit = 'maintenance.equipment'

    # ═══════════════════════════════════════════════════════════════════════════
    # CHAMPS AVEC PRÉFIXE x_ (conformité isolation Odoo)
    # ═══════════════════════════════════════════════════════════════════════════

    # KPI Performance
    x_mtbf_hours = fields.Float(
        string='MTBF (heures)',
        help="Temps moyen entre pannes"
    )
    x_mttr_hours = fields.Float(
        string='MTTR (heures)',
        help="Temps moyen réparation"
    )
    x_uptime_percentage = fields.Float(
        string='Disponibilité %',
        help="% temps opérationnel"
    )

    # Métier
    x_is_critical = fields.Boolean(
        string='Équipement Critique',
        default=False
    )
    x_serial_number = fields.Char(
        string='Numéro de Série'
    )
    x_purchase_date = fields.Date(
        string='Date Achat'
    )
    x_warranty_end_date = fields.Date(
        string='Fin Garantie'
    )
    x_next_preventive_date = fields.Date(
        string='Prochaine Maintenance Préventive'
    )

    # Statistiques (computed + stored)
    x_failure_count = fields.Integer(
        string='Nombre Pannes',
        compute='_compute_failure_count',
        store=True
    )
    x_last_failure_date = fields.Datetime(
        string='Dernière Panne',
        compute='_compute_failure_count',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ALIAS BACKWARD-COMPATIBLE (DEPRECATED - sera supprimé Q4 2026)
    # ═══════════════════════════════════════════════════════════════════════════

    mtbf_hours = fields.Float(
        related='x_mtbf_hours',
        string='MTBF (heures) [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_mtbf_hours"
    )
    mttr_hours = fields.Float(
        related='x_mttr_hours',
        string='MTTR (heures) [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_mttr_hours"
    )
    uptime_percentage = fields.Float(
        related='x_uptime_percentage',
        string='Disponibilité % [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_uptime_percentage"
    )
    is_critical = fields.Boolean(
        related='x_is_critical',
        string='Équipement Critique [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_is_critical"
    )
    serial_number = fields.Char(
        related='x_serial_number',
        string='Numéro de Série [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_serial_number"
    )
    purchase_date = fields.Date(
        related='x_purchase_date',
        string='Date Achat [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_purchase_date"
    )
    warranty_end_date = fields.Date(
        related='x_warranty_end_date',
        string='Fin Garantie [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_warranty_end_date"
    )
    next_preventive_date = fields.Date(
        related='x_next_preventive_date',
        string='Prochaine Maintenance Préventive [DEPRECATED]',
        readonly=False,
        store=False,
        help="DEPRECATED: Utiliser x_next_preventive_date"
    )
    failure_count = fields.Integer(
        related='x_failure_count',
        string='Nombre Pannes [DEPRECATED]',
        readonly=True,
        store=False,
        help="DEPRECATED: Utiliser x_failure_count"
    )
    last_failure_date = fields.Datetime(
        related='x_last_failure_date',
        string='Dernière Panne [DEPRECATED]',
        readonly=True,
        store=False,
        help="DEPRECATED: Utiliser x_last_failure_date"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES COMPUTED
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('maintenance_ids', 'maintenance_ids.maintenance_type')
    def _compute_failure_count(self):
        """Compte les pannes correctives"""
        for equipment in self:
            failures = equipment.maintenance_ids.filtered(lambda r: r.maintenance_type == 'corrective')
            equipment.x_failure_count = len(failures)
            equipment.x_last_failure_date = failures.sorted('create_date', reverse=True)[0].create_date if failures else False
