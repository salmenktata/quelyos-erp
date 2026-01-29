# -*- coding: utf-8 -*-
"""
API Controller for HR Departments management.
"""
from odoo import http
from odoo.http import request


class HRDepartmentController(http.Controller):
    """API endpoints for HR departments"""

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
    # DEPARTMENTS
    # =========================================================================

    @http.route('/api/hr/departments', type='jsonrpc', auth='user', methods=['POST'])
    def get_departments(self, **kwargs):
        """Liste des départements"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id)), ('active', '=', True)]

            Department = request.env['hr.department'].sudo()
            departments = Department.search(domain, order='sequence, name')

            return {
                'success': True,
                'departments': [d.get_department_data() for d in departments],
                'total': len(departments),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/departments/tree', type='jsonrpc', auth='user', methods=['POST'])
    def get_departments_tree(self, **kwargs):
        """Organigramme hiérarchique des départements"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            # Récupérer les départements racines (sans parent)
            domain = [
                ('tenant_id', '=', int(tenant_id)),
                ('active', '=', True),
                ('parent_id', '=', False),
            ]

            Department = request.env['hr.department'].sudo()
            root_departments = Department.search(domain, order='sequence, name')

            return {
                'success': True,
                'tree': [d.get_tree_data() for d in root_departments],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/departments/<int:department_id>', type='jsonrpc', auth='user', methods=['POST'])
    def get_department(self, department_id, **kwargs):
        """Détail d'un département"""
        try:
            department = request.env['hr.department'].sudo().browse(department_id)
            if not department.exists():
                return {'success': False, 'error': 'Département introuvable'}

            # Membres du département
            members = department.member_ids.filtered(lambda e: e.state == 'active')

            return {
                'success': True,
                'department': department.get_department_data(),
                'members': [m.get_employee_data() for m in members],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/departments/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_department(self, **kwargs):
        """Créer un département"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('name'):
                return {'success': False, 'error': 'Champ requis: name'}

            values = {
                'tenant_id': int(tenant_id),
                'name': kwargs['name'],
            }

            if kwargs.get('code'):
                values['code'] = kwargs['code']
            if kwargs.get('parent_id'):
                values['parent_id'] = int(kwargs['parent_id'])
            if kwargs.get('manager_id'):
                values['manager_id'] = int(kwargs['manager_id'])
            if kwargs.get('sequence'):
                values['sequence'] = int(kwargs['sequence'])
            if kwargs.get('color'):
                values['color'] = int(kwargs['color'])
            if kwargs.get('note'):
                values['note'] = kwargs['note']

            department = request.env['hr.department'].sudo().create(values)

            return {
                'success': True,
                'department': department.get_department_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/departments/<int:department_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_department(self, department_id, **kwargs):
        """Mettre à jour un département"""
        try:
            department = request.env['hr.department'].sudo().browse(department_id)
            if not department.exists():
                return {'success': False, 'error': 'Département introuvable'}

            values = {}
            if 'name' in kwargs:
                values['name'] = kwargs['name']
            if 'code' in kwargs:
                values['code'] = kwargs['code']
            if 'parent_id' in kwargs:
                values['parent_id'] = int(kwargs['parent_id']) if kwargs['parent_id'] else False
            if 'manager_id' in kwargs:
                values['manager_id'] = int(kwargs['manager_id']) if kwargs['manager_id'] else False
            if 'sequence' in kwargs:
                values['sequence'] = int(kwargs['sequence'])
            if 'color' in kwargs:
                values['color'] = int(kwargs['color'])
            if 'note' in kwargs:
                values['note'] = kwargs['note']
            if 'active' in kwargs:
                values['active'] = kwargs['active']

            if values:
                department.write(values)

            return {
                'success': True,
                'department': department.get_department_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/departments/<int:department_id>/delete', type='jsonrpc', auth='user', methods=['POST'])
    def delete_department(self, department_id, **kwargs):
        """Supprimer (archiver) un département"""
        try:
            department = request.env['hr.department'].sudo().browse(department_id)
            if not department.exists():
                return {'success': False, 'error': 'Département introuvable'}

            if department.member_ids.filtered(lambda e: e.state == 'active'):
                return {'success': False, 'error': 'Impossible de supprimer un département avec des employés actifs'}

            department.write({'active': False})

            return {'success': True, 'message': 'Département archivé'}
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    # =========================================================================
    # JOBS (POSTES)
    # =========================================================================

    @http.route('/api/hr/jobs', type='jsonrpc', auth='user', methods=['POST'])
    def get_jobs(self, **kwargs):
        """Liste des postes"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id)), ('active', '=', True)]

            if kwargs.get('department_id'):
                domain.append(('department_id', '=', int(kwargs['department_id'])))

            Job = request.env['hr.job'].sudo()
            jobs = Job.search(domain, order='sequence, name')

            return {
                'success': True,
                'jobs': [j.get_job_data() for j in jobs],
                'total': len(jobs),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/jobs/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_job(self, **kwargs):
        """Créer un poste"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('name'):
                return {'success': False, 'error': 'Champ requis: name'}

            values = {
                'tenant_id': int(tenant_id),
                'name': kwargs['name'],
            }

            if kwargs.get('code'):
                values['code'] = kwargs['code']
            if kwargs.get('department_id'):
                values['department_id'] = int(kwargs['department_id'])
            if kwargs.get('description'):
                values['description'] = kwargs['description']
            if kwargs.get('requirements'):
                values['requirements'] = kwargs['requirements']
            if kwargs.get('expected_employees'):
                values['expected_employees'] = int(kwargs['expected_employees'])

            job = request.env['hr.job'].sudo().create(values)

            return {
                'success': True,
                'job': job.get_job_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/jobs/<int:job_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_job(self, job_id, **kwargs):
        """Mettre à jour un poste"""
        try:
            job = request.env['hr.job'].sudo().browse(job_id)
            if not job.exists():
                return {'success': False, 'error': 'Poste introuvable'}

            values = {}
            if 'name' in kwargs:
                values['name'] = kwargs['name']
            if 'code' in kwargs:
                values['code'] = kwargs['code']
            if 'department_id' in kwargs:
                values['department_id'] = int(kwargs['department_id']) if kwargs['department_id'] else False
            if 'description' in kwargs:
                values['description'] = kwargs['description']
            if 'requirements' in kwargs:
                values['requirements'] = kwargs['requirements']
            if 'expected_employees' in kwargs:
                values['expected_employees'] = int(kwargs['expected_employees'])
            if 'active' in kwargs:
                values['active'] = kwargs['active']

            if values:
                job.write(values)

            return {
                'success': True,
                'job': job.get_job_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}
