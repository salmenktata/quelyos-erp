# -*- coding: utf-8 -*-
"""API REST GMAO - Gestion Maintenance"""

import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class MaintenanceAPI(http.Controller):
    """API REST GMAO Complète"""

    # ==================== ÉQUIPEMENTS ====================

    @http.route('/api/maintenance/equipment', type='json', auth='user', methods=['POST'], csrf=False)
    def get_equipment_list(self, **kwargs):
        """Liste équipements avec filtres"""
        try:
            category_id = kwargs.get('category_id')
            location_id = kwargs.get('location_id')
            critical_only = kwargs.get('critical_only', False)
            limit = kwargs.get('limit', 50)
            
            domain = []
            if category_id:
                domain.append(('category_id', '=', category_id))
            if location_id:
                domain.append(('location_id', '=', location_id))
            if critical_only:
                domain.append(('is_critical', '=', True))
            
            equipment = request.env['maintenance.equipment'].sudo().search(domain, limit=limit, order='name')
            
            return {
                'success': True,
                'data': [{
                    'id': e.id,
                    'name': e.name,
                    'category_name': e.category_id.name if e.category_id else '',
                    'serial_number': e.serial_number or '',
                    'is_critical': e.is_critical,
                    'mtbf_hours': e.mtbf_hours,
                    'mttr_hours': e.mttr_hours,
                    'uptime_percentage': e.uptime_percentage,
                    'failure_count': e.failure_count,
                    'last_failure_date': e.last_failure_date.isoformat() if e.last_failure_date else None,
                    'next_preventive_date': e.next_preventive_date.isoformat() if e.next_preventive_date else None,
                } for e in equipment]
            }
        except Exception as e:
            _logger.error("Erreur get_equipment_list: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/maintenance/equipment/<int:equipment_id>', type='json', auth='user', methods=['POST'], csrf=False)
    def get_equipment_detail(self, equipment_id, **kwargs):
        """Détail équipement avec historique"""
        try:
            equipment = request.env['maintenance.equipment'].sudo().browse(equipment_id)
            
            if not equipment.exists():
                return {'success': False, 'error': 'Équipement non trouvé'}
            
            # Historique interventions
            requests = equipment.maintenance_ids.sorted('create_date', reverse=True)[:10]
            
            return {
                'success': True,
                'data': {
                    'id': equipment.id,
                    'name': equipment.name,
                    'serial_number': equipment.serial_number or '',
                    'category_name': equipment.category_id.name if equipment.category_id else '',
                    'location': equipment.location if hasattr(equipment, 'location') else '',
                    'is_critical': equipment.is_critical,
                    'purchase_date': equipment.purchase_date.isoformat() if equipment.purchase_date else None,
                    'warranty_end_date': equipment.warranty_end_date.isoformat() if equipment.warranty_end_date else None,
                    'mtbf_hours': equipment.mtbf_hours,
                    'mttr_hours': equipment.mttr_hours,
                    'uptime_percentage': equipment.uptime_percentage,
                    'failure_count': equipment.failure_count,
                    'last_failure_date': equipment.last_failure_date.isoformat() if equipment.last_failure_date else None,
                    'next_preventive_date': equipment.next_preventive_date.isoformat() if equipment.next_preventive_date else None,
                    'recent_requests': [{
                        'id': r.id,
                        'name': r.name,
                        'maintenance_type': r.maintenance_type,
                        'priority': r.priority,
                        'stage_name': r.stage_id.name if r.stage_id else '',
                        'create_date': r.create_date.isoformat() if r.create_date else None,
                    } for r in requests]
                }
            }
        except Exception as e:
            _logger.error("Erreur get_equipment_detail: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/maintenance/equipment/create', type='json', auth='user', methods=['POST'], csrf=False)
    def create_equipment(self, **kwargs):
        """Créer équipement"""
        try:
            name = kwargs.get('name')
            category_id = kwargs.get('category_id')
            
            if not name:
                return {'success': False, 'error': 'name requis'}
            
            vals = {
                'name': name,
                'category_id': category_id,
                'serial_number': kwargs.get('serial_number'),
                'is_critical': kwargs.get('is_critical', False),
                'purchase_date': kwargs.get('purchase_date'),
                'warranty_end_date': kwargs.get('warranty_end_date'),
            }
            
            equipment = request.env['maintenance.equipment'].sudo().create(vals)
            
            return {
                'success': True,
                'data': {
                    'id': equipment.id,
                    'name': equipment.name,
                }
            }
        except Exception as e:
            _logger.error("Erreur create_equipment: %s", e)
            return {'success': False, 'error': str(e)}

    # ==================== DEMANDES INTERVENTION ====================

    @http.route('/api/maintenance/requests', type='json', auth='user', methods=['POST'], csrf=False)
    def get_maintenance_requests(self, **kwargs):
        """Liste demandes intervention"""
        try:
            equipment_id = kwargs.get('equipment_id')
            maintenance_type = kwargs.get('maintenance_type')
            state = kwargs.get('state')
            limit = kwargs.get('limit', 50)
            
            domain = []
            if equipment_id:
                domain.append(('equipment_id', '=', equipment_id))
            if maintenance_type:
                domain.append(('maintenance_type', '=', maintenance_type))
            if state:
                domain.append(('stage_id.done', '=', state == 'done'))
            
            requests_list = request.env['maintenance.request'].sudo().search(domain, limit=limit, order='create_date desc')
            
            return {
                'success': True,
                'data': [{
                    'id': r.id,
                    'name': r.name,
                    'equipment_name': r.equipment_id.name if r.equipment_id else '',
                    'maintenance_type': r.maintenance_type,
                    'priority': r.priority,
                    'is_emergency': r.is_emergency if hasattr(r, 'is_emergency') else False,
                    'downtime_impact': r.downtime_impact if hasattr(r, 'downtime_impact') else 'none',
                    'stage_name': r.stage_id.name if r.stage_id else '',
                    'schedule_date': r.schedule_date.isoformat() if r.schedule_date else None,
                    'total_cost': r.total_cost if hasattr(r, 'total_cost') else 0.0,
                    'actual_duration_hours': r.actual_duration_hours if hasattr(r, 'actual_duration_hours') else 0.0,
                } for r in requests_list]
            }
        except Exception as e:
            _logger.error("Erreur get_maintenance_requests: %s", e)
            return {'success': False, 'error': str(e)}

    @http.route('/api/maintenance/requests/create', type='json', auth='user', methods=['POST'], csrf=False)
    def create_maintenance_request(self, **kwargs):
        """Créer demande intervention"""
        try:
            name = kwargs.get('name')
            equipment_id = kwargs.get('equipment_id')
            maintenance_type = kwargs.get('maintenance_type', 'corrective')
            
            if not all([name, equipment_id]):
                return {'success': False, 'error': 'name et equipment_id requis'}
            
            vals = {
                'name': name,
                'equipment_id': equipment_id,
                'maintenance_type': maintenance_type,
                'priority': kwargs.get('priority', '1'),
                'description': kwargs.get('description', ''),
                'schedule_date': kwargs.get('schedule_date'),
            }
            
            # Champs étendus si disponibles
            if kwargs.get('is_emergency'):
                vals['is_emergency'] = True
            if kwargs.get('downtime_impact'):
                vals['downtime_impact'] = kwargs['downtime_impact']
            if kwargs.get('planned_duration_hours'):
                vals['planned_duration_hours'] = kwargs['planned_duration_hours']
            
            maintenance_request = request.env['maintenance.request'].sudo().create(vals)
            
            return {
                'success': True,
                'data': {
                    'id': maintenance_request.id,
                    'name': maintenance_request.name,
                }
            }
        except Exception as e:
            _logger.error("Erreur create_maintenance_request: %s", e)
            return {'success': False, 'error': str(e)}

    # ==================== RAPPORTS & KPI ====================

    @http.route('/api/maintenance/reports/dashboard', type='json', auth='user', methods=['POST'], csrf=False)
    def get_maintenance_dashboard(self, **kwargs):
        """Dashboard GMAO avec KPI globaux"""
        try:
            # Stats équipements
            total_equipment = request.env['maintenance.equipment'].sudo().search_count([])
            critical_equipment = request.env['maintenance.equipment'].sudo().search_count([('is_critical', '=', True)])
            
            # Stats demandes
            total_requests = request.env['maintenance.request'].sudo().search_count([])
            pending_requests = request.env['maintenance.request'].sudo().search_count([
                ('stage_id.done', '=', False)
            ])
            emergency_requests = request.env['maintenance.request'].sudo().search_count([
                ('is_emergency', '=', True),
                ('stage_id.done', '=', False)
            ]) if hasattr(request.env['maintenance.request'], 'is_emergency') else 0
            
            # MTBF/MTTR moyens
            equipment_with_kpi = request.env['maintenance.equipment'].sudo().search([
                ('mtbf_hours', '>', 0)
            ])
            avg_mtbf = sum(e.mtbf_hours for e in equipment_with_kpi) / len(equipment_with_kpi) if equipment_with_kpi else 0
            avg_mttr = sum(e.mttr_hours for e in equipment_with_kpi) / len(equipment_with_kpi) if equipment_with_kpi else 0
            avg_uptime = sum(e.uptime_percentage for e in equipment_with_kpi) / len(equipment_with_kpi) if equipment_with_kpi else 100
            
            return {
                'success': True,
                'data': {
                    'equipment': {
                        'total': total_equipment,
                        'critical': critical_equipment,
                    },
                    'requests': {
                        'total': total_requests,
                        'pending': pending_requests,
                        'emergency': emergency_requests,
                    },
                    'kpi': {
                        'avg_mtbf_hours': round(avg_mtbf, 2),
                        'avg_mttr_hours': round(avg_mttr, 2),
                        'avg_uptime_percentage': round(avg_uptime, 2),
                    }
                }
            }
        except Exception as e:
            _logger.error("Erreur get_maintenance_dashboard: %s", e)
            return {'success': False, 'error': str(e)}
