# -*- coding: utf-8 -*-

from odoo import models, fields, api
import re


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # SEO & URLs
    slug = fields.Char('URL Slug', compute='_compute_slug', store=True, index=True,
                       help='URL-friendly identifier pour SEO')
    meta_title = fields.Char('Meta Title (SEO)', translate=True,
                              help='Titre pour les moteurs de recherche (50-60 caractères)')
    meta_description = fields.Text('Meta Description (SEO)', translate=True,
                                    help='Description pour les moteurs de recherche (150-160 caractères)')
    meta_keywords = fields.Char('Meta Keywords (SEO)', translate=True,
                                 help='Mots-clés séparés par des virgules')

    # E-commerce features
    is_featured = fields.Boolean('Produit mis en avant', default=False,
                                  help='Afficher sur la page d\'accueil')
    featured_order = fields.Integer('Ordre affichage featured', default=0)
    is_new = fields.Boolean('Nouveau produit', default=False)
    is_bestseller = fields.Boolean('Meilleure vente', default=False)

    # Relations produits
    related_product_ids = fields.Many2many(
        'product.template',
        'product_template_related_rel',
        'product_id', 'related_id',
        string='Produits similaires',
        help='Produits à suggérer'
    )

    # Images supplémentaires (utilise product_template_image_ids natif)
    # gallery_image_ids = fields.One2many(
    #     'product.image',
    #     'product_tmpl_id',
    #     string='Galerie images'
    # )

    # Informations techniques
    technical_description = fields.Html('Description technique', translate=True)
    specifications = fields.Text('Spécifications', help='Format JSON pour affichage structuré')

    # Statistiques
    view_count = fields.Integer('Nombre de vues', default=0, readonly=True)
    wishlist_count = fields.Integer('Dans wishlists', compute='_compute_wishlist_count', store=True)

    @api.depends('name')
    def _compute_slug(self):
        """Génère un slug SEO-friendly depuis le nom du produit."""
        for product in self:
            if product.name:
                # Convertir en minuscules, remplacer espaces et caractères spéciaux
                slug = product.name.lower()
                slug = re.sub(r'[àáâãäå]', 'a', slug)
                slug = re.sub(r'[èéêë]', 'e', slug)
                slug = re.sub(r'[ìíîï]', 'i', slug)
                slug = re.sub(r'[òóôõö]', 'o', slug)
                slug = re.sub(r'[ùúûü]', 'u', slug)
                slug = re.sub(r'[ç]', 'c', slug)
                slug = re.sub(r'[^a-z0-9]+', '-', slug)
                slug = slug.strip('-')

                # Assurer l'unicité
                existing = self.search([('slug', '=', slug), ('id', '!=', product.id)])
                if existing:
                    slug = f"{slug}-{product.id}"

                product.slug = slug
            else:
                product.slug = False

    @api.depends('wishlist_ids')
    def _compute_wishlist_count(self):
        """Compte le nombre de wishlists contenant ce produit."""
        for product in self:
            product.wishlist_count = len(product.wishlist_ids)

    def increment_view_count(self):
        """Incrémente le compteur de vues."""
        self.ensure_one()
        self.sudo().write({'view_count': self.view_count + 1})

    def get_seo_data(self):
        """Retourne les données SEO formatées pour le frontend."""
        self.ensure_one()
        return {
            'slug': self.slug,
            'meta_title': self.meta_title or self.name,
            'meta_description': self.meta_description or self.description_sale or '',
            'meta_keywords': self.meta_keywords or '',
            'canonical_url': f'/products/{self.slug}',
        }

    def get_api_data(self, include_variants=True):
        """Formate les données produit pour l'API.

        Returns data in format matching frontend TypeScript Product interface.
        """
        self.ensure_one()

        # Currency (use company currency if not set)
        currency = self.currency_id or self.env.company.currency_id

        # Images (main + gallery)
        images = []
        if self.image_1920:
            images.append({
                'id': 0,
                'url': f'/web/image/product.template/{self.id}/image_1920',
                'alt': self.name,
                'is_main': True
            })

        # Add gallery images from product_template_image_ids if field exists (requires product_images module)
        if hasattr(self, 'product_template_image_ids'):
            for idx, img in enumerate(self.product_template_image_ids, start=1):
                images.append({
                    'id': img.id,
                    'url': f'/web/image/product.image/{img.id}/image_1920',
                    'alt': img.name or self.name,
                    'is_main': False
                })

        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description_sale or '',
            'technical_description': self.technical_description or '',
            'list_price': self.list_price,
            'currency': {
                'id': currency.id,
                'code': currency.name,  # In Odoo, currency.name is the code (EUR, USD, etc.)
                'symbol': currency.symbol,
            },
            'is_featured': self.is_featured,
            'is_new': self.is_new,
            'is_bestseller': self.is_bestseller,
            'images': images,
            'category': {
                'id': self.categ_id.id,
                'name': self.categ_id.name,
                'slug': self.categ_id.name.lower().replace(' ', '-'),
            } if self.categ_id else None,
            'in_stock': self.qty_available > 0,
            'stock_qty': self.qty_available,
            'seo': self.get_seo_data(),
            'view_count': self.view_count,
            'wishlist_count': self.wishlist_count,
        }

        # Variants
        if include_variants and self.product_variant_count > 1:
            data['variants'] = [{
                'id': variant.id,
                'name': variant.display_name,
                'price': variant.lst_price,
                'in_stock': variant.qty_available > 0,
                'stock_qty': variant.qty_available,
                'attributes': [{
                    'name': attr.attribute_id.name,
                    'value': attr.name,
                } for attr in variant.product_template_attribute_value_ids],
            } for variant in self.product_variant_ids]

        # Related products (return full object with id, name, slug, image)
        if self.related_product_ids:
            data['related_products'] = [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'image': f'/web/image/product.template/{p.id}/image_256',
                'list_price': p.list_price,
            } for p in self.related_product_ids[:4]]  # Limit to 4 products

        return data
