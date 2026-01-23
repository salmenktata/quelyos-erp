# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ProductProduct(models.Model):
    _inherit = 'product.product'

    # Override pour gérer les variants
    slug = fields.Char('URL Slug', compute='_compute_slug', store=True, index=True)

    @api.depends('name', 'product_tmpl_id.slug')
    def _compute_slug(self):
        """Génère un slug pour les variants."""
        for product in self:
            if product.product_tmpl_id.slug:
                if product.product_variant_count > 1:
                    # Pour variants: template-slug + attributs
                    attrs = '-'.join([
                        attr.name.lower().replace(' ', '-')
                        for attr in product.product_template_attribute_value_ids
                    ])
                    product.slug = f"{product.product_tmpl_id.slug}-{attrs}"
                else:
                    product.slug = product.product_tmpl_id.slug
            else:
                product.slug = False

    def get_api_data(self):
        """Formate les données variant pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'template_id': self.product_tmpl_id.id,
            'name': self.name,
            'slug': self.slug,
            'price': self.lst_price,
            'in_stock': self.qty_available > 0,
            'stock_qty': self.qty_available,
            'image_url': f'/web/image/product.product/{self.id}/image_1920',
            'attributes': [{
                'id': attr.attribute_id.id,
                'name': attr.attribute_id.name,
                'value_id': attr.id,
                'value': attr.name,
            } for attr in self.product_template_attribute_value_ids],
        }
