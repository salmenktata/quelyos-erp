# -*- coding: utf-8 -*-
"""
Extension res.partner pour support multi-tenant et intégration mass mailing.

Ajoute le champ tenant_id sur les contacts/clients pour permettre
à chaque tenant d'avoir ses propres clients isolés.

Intègre les fonctionnalités OCA mass_mailing_partner pour lier
les contacts res.partner aux contacts mailing et leurs statistiques.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class ResPartner(models.Model):
    """Extension res.partner pour multi-tenant et mass mailing"""
    _inherit = 'res.partner'

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        index=True,
        ondelete='cascade',
        help='Tenant propriétaire de ce contact/client',
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # INTÉGRATION OCA: mass_mailing_partner
    # ═══════════════════════════════════════════════════════════════════════════
    # DÉSACTIVÉ TEMPORAIREMENT : Nécessite d'hériter mailing.contact et mailing.trace
    # pour ajouter le champ partner_id inverse avant d'utiliser les One2many.
    # TODO : Créer mailing_contact.py et mailing_trace.py avec _inherit et partner_id
    pass
