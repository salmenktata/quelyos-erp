# -*- coding: utf-8 -*-
from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    qty_available_unreserved = fields.Float(
        string='Stock Disponible Non Réservé',
        compute='_compute_qty_available_unreserved',
        help='Quantité disponible en stock excluant les réservations (commandes confirmées non livrées)'
    )

    @api.depends('qty_available')
    def _compute_qty_available_unreserved(self):
        """
        Calcul du stock disponible hors réservations.

        Formule : qty_available_unreserved = qty_available - reserved_qty

        reserved_qty = Somme des mouvements stock en état 'assigned' (prêt à livrer)
        pour ce produit depuis locations internes vers locations clients.
        """
        for product in self:
            # Récupérer les mouvements réservés (assigned) pour ce produit
            # depuis emplacements internes vers emplacements clients
            reserved_moves = self.env['stock.move'].search([
                ('product_id', '=', product.id),
                ('state', 'in', ['assigned', 'confirmed', 'waiting']),
                ('location_id.usage', '=', 'internal'),
                ('location_dest_id.usage', '=', 'customer'),
            ])

            # Sommer les quantités réservées
            reserved_qty = sum(reserved_moves.mapped('product_uom_qty'))

            # Calculer stock disponible hors réservations
            product.qty_available_unreserved = max(0, product.qty_available - reserved_qty)
