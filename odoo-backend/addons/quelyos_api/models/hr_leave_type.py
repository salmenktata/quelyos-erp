# -*- coding: utf-8 -*-
"""
Modèle Types de Congés RH.

Définit les différents types de congés disponibles :
congés payés, maladie, sans solde, maternité, etc.
"""

from odoo import models, fields, api


class HRLeaveType(models.Model):
    _name = 'quelyos.hr.leave.type'
    _description = 'Type de Congé'
    _order = 'sequence, name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Nom',
        required=True,
        translate=True,
        help="Nom du type de congé (ex: Congés payés, Maladie)"
    )
    code = fields.Char(
        string='Code',
        required=True,
        help="Code unique (ex: CP, MAL, SS)"
    )
    sequence = fields.Integer(
        string='Séquence',
        default=10
    )
    active = fields.Boolean(
        string='Actif',
        default=True
    )
    color = fields.Integer(
        string='Couleur',
        default=0,
        help="Couleur dans le calendrier"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONFIGURATION
    # ═══════════════════════════════════════════════════════════════════════════

    requires_allocation = fields.Boolean(
        string='Nécessite allocation',
        default=True,
        help="Si coché, l'employé doit avoir des jours alloués"
    )
    allocation_type = fields.Selection([
        ('no', 'Pas d\'allocation'),
        ('fixed', 'Allocation fixe'),
        ('accrual', 'Acquisition progressive'),
    ], string='Type d\'allocation', default='fixed')

    request_unit = fields.Selection([
        ('day', 'Jour'),
        ('half_day', 'Demi-journée'),
        ('hour', 'Heure'),
    ], string='Unité de demande', default='day', required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # VALIDATION
    # ═══════════════════════════════════════════════════════════════════════════

    validation_type = fields.Selection([
        ('no_validation', 'Pas de validation'),
        ('manager', 'Par le Manager'),
        ('hr', 'Par les RH'),
        ('both', 'Manager puis RH'),
    ], string='Validation', default='manager', required=True)

    # ═══════════════════════════════════════════════════════════════════════════
    # LIMITES
    # ═══════════════════════════════════════════════════════════════════════════

    max_days = fields.Float(
        string='Jours max/an',
        help="Nombre maximum de jours par an (0 = illimité)"
    )
    max_consecutive_days = fields.Float(
        string='Jours consécutifs max',
        help="Nombre maximum de jours consécutifs (0 = illimité)"
    )
    min_notice_days = fields.Integer(
        string='Préavis minimum (jours)',
        default=0,
        help="Délai minimum avant la date de début"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # RÉMUNÉRATION
    # ═══════════════════════════════════════════════════════════════════════════

    unpaid = fields.Boolean(
        string='Non rémunéré',
        default=False,
        help="Congé sans maintien de salaire"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # JUSTIFICATIF
    # ═══════════════════════════════════════════════════════════════════════════

    requires_attachment = fields.Boolean(
        string='Justificatif obligatoire',
        default=False,
        help="Un document justificatif est requis"
    )
    attachment_description = fields.Char(
        string='Description justificatif',
        help="Ex: Certificat médical"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        index=True
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='tenant_id.company_id',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('code_tenant_uniq', 'unique(code, tenant_id)',
         'Ce code de type de congé existe déjà !'),
    ]

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model
    def create_default_types(self, tenant_id):
        """Créer les types de congés par défaut pour un tenant."""
        default_types = [
            {
                'name': 'Congés Payés',
                'code': 'CP',
                'color': 4,
                'requires_allocation': True,
                'allocation_type': 'fixed',
                'validation_type': 'manager',
                'max_days': 30,
            },
            {
                'name': 'Congé Maladie',
                'code': 'MAL',
                'color': 1,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'hr',
                'requires_attachment': True,
                'attachment_description': 'Certificat médical',
            },
            {
                'name': 'Congé Sans Solde',
                'code': 'CSS',
                'color': 2,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'both',
                'unpaid': True,
            },
            {
                'name': 'Congé Maternité',
                'code': 'MAT',
                'color': 6,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'hr',
                'max_days': 98,  # 14 semaines
                'requires_attachment': True,
            },
            {
                'name': 'Congé Paternité',
                'code': 'PAT',
                'color': 5,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'hr',
                'max_days': 3,
            },
            {
                'name': 'Congé Mariage',
                'code': 'MAR',
                'color': 8,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'manager',
                'max_days': 3,
                'requires_attachment': True,
                'attachment_description': 'Certificat de mariage',
            },
            {
                'name': 'Congé Décès',
                'code': 'DEC',
                'color': 0,
                'requires_allocation': False,
                'allocation_type': 'no',
                'validation_type': 'manager',
                'max_days': 3,
            },
            {
                'name': 'RTT',
                'code': 'RTT',
                'color': 3,
                'requires_allocation': True,
                'allocation_type': 'accrual',
                'validation_type': 'manager',
            },
        ]

        for leave_type in default_types:
            leave_type['tenant_id'] = tenant_id
            existing = self.search([
                ('code', '=', leave_type['code']),
                ('tenant_id', '=', tenant_id),
            ], limit=1)
            if not existing:
                self.create(leave_type)

    def get_leave_type_data(self):
        """Retourne les données du type de congé pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'color': self.color,
            'requires_allocation': self.requires_allocation,
            'allocation_type': self.allocation_type,
            'request_unit': self.request_unit,
            'validation_type': self.validation_type,
            'max_days': self.max_days,
            'max_consecutive_days': self.max_consecutive_days,
            'min_notice_days': self.min_notice_days,
            'unpaid': self.unpaid,
            'requires_attachment': self.requires_attachment,
            'attachment_description': self.attachment_description or '',
            'active': self.active,
        }
