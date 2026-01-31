# -*- coding: utf-8 -*-
"""
Extension stock.quant avec champ computed unreserved_quantity
Stock disponible = Stock réel - Réservations en cours
"""

from odoo import models, fields, api


class StockQuantUnreserved(models.Model):
    _inherit = 'stock.quant'

    unreserved_quantity = fields.Float(
        string='Quantité Non Réservée',
        compute='_compute_unreserved_quantity',
        store=False,
        help="Quantité disponible hors réservations en cours (commandes non traitées)"
    )

    reserved_quantity_detail = fields.Float(
        string='Quantité Réservée',
        compute='_compute_unreserved_quantity',
        store=False,
        help="Quantité totale réservée par des commandes/transferts en attente"
    )

    @api.depends('quantity', 'reserved_quantity')
    def _compute_unreserved_quantity(self):
        """
        Calcule la quantité réellement disponible :
        unreserved = quantity - reserved_quantity
        
        reserved_quantity (Odoo native) = Somme des réservations en cours
        """
        for quant in self:
            # Odoo calcule déjà reserved_quantity via stock.move
            # On utilise directement ce champ natif
            reserved = quant.reserved_quantity if hasattr(quant, 'reserved_quantity') else 0.0
            
            quant.reserved_quantity_detail = reserved
            quant.unreserved_quantity = quant.quantity - reserved
            
            # Sécurité : ne jamais retourner négatif
            if quant.unreserved_quantity < 0:
                quant.unreserved_quantity = 0.0
