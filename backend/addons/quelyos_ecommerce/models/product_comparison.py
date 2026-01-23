# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class ProductComparison(models.Model):
    _name = 'product.comparison'
    _description = 'Comparateur de Produits'
    _order = 'date_added desc'

    partner_id = fields.Many2one('res.partner', 'Client', required=True, ondelete='cascade', index=True)
    product_id = fields.Many2one('product.product', 'Produit', required=True, ondelete='cascade')
    product_tmpl_id = fields.Many2one('product.template', 'Template Produit',
                                       related='product_id.product_tmpl_id', store=True)
    date_added = fields.Datetime('Date ajout', default=fields.Datetime.now, required=True)

    _sql_constraints = [
        ('comparison_unique', 'unique(partner_id, product_id)',
         'Ce produit est déjà dans votre comparateur!')
    ]

    @api.model
    def add_to_comparison(self, partner_id, product_id):
        """Ajoute un produit au comparateur."""
        # Limite de 4 produits dans le comparateur
        existing_count = self.search_count([('partner_id', '=', partner_id)])
        if existing_count >= 4:
            raise ValidationError(_("Vous ne pouvez comparer que 4 produits maximum"))

        # Vérifier que le produit existe
        product = self.env['product.product'].browse(product_id)
        if not product.exists():
            raise ValidationError(_("Produit non trouvé"))

        # Vérifier si déjà dans comparateur
        existing = self.search([
            ('partner_id', '=', partner_id),
            ('product_id', '=', product_id)
        ])

        if existing:
            return {
                'success': False,
                'message': _("Ce produit est déjà dans votre comparateur"),
            }

        # Créer l'entrée
        comparison_item = self.create({
            'partner_id': partner_id,
            'product_id': product_id,
        })

        return {
            'success': True,
            'message': _("Produit ajouté au comparateur"),
            'comparison_item': comparison_item.id,
        }

    @api.model
    def remove_from_comparison(self, partner_id, product_id):
        """Retire un produit du comparateur."""
        comparison_item = self.search([
            ('partner_id', '=', partner_id),
            ('product_id', '=', product_id)
        ])

        if not comparison_item:
            return {
                'success': False,
                'message': _("Produit non trouvé dans le comparateur"),
            }

        comparison_item.unlink()

        return {
            'success': True,
            'message': _("Produit retiré du comparateur"),
        }

    @api.model
    def get_partner_comparison(self, partner_id):
        """Récupère tous les produits dans le comparateur."""
        comparison_items = self.search([('partner_id', '=', partner_id)])

        products_data = []
        for item in comparison_items:
            product_data = item.product_id.product_tmpl_id.get_api_data(include_variants=False)
            product_data['variant_id'] = item.product_id.id
            product_data['date_added'] = item.date_added.isoformat() if item.date_added else None
            products_data.append(product_data)

        return {
            'count': len(comparison_items),
            'max_items': 4,
            'products': products_data,
        }

    @api.model
    def clear_comparison(self, partner_id):
        """Vide le comparateur."""
        comparison_items = self.search([('partner_id', '=', partner_id)])
        comparison_items.unlink()

        return {
            'success': True,
            'message': _("Comparateur vidé"),
        }
