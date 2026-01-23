# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging

_logger = logging.getLogger(__name__)


class EcommerceCouponController(BaseEcommerceController):
    """Controller pour les coupons de réduction avec sécurité renforcée."""

    @http.route('/api/ecommerce/coupon/validate', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=10, window=300)  # 10 tentatives par 5 minutes (protection brute force codes promo)
    def validate_coupon(self, **kwargs):
        """
        Valide et applique un coupon à la commande/panier actuel.

        Body JSON:
        {
            "code": "SUMMER2024",
            "order_id": 123  // optionnel, sinon utilise le panier actif
        }

        Returns:
        {
            "success": true,
            "discount": 10.00,
            "message": "Coupon appliqué",
            "coupon": {...},
            "cart": {...}  // panier mis à jour
        }
        """
        try:
            params = request.jsonrequest

            # Validation code coupon
            self._validate_required_params(params, ['code'])

            input_validator = request.env['input.validator']
            code = input_validator.validate_string(
                params.get('code'),
                field_name='code',
                min_length=3,
                max_length=50,
                required=True
            )

            # Normaliser le code (uppercase, strip)
            code = code.upper().strip()

            partner = request.env.user.partner_id
            order_id = params.get('order_id')

            # Si pas d'order_id, récupérer le panier actif
            if not order_id:
                cart = request.env['sale.order'].sudo().get_or_create_cart(partner_id=partner.id)
                if not cart:
                    return self._handle_error(
                        Exception('Panier non trouvé'),
                        "validation coupon"
                    )
                order_id = cart.id
            else:
                # Validation order_id
                order_id = input_validator.validate_id(order_id, 'order_id')

                # SÉCURITÉ: Vérifier que c'est bien la commande de l'utilisateur
                cart = request.env['sale.order'].sudo().browse(order_id)
                if not cart.exists() or cart.partner_id.id != partner.id:
                    _logger.warning(f"Tentative d'accès non autorisé à la commande {order_id} par {partner.id}")
                    return self._handle_error(
                        Exception('Commande non trouvée ou accès non autorisé'),
                        "validation coupon"
                    )

            # Valider et appliquer le coupon
            result = request.env['ecommerce.coupon'].sudo().validate_and_apply_coupon(
                code=code,
                order_id=order_id,
                partner_id=partner.id
            )

            if result['success']:
                # Retourner les données du panier mis à jour
                result['cart'] = cart.get_cart_data()
                _logger.info(f"Coupon {code} appliqué avec succès à la commande {order_id}")
            else:
                _logger.info(f"Échec application coupon {code} pour commande {order_id}: {result.get('error')}")

            return result

        except Exception as e:
            return self._handle_error(e, "validation coupon")

    @http.route('/api/ecommerce/coupon/remove', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=20, window=60)
    def remove_coupon(self, **kwargs):
        """
        Retire le coupon de la commande/panier.

        Body JSON:
        {
            "order_id": 123  // optionnel, sinon utilise le panier actif
        }

        Returns:
        {
            "success": true,
            "cart": {...}  // panier mis à jour
        }
        """
        try:
            params = request.jsonrequest
            partner = request.env.user.partner_id
            order_id = params.get('order_id')

            # Si pas d'order_id, récupérer le panier actif
            if not order_id:
                cart = request.env['sale.order'].sudo().get_or_create_cart(partner_id=partner.id)
                if not cart:
                    return self._handle_error(
                        Exception('Panier non trouvé'),
                        "retrait coupon"
                    )
            else:
                # Validation order_id
                input_validator = request.env['input.validator']
                order_id = input_validator.validate_id(order_id, 'order_id')

                # SÉCURITÉ: Vérifier que c'est bien la commande de l'utilisateur
                cart = request.env['sale.order'].sudo().browse(order_id)
                if not cart.exists() or cart.partner_id.id != partner.id:
                    _logger.warning(f"Tentative d'accès non autorisé à la commande {order_id} par {partner.id}")
                    return self._handle_error(
                        Exception('Commande non trouvée ou accès non autorisé'),
                        "retrait coupon"
                    )

            # Retirer le coupon
            cart.remove_coupon()

            _logger.info(f"Coupon retiré de la commande {cart.id}")

            return self._success_response(
                data={'cart': cart.get_cart_data()},
                message='Coupon retiré'
            )

        except Exception as e:
            return self._handle_error(e, "retrait coupon")

    @http.route('/api/ecommerce/coupons/available', type='json', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
    @rate_limit(limit=30, window=60)
    def get_available_coupons(self, **kwargs):
        """
        Liste les coupons disponibles pour le client connecté.

        Returns:
        {
            "success": true,
            "coupons": [...]
        }
        """
        try:
            partner = request.env.user.partner_id
            today = request.env['ir.fields'].Date.today()

            # Chercher coupons actifs et valides
            domain = [
                ('active', '=', True),
                ('date_start', '<=', today),
                '|',
                ('date_end', '=', False),
                ('date_end', '>=', today),
            ]

            # Filtrer coupons disponibles pour ce client
            # Note: on ne peut pas facilement filtrer partner_ids dans domain SQL
            # donc on filtre après en Python
            all_coupons = request.env['ecommerce.coupon'].sudo().search(domain)

            available_coupons = []
            for coupon in all_coupons:
                # Vérifier restrictions client
                if coupon.partner_ids and partner.id not in coupon.partner_ids.ids:
                    continue

                # Vérifier limite globale
                if coupon.usage_limit > 0 and coupon.usage_count >= coupon.usage_limit:
                    continue

                # Vérifier limite par client
                if coupon.usage_limit_per_customer > 0:
                    customer_usage = request.env['sale.order'].sudo().search_count([
                        ('partner_id', '=', partner.id),
                        ('coupon_id', '=', coupon.id),
                        ('state', 'in', ['sale', 'done']),
                    ])
                    if customer_usage >= coupon.usage_limit_per_customer:
                        continue

                available_coupons.append({
                    'code': coupon.code,
                    'name': coupon.name,
                    'description': coupon.description or '',
                    'discount_type': coupon.discount_type,
                    'discount_value': coupon.discount_value,
                    'minimum_amount': coupon.minimum_amount,
                    'date_end': coupon.date_end.isoformat() if coupon.date_end else None,
                })

            _logger.info(f"{len(available_coupons)} coupons disponibles pour {partner.id}")

            return self._success_response({
                'coupons': available_coupons
            })

        except Exception as e:
            return self._handle_error(e, "récupération coupons")
