# -*- coding: utf-8 -*-
from odoo import models, fields


class SubscriptionPlan(models.Model):
    _inherit = 'quelyos.subscription.plan'

    sms_quota = fields.Integer(
        string='Quota SMS/mois',
        default=0,
        help='Nombre de SMS inclus par mois dans cet abonnement'
    )

    sms_overage_price = fields.Float(
        string='Prix SMS supplémentaire',
        digits='Product Price',
        default=0.05,
        help='Prix par SMS au-delà du quota (en DT)'
    )
