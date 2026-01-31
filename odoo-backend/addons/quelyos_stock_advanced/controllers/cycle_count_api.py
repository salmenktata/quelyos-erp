# -*- coding: utf-8 -*-
"""
API REST pour Comptage Cyclique
"""

import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class CycleCountAPI(http.Controller):
    """API Comptage Cyclique"""

    @http.route('/api/stock/cycle-counts/rules', type='json', auth='user', methods=['POST'], csrf=False)
    def get_cycle_count_rules(self, **kwargs):
        """Liste des règles de comptage cyclique"""
        try:
            active_only = kwargs.get('active_only', True)
            
            domain = []
            if active_only:
                domain.append(('active', '=', True))
            
            rules = request.env['stock.cycle.count.rule'].sudo().search(domain, order='priority desc, name')
            
            return {
                'success': True,
                'data': [{
                    'id': r.id,
                    'name': r.name,
                    'active': r.active,
                    'priority': r.priority,
                    'location_id': r.location_id.id,
                    'location_name': r.location_id.complete_name,
                    'frequency': r.frequency,
                    'next_execution_date': r.next_execution_date.isoformat() if r.next_execution_date else None,
                    'last_execution_date': r.last_execution_date.isoformat() if r.last_execution_date else None,
                    'execution_count': r.execution_count,
                } for r in rules]
            }
        except Exception as e:
            _logger.error("Erreur get_cycle_count_rules: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/rules/create', type='json', auth='user', methods=['POST'], csrf=False)
    def create_cycle_count_rule(self, **kwargs):
        """Créer une règle de comptage cyclique"""
        try:
            name = kwargs.get('name')
            location_id = kwargs.get('location_id')
            frequency = kwargs.get('frequency', 'monthly')
            
            if not all([name, location_id]):
                return {'success': False, 'error': 'name et location_id requis'}
            
            vals = {
                'name': name,
                'location_id': location_id,
                'frequency': frequency,
                'priority': kwargs.get('priority', 10),
                'day_of_week': kwargs.get('day_of_week'),
                'day_of_month': kwargs.get('day_of_month', 1),
            }
            
            if kwargs.get('category_ids'):
                vals['category_ids'] = [(6, 0, kwargs['category_ids'])]
            
            if kwargs.get('product_ids'):
                vals['product_ids'] = [(6, 0, kwargs['product_ids'])]
            
            rule = request.env['stock.cycle.count.rule'].sudo().create(vals)
            
            return {
                'success': True,
                'data': {
                    'id': rule.id,
                    'name': rule.name,
                    'next_execution_date': rule.next_execution_date.isoformat() if rule.next_execution_date else None,
                }
            }
        except Exception as e:
            _logger.error("Erreur create_cycle_count_rule: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/rules/<int:rule_id>/execute', type='json', auth='user', methods=['POST'], csrf=False)
    def execute_cycle_count_rule(self, rule_id, **kwargs):
        """Exécuter manuellement une règle"""
        try:
            rule = request.env['stock.cycle.count.rule'].sudo().browse(rule_id)
            
            if not rule.exists():
                return {'success': False, 'error': 'Règle non trouvée'}
            
            execution = rule.execute_cycle_count()
            
            return {
                'success': True,
                'data': {
                    'execution_id': execution.id,
                    'name': execution.name,
                    'state': execution.state,
                    'total_lines': execution.total_lines,
                }
            }
        except Exception as e:
            _logger.error("Erreur execute_cycle_count_rule: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/executions', type='json', auth='user', methods=['POST'], csrf=False)
    def get_cycle_count_executions(self, **kwargs):
        """Liste des exécutions de comptage"""
        try:
            state = kwargs.get('state')
            limit = kwargs.get('limit', 50)
            
            domain = []
            if state:
                domain.append(('state', '=', state))
            
            executions = request.env['stock.cycle.count.execution'].sudo().search(domain, limit=limit, order='create_date desc')
            
            return {
                'success': True,
                'data': [{
                    'id': e.id,
                    'name': e.name,
                    'rule_name': e.rule_id.name,
                    'location_name': e.location_id.complete_name,
                    'state': e.state,
                    'total_lines': e.total_lines,
                    'counted_lines': e.counted_lines,
                    'progress_percentage': e.progress_percentage,
                    'discrepancy_count': e.discrepancy_count,
                    'start_date': e.start_date.isoformat() if e.start_date else None,
                    'end_date': e.end_date.isoformat() if e.end_date else None,
                } for e in executions]
            }
        except Exception as e:
            _logger.error("Erreur get_cycle_count_executions: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/executions/<int:execution_id>', type='json', auth='user', methods=['POST'], csrf=False)
    def get_cycle_count_execution_detail(self, execution_id, **kwargs):
        """Détail d'une exécution avec lignes"""
        try:
            execution = request.env['stock.cycle.count.execution'].sudo().browse(execution_id)
            
            if not execution.exists():
                return {'success': False, 'error': 'Exécution non trouvée'}
            
            return {
                'success': True,
                'data': {
                    'id': execution.id,
                    'name': execution.name,
                    'rule_name': execution.rule_id.name,
                    'location_name': execution.location_id.complete_name,
                    'state': execution.state,
                    'progress_percentage': execution.progress_percentage,
                    'discrepancy_count': execution.discrepancy_count,
                    'total_discrepancy_value': execution.total_discrepancy_value,
                    'lines': [{
                        'id': l.id,
                        'product_id': l.product_id.id,
                        'product_name': l.product_id.name,
                        'product_sku': l.product_id.default_code or '',
                        'theoretical_qty': l.theoretical_qty,
                        'counted_qty': l.counted_qty,
                        'discrepancy': l.discrepancy,
                        'is_counted': l.is_counted,
                    } for l in execution.line_ids]
                }
            }
        except Exception as e:
            _logger.error("Erreur get_cycle_count_execution_detail: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/executions/<int:execution_id>/start', type='json', auth='user', methods=['POST'], csrf=False)
    def start_cycle_count_execution(self, execution_id, **kwargs):
        """Démarrer une exécution"""
        try:
            execution = request.env['stock.cycle.count.execution'].sudo().browse(execution_id)
            
            if not execution.exists():
                return {'success': False, 'error': 'Exécution non trouvée'}
            
            execution.action_start()
            
            return {'success': True, 'data': {'state': execution.state}}
        except Exception as e:
            _logger.error("Erreur start_cycle_count_execution: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/lines/<int:line_id>/count', type='json', auth='user', methods=['POST'], csrf=False)
    def update_cycle_count_line(self, line_id, **kwargs):
        """Mettre à jour quantité comptée d'une ligne"""
        try:
            counted_qty = kwargs.get('counted_qty')
            
            if counted_qty is None:
                return {'success': False, 'error': 'counted_qty requis'}
            
            line = request.env['stock.cycle.count.line'].sudo().browse(line_id)
            
            if not line.exists():
                return {'success': False, 'error': 'Ligne non trouvée'}
            
            line.write({
                'counted_qty': counted_qty,
                'is_counted': True,
                'notes': kwargs.get('notes', ''),
            })
            
            return {
                'success': True,
                'data': {
                    'id': line.id,
                    'counted_qty': line.counted_qty,
                    'discrepancy': line.discrepancy,
                }
            }
        except Exception as e:
            _logger.error("Erreur update_cycle_count_line: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/stock/cycle-counts/executions/<int:execution_id>/validate', type='json', auth='user', methods=['POST'], csrf=False)
    def validate_cycle_count_execution(self, execution_id, **kwargs):
        """Valider une exécution"""
        try:
            execution = request.env['stock.cycle.count.execution'].sudo().browse(execution_id)
            
            if not execution.exists():
                return {'success': False, 'error': 'Exécution non trouvée'}
            
            execution.action_validate()
            
            return {
                'success': True,
                'data': {
                    'state': execution.state,
                    'discrepancy_count': execution.discrepancy_count,
                }
            }
        except Exception as e:
            _logger.error("Erreur validate_cycle_count_execution: %s", e)
            return {'success': False, 'error': str(e)}
