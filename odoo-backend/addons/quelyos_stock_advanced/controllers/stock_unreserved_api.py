# -*- coding: utf-8 -*-
"""
API REST pour stock disponible (unreserved)
"""

import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class StockUnreservedAPI(http.Controller):
    """API pour stock disponible hors réservations"""

    @http.route('/api/stock/available-unreserved', type='json', auth='user', methods=['POST'], csrf=False)
    def get_available_unreserved(self, **kwargs):
        """
        Récupère le stock disponible (hors réservations) pour un ou plusieurs produits
        
        Params:
            product_id (int, optional): ID produit spécifique
            product_ids (list, optional): Liste IDs produits
            location_id (int, optional): Filtrer par emplacement
            category_id (int, optional): Filtrer par catégorie
        
        Returns:
            dict: Liste produits avec stock disponible réel
        """
        try:
            product_id = kwargs.get('product_id')
            product_ids = kwargs.get('product_ids', [])
            location_id = kwargs.get('location_id')
            category_id = kwargs.get('category_id')
            
            # Construction domaine recherche
            domain = [('quantity', '>', 0)]
            
            if product_id:
                domain.append(('product_id', '=', product_id))
            elif product_ids:
                domain.append(('product_id', 'in', product_ids))
            
            if location_id:
                domain.append(('location_id', '=', location_id))
            
            if category_id:
                domain.append(('product_id.categ_id', '=', category_id))
            
            # Recherche quants avec stock
            quants = request.env['stock.quant'].sudo().search(domain)
            
            # Regroupement par produit
            products_stock = {}
            
            for quant in quants:
                product_id_key = quant.product_id.id
                
                if product_id_key not in products_stock:
                    products_stock[product_id_key] = {
                        'product_id': product_id_key,
                        'product_name': quant.product_id.name,
                        'product_sku': quant.product_id.default_code or '',
                        'total_quantity': 0.0,
                        'total_reserved': 0.0,
                        'total_unreserved': 0.0,
                        'locations': []
                    }
                
                products_stock[product_id_key]['total_quantity'] += quant.quantity
                products_stock[product_id_key]['total_reserved'] += quant.reserved_quantity_detail
                products_stock[product_id_key]['total_unreserved'] += quant.unreserved_quantity
                
                products_stock[product_id_key]['locations'].append({
                    'location_id': quant.location_id.id,
                    'location_name': quant.location_id.complete_name,
                    'quantity': quant.quantity,
                    'reserved': quant.reserved_quantity_detail,
                    'unreserved': quant.unreserved_quantity,
                })
            
            return {
                'success': True,
                'data': {
                    'products_count': len(products_stock),
                    'products': list(products_stock.values()),
                }
            }
        
        except Exception as e:
            _logger.error("Erreur get_available_unreserved: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/product/<int:product_id>/unreserved', type='json', auth='user', methods=['POST'], csrf=False)
    def get_product_unreserved(self, product_id, **kwargs):
        """
        Stock disponible pour un produit spécifique
        
        Returns:
            dict: Détail stock disponible par emplacement
        """
        try:
            quants = request.env['stock.quant'].sudo().search([
                ('product_id', '=', product_id),
                ('quantity', '>', 0),
            ])
            
            if not quants:
                return {
                    'success': True,
                    'data': {
                        'product_id': product_id,
                        'total_quantity': 0.0,
                        'total_reserved': 0.0,
                        'total_unreserved': 0.0,
                        'locations': []
                    }
                }
            
            product = quants[0].product_id
            total_qty = sum(q.quantity for q in quants)
            total_reserved = sum(q.reserved_quantity_detail for q in quants)
            total_unreserved = sum(q.unreserved_quantity for q in quants)
            
            locations_detail = []
            for quant in quants:
                locations_detail.append({
                    'location_id': quant.location_id.id,
                    'location_name': quant.location_id.complete_name,
                    'quantity': quant.quantity,
                    'reserved': quant.reserved_quantity_detail,
                    'unreserved': quant.unreserved_quantity,
                    'availability_status': 'available' if quant.unreserved_quantity > 0 else 'reserved',
                })
            
            return {
                'success': True,
                'data': {
                    'product_id': product.id,
                    'product_name': product.name,
                    'product_sku': product.default_code or '',
                    'total_quantity': total_qty,
                    'total_reserved': total_reserved,
                    'total_unreserved': total_unreserved,
                    'availability_percentage': (total_unreserved / total_qty * 100) if total_qty > 0 else 0,
                    'locations': locations_detail,
                }
            }
        
        except Exception as e:
            _logger.error("Erreur get_product_unreserved: %s", e)
            return {'success': False, 'error': str(e)}
