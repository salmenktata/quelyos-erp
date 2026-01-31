# -*- coding: utf-8 -*-
"""
Modèle Audit Log pour traçabilité des actions sensibles.

Stocke en base de données toutes les actions auditées:
- Connexions (succès/échec)
- Modifications de données tenant
- Suppressions
- Actions admin
- Exports de données
"""

from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class AuditLog(models.Model):
    """
    Log d'audit pour traçabilité des actions sensibles.

    Données conservées 90 jours par défaut (configurable).
    Index optimisés pour recherche par user, action, date.
    """
    _name = 'quelyos.audit.log'
    _description = 'Audit Log'
    _order = 'create_date desc'
    _rec_name = 'action'

    # Champs principaux
    action = fields.Char('Action', required=True, index=True,
        help="Type d'action (ex: auth.login.success, product.delete)")
    user_id = fields.Many2one('res.users', string='Utilisateur', index=True,
        ondelete='set null')
    user_login = fields.Char('Login utilisateur', index=True)

    # Ressource affectée
    resource_type = fields.Char('Type ressource', index=True,
        help="Type de ressource affectée (product, order, user, etc.)")
    resource_id = fields.Integer('ID ressource', index=True)
    resource_name = fields.Char('Nom ressource')

    # Contexte
    ip_address = fields.Char('Adresse IP', index=True)
    user_agent = fields.Char('User Agent')
    tenant_id = fields.Many2one('quelyos.tenant', string='Tenant', index=True,
        ondelete='set null')

    # Résultat
    success = fields.Boolean('Succès', default=True, index=True)
    error_message = fields.Text('Message erreur')

    # Détails JSON
    details = fields.Text('Détails (JSON)',
        help="Informations additionnelles au format JSON")

    # Catégorie pour filtrage rapide
    category = fields.Selection([
        ('auth', 'Authentification'),
        ('data', 'Données'),
        ('config', 'Configuration'),
        ('admin', 'Administration'),
        ('security', 'Sécurité'),
        ('export', 'Export'),
        ('other', 'Autre'),
    ], string='Catégorie', default='other', index=True)

    # Niveau de sévérité
    severity = fields.Selection([
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ], string='Sévérité', default='info', index=True)

    @api.model
    def log_action(self, action, user_id=None, user_login=None, resource_type=None,
                   resource_id=None, resource_name=None, ip_address=None,
                   user_agent=None, tenant_id=None, success=True, error_message=None,
                   details=None, category='other', severity='info'):
        """
        Crée une entrée de log d'audit.

        Args:
            action: Type d'action (ex: 'auth.login.success')
            user_id: ID de l'utilisateur
            user_login: Login de l'utilisateur
            resource_type: Type de ressource (ex: 'product')
            resource_id: ID de la ressource
            resource_name: Nom de la ressource
            ip_address: Adresse IP
            user_agent: User Agent du navigateur
            tenant_id: ID du tenant
            success: Action réussie ou non
            error_message: Message d'erreur si échec
            details: Détails additionnels (dict converti en JSON)
            category: Catégorie de l'action
            severity: Niveau de sévérité

        Returns:
            quelyos.audit.log: Enregistrement créé
        """
        import json

        # Convertir details en JSON si c'est un dict
        if details and isinstance(details, dict):
            details = json.dumps(details, ensure_ascii=False, default=str)

        # Déterminer la catégorie automatiquement si non spécifiée
        if category == 'other' and action:
            if action.startswith('auth.'):
                category = 'auth'
            elif action.startswith('data.') or action.endswith('.export'):
                category = 'export'
            elif action.startswith('config.') or action.startswith('setting.'):
                category = 'config'
            elif 'admin' in action or 'permission' in action:
                category = 'admin'
            elif 'security' in action or 'failed' in action:
                category = 'security'
            elif any(x in action for x in ['create', 'update', 'delete']):
                category = 'data'

        # Déterminer la sévérité automatiquement
        if severity == 'info':
            if not success or 'failed' in action.lower():
                severity = 'warning'
            if 'delete' in action or 'security' in action:
                severity = 'warning'
            if action in ['auth.login.failed', 'auth.password.reset']:
                severity = 'warning'

        try:
            record = self.sudo().create({
                'action': action,
                'user_id': user_id,
                'user_login': user_login,
                'resource_type': resource_type,
                'resource_id': resource_id,
                'resource_name': resource_name,
                'ip_address': ip_address,
                'user_agent': user_agent,
                'tenant_id': tenant_id,
                'success': success,
                'error_message': error_message,
                'details': details,
                'category': category,
                'severity': severity,
            })

            # Log aussi dans les logs Odoo standards pour monitoring
            log_msg = f"AUDIT | {action} | user={user_login}({user_id}) | success={success}"
            if resource_type:
                log_msg += f" | resource={resource_type}:{resource_id}"
            if not success:
                _logger.warning(log_msg)
            else:
                _logger.info(log_msg)

            return record

        except Exception as e:
            # Ne jamais faire échouer l'opération principale à cause du logging
            _logger.error(f"Failed to create audit log: {e}")
            return None

    @api.model
    def cleanup_old_logs(self, days=90):
        """
        Supprime les logs plus anciens que `days` jours.

        Appelé par un cron job pour maintenance automatique.
        Conserve les logs critiques plus longtemps (180 jours).
        """
        from datetime import datetime, timedelta

        # Logs normaux: 90 jours
        cutoff_date = datetime.now() - timedelta(days=days)
        old_logs = self.sudo().search([
            ('create_date', '<', cutoff_date),
            ('severity', '!=', 'critical'),
        ])
        count_normal = len(old_logs)
        old_logs.unlink()

        # Logs critiques: 180 jours
        critical_cutoff = datetime.now() - timedelta(days=days * 2)
        critical_logs = self.sudo().search([
            ('create_date', '<', critical_cutoff),
            ('severity', '=', 'critical'),
        ])
        count_critical = len(critical_logs)
        critical_logs.unlink()

        _logger.info(f"Audit log cleanup: {count_normal} normal + {count_critical} critical logs deleted")
        return count_normal + count_critical

    @api.model
    def get_user_activity(self, user_id, limit=50):
        """Récupère l'activité récente d'un utilisateur"""
        return self.sudo().search([
            ('user_id', '=', user_id)
        ], limit=limit, order='create_date desc')

    @api.model
    def get_failed_logins(self, hours=24, limit=100):
        """Récupère les tentatives de connexion échouées récentes"""
        from datetime import datetime, timedelta

        cutoff = datetime.now() - timedelta(hours=hours)
        return self.sudo().search([
            ('action', '=', 'auth.login.failed'),
            ('create_date', '>=', cutoff),
        ], limit=limit, order='create_date desc')

    @api.model
    def get_security_events(self, hours=24, limit=100):
        """Récupère les événements de sécurité récents"""
        from datetime import datetime, timedelta

        cutoff = datetime.now() - timedelta(hours=hours)
        return self.sudo().search([
            ('category', '=', 'security'),
            ('create_date', '>=', cutoff),
        ], limit=limit, order='create_date desc')

    # ========== P5: Fonctionnalités avancées ==========

    @api.model
    def search_logs(self, filters=None, offset=0, limit=50):
        """
        Recherche avancée dans les logs avec pagination
        filters: user_id, category, severity, success, date_from, date_to, search, ip_address
        """
        import json
        from datetime import datetime

        domain = []
        filters = filters or {}

        if filters.get('user_id'):
            domain.append(('user_id', '=', int(filters['user_id'])))

        if filters.get('category'):
            domain.append(('category', '=', filters['category']))

        if filters.get('severity'):
            domain.append(('severity', '=', filters['severity']))

        if filters.get('success') is not None:
            domain.append(('success', '=', filters['success']))

        if filters.get('date_from'):
            domain.append(('create_date', '>=', filters['date_from']))

        if filters.get('date_to'):
            domain.append(('create_date', '<=', filters['date_to']))

        if filters.get('ip_address'):
            domain.append(('ip_address', '=', filters['ip_address']))

        if filters.get('resource_type'):
            domain.append(('resource_type', '=', filters['resource_type']))

        if filters.get('search'):
            search_term = filters['search']
            domain.append('|')
            domain.append('|')
            domain.append(('action', 'ilike', search_term))
            domain.append(('resource_name', 'ilike', search_term))
            domain.append(('user_login', 'ilike', search_term))

        total = self.sudo().search_count(domain)
        logs = self.sudo().search(domain, offset=offset, limit=limit, order='create_date desc')

        return {
            'total': total,
            'offset': offset,
            'limit': limit,
            'logs': [{
                'id': log.id,
                'timestamp': log.create_date.isoformat() if log.create_date else None,
                'user_id': log.user_id.id if log.user_id else None,
                'user_name': log.user_id.name if log.user_id else log.user_login or 'Système',
                'user_login': log.user_login,
                'ip_address': log.ip_address,
                'action': log.action,
                'category': log.category,
                'severity': log.severity,
                'resource_type': log.resource_type,
                'resource_id': log.resource_id,
                'resource_name': log.resource_name,
                'success': log.success,
                'error_message': log.error_message,
                'details': json.loads(log.details) if log.details else None,
            } for log in logs]
        }

    @api.model
    def export_csv(self, filters=None, limit=10000):
        """Export des logs en CSV"""
        import csv
        import io

        result = self.search_logs(filters=filters, offset=0, limit=limit)

        output = io.StringIO()
        writer = csv.writer(output)

        # En-têtes
        headers = ['Date/Heure', 'Utilisateur', 'Login', 'IP', 'Action', 'Catégorie',
                   'Sévérité', 'Ressource', 'ID Ressource', 'Succès', 'Erreur']
        writer.writerow(headers)

        # Données
        for log in result['logs']:
            writer.writerow([
                log['timestamp'],
                log['user_name'],
                log['user_login'] or '',
                log['ip_address'] or '',
                log['action'],
                log['category'],
                log['severity'],
                log['resource_type'] or '',
                log['resource_id'] or '',
                'Oui' if log['success'] else 'Non',
                log['error_message'] or '',
            ])

        return output.getvalue()

    @api.model
    def get_statistics(self, days=7):
        """Statistiques des logs sur N jours - VERSION ORM"""
        from datetime import datetime, timedelta

        date_from = datetime.now() - timedelta(days=days)
        domain = [('create_date', '>=', date_from)]

        # 1. Total par catégorie (ORM read_group)
        by_category_data = self.read_group(
            domain=domain,
            fields=['category'],
            groupby=['category'],
            orderby='category_count desc'
        )
        by_category = {item['category']: item['category_count'] for item in by_category_data}

        # 2. Total par sévérité
        by_severity_data = self.read_group(
            domain=domain,
            fields=['severity'],
            groupby=['severity']
        )
        by_severity = {item['severity']: item['severity_count'] for item in by_severity_data}

        # 3. Succès vs échecs
        by_success_data = self.read_group(
            domain=domain,
            fields=['success'],
            groupby=['success']
        )
        by_success = {str(item['success']): item['success_count'] for item in by_success_data}

        # 4. Top utilisateurs (ORM avec iteration)
        logs = self.search(domain, order='user_id')
        user_counts = {}
        for log in logs:
            user_name = log.user_id.name if log.user_id else (log.user_login or 'Système')
            user_counts[user_name] = user_counts.get(user_name, 0) + 1

        top_users = [
            {'name': name, 'count': count}
            for name, count in sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        # 5. Top actions
        by_action_data = self.read_group(
            domain=domain,
            fields=['action'],
            groupby=['action'],
            orderby='action_count desc',
            limit=10
        )
        top_actions = [{'action': item['action'], 'count': item['action_count']} for item in by_action_data]

        # 6. Timeline par jour (ORM groupby date)
        by_date_data = self.read_group(
            domain=domain,
            fields=['create_date:day'],
            groupby=['create_date:day'],
            orderby='create_date:day'
        )
        timeline = [
            {'date': item['create_date:day'], 'count': item['create_date_count']}
            for item in by_date_data
        ]

        return {
            'period_days': days,
            'total': sum(by_category.values()) if by_category else 0,
            'by_category': by_category,
            'by_severity': by_severity,
            'by_success': by_success,
            'top_users': top_users,
            'top_actions': top_actions,
            'timeline': timeline,
        }
