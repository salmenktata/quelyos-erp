# -*- coding: utf-8 -*-
"""
API Controller for HR Contracts management.
"""
from odoo import http
from odoo.http import request


class HRContractController(http.Controller):
    """API endpoints for HR contracts"""

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
    # CONTRACTS
    # =========================================================================

    @http.route('/api/hr/contracts', type='json', auth='user', methods=['POST'])
    def get_contracts(self, **kwargs):
        """Liste des contrats avec filtres"""
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
            if kwargs.get('contract_type'):
                domain.append(('contract_type', '=', kwargs['contract_type']))
            if kwargs.get('state'):
                domain.append(('state', '=', kwargs['state']))

            limit = kwargs.get('limit', 50)
            offset = kwargs.get('offset', 0)

            Contract = request.env['quelyos.hr.contract'].sudo()
            total = Contract.search_count(domain)
            contracts = Contract.search(domain, limit=limit, offset=offset, order='date_start desc')

            return {
                'success': True,
                'contracts': [c.get_contract_data() for c in contracts],
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/<int:contract_id>', type='json', auth='user', methods=['POST'])
    def get_contract(self, contract_id, **kwargs):
        """Détail d'un contrat"""
        try:
            contract = request.env['quelyos.hr.contract'].sudo().browse(contract_id)
            if not contract.exists():
                return {'success': False, 'error': 'Contrat introuvable'}

            return {
                'success': True,
                'contract': contract.get_contract_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/create', type='json', auth='user', methods=['POST'])
    def create_contract(self, **kwargs):
        """Créer un contrat"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['employee_id', 'contract_type', 'date_start', 'wage']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'employee_id': int(kwargs['employee_id']),
                'contract_type': kwargs['contract_type'],
                'date_start': kwargs['date_start'],
                'wage': float(kwargs['wage']),
            }

            # Champs optionnels
            if kwargs.get('date_end'):
                values['date_end'] = kwargs['date_end']
            if kwargs.get('trial_date_end'):
                values['trial_date_end'] = kwargs['trial_date_end']
            if kwargs.get('department_id'):
                values['department_id'] = int(kwargs['department_id'])
            if kwargs.get('job_id'):
                values['job_id'] = int(kwargs['job_id'])
            if kwargs.get('wage_type'):
                values['wage_type'] = kwargs['wage_type']
            if kwargs.get('schedule_pay'):
                values['schedule_pay'] = kwargs['schedule_pay']
            if kwargs.get('hours_per_week'):
                values['hours_per_week'] = float(kwargs['hours_per_week'])
            if kwargs.get('time_type'):
                values['time_type'] = kwargs['time_type']
            if kwargs.get('notes'):
                values['notes'] = kwargs['notes']
            if kwargs.get('advantages'):
                values['advantages'] = kwargs['advantages']

            contract = request.env['quelyos.hr.contract'].sudo().create(values)

            return {
                'success': True,
                'contract': contract.get_contract_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/<int:contract_id>/update', type='json', auth='user', methods=['POST'])
    def update_contract(self, contract_id, **kwargs):
        """Mettre à jour un contrat"""
        try:
            contract = request.env['quelyos.hr.contract'].sudo().browse(contract_id)
            if not contract.exists():
                return {'success': False, 'error': 'Contrat introuvable'}

            if contract.state not in ('draft', 'open'):
                return {'success': False, 'error': 'Contrat non modifiable'}

            values = {}
            allowed_fields = [
                'contract_type', 'date_start', 'date_end', 'trial_date_end',
                'wage', 'wage_type', 'schedule_pay', 'hours_per_week',
                'time_type', 'notes', 'advantages',
            ]

            for field in allowed_fields:
                if field in kwargs:
                    if field in ('wage', 'hours_per_week') and kwargs[field]:
                        values[field] = float(kwargs[field])
                    else:
                        values[field] = kwargs[field]

            if 'department_id' in kwargs:
                values['department_id'] = int(kwargs['department_id']) if kwargs['department_id'] else False
            if 'job_id' in kwargs:
                values['job_id'] = int(kwargs['job_id']) if kwargs['job_id'] else False

            if values:
                contract.write(values)

            return {
                'success': True,
                'contract': contract.get_contract_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/<int:contract_id>/open', type='json', auth='user', methods=['POST'])
    def open_contract(self, contract_id, **kwargs):
        """Activer un contrat"""
        try:
            contract = request.env['quelyos.hr.contract'].sudo().browse(contract_id)
            if not contract.exists():
                return {'success': False, 'error': 'Contrat introuvable'}

            contract.action_open()

            return {
                'success': True,
                'contract': contract.get_contract_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/<int:contract_id>/close', type='json', auth='user', methods=['POST'])
    def close_contract(self, contract_id, **kwargs):
        """Clôturer un contrat"""
        try:
            contract = request.env['quelyos.hr.contract'].sudo().browse(contract_id)
            if not contract.exists():
                return {'success': False, 'error': 'Contrat introuvable'}

            contract.action_close()

            return {
                'success': True,
                'contract': contract.get_contract_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/contracts/expiring', type='json', auth='user', methods=['POST'])
    def get_expiring_contracts(self, **kwargs):
        """Contrats arrivant à expiration"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            days = kwargs.get('days', 30)

            from datetime import datetime, timedelta
            from odoo import fields
            today = fields.Date.today()
            deadline = today + timedelta(days=days)

            domain = [
                ('tenant_id', '=', int(tenant_id)),
                ('state', '=', 'open'),
                ('date_end', '!=', False),
                ('date_end', '<=', deadline),
                ('date_end', '>=', today),
            ]

            Contract = request.env['quelyos.hr.contract'].sudo()
            contracts = Contract.search(domain, order='date_end')

            return {
                'success': True,
                'contracts': [c.get_contract_data() for c in contracts],
                'total': len(contracts),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
