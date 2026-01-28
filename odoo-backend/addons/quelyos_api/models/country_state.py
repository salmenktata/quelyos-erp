# -*- coding: utf-8 -*-
"""
Extension du modèle res.country.state pour les zones de livraison
"""
from odoo import models, fields


class CountryState(models.Model):
    _inherit = 'res.country.state'

    x_shipping_zone = fields.Selection([
        ('grand-tunis', 'Grand Tunis'),
        ('nord', 'Nord'),
        ('centre', 'Centre'),
        ('sud', 'Sud'),
    ], string='Zone de livraison', help='Zone géographique pour le calcul des frais de livraison')
