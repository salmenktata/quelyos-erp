# -*- coding: utf-8 -*-
"""
API Controller for HR Leaves management.
"""
import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class HRLeaveController(http.Controller):
    """API endpoints for HR leaves"""

    def _get_tenant_id(self, kwargs):
        """Helper to get tenant_id from request"""
        tenant_id = kwargs.get('tenant_id')
        if not tenant_id:
            tenant_code = kwargs.get('tenant_code')
            if tenant_code:
                tenant = request.env['quelyos.tenant'].sudo().search([
                    ('code', '=', tenant_code)
                ], limit=1)
                if tenant:
                    tenant_id = tenant.id
        return tenant_id

    # =========================================================================
    # LEAVE TYPES
    # =========================================================================

    @http.route('/api/hr/leave-types', type='jsonrpc', auth='user', methods=['POST'])
    def get_leave_types(self, **kwargs):
        """Liste des types de congés"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id)), ('active', '=', True)]

            LeaveType = request.env['hr.leave.type'].sudo()
            leave_types = LeaveType.search(domain, order='sequence, name')

            return {
                'success': True,
                'leave_types': [lt.get_leave_type_data() for lt in leave_types],
            }
        except Exception as e:
            _logger.error("Error fetching leave types: %s", e)
            return {'success': False, 'error': 'Erreur lors de la récupération des types de congés'}

    @http.route('/api/hr/leave-types/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_leave_type(self, **kwargs):
        """Créer un type de congé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['name', 'code']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'name': kwargs['name'],
                'code': kwargs['code'],
            }

            # Champs optionnels
            optional_fields = [
                'color', 'requires_allocation', 'allocation_type', 'request_unit',
                'validation_type', 'max_days', 'max_consecutive_days', 'min_notice_days',
                'unpaid', 'requires_attachment', 'attachment_description',
            ]
            for field in optional_fields:
                if field in kwargs:
                    values[field] = kwargs[field]

            leave_type = request.env['hr.leave.type'].sudo().create(values)

            return {
                'success': True,
                'leave_type': leave_type.get_leave_type_data(),
            }
        except Exception as e:
            _logger.error("Error creating leave type: %s", e)
            return {'success': False, 'error': 'Erreur lors de la création du type de congé'}

    @http.route('/api/hr/leave-types/<int:leave_type_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_leave_type(self, leave_type_id, **kwargs):
        """Mettre à jour un type de congé"""
        try:
            leave_type = request.env['hr.leave.type'].sudo().browse(leave_type_id)
            if not leave_type.exists():
                return {'success': False, 'error': 'Type de congé introuvable'}

            values = {}
            allowed_fields = [
                'name', 'code', 'color', 'requires_allocation', 'allocation_type',
                'request_unit', 'validation_type', 'max_days', 'max_consecutive_days',
                'min_notice_days', 'unpaid', 'requires_attachment', 'attachment_description',
                'active',
            ]

            for field in allowed_fields:
                if field in kwargs:
                    values[field] = kwargs[field]

            if values:
                leave_type.write(values)

            return {
                'success': True,
                'leave_type': leave_type.get_leave_type_data(),
            }
        except Exception as e:
            _logger.error("Error updating leave type: %s", e)
            return {'success': False, 'error': 'Erreur lors de la mise à jour du type de congé'}

    @http.route('/api/hr/leave-types/init-defaults', type='jsonrpc', auth='user', methods=['POST'])
    def init_default_leave_types(self, **kwargs):
        """Initialiser les types de congés par défaut"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            request.env['hr.leave.type'].sudo().create_default_types(int(tenant_id))

            return {'success': True, 'message': 'Types de congés par défaut créés'}
        except Exception as e:
            _logger.error("Error initializing default leave types: %s", e)
            return {'success': False, 'error': 'Erreur lors de l\'initialisation des types de congés'}

    # =========================================================================
    # LEAVES (Demandes)
    # =========================================================================

    @http.route('/api/hr/leaves', type='jsonrpc', auth='user', methods=['POST'])
    def get_leaves(self, **kwargs):
        """Liste des demandes de congés avec filtres"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id))]

            # Filtres optionnels
            if kwargs.get('employee_id'):
                domain.append(('employee_id', '=', int(kwargs['employee_id'])))
            if kwargs.get('department_id'):
                domain.append(('department_id', '=', int(kwargs['department_id'])))
            if kwargs.get('leave_type_id'):
                domain.append(('leave_type_id', '=', int(kwargs['leave_type_id'])))
            if kwargs.get('state'):
                if isinstance(kwargs['state'], list):
                    domain.append(('state', 'in', kwargs['state']))
                else:
                    domain.append(('state', '=', kwargs['state']))
            if kwargs.get('date_from'):
                domain.append(('date_from', '>=', kwargs['date_from']))
            if kwargs.get('date_to'):
                domain.append(('date_to', '<=', kwargs['date_to']))

            limit = kwargs.get('limit', 50)
            offset = kwargs.get('offset', 0)

            Leave = request.env['hr.leave'].sudo()
            total = Leave.search_count(domain)
            leaves = Leave.search(domain, limit=limit, offset=offset, order='date_from desc')

            return {
                'success': True,
                'leaves': [l.get_leave_data() for l in leaves],
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>', type='jsonrpc', auth='user', methods=['POST'])
    def get_leave(self, leave_id, **kwargs):
        """Détail d'une demande de congé"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_leave(self, **kwargs):
        """Créer une demande de congé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['employee_id', 'leave_type_id', 'date_from', 'date_to']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'employee_id': int(kwargs['employee_id']),
                'leave_type_id': int(kwargs['leave_type_id']),
                'date_from': kwargs['date_from'],
                'date_to': kwargs['date_to'],
            }

            if kwargs.get('notes'):
                values['notes'] = kwargs['notes']
            if kwargs.get('request_unit_half'):
                values['request_unit_half'] = kwargs['request_unit_half']

            leave = request.env['hr.leave'].sudo().create(values)

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_leave(self, leave_id, **kwargs):
        """Modifier une demande de congé"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            if leave.state not in ('draft',):
                return {'success': False, 'error': 'Demande non modifiable'}

            values = {}
            if 'leave_type_id' in kwargs:
                values['leave_type_id'] = int(kwargs['leave_type_id'])
            if 'date_from' in kwargs:
                values['date_from'] = kwargs['date_from']
            if 'date_to' in kwargs:
                values['date_to'] = kwargs['date_to']
            if 'notes' in kwargs:
                values['notes'] = kwargs['notes']
            if 'request_unit_half' in kwargs:
                values['request_unit_half'] = kwargs['request_unit_half']

            if values:
                leave.write(values)

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/confirm', type='jsonrpc', auth='user', methods=['POST'])
    def confirm_leave(self, leave_id, **kwargs):
        """Soumettre une demande de congé"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            leave.action_confirm()

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/approve', type='jsonrpc', auth='user', methods=['POST'])
    def approve_leave(self, leave_id, **kwargs):
        """Approuver une demande de congé (premier niveau)"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            leave.action_approve()

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/validate', type='jsonrpc', auth='user', methods=['POST'])
    def validate_leave(self, leave_id, **kwargs):
        """Valider une demande de congé (second niveau)"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            leave.action_validate()

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/refuse', type='jsonrpc', auth='user', methods=['POST'])
    def refuse_leave(self, leave_id, **kwargs):
        """Refuser une demande de congé"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            reason = kwargs.get('reason', '')
            leave.action_refuse(reason)

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/<int:leave_id>/cancel', type='jsonrpc', auth='user', methods=['POST'])
    def cancel_leave(self, leave_id, **kwargs):
        """Annuler une demande de congé"""
        try:
            leave = request.env['hr.leave'].sudo().browse(leave_id)
            if not leave.exists():
                return {'success': False, 'error': 'Demande introuvable'}

            leave.action_cancel()

            return {
                'success': True,
                'leave': leave.get_leave_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/calendar', type='jsonrpc', auth='user', methods=['POST'])
    def get_leaves_calendar(self, **kwargs):
        """Données pour le calendrier des absences"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('date_from') or not kwargs.get('date_to'):
                return {'success': False, 'error': 'date_from et date_to requis'}

            calendar_data = request.env['hr.leave'].sudo().get_calendar_data(
                tenant_id=int(tenant_id),
                date_from=kwargs['date_from'],
                date_to=kwargs['date_to'],
                department_id=int(kwargs['department_id']) if kwargs.get('department_id') else None,
            )

            return {
                'success': True,
                'events': calendar_data,
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leaves/pending', type='jsonrpc', auth='user', methods=['POST'])
    def get_pending_leaves(self, **kwargs):
        """Demandes en attente d'approbation"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            manager_employee_id = int(kwargs['manager_employee_id']) if kwargs.get('manager_employee_id') else None

            pending = request.env['hr.leave'].sudo().get_pending_approvals(
                tenant_id=int(tenant_id),
                manager_employee_id=manager_employee_id,
            )

            return {
                'success': True,
                'pending_leaves': pending,
                'total': len(pending),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    # =========================================================================
    # ALLOCATIONS
    # =========================================================================

    @http.route('/api/hr/leave-allocations', type='jsonrpc', auth='user', methods=['POST'])
    def get_allocations(self, **kwargs):
        """Liste des allocations de congés"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id))]

            if kwargs.get('employee_id'):
                domain.append(('employee_id', '=', int(kwargs['employee_id'])))
            if kwargs.get('leave_type_id'):
                domain.append(('leave_type_id', '=', int(kwargs['leave_type_id'])))
            if kwargs.get('state'):
                domain.append(('state', '=', kwargs['state']))

            limit = kwargs.get('limit', 50)
            offset = kwargs.get('offset', 0)

            Allocation = request.env['hr.leave.allocation'].sudo()
            total = Allocation.search_count(domain)
            allocations = Allocation.search(domain, limit=limit, offset=offset, order='date_from desc')

            return {
                'success': True,
                'allocations': [a.get_allocation_data() for a in allocations],
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leave-allocations/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_allocation(self, **kwargs):
        """Créer une allocation de congés"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['employee_id', 'leave_type_id', 'number_of_days']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'employee_id': int(kwargs['employee_id']),
                'leave_type_id': int(kwargs['leave_type_id']),
                'number_of_days': float(kwargs['number_of_days']),
            }

            if kwargs.get('date_from'):
                values['date_from'] = kwargs['date_from']
            if kwargs.get('date_to'):
                values['date_to'] = kwargs['date_to']
            if kwargs.get('allocation_type'):
                values['allocation_type'] = kwargs['allocation_type']
            if kwargs.get('notes'):
                values['notes'] = kwargs['notes']

            allocation = request.env['hr.leave.allocation'].sudo().create(values)

            return {
                'success': True,
                'allocation': allocation.get_allocation_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leave-allocations/<int:allocation_id>/validate', type='jsonrpc', auth='user', methods=['POST'])
    def validate_allocation(self, allocation_id, **kwargs):
        """Valider une allocation"""
        try:
            allocation = request.env['hr.leave.allocation'].sudo().browse(allocation_id)
            if not allocation.exists():
                return {'success': False, 'error': 'Allocation introuvable'}

            allocation.action_validate()

            return {
                'success': True,
                'allocation': allocation.get_allocation_data(),
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leave-allocations/bulk-create', type='jsonrpc', auth='user', methods=['POST'])
    def bulk_create_allocations(self, **kwargs):
        """Créer des allocations en masse pour tous les employés"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['leave_type_id', 'number_of_days']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            year = kwargs.get('year')

            count = request.env['hr.leave.allocation'].sudo().create_yearly_allocations(
                tenant_id=int(tenant_id),
                leave_type_id=int(kwargs['leave_type_id']),
                number_of_days=float(kwargs['number_of_days']),
                year=int(year) if year else None,
            )

            return {
                'success': True,
                'created': count,
                'message': f'{count} allocations créées',
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/leave-balances', type='jsonrpc', auth='user', methods=['POST'])
    def get_balances(self, **kwargs):
        """Soldes de congés d'un employé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('employee_id'):
                return {'success': False, 'error': 'employee_id requis'}

            balances = request.env['hr.leave.allocation'].sudo().get_employee_balances(
                tenant_id=int(tenant_id),
                employee_id=int(kwargs['employee_id']),
            )

            return {
                'success': True,
                'balances': balances,
            }
        except Exception as e:
            _logger.error("HR Leaves API error: %s", e)
            return {'success': False, 'error': 'Erreur serveur'}
