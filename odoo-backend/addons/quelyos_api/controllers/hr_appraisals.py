# -*- coding: utf-8 -*-
"""
API Controller pour les évaluations RH.
"""
from odoo import http
from odoo.http import request


class HRAppraisalController(http.Controller):
    """API endpoints pour les évaluations, compétences et objectifs"""

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
    # ÉVALUATIONS
    # =========================================================================

    @http.route('/api/hr/appraisals', type='jsonrpc', auth='user', methods=['POST'])
    def get_appraisals(self, **kwargs):
        """Liste des évaluations avec filtres"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id))]

            # Filtres optionnels
            if kwargs.get('employee_id'):
                domain.append(('employee_id', '=', int(kwargs['employee_id'])))
            if kwargs.get('manager_id'):
                domain.append(('manager_id', '=', int(kwargs['manager_id'])))
            if kwargs.get('department_id'):
                domain.append(('department_id', '=', int(kwargs['department_id'])))
            if kwargs.get('state'):
                if isinstance(kwargs['state'], list):
                    domain.append(('state', 'in', kwargs['state']))
                else:
                    domain.append(('state', '=', kwargs['state']))
            if kwargs.get('appraisal_type'):
                domain.append(('appraisal_type', '=', kwargs['appraisal_type']))
            if kwargs.get('year'):
                domain.append(('date_scheduled', '>=', f"{kwargs['year']}-01-01"))
                domain.append(('date_scheduled', '<=', f"{kwargs['year']}-12-31"))

            limit = kwargs.get('limit', 100)
            offset = kwargs.get('offset', 0)

            Appraisal = request.env['quelyos.hr.appraisal'].sudo()
            total = Appraisal.search_count(domain)
            appraisals = Appraisal.search(domain, limit=limit, offset=offset, order='date_scheduled desc')

            return {
                'success': True,
                'appraisals': [a.get_appraisal_summary() for a in appraisals],
                'total': total,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/appraisals/<int:appraisal_id>', type='jsonrpc', auth='user', methods=['POST'])
    def get_appraisal(self, appraisal_id, **kwargs):
        """Détails d'une évaluation"""
        try:
            appraisal = request.env['quelyos.hr.appraisal'].sudo().browse(appraisal_id)
            if not appraisal.exists():
                return {'success': False, 'error': 'Évaluation introuvable'}

            # Récupérer les objectifs liés
            goals = appraisal.goal_ids

            return {
                'success': True,
                'appraisal': appraisal.get_appraisal_data(),
                'goals': [g.get_goal_data() for g in goals],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/appraisals/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_appraisal(self, **kwargs):
        """Crée une nouvelle évaluation"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required = ['employee_id', 'appraisal_type']
            for field in required:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'{field} requis'}

            vals = {
                'employee_id': int(kwargs['employee_id']),
                'appraisal_type': kwargs['appraisal_type'],
            }

            # Champs optionnels
            if kwargs.get('manager_id'):
                vals['manager_id'] = int(kwargs['manager_id'])
            if kwargs.get('period_start'):
                vals['period_start'] = kwargs['period_start']
            if kwargs.get('period_end'):
                vals['period_end'] = kwargs['period_end']
            if kwargs.get('date_scheduled'):
                vals['date_scheduled'] = kwargs['date_scheduled']
            if kwargs.get('duration'):
                vals['duration'] = float(kwargs['duration'])
            if kwargs.get('location'):
                vals['location'] = kwargs['location']

            appraisal = request.env['quelyos.hr.appraisal'].sudo().create(vals)

            return {
                'success': True,
                'appraisal': appraisal.get_appraisal_data(),
                'message': 'Évaluation créée avec succès',
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/appraisals/<int:appraisal_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_appraisal(self, appraisal_id, **kwargs):
        """Met à jour une évaluation"""
        try:
            appraisal = request.env['quelyos.hr.appraisal'].sudo().browse(appraisal_id)
            if not appraisal.exists():
                return {'success': False, 'error': 'Évaluation introuvable'}

            allowed_fields = [
                'manager_id', 'appraisal_type', 'period_start', 'period_end',
                'date_scheduled', 'duration', 'location',
                'employee_score', 'manager_score', 'final_score',
                'employee_feedback', 'manager_feedback', 'strengths', 'improvements',
                'training_needs', 'training_plan',
                'promotion_recommended', 'salary_increase_recommended', 'career_goals',
            ]

            vals = {k: v for k, v in kwargs.items() if k in allowed_fields and v is not None}

            if vals:
                appraisal.write(vals)

            return {
                'success': True,
                'appraisal': appraisal.get_appraisal_data(),
                'message': 'Évaluation mise à jour',
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/appraisals/<int:appraisal_id>/action', type='jsonrpc', auth='user', methods=['POST'])
    def appraisal_action(self, appraisal_id, action, **kwargs):
        """Exécute une action sur l'évaluation"""
        try:
            appraisal = request.env['quelyos.hr.appraisal'].sudo().browse(appraisal_id)
            if not appraisal.exists():
                return {'success': False, 'error': 'Évaluation introuvable'}

            actions_map = {
                'schedule': appraisal.action_schedule,
                'start': appraisal.action_start,
                'employee_done': appraisal.action_employee_done,
                'manager_done': appraisal.action_manager_done,
                'complete': appraisal.action_complete,
                'cancel': appraisal.action_cancel,
            }

            if action not in actions_map:
                return {'success': False, 'error': f'Action inconnue: {action}'}

            actions_map[action]()

            return {
                'success': True,
                'appraisal': appraisal.get_appraisal_data(),
                'message': f'Action {action} effectuée',
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    # =========================================================================
    # OBJECTIFS
    # =========================================================================

    @http.route('/api/hr/goals', type='jsonrpc', auth='user', methods=['POST'])
    def get_goals(self, **kwargs):
        """Liste des objectifs"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id))]

            if kwargs.get('employee_id'):
                domain.append(('employee_id', '=', int(kwargs['employee_id'])))
            if kwargs.get('state'):
                if isinstance(kwargs['state'], list):
                    domain.append(('state', 'in', kwargs['state']))
                else:
                    domain.append(('state', '=', kwargs['state']))
            if kwargs.get('goal_type'):
                domain.append(('goal_type', '=', kwargs['goal_type']))
            if kwargs.get('appraisal_id'):
                domain.append(('appraisal_id', '=', int(kwargs['appraisal_id'])))

            limit = kwargs.get('limit', 100)
            offset = kwargs.get('offset', 0)

            Goal = request.env['quelyos.hr.goal'].sudo()
            total = Goal.search_count(domain)
            goals = Goal.search(domain, limit=limit, offset=offset, order='deadline, priority desc')

            return {
                'success': True,
                'goals': [g.get_goal_data() for g in goals],
                'total': total,
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/goals/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_goal(self, **kwargs):
        """Crée un nouvel objectif"""
        try:
            required = ['employee_id', 'name', 'deadline']
            for field in required:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'{field} requis'}

            vals = {
                'employee_id': int(kwargs['employee_id']),
                'name': kwargs['name'],
                'deadline': kwargs['deadline'],
            }

            optional = ['description', 'period_start', 'priority', 'goal_type',
                       'target_value', 'unit', 'appraisal_id', 'notes']
            for field in optional:
                if kwargs.get(field):
                    vals[field] = kwargs[field]

            goal = request.env['quelyos.hr.goal'].sudo().create(vals)

            return {
                'success': True,
                'goal': goal.get_goal_data(),
                'message': 'Objectif créé avec succès',
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/goals/<int:goal_id>/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_goal(self, goal_id, **kwargs):
        """Met à jour un objectif"""
        try:
            goal = request.env['quelyos.hr.goal'].sudo().browse(goal_id)
            if not goal.exists():
                return {'success': False, 'error': 'Objectif introuvable'}

            allowed = ['name', 'description', 'deadline', 'period_start', 'progress',
                      'priority', 'goal_type', 'target_value', 'current_value', 'unit', 'notes']
            vals = {k: v for k, v in kwargs.items() if k in allowed and v is not None}

            if vals:
                goal.write(vals)

            return {
                'success': True,
                'goal': goal.get_goal_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/goals/<int:goal_id>/action', type='jsonrpc', auth='user', methods=['POST'])
    def goal_action(self, goal_id, action, **kwargs):
        """Action sur un objectif"""
        try:
            goal = request.env['quelyos.hr.goal'].sudo().browse(goal_id)
            if not goal.exists():
                return {'success': False, 'error': 'Objectif introuvable'}

            actions_map = {
                'start': goal.action_start,
                'complete': goal.action_complete,
                'cancel': goal.action_cancel,
            }

            if action not in actions_map:
                return {'success': False, 'error': f'Action inconnue: {action}'}

            actions_map[action]()

            return {
                'success': True,
                'goal': goal.get_goal_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    # =========================================================================
    # COMPÉTENCES
    # =========================================================================

    @http.route('/api/hr/skill-types', type='jsonrpc', auth='user', methods=['POST'])
    def get_skill_types(self, **kwargs):
        """Liste des types de compétences"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id)), ('active', '=', True)]
            types = request.env['quelyos.hr.skill.type'].sudo().search(domain, order='sequence, name')

            return {
                'success': True,
                'skill_types': [t.get_type_data() for t in types],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/skills', type='jsonrpc', auth='user', methods=['POST'])
    def get_skills(self, **kwargs):
        """Liste des compétences"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            domain = [('tenant_id', '=', int(tenant_id)), ('active', '=', True)]

            if kwargs.get('skill_type_id'):
                domain.append(('skill_type_id', '=', int(kwargs['skill_type_id'])))

            skills = request.env['quelyos.hr.skill'].sudo().search(domain, order='skill_type_id, name')

            return {
                'success': True,
                'skills': [s.get_skill_data() for s in skills],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/employees/<int:employee_id>/skills', type='jsonrpc', auth='user', methods=['POST'])
    def get_employee_skills(self, employee_id, **kwargs):
        """Compétences d'un employé"""
        try:
            domain = [('employee_id', '=', employee_id)]
            skills = request.env['hr.employee.skill'].sudo().search(domain, order='skill_type_id, skill_id')

            return {
                'success': True,
                'employee_skills': [s.get_employee_skill_data() for s in skills],
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/employees/<int:employee_id>/skills/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_employee_skills(self, employee_id, skills, **kwargs):
        """Met à jour les compétences d'un employé"""
        try:
            EmployeeSkill = request.env['hr.employee.skill'].sudo()

            # Supprimer les compétences existantes non incluses
            existing = EmployeeSkill.search([('employee_id', '=', employee_id)])
            skill_ids_to_keep = [s.get('skill_id') for s in skills if s.get('skill_id')]
            to_delete = existing.filtered(lambda s: s.skill_id.id not in skill_ids_to_keep)
            to_delete.unlink()

            # Créer ou mettre à jour
            for skill_data in skills:
                skill_id = skill_data.get('skill_id')
                if not skill_id:
                    continue

                existing_skill = EmployeeSkill.search([
                    ('employee_id', '=', employee_id),
                    ('skill_id', '=', skill_id),
                ], limit=1)

                vals = {
                    'skill_level': skill_data.get('level', '1'),
                    'level_progress': skill_data.get('level_progress', 50),
                }

                if existing_skill:
                    existing_skill.write(vals)
                else:
                    vals.update({
                        'employee_id': employee_id,
                        'skill_id': skill_id,
                    })
                    EmployeeSkill.create(vals)

            # Retourner les compétences mises à jour
            updated_skills = EmployeeSkill.search([('employee_id', '=', employee_id)])

            return {
                'success': True,
                'employee_skills': [s.get_employee_skill_data() for s in updated_skills],
                'message': 'Compétences mises à jour',
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/skills/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_skill(self, **kwargs):
        """Crée une nouvelle compétence"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            required = ['name', 'skill_type_id']
            for field in required:
                if not kwargs.get(field):
                    return {'success': False, 'error': f'{field} requis'}

            vals = {
                'name': kwargs['name'],
                'skill_type_id': int(kwargs['skill_type_id']),
                'tenant_id': int(tenant_id),
            }

            if kwargs.get('description'):
                vals['description'] = kwargs['description']

            skill = request.env['quelyos.hr.skill'].sudo().create(vals)

            return {
                'success': True,
                'skill': skill.get_skill_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}

    @http.route('/api/hr/skill-types/create', type='jsonrpc', auth='user', methods=['POST'])
    def create_skill_type(self, **kwargs):
        """Crée un nouveau type de compétence"""
        try:
            tenant_id = self._get_tenant_id(kwargs)
            if not tenant_id:
                return {'success': False, 'error': 'tenant_id requis'}

            if not kwargs.get('name'):
                return {'success': False, 'error': 'name requis'}

            vals = {
                'name': kwargs['name'],
                'tenant_id': int(tenant_id),
            }

            if kwargs.get('color'):
                vals['color'] = kwargs['color']
            if kwargs.get('sequence'):
                vals['sequence'] = int(kwargs['sequence'])

            skill_type = request.env['quelyos.hr.skill.type'].sudo().create(vals)

            return {
                'success': True,
                'skill_type': skill_type.get_type_data(),
            }
        except Exception as e:
            return {'success': False, 'error': 'Erreur serveur'}
