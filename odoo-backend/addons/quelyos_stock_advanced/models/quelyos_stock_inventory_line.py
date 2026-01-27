# -*- coding: utf-8 -*-
"""
Lignes d'inventaire de stock - Quelyos Native
"""
from odoo import models, fields, api


class QuelyosStockInventoryLine(models.Model):
    _name = 'quelyos.stock.inventory.line'
    _description = 'Ligne Inventaire Stock Quelyos'
    _order = 'product_id'

    inventory_id = fields.Many2one(
        'quelyos.stock.inventory',
        string='Inventaire',
        required=True,
        ondelete='cascade',
        index=True
    )

    product_id = fields.Many2one(
        'product.product',
        string='Produit',
        required=True,
        domain=[('type', '=', 'product')],
        index=True
    )

    theoretical_qty = fields.Float(
        string='Quantité Théorique',
        digits='Product Unit of Measure',
        readonly=True,
        help="Quantité dans le système au moment du démarrage de l'inventaire"
    )

    counted_qty = fields.Float(
        string='Quantité Comptée',
        digits='Product Unit of Measure',
        required=True,
        default=0.0,
        help="Quantité réellement comptée physiquement"
    )

    difference_qty = fields.Float(
        string='Écart',
        digits='Product Unit of Measure',
        compute='_compute_difference_qty',
        store=True,
        help="Différence entre quantité comptée et théorique"
    )

    state = fields.Selection(
        related='inventory_id.state',
        string='Statut',
        store=True,
        readonly=True
    )

    @api.depends('theoretical_qty', 'counted_qty')
    def _compute_difference_qty(self):
        for line in self:
            line.difference_qty = line.counted_qty - line.theoretical_qty
