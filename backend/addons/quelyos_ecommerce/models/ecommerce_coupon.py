# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime


class EcommerceCoupon(models.Model):
    _name = 'ecommerce.coupon'
    _description = 'Coupon de Réduction E-commerce'
    _order = 'create_date desc'

    name = fields.Char('Nom', required=True)
    code = fields.Char('Code', required=True, size=50, index=True)
    description = fields.Text('Description')

    # Type de réduction
    discount_type = fields.Selection([
        ('percent', 'Pourcentage'),
        ('fixed', 'Montant fixe'),
        ('free_shipping', 'Livraison gratuite'),
    ], string='Type', required=True, default='percent')

    discount_value = fields.Float('Valeur réduction', required=True,
                                    help='Pourcentage (0-100) ou montant fixe')

    # Conditions d'application
    minimum_amount = fields.Monetary('Montant minimum', currency_field='currency_id',
                                      help='Montant minimum de commande pour appliquer le coupon')
    maximum_discount = fields.Monetary('Réduction maximum', currency_field='currency_id',
                                        help='Montant maximum de réduction (pour pourcentage)')

    # Restrictions produits/catégories
    product_ids = fields.Many2many('product.template', string='Produits spécifiques',
                                     help='Laisser vide pour tous les produits')
    category_ids = fields.Many2many('product.category', string='Catégories spécifiques',
                                      help='Laisser vide pour toutes les catégories')

    # Validité
    date_start = fields.Date('Date début', default=fields.Date.today, required=True)
    date_end = fields.Date('Date fin')
    active = fields.Boolean('Actif', default=True)

    # Limitations d'usage
    usage_limit = fields.Integer('Limite d\'utilisation', default=0,
                                   help='0 = illimité')
    usage_count = fields.Integer('Nombre d\'utilisations', readonly=True, default=0)
    usage_limit_per_customer = fields.Integer('Limite par client', default=0,
                                                help='0 = illimité')

    # Restrictions clients
    partner_ids = fields.Many2many('res.partner', string='Clients spécifiques',
                                     help='Laisser vide pour tous les clients')
    first_order_only = fields.Boolean('Première commande uniquement')

    currency_id = fields.Many2one('res.currency', 'Devise',
                                   default=lambda self: self.env.company.currency_id)

    # Stats
    total_discount_given = fields.Monetary('Réduction totale accordée', readonly=True,
                                            currency_field='currency_id')

    _sql_constraints = [
        ('code_unique', 'unique(code)', 'Ce code coupon existe déjà !'),
    ]

    @api.constrains('discount_value', 'discount_type')
    def _check_discount_value(self):
        """Valide la valeur de réduction."""
        for coupon in self:
            if coupon.discount_type == 'percent':
                if coupon.discount_value < 0 or coupon.discount_value > 100:
                    raise ValidationError(_('Le pourcentage doit être entre 0 et 100'))
            elif coupon.discount_type == 'fixed':
                if coupon.discount_value < 0:
                    raise ValidationError(_('Le montant fixe ne peut pas être négatif'))

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        """Valide les dates."""
        for coupon in self:
            if coupon.date_end and coupon.date_end < coupon.date_start:
                raise ValidationError(_('La date de fin doit être après la date de début'))

    def is_valid(self, order, partner):
        """
        Vérifie si le coupon est valide pour une commande donnée.

        Returns:
            dict: {'valid': bool, 'error': str}
        """
        self.ensure_one()

        # Vérifier actif
        if not self.active:
            return {'valid': False, 'error': _('Ce coupon est désactivé')}

        # Vérifier dates
        today = fields.Date.today()
        if today < self.date_start:
            return {'valid': False, 'error': _('Ce coupon n\'est pas encore valide')}
        if self.date_end and today > self.date_end:
            return {'valid': False, 'error': _('Ce coupon a expiré')}

        # Vérifier limite d'utilisation globale
        if self.usage_limit > 0 and self.usage_count >= self.usage_limit:
            return {'valid': False, 'error': _('Ce coupon a atteint sa limite d\'utilisation')}

        # Vérifier limite par client
        if self.usage_limit_per_customer > 0:
            customer_usage = self.env['sale.order'].search_count([
                ('partner_id', '=', partner.id),
                ('coupon_id', '=', self.id),
                ('state', 'in', ['sale', 'done']),
            ])
            if customer_usage >= self.usage_limit_per_customer:
                return {'valid': False, 'error': _('Vous avez déjà utilisé ce coupon le nombre maximum de fois')}

        # Vérifier client spécifique
        if self.partner_ids and partner.id not in self.partner_ids.ids:
            return {'valid': False, 'error': _('Ce coupon n\'est pas valide pour votre compte')}

        # Vérifier première commande
        if self.first_order_only:
            previous_orders = self.env['sale.order'].search_count([
                ('partner_id', '=', partner.id),
                ('state', 'in', ['sale', 'done']),
            ])
            if previous_orders > 0:
                return {'valid': False, 'error': _('Ce coupon est réservé aux nouveaux clients')}

        # Vérifier montant minimum
        if self.minimum_amount > 0 and order.amount_untaxed < self.minimum_amount:
            return {
                'valid': False,
                'error': _('Montant minimum de %(amount).2f %(currency)s requis') % {
                    'amount': self.minimum_amount,
                    'currency': self.currency_id.name
                }
            }

        # Vérifier produits/catégories
        if self.product_ids or self.category_ids:
            order_products = order.order_line.mapped('product_id.product_tmpl_id')
            order_categories = order.order_line.mapped('product_id.categ_id')

            valid_products = any(
                p in self.product_ids for p in order_products
            ) if self.product_ids else True

            valid_categories = any(
                c in self.category_ids for c in order_categories
            ) if self.category_ids else True

            if not (valid_products and valid_categories):
                return {'valid': False, 'error': _('Ce coupon ne s\'applique pas aux produits de votre panier')}

        return {'valid': True, 'error': None}

    def calculate_discount(self, order):
        """
        Calcule le montant de réduction pour une commande.

        Returns:
            float: Montant de la réduction
        """
        self.ensure_one()

        # Base de calcul (montant HT lignes éligibles)
        if self.product_ids or self.category_ids:
            # Filtrer lignes éligibles
            eligible_lines = order.order_line.filtered(
                lambda l: (not self.product_ids or l.product_id.product_tmpl_id in self.product_ids) and
                         (not self.category_ids or l.product_id.categ_id in self.category_ids)
            )
            base_amount = sum(eligible_lines.mapped('price_subtotal'))
        else:
            base_amount = order.amount_untaxed

        # Calculer réduction
        if self.discount_type == 'percent':
            discount = base_amount * (self.discount_value / 100.0)
            # Appliquer maximum si défini
            if self.maximum_discount > 0:
                discount = min(discount, self.maximum_discount)
        elif self.discount_type == 'fixed':
            discount = self.discount_value
        else:  # free_shipping
            # Pour livraison gratuite, on calcule le coût de livraison
            shipping_lines = order.order_line.filtered(lambda l: l.is_delivery)
            discount = sum(shipping_lines.mapped('price_subtotal'))

        # Ne pas dépasser le montant de la commande
        discount = min(discount, order.amount_untaxed)

        return discount

    @api.model
    def validate_and_apply_coupon(self, code, order_id, partner_id):
        """
        Valide et applique un coupon à une commande.

        Returns:
            dict: {'success': bool, 'discount': float, 'message': str}
        """
        # Chercher le coupon
        coupon = self.search([('code', '=', code.strip().upper())], limit=1)

        if not coupon:
            return {
                'success': False,
                'error': _('Code coupon invalide'),
            }

        # Récupérer commande et client
        order = self.env['sale.order'].browse(order_id)
        partner = self.env['res.partner'].browse(partner_id)

        if not order.exists() or not partner.exists():
            return {
                'success': False,
                'error': _('Commande ou client non trouvé'),
            }

        # Valider le coupon
        validation = coupon.is_valid(order, partner)
        if not validation['valid']:
            return {
                'success': False,
                'error': validation['error'],
            }

        # Calculer la réduction
        discount = coupon.calculate_discount(order)

        # Appliquer le coupon à la commande
        order.write({
            'coupon_id': coupon.id,
            'coupon_discount': discount,
        })

        return {
            'success': True,
            'discount': discount,
            'message': _('Coupon appliqué avec succès'),
            'coupon': {
                'code': coupon.code,
                'name': coupon.name,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value,
            }
        }


# Extension sale.order pour gérer les coupons
class SaleOrder(models.Model):
    _inherit = 'sale.order'

    coupon_id = fields.Many2one('ecommerce.coupon', 'Coupon appliqué', ondelete='restrict')
    coupon_discount = fields.Monetary('Réduction coupon', currency_field='currency_id')

    @api.depends('order_line.price_total', 'coupon_discount')
    def _amount_all(self):
        """Surchargé pour prendre en compte la réduction coupon."""
        super()._amount_all()
        for order in self:
            if order.coupon_discount > 0:
                order.amount_total = order.amount_total - order.coupon_discount

    def action_confirm(self):
        """Incrémente les stats du coupon lors de la confirmation."""
        res = super().action_confirm()
        for order in self:
            if order.coupon_id:
                order.coupon_id.usage_count += 1
                order.coupon_id.total_discount_given += order.coupon_discount
        return res

    def remove_coupon(self):
        """Retire le coupon de la commande."""
        self.ensure_one()
        self.write({
            'coupon_id': False,
            'coupon_discount': 0.0,
        })
