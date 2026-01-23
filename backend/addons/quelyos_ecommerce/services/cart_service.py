# -*- coding: utf-8 -*-

from odoo import models, api
import logging

_logger = logging.getLogger(__name__)


class CartService(models.AbstractModel):
    """Service métier pour la gestion du panier."""

    _name = 'cart.service'
    _description = 'Service Panier E-commerce'

    @api.model
    def validate_cart_items(self, cart):
        """
        Valide tous les articles du panier (stock, prix, disponibilité).

        Args:
            cart: sale.order record

        Returns:
            dict: {
                'valid': bool,
                'errors': list,
                'warnings': list
            }
        """
        errors = []
        warnings = []

        if not cart.order_line:
            errors.append("Le panier est vide")
            return {
                'valid': False,
                'errors': errors,
                'warnings': warnings,
            }

        for line in cart.order_line:
            product = line.product_id

            # Vérifier que le produit est toujours vendable
            if not product.sale_ok:
                errors.append(f"{product.name} n'est plus disponible à la vente")
                continue

            # Vérifier stock pour produits stockables
            if product.type == 'product':
                if product.qty_available < line.product_uom_qty:
                    errors.append(
                        f"Stock insuffisant pour {product.name}. "
                        f"Disponible: {int(product.qty_available)}, Demandé: {int(line.product_uom_qty)}"
                    )

                # Avertissement si stock faible
                elif product.qty_available < line.product_uom_qty * 2:
                    warnings.append(f"Stock limité pour {product.name}")

            # Vérifier que le prix n'a pas changé significativement
            current_price = product.list_price
            if abs(current_price - line.price_unit) / line.price_unit > 0.1:  # >10% de différence
                warnings.append(
                    f"Le prix de {product.name} a changé. "
                    f"Nouveau prix: {current_price}"
                )

        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
        }

    @api.model
    def calculate_cart_totals(self, cart):
        """
        Calcule les totaux détaillés du panier.

        Returns:
            dict: {
                'subtotal': float,
                'tax': float,
                'shipping': float,
                'discount': float,
                'total': float
            }
        """
        subtotal = sum(line.price_subtotal for line in cart.order_line)
        tax = sum(line.price_tax for line in cart.order_line)

        # Frais de livraison
        shipping_lines = cart.order_line.filtered(lambda l: l.is_delivery)
        shipping = sum(line.price_subtotal for line in shipping_lines)

        # Remises
        discount = 0
        for line in cart.order_line:
            if line.discount > 0:
                discount += line.price_unit * line.product_uom_qty * (line.discount / 100)

        total = cart.amount_total

        return {
            'subtotal': subtotal,
            'tax': tax,
            'shipping': shipping,
            'discount': discount,
            'total': total,
            'currency': {
                'id': cart.currency_id.id,
                'symbol': cart.currency_id.symbol,
                'name': cart.currency_id.name,
            },
        }

    @api.model
    def apply_coupon(self, cart, coupon_code):
        """
        Applique un code promo au panier.
        (À implémenter avec module promotion/coupon)

        Args:
            cart: sale.order record
            coupon_code: Code promo

        Returns:
            dict: {
                'success': bool,
                'message': str,
                'discount_amount': float
            }
        """
        # Placeholder - à implémenter avec module coupon
        return {
            'success': False,
            'message': 'Module coupons non installé',
            'discount_amount': 0,
        }

    @api.model
    def estimate_delivery_date(self, cart, delivery_method_id=None):
        """
        Estime la date de livraison.

        Returns:
            dict: {
                'estimated_date': str (ISO format),
                'min_days': int,
                'max_days': int
            }
        """
        from datetime import datetime, timedelta

        # Par défaut: 3-5 jours ouvrés
        min_days = 3
        max_days = 5

        if delivery_method_id:
            delivery_method = self.env['delivery.carrier'].browse(delivery_method_id)
            # Ajuster selon la méthode de livraison
            # (logique à personnaliser)

        base_date = datetime.now()
        estimated_date = base_date + timedelta(days=min_days)

        return {
            'estimated_date': estimated_date.isoformat(),
            'min_days': min_days,
            'max_days': max_days,
            'message': f'Livraison estimée entre {min_days} et {max_days} jours ouvrés',
        }

    @api.model
    def merge_carts(self, guest_cart, user_cart):
        """
        Fusionne un panier invité avec le panier utilisateur après login.

        Args:
            guest_cart: Panier de l'invité (session)
            user_cart: Panier de l'utilisateur authentifié

        Returns:
            sale.order: Panier fusionné
        """
        if not guest_cart or not guest_cart.order_line:
            return user_cart

        if not user_cart:
            # Convertir le panier invité en panier utilisateur
            guest_cart.write({
                'partner_id': self.env.user.partner_id.id,
                'session_id': False,
            })
            return guest_cart

        # Fusionner les lignes
        for guest_line in guest_cart.order_line:
            # Chercher ligne similaire dans panier utilisateur
            existing_line = user_cart.order_line.filtered(
                lambda l: l.product_id == guest_line.product_id
            )

            if existing_line:
                # Augmenter la quantité
                existing_line.product_uom_qty += guest_line.product_uom_qty
            else:
                # Copier la ligne
                guest_line.copy({'order_id': user_cart.id})

        # Supprimer le panier invité
        guest_cart.unlink()

        return user_cart

    @api.model
    def get_cart_recommendations(self, cart, limit=4):
        """
        Recommande des produits basés sur le contenu du panier.

        Args:
            cart: sale.order record
            limit: Nombre de recommandations

        Returns:
            list: Produits recommandés
        """
        if not cart.order_line:
            return []

        # Récupérer les catégories des produits du panier
        cart_categories = cart.order_line.mapped('product_id.categ_id')

        # Trouver produits similaires
        recommendations = self.env['product.template'].search([
            ('sale_ok', '=', True),
            ('categ_id', 'in', cart_categories.ids),
            ('id', 'not in', cart.order_line.mapped('product_id.product_tmpl_id').ids),
        ], limit=limit, order='view_count DESC')

        return [
            {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': p.list_price,
                'image_url': f'/web/image/product.template/{p.id}/image_256',
            }
            for p in recommendations
        ]

    @api.model
    def check_minimum_order(self, cart):
        """
        Vérifie si le montant minimum de commande est atteint.

        Returns:
            dict: {
                'valid': bool,
                'minimum_amount': float,
                'current_amount': float,
                'missing_amount': float
            }
        """
        config = self.env['ecommerce.config'].sudo().get_config()
        minimum_amount = config.get('min_order_amount', 0)

        current_amount = cart.amount_total
        missing_amount = max(0, minimum_amount - current_amount)

        return {
            'valid': current_amount >= minimum_amount,
            'minimum_amount': minimum_amount,
            'current_amount': current_amount,
            'missing_amount': missing_amount,
            'message': f'Montant minimum de commande: {minimum_amount}' if missing_amount > 0 else 'OK',
        }
