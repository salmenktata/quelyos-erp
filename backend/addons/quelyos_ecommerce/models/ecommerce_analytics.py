# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from datetime import datetime, timedelta


class EcommerceAnalytics(models.TransientModel):
    """
    Modèle transient pour le tableau de bord analytics e-commerce.
    Calcule des métriques en temps réel sans stocker de données.
    """
    _name = 'ecommerce.analytics'
    _description = 'Analytics E-commerce'

    # Période d'analyse
    date_from = fields.Date('Date début', default=lambda self: fields.Date.today() - timedelta(days=30))
    date_to = fields.Date('Date fin', default=fields.Date.today)

    # Métriques calculées
    total_orders = fields.Integer('Total Commandes', compute='_compute_metrics')
    total_revenue = fields.Monetary('Chiffre d\'affaires', compute='_compute_metrics')
    average_order_value = fields.Monetary('Panier moyen', compute='_compute_metrics')
    conversion_rate = fields.Float('Taux conversion (%)', compute='_compute_metrics')

    # Paniers
    active_carts = fields.Integer('Paniers actifs', compute='_compute_metrics')
    abandoned_carts = fields.Integer('Paniers abandonnés', compute='_compute_metrics')
    abandoned_cart_value = fields.Monetary('Valeur paniers abandonnés', compute='_compute_metrics')

    # Produits
    top_products_count = fields.Integer('Nombre top produits', compute='_compute_metrics')
    total_products_sold = fields.Integer('Produits vendus', compute='_compute_metrics')

    # Clients
    new_customers = fields.Integer('Nouveaux clients', compute='_compute_metrics')
    returning_customers = fields.Integer('Clients récurrents', compute='_compute_metrics')
    total_customers = fields.Integer('Total clients', compute='_compute_metrics')

    # Wishlist
    total_wishlist_items = fields.Integer('Items wishlist', compute='_compute_metrics')
    wishlist_conversion = fields.Float('Conversion wishlist (%)', compute='_compute_metrics')

    currency_id = fields.Many2one('res.currency', 'Devise',
                                   default=lambda self: self.env.company.currency_id)

    @api.depends('date_from', 'date_to')
    def _compute_metrics(self):
        """Calcule toutes les métriques pour la période sélectionnée."""
        for record in self:
            domain_date = [
                ('date_order', '>=', record.date_from),
                ('date_order', '<=', record.date_to),
            ]

            # Commandes confirmées
            confirmed_orders = self.env['sale.order'].search(
                domain_date + [('state', 'in', ['sale', 'done'])]
            )

            record.total_orders = len(confirmed_orders)
            record.total_revenue = sum(confirmed_orders.mapped('amount_total'))
            record.average_order_value = (
                record.total_revenue / record.total_orders
                if record.total_orders > 0 else 0
            )

            # Paniers actifs (dernières 24h)
            active_cart_date = fields.Datetime.now() - timedelta(days=1)
            record.active_carts = self.env['sale.order'].search_count([
                ('state', '=', 'draft'),
                ('cart_last_update', '>=', active_cart_date)
            ])

            # Paniers abandonnés (> 7 jours)
            abandoned_cart_date = fields.Datetime.now() - timedelta(days=7)
            abandoned_carts = self.env['sale.order'].search([
                ('state', '=', 'draft'),
                ('cart_last_update', '<', abandoned_cart_date),
                ('cart_last_update', '>=', record.date_from),
            ])

            record.abandoned_carts = len(abandoned_carts)
            record.abandoned_cart_value = sum(abandoned_carts.mapped('amount_total'))

            # Taux de conversion
            total_carts = self.env['sale.order'].search_count(
                [('create_date', '>=', record.date_from),
                 ('create_date', '<=', record.date_to)]
            )
            record.conversion_rate = (
                (record.total_orders / total_carts * 100)
                if total_carts > 0 else 0
            )

            # Produits vendus
            order_lines = confirmed_orders.mapped('order_line')
            record.total_products_sold = int(sum(order_lines.mapped('product_uom_qty')))
            record.top_products_count = len(order_lines.mapped('product_id'))

            # Clients
            all_customers = confirmed_orders.mapped('partner_id')
            record.total_customers = len(all_customers)

            # Nouveaux clients (première commande dans la période)
            new_customers = all_customers.filtered(
                lambda p: self.env['sale.order'].search_count([
                    ('partner_id', '=', p.id),
                    ('state', 'in', ['sale', 'done']),
                    ('date_order', '<', record.date_from)
                ]) == 0
            )
            record.new_customers = len(new_customers)
            record.returning_customers = record.total_customers - record.new_customers

            # Wishlist
            wishlist_items = self.env['product.wishlist'].search([
                ('date_added', '>=', record.date_from),
                ('date_added', '<=', record.date_to),
            ])
            record.total_wishlist_items = len(wishlist_items)

            # Conversion wishlist (produits achetés depuis wishlist)
            wishlist_products = wishlist_items.mapped('product_id')
            bought_from_wishlist = order_lines.filtered(
                lambda l: l.product_id in wishlist_products
            )
            record.wishlist_conversion = (
                (len(bought_from_wishlist) / len(wishlist_items) * 100)
                if len(wishlist_items) > 0 else 0
            )

    def get_top_products(self, limit=10):
        """Retourne les produits les plus vendus."""
        self.ensure_one()

        domain_date = [
            ('order_id.date_order', '>=', self.date_from),
            ('order_id.date_order', '<=', self.date_to),
            ('order_id.state', 'in', ['sale', 'done']),
        ]

        order_lines = self.env['sale.order.line'].search(domain_date)

        # Grouper par produit et calculer quantités
        product_sales = {}
        for line in order_lines:
            product = line.product_id.product_tmpl_id
            if product.id not in product_sales:
                product_sales[product.id] = {
                    'product': product,
                    'quantity': 0,
                    'revenue': 0,
                }
            product_sales[product.id]['quantity'] += line.product_uom_qty
            product_sales[product.id]['revenue'] += line.price_subtotal

        # Trier par quantité
        sorted_products = sorted(
            product_sales.values(),
            key=lambda x: x['quantity'],
            reverse=True
        )[:limit]

        return [{
            'id': item['product'].id,
            'name': item['product'].name,
            'quantity': int(item['quantity']),
            'revenue': item['revenue'],
        } for item in sorted_products]

    def get_sales_by_day(self):
        """Retourne les ventes par jour pour graphique."""
        self.ensure_one()

        sales_by_day = {}
        current_date = self.date_from

        while current_date <= self.date_to:
            next_date = current_date + timedelta(days=1)

            daily_orders = self.env['sale.order'].search([
                ('date_order', '>=', current_date),
                ('date_order', '<', next_date),
                ('state', 'in', ['sale', 'done']),
            ])

            sales_by_day[current_date.isoformat()] = {
                'date': current_date.isoformat(),
                'orders': len(daily_orders),
                'revenue': sum(daily_orders.mapped('amount_total')),
            }

            current_date = next_date

        return list(sales_by_day.values())

    def get_category_performance(self):
        """Retourne les performances par catégorie."""
        self.ensure_one()

        domain_date = [
            ('order_id.date_order', '>=', self.date_from),
            ('order_id.date_order', '<=', self.date_to),
            ('order_id.state', 'in', ['sale', 'done']),
        ]

        order_lines = self.env['sale.order.line'].search(domain_date)

        category_sales = {}
        for line in order_lines:
            category = line.product_id.categ_id
            if category.id not in category_sales:
                category_sales[category.id] = {
                    'category': category.name,
                    'quantity': 0,
                    'revenue': 0,
                    'orders': set(),
                }
            category_sales[category.id]['quantity'] += line.product_uom_qty
            category_sales[category.id]['revenue'] += line.price_subtotal
            category_sales[category.id]['orders'].add(line.order_id.id)

        return [{
            'category': item['category'],
            'quantity': int(item['quantity']),
            'revenue': item['revenue'],
            'orders': len(item['orders']),
        } for item in category_sales.values()]

    def action_view_abandoned_carts(self):
        """Ouvre la vue des paniers abandonnés."""
        self.ensure_one()

        abandoned_cart_date = fields.Datetime.now() - timedelta(days=7)

        return {
            'type': 'ir.actions.act_window',
            'name': _('Paniers Abandonnés'),
            'res_model': 'sale.order',
            'view_mode': 'list,form',
            'domain': [
                ('state', '=', 'draft'),
                ('cart_last_update', '<', abandoned_cart_date),
                ('cart_last_update', '>=', self.date_from),
            ],
            'context': {'create': False},
        }

    def action_view_top_products(self):
        """Ouvre la vue des produits les plus vendus."""
        self.ensure_one()

        top_products = self.get_top_products(limit=50)
        product_ids = [p['id'] for p in top_products]

        return {
            'type': 'ir.actions.act_window',
            'name': _('Top Produits'),
            'res_model': 'product.template',
            'view_mode': 'kanban,list,form',
            'domain': [('id', 'in', product_ids)],
            'context': {'create': False},
        }
