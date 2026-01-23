# -*- coding: utf-8 -*-

from odoo import models, fields, api


class EcommerceConfig(models.Model):
    _name = 'ecommerce.config'
    _description = 'Configuration E-commerce'
    _rec_name = 'name'

    name = fields.Char('Nom Configuration', required=True, default='Configuration E-commerce')

    # URLs et intégration
    frontend_url = fields.Char('URL Frontend', required=True, default='http://localhost:3000',
                                help='URL du frontend Next.js')
    webhook_secret = fields.Char('Webhook Secret', required=True,
                                  help='Secret partagé pour authentifier les webhooks')

    # Configuration catalogue
    products_per_page = fields.Integer('Produits par page', default=24)
    show_out_of_stock = fields.Boolean('Afficher produits en rupture', default=True)
    enable_wishlist = fields.Boolean('Activer wishlist', default=True)
    enable_comparison = fields.Boolean('Activer comparateur', default=True)

    # Configuration panier
    cart_session_duration = fields.Integer('Durée session panier (jours)', default=7)
    min_order_amount = fields.Float('Montant minimum commande', default=0.0)

    # SEO
    default_meta_description = fields.Text('Meta description par défaut')
    enable_auto_slug = fields.Boolean('Génération automatique des slugs', default=True)

    # Webhooks activés
    webhook_stock_change = fields.Boolean('Webhook changement stock', default=True)
    webhook_order_confirmed = fields.Boolean('Webhook commande confirmée', default=True)
    webhook_product_updated = fields.Boolean('Webhook produit mis à jour', default=True)

    # Configuration paiement
    enable_guest_checkout = fields.Boolean('Autoriser achat invité', default=False)

    @api.model
    def get_config(self):
        """Récupère la configuration active."""
        config = self.search([], limit=1)
        if not config:
            config = self.create({})
        return {
            'frontend_url': config.frontend_url,
            'products_per_page': config.products_per_page,
            'show_out_of_stock': config.show_out_of_stock,
            'enable_wishlist': config.enable_wishlist,
            'enable_comparison': config.enable_comparison,
            'min_order_amount': config.min_order_amount,
            'enable_guest_checkout': config.enable_guest_checkout,
        }
