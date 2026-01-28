# -*- coding: utf-8 -*-
"""
API Controller for HR Employees management.
"""
from odoo import http
from odoo.http import request
from datetime import datetime


class HREmployeeController(http.Controller):
    """API endpoints for HR employees"""

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
    # EMPLOYEES
    # =========================================================================

    @http.route('/api/hr/employees', type='jsonrpc', auth='user', methods=['POST'])
    def get_employees(self, **kwargs):
        """Liste des employés avec filtres"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id))]

            # Filtres optionnels
            if kwargs.get('department_id'):
                domain.append(('department_id', '=', int(kwargs['department_id'])))
            if kwargs.get('job_id'):
                domain.append(('job_id', '=', int(kwargs['job_id'])))
            if kwargs.get('state'):
                domain.append(('state', '=', kwargs['state']))
            if kwargs.get('manager_id'):
                domain.append(('parent_id', '=', int(kwargs['manager_id'])))
            if kwargs.get('search'):
                search_term = kwargs['search']
                domain.append('|')
                domain.append('|')
                domain.append(('name', 'ilike', search_term))
                domain.append(('employee_number', 'ilike', search_term))
                domain.append(('work_email', 'ilike', search_term))

            limit = kwargs.get('limit', 50)
            offset = kwargs.get('offset', 0)

            Employee = request.env['hr.employee'].sudo()
            total = Employee.search_count(domain)
            employees = Employee.search(domain, limit=limit, offset=offset, order='name')

            return {
                'success': True,
                'employees': [e.get_employee_data() for e in employees],
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>', type='jsonrpc', auth='user', methods=['POST'])
    def get_employee(self, employee_id, **kwargs):
        """Détail d'un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            return {
                'success': True,
                'employee': employee.get_employee_data(detailed=True),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_employee(self, **kwargs):
        """Créer un nouvel employé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['first_name', 'last_name']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'first_name': kwargs['first_name'],
                'last_name': kwargs['last_name'],
            }

            # Champs optionnels
            optional_fields = [
                'work_email', 'work_phone', 'mobile_phone', 'job_title',
                'gender', 'birthday', 'identification_id', 'marital',
                'children', 'emergency_contact', 'emergency_phone',
                'private_email', 'bank_name', 'bank_account_number',
                'address_home_street', 'address_home_city', 'address_home_zip',
            ]
            for field in optional_fields:
                if kwargs.get(field):
                    values[field] = kwargs[field]

            # Champs relations
            if kwargs.get('department_id'):
                values['department_id'] = int(kwargs['department_id'])
            if kwargs.get('job_id'):
                values['job_id'] = int(kwargs['job_id'])
            if kwargs.get('parent_id'):
                values['parent_id'] = int(kwargs['parent_id'])
            if kwargs.get('hire_date'):
                values['hire_date'] = kwargs['hire_date']

            employee = request.env['hr.employee'].sudo().create(values)

            return {
                'success': True,
                'employee': employee.get_employee_data(detailed=True),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_employee(self, employee_id, **kwargs):
        """Mettre à jour un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            values = {}
            allowed_fields = [
                'first_name', 'last_name', 'work_email', 'work_phone', 'mobile_phone',
                'job_title', 'gender', 'birthday', 'identification_id', 'marital',
                'children', 'emergency_contact', 'emergency_phone', 'private_email',
                'bank_name', 'bank_account_number', 'address_home_street',
                'address_home_street2', 'address_home_city', 'address_home_zip',
                'state', 'departure_date', 'departure_reason', 'departure_description',
            ]

            for field in allowed_fields:
                if field in kwargs:
                    values[field] = kwargs[field]

            # Relations
            if 'department_id' in kwargs:
                values['department_id'] = int(kwargs['department_id']) if kwargs['department_id'] else False
            if 'job_id' in kwargs:
                values['job_id'] = int(kwargs['job_id']) if kwargs['job_id'] else False
            if 'parent_id' in kwargs:
                values['parent_id'] = int(kwargs['parent_id']) if kwargs['parent_id'] else False
            if 'hire_date' in kwargs:
                values['hire_date'] = kwargs['hire_date']

            if values:
                employee.write(values)

            return {
                'success': True,
                'employee': employee.get_employee_data(detailed=True),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>/archive', type='jsonrpc', auth='user', methods=['POST'])
    def archive_employee(self, employee_id, **kwargs):
        """Archiver un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            employee.write({
                'active': False,
                'state': 'departed',
                'departure_date': kwargs.get('departure_date') or datetime.now().date(),
                'departure_reason': kwargs.get('departure_reason', 'other'),
            })

            return {'success': True, 'message': 'Employé archivé'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>/subordinates', type='jsonrpc', auth='user', methods=['POST'])
    def get_subordinates(self, employee_id, **kwargs):
        """Liste des subordonnés d'un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            return {
                'success': True,
                'subordinates': employee.get_subordinates_data(),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>/leaves', type='jsonrpc', auth='user', methods=['POST'])
    def get_employee_leaves(self, employee_id, **kwargs):
        """Historique des congés d'un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            # Soldes
            balances = request.env['hr.leave.allocation'].sudo().get_employee_balances(
                employee.tenant_id.id, employee_id
            )

            # Historique
            leaves = employee.leave_ids.sorted(key=lambda l: l.date_from, reverse=True)[:20]

            return {
                'success': True,
                'balances': balances,
                'leaves': [l.get_leave_data() for l in leaves],
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/api/hr/employees/<int:employee_id>/attendance', type='jsonrpc', auth='user', methods=['POST'])
    def get_employee_attendance(self, employee_id, **kwargs):
        """Historique des pointages d'un employé"""
        try:
            employee = request.env['hr.employee'].sudo().browse(employee_id)
            if not employee.exists():
                return {'success': False, 'error': 'Employé introuvable'}

            limit = kwargs.get('limit', 30)
            attendances = employee.attendance_ids[:limit]

            return {
                'success': True,
                'attendances': [a.get_attendance_data() for a in attendances],
                'attendance_state': employee.attendance_state,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
