# -*- coding: utf-8 -*-

from odoo import models, api
import logging

_logger = logging.getLogger(__name__)


class SEOService(models.AbstractModel):
    """Service métier pour l'optimisation SEO."""

    _name = 'seo.service'
    _description = 'Service SEO E-commerce'

    @api.model
    def generate_meta_description(self, product):
        """
        Génère une meta description optimisée pour un produit.

        Args:
            product: product.template record

        Returns:
            str: Meta description (150-160 caractères)
        """
        if product.meta_description:
            return product.meta_description[:160]

        # Générer automatiquement
        description = f"{product.name}"

        if product.list_price:
            description += f" - {product.list_price:.2f} {product.currency_id.symbol}"

        if product.description_sale:
            # Ajouter début de la description
            clean_desc = product.description_sale[:80].strip()
            description += f". {clean_desc}"

        if product.categ_id:
            description += f" | {product.categ_id.name}"

        # Limiter à 160 caractères
        return description[:160]

    @api.model
    def generate_meta_keywords(self, product):
        """
        Génère des mots-clés SEO pour un produit.

        Returns:
            str: Mots-clés séparés par des virgules
        """
        if product.meta_keywords:
            return product.meta_keywords

        keywords = []

        # Nom du produit
        keywords.append(product.name.lower())

        # Catégorie
        if product.categ_id:
            keywords.append(product.categ_id.name.lower())
            if product.categ_id.parent_id:
                keywords.append(product.categ_id.parent_id.name.lower())

        # Attributs
        for variant in product.product_variant_ids:
            for attr_value in variant.product_template_attribute_value_ids:
                keywords.append(attr_value.name.lower())

        # Dédupliquer et limiter
        unique_keywords = list(dict.fromkeys(keywords))[:10]

        return ', '.join(unique_keywords)

    @api.model
    def generate_structured_data(self, product):
        """
        Génère les structured data (JSON-LD) pour un produit.

        Returns:
            dict: Structured data au format JSON-LD
        """
        config = self.env['ecommerce.config'].sudo().search([], limit=1)
        frontend_url = config.frontend_url if config else 'http://localhost:3000'

        structured_data = {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            'name': product.name,
            'description': self.generate_meta_description(product),
            'sku': product.default_code or str(product.id),
            'url': f"{frontend_url}/products/{product.slug}",
            'offers': {
                '@type': 'Offer',
                'price': product.list_price,
                'priceCurrency': product.currency_id.name,
                'availability': 'https://schema.org/InStock' if product.qty_available > 0 else 'https://schema.org/OutOfStock',
                'url': f"{frontend_url}/products/{product.slug}",
            },
        }

        # Images
        if product.image_1920:
            structured_data['image'] = f"{frontend_url}/web/image/product.template/{product.id}/image_1920"

        # Brand (si disponible)
        # structured_data['brand'] = {
        #     '@type': 'Brand',
        #     'name': 'Quelyos'
        # }

        # Category
        if product.categ_id:
            structured_data['category'] = product.categ_id.name

        # Reviews (si disponibles)
        # structured_data['aggregateRating'] = {
        #     '@type': 'AggregateRating',
        #     'ratingValue': '4.5',
        #     'reviewCount': '42'
        # }

        return structured_data

    @api.model
    def generate_sitemap_urls(self, base_url):
        """
        Génère la liste des URLs pour le sitemap.

        Args:
            base_url: URL de base du site

        Returns:
            list: Liste d'URLs avec métadonnées
        """
        urls = []

        # Page d'accueil
        urls.append({
            'loc': base_url,
            'changefreq': 'daily',
            'priority': 1.0,
        })

        # Produits
        products = self.env['product.template'].search([
            ('sale_ok', '=', True),
            ('slug', '!=', False),
        ])

        for product in products:
            urls.append({
                'loc': f"{base_url}/products/{product.slug}",
                'lastmod': product.write_date.isoformat() if product.write_date else None,
                'changefreq': 'weekly',
                'priority': 0.8,
            })

        # Catégories
        categories = self.env['product.category'].search([])

        for category in categories:
            # Générer slug pour catégorie (similaire aux produits)
            slug = category.name.lower().replace(' ', '-')
            urls.append({
                'loc': f"{base_url}/categories/{slug}",
                'changefreq': 'weekly',
                'priority': 0.7,
            })

        return urls

    @api.model
    def generate_robots_txt(self):
        """
        Génère le contenu du fichier robots.txt.

        Returns:
            str: Contenu robots.txt
        """
        config = self.env['ecommerce.config'].sudo().search([], limit=1)
        frontend_url = config.frontend_url if config else 'http://localhost:3000'

        robots_txt = f"""User-agent: *
Allow: /
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /account

Sitemap: {frontend_url}/sitemap.xml
"""
        return robots_txt

    @api.model
    def optimize_product_seo(self, product):
        """
        Optimise automatiquement le SEO d'un produit.

        Args:
            product: product.template record

        Returns:
            dict: Modifications appliquées
        """
        modifications = {}

        # Meta title
        if not product.meta_title:
            meta_title = f"{product.name}"
            if product.categ_id:
                meta_title += f" - {product.categ_id.name}"
            meta_title += " | Quelyos"

            product.meta_title = meta_title[:60]
            modifications['meta_title'] = product.meta_title

        # Meta description
        if not product.meta_description:
            product.meta_description = self.generate_meta_description(product)
            modifications['meta_description'] = product.meta_description

        # Meta keywords
        if not product.meta_keywords:
            product.meta_keywords = self.generate_meta_keywords(product)
            modifications['meta_keywords'] = product.meta_keywords

        # Slug (normalement auto-généré par compute, mais on peut forcer)
        if not product.slug:
            product._compute_slug()
            modifications['slug'] = product.slug

        return {
            'success': True,
            'modifications': modifications,
            'message': f"{len(modifications)} champs SEO optimisés",
        }

    @api.model
    def get_seo_score(self, product):
        """
        Calcule un score SEO pour un produit (0-100).

        Returns:
            dict: {
                'score': int,
                'recommendations': list
            }
        """
        score = 0
        recommendations = []

        # Slug (10 points)
        if product.slug:
            score += 10
        else:
            recommendations.append("Ajouter un slug URL")

        # Meta title (20 points)
        if product.meta_title:
            score += 20
            if len(product.meta_title) > 60:
                recommendations.append("Meta title trop long (max 60 caractères)")
                score -= 5
        else:
            recommendations.append("Ajouter un meta title")

        # Meta description (20 points)
        if product.meta_description:
            score += 20
            if len(product.meta_description) > 160:
                recommendations.append("Meta description trop longue (max 160 caractères)")
                score -= 5
        else:
            recommendations.append("Ajouter une meta description")

        # Images (15 points)
        if product.image_1920:
            score += 15
        else:
            recommendations.append("Ajouter une image produit")

        # Description (15 points)
        if product.description_sale:
            score += 15
            if len(product.description_sale) < 100:
                recommendations.append("Description trop courte (min 100 caractères recommandé)")
                score -= 5
        else:
            recommendations.append("Ajouter une description produit")

        # Prix (10 points)
        if product.list_price > 0:
            score += 10
        else:
            recommendations.append("Définir un prix")

        # Catégorie (10 points)
        if product.categ_id:
            score += 10
        else:
            recommendations.append("Assigner une catégorie")

        return {
            'score': max(0, min(100, score)),
            'recommendations': recommendations,
            'status': 'excellent' if score >= 80 else 'good' if score >= 60 else 'needs_improvement',
        }
