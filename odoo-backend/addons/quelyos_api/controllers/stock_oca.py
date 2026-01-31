# -*- coding: utf-8 -*-
"""
Contrôleur API REST pour fonctionnalités OCA Stock
Modules : stock_quant_cost_info
"""

import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class StockOCAController(http.Controller):
    """API REST pour modules OCA Stock"""

    @http.route('/api/stock/quant/cost-info', type='json', auth='user', methods=['POST'], csrf=False)
    def get_quant_cost_info(self, **kwargs):
        """
        Récupérer informations de coût pour un quant
        
        Params:
            quant_id (int): ID du quant
            location_id (int, optional): Filtrer par emplacement
        
        Returns:
            dict: Informations de coût du quant
        """
        try:
            quant_id = kwargs.get('quant_id')
            location_id = kwargs.get('location_id')
            
            if not quant_id:
                return {'success': False, 'error': 'quant_id requis'}
            
            domain = [('id', '=', quant_id)]
            if location_id:
                domain.append(('location_id', '=', location_id))
            
            quant = request.env['stock.quant'].sudo().search(domain, limit=1)
            
            if not quant:
                return {'success': False, 'error': 'Quant non trouvé'}
            
            # Calcul du coût (dépend du module stock_quant_cost_info)
            unit_cost = quant.product_id.standard_price if quant.product_id else 0.0
            total_cost = unit_cost * quant.quantity
            
            return {
                'success': True,
                'data': {
                    'quant_id': quant.id,
                    'product_id': quant.product_id.id,
                    'product_name': quant.product_id.name,
                    'location_id': quant.location_id.id,
                    'location_name': quant.location_id.complete_name,
                    'quantity': quant.quantity,
                    'unit_cost': unit_cost,
                    'total_cost': total_cost,
                    'currency': request.env.company.currency_id.name,
                }
            }
        
        except Exception as e:
            _logger.error("Erreur get_quant_cost_info: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/inventory/cost-report', type='json', auth='user', methods=['POST'], csrf=False)
    def get_inventory_cost_report(self, **kwargs):
        """
        Rapport valorisation inventaire avec coûts
        
        Params:
            location_id (int, optional): Filtrer par emplacement
            category_id (int, optional): Filtrer par catégorie produit
        
        Returns:
            dict: Rapport de valorisation
        """
        try:
            location_id = kwargs.get('location_id')
            category_id = kwargs.get('category_id')
            
            domain = [('quantity', '>', 0)]
            
            if location_id:
                domain.append(('location_id', '=', location_id))
            
            if category_id:
                domain.append(('product_id.categ_id', '=', category_id))
            
            quants = request.env['stock.quant'].sudo().search(domain)
            
            items = []
            total_value = 0.0
            
            for quant in quants:
                unit_cost = quant.product_id.standard_price if quant.product_id else 0.0
                total_cost = unit_cost * quant.quantity
                total_value += total_cost
                
                items.append({
                    'product_id': quant.product_id.id,
                    'product_name': quant.product_id.name,
                    'product_sku': quant.product_id.default_code or '',
                    'location_id': quant.location_id.id,
                    'location_name': quant.location_id.complete_name,
                    'quantity': quant.quantity,
                    'unit_cost': unit_cost,
                    'total_cost': total_cost,
                })
            
            return {
                'success': True,
                'data': {
                    'total_value': total_value,
                    'currency': request.env.company.currency_id.name,
                    'items_count': len(items),
                    'items': items,
                }
            }
        
        except Exception as e:
            _logger.error("Erreur get_inventory_cost_report: %s", e)
            return {'success': False, 'error': str(e)}
