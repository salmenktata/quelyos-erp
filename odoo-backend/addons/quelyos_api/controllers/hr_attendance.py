# -*- coding: utf-8 -*-
"""
API Controller for HR Attendance/Time tracking.
"""
from odoo import http
from odoo.http import request
from datetime import datetime, timedelta


class HRAttendanceController(http.Controller):
    """API endpoints for HR attendance"""

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
    # ATTENDANCE
    # =========================================================================

    @http.route('/api/hr/attendance', type='jsonrpc', auth='user', methods=['POST'])
    def get_attendances(self, **kwargs):
        """Liste des pointages avec filtres"""
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
            if kwargs.get('date_from'):
                domain.append(('check_in', '>=', kwargs['date_from']))
            if kwargs.get('date_to'):
                domain.append(('check_in', '<=', kwargs['date_to']))
            if kwargs.get('state'):
                domain.append(('state', '=', kwargs['state']))

            limit = kwargs.get('limit', 50)
            offset = kwargs.get('offset', 0)

            Attendance = request.env['hr.attendance'].sudo()
            total = Attendance.search_count(domain)
            attendances = Attendance.search(domain, limit=limit, offset=offset, order='check_in desc')

            return {
                'success': True,
                'attendances': [a.get_attendance_data() for a in attendances],
                'total': total,
                'limit': limit,
                'offset': offset,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/today', type='jsonrpc', auth='user', methods=['POST'])
    def get_today_attendance(self, **kwargs):
        """Présences du jour"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            summary = request.env['hr.attendance'].sudo().get_today_summary(int(tenant_id))

            return {
                'success': True,
                **summary,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/check-in', type='jsonrpc', auth='user', methods=['POST'])
    def check_in(self, **kwargs):
        """Pointer l'entrée d'un employé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('employee_id'):
                return {'success': False, 'error': 'employee_id requis'}

            mode = kwargs.get('mode', 'manual')
            latitude = kwargs.get('latitude')
            longitude = kwargs.get('longitude')

            attendance_data = request.env['hr.attendance'].sudo().check_in_employee(
                employee_id=int(kwargs['employee_id']),
                tenant_id=int(tenant_id),
                mode=mode,
                latitude=float(latitude) if latitude else None,
                longitude=float(longitude) if longitude else None,
            )

            return {
                'success': True,
                'attendance': attendance_data,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/check-out', type='jsonrpc', auth='user', methods=['POST'])
    def check_out(self, **kwargs):
        """Pointer la sortie d'un employé"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('employee_id'):
                return {'success': False, 'error': 'employee_id requis'}

            mode = kwargs.get('mode', 'manual')
            latitude = kwargs.get('latitude')
            longitude = kwargs.get('longitude')

            attendance_data = request.env['hr.attendance'].sudo().check_out_employee(
                employee_id=int(kwargs['employee_id']),
                tenant_id=int(tenant_id),
                mode=mode,
                latitude=float(latitude) if latitude else None,
                longitude=float(longitude) if longitude else None,
            )

            return {
                'success': True,
                'attendance': attendance_data,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/report', type='jsonrpc', auth='user', methods=['POST'])
    def get_attendance_report(self, **kwargs):
        """Rapport de présences sur une période"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('date_from') or not kwargs.get('date_to'):
                return {'success': False, 'error': 'date_from et date_to requis'}

            report = request.env['hr.attendance'].sudo().get_period_report(
                tenant_id=int(tenant_id),
                date_from=kwargs['date_from'],
                date_to=kwargs['date_to'],
                employee_id=int(kwargs['employee_id']) if kwargs.get('employee_id') else None,
                department_id=int(kwargs['department_id']) if kwargs.get('department_id') else None,
            )

            return {
                'success': True,
                **report,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/<int:attendance_id>/validate', type='jsonrpc', auth='user', methods=['POST'])
    def validate_attendance(self, attendance_id, **kwargs):
        """Valider un pointage"""
        try:
            attendance = request.env['hr.attendance'].sudo().browse(attendance_id)
            if not attendance.exists():
                return {'success': False, 'error': 'Pointage introuvable'}

            attendance.action_validate()

            return {
                'success': True,
                'attendance': attendance.get_attendance_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/<int:attendance_id>/anomaly', type='jsonrpc', auth='user', methods=['POST'])
    def mark_anomaly(self, attendance_id, **kwargs):
        """Marquer un pointage comme anomalie"""
        try:
            attendance = request.env['hr.attendance'].sudo().browse(attendance_id)
            if not attendance.exists():
                return {'success': False, 'error': 'Pointage introuvable'}

            reason = kwargs.get('reason', 'Anomalie détectée')
            attendance.action_mark_anomaly(reason)

            return {
                'success': True,
                'attendance': attendance.get_attendance_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_attendance(self, **kwargs):
        """Créer manuellement un pointage (régularisation)"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required_fields = ['employee_id', 'check_in']
            for field in required_fields:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'Champ requis: {field}'}

            values = {
                'tenant_id': int(tenant_id),
                'employee_id': int(kwargs['employee_id']),
                'check_in': kwargs['check_in'],
                'check_in_mode': 'manual',
                'state': 'draft',
            }

            if kwargs.get('check_out'):
                values['check_out'] = kwargs['check_out']
                values['check_out_mode'] = 'manual'
            if kwargs.get('notes'):
                values['notes'] = kwargs['notes']

            attendance = request.env['hr.attendance'].sudo().create(values)

            return {
                'success': True,
                'attendance': attendance.get_attendance_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/attendance/<int:attendance_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_attendance(self, attendance_id, **kwargs):
        """Modifier un pointage"""
        try:
            attendance = request.env['hr.attendance'].sudo().browse(attendance_id)
            if not attendance.exists():
                return {'success': False, 'error': 'Pointage introuvable'}

            values = {}
            if 'check_in' in kwargs:
                values['check_in'] = kwargs['check_in']
            if 'check_out' in kwargs:
                values['check_out'] = kwargs['check_out']
            if 'notes' in kwargs:
                values['notes'] = kwargs['notes']

            if values:
                attendance.write(values)

            return {
                'success': True,
                'attendance': attendance.get_attendance_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}
