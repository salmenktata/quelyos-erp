# -*- coding: utf-8 -*-
"""
WAF Rules - Web Application Firewall
Règles de filtrage contre injections SQL, XSS, patterns suspects
"""

import re
import json
from datetime import datetime, timedelta
from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class WAFRule(models.Model):
    """Règles WAF personnalisables"""
    _name = 'quelyos.waf.rule'
    _description = 'Règle WAF'
    _order = 'priority desc, id'

    name = fields.Char('Nom', required=True)
    active = fields.Boolean('Actif', default=True)
    priority = fields.Integer('Priorité', default=10)

    # Type de règle
    rule_type = fields.Selection([
        ('sql_injection', 'Injection SQL'),
        ('xss', 'Cross-Site Scripting (XSS)'),
        ('path_traversal', 'Path Traversal'),
        ('command_injection', 'Injection de commande'),
        ('file_inclusion', 'Inclusion de fichier'),
        ('custom_pattern', 'Pattern personnalisé'),
        ('user_agent', 'User Agent suspect'),
    ], string='Type', default='custom_pattern', required=True)

    # Pattern de détection
    pattern = fields.Char('Pattern (Regex)', help="Expression régulière de détection")
    pattern_flags = fields.Selection([
        ('i', 'Insensible à la casse'),
        ('m', 'Multi-ligne'),
        ('s', 'Dotall'),
    ], string='Flags regex', default='i')

    # Cible d'inspection
    inspect_target = fields.Selection([
        ('url', 'URL'),
        ('query_params', 'Paramètres GET'),
        ('body', 'Corps de requête'),
        ('headers', 'En-têtes'),
        ('cookies', 'Cookies'),
        ('all', 'Tout'),
    ], string='Cible inspection', default='all')

    # Action
    action = fields.Selection([
        ('block', 'Bloquer'),
        ('log', 'Logger seulement'),
        ('sanitize', 'Nettoyer'),
    ], string='Action', default='block', required=True)

    block_response_code = fields.Integer('Code HTTP blocage', default=403)
    block_message = fields.Char('Message blocage', default='Request blocked by security rules')

    # Exclusions
    exclude_ips = fields.Text('IPs exclues', help="Une IP par ligne")
    exclude_endpoints = fields.Text('Endpoints exclus', help="Un pattern par ligne")
    exclude_users = fields.Many2many('res.users', string='Utilisateurs exclus')

    # Statistiques
    total_matches = fields.Integer('Total détections', readonly=True, default=0)
    total_blocks = fields.Integer('Total blocages', readonly=True, default=0)
    last_triggered = fields.Datetime('Dernier déclenchement', readonly=True)

    # Métadonnées
    description = fields.Text('Description')
    cwe_id = fields.Char('CWE ID', help="Common Weakness Enumeration")
    owasp_category = fields.Char('Catégorie OWASP')

    @api.model
    def get_default_rules(self):
        """Retourne les règles par défaut à créer"""
        return [
            {
                'name': 'SQL Injection - Basic',
                'rule_type': 'sql_injection',
                'pattern': r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|WHERE|TABLE)\b)|('.*--)|(\bOR\b.*=.*\bOR\b)",
                'inspect_target': 'all',
                'action': 'block',
                'cwe_id': 'CWE-89',
                'owasp_category': 'A03:2021-Injection',
                'priority': 100,
            },
            {
                'name': 'XSS - Script Tags',
                'rule_type': 'xss',
                'pattern': r"<script[^>]*>.*?</script>|javascript:|on\w+\s*=",
                'inspect_target': 'all',
                'action': 'block',
                'cwe_id': 'CWE-79',
                'owasp_category': 'A03:2021-Injection',
                'priority': 100,
            },
            {
                'name': 'Path Traversal',
                'rule_type': 'path_traversal',
                'pattern': r"\.\./|\.\.\\|%2e%2e%2f|%2e%2e/|\.%2e/|%2e\./",
                'inspect_target': 'url',
                'action': 'block',
                'cwe_id': 'CWE-22',
                'owasp_category': 'A01:2021-Broken Access Control',
                'priority': 90,
            },
            {
                'name': 'Command Injection',
                'rule_type': 'command_injection',
                'pattern': r"[;&|`$]|\b(cat|ls|dir|wget|curl|nc|bash|sh|cmd)\b.*[|;]",
                'inspect_target': 'all',
                'action': 'block',
                'cwe_id': 'CWE-78',
                'owasp_category': 'A03:2021-Injection',
                'priority': 100,
            },
            {
                'name': 'Suspicious User Agents',
                'rule_type': 'user_agent',
                'pattern': r"(sqlmap|nikto|nmap|masscan|zgrab|gobuster|dirbuster|burpsuite)",
                'inspect_target': 'headers',
                'action': 'block',
                'priority': 80,
            },
        ]

    @api.model
    def init_default_rules(self):
        """Initialise les règles par défaut si elles n'existent pas"""
        for rule_data in self.get_default_rules():
            existing = self.search([('name', '=', rule_data['name'])], limit=1)
            if not existing:
                self.create(rule_data)
                _logger.info(f"WAF: règle '{rule_data['name']}' créée")

    @api.model
    def check_request(self, request_data):
        """
        Vérifie une requête contre toutes les règles WAF actives
        request_data: dict avec url, params, body, headers, cookies, ip, user_id
        Retourne: (allowed: bool, rule: record, message: str)
        """
        rules = self.search([('active', '=', True)], order='priority desc')

        for rule in rules:
            if rule._is_excluded(request_data):
                continue

            if rule._matches_pattern(request_data):
                rule.sudo().write({
                    'total_matches': rule.total_matches + 1,
                    'last_triggered': fields.Datetime.now()
                })

                if rule.action == 'block':
                    rule.sudo().write({'total_blocks': rule.total_blocks + 1})
                    self.env['quelyos.waf.log'].sudo().create({
                        'rule_id': rule.id,
                        'ip_address': request_data.get('ip'),
                        'url': request_data.get('url'),
                        'matched_content': rule._get_matched_content(request_data)[:500],
                        'action_taken': 'block',
                        'user_id': request_data.get('user_id'),
                    })
                    return False, rule, rule.block_message

                elif rule.action == 'log':
                    self.env['quelyos.waf.log'].sudo().create({
                        'rule_id': rule.id,
                        'ip_address': request_data.get('ip'),
                        'url': request_data.get('url'),
                        'matched_content': rule._get_matched_content(request_data)[:500],
                        'action_taken': 'log',
                        'user_id': request_data.get('user_id'),
                    })

        return True, None, ''

    def _is_excluded(self, request_data):
        """Vérifie si la requête est exclue de cette règle"""
        self.ensure_one()

        if self.exclude_ips:
            excluded_ips = [ip.strip() for ip in self.exclude_ips.split('\n') if ip.strip()]
            if request_data.get('ip') in excluded_ips:
                return True

        if self.exclude_endpoints:
            import fnmatch
            excluded_patterns = [p.strip() for p in self.exclude_endpoints.split('\n') if p.strip()]
            url = request_data.get('url', '')
            for pattern in excluded_patterns:
                if fnmatch.fnmatch(url, pattern):
                    return True

        if self.exclude_users:
            user_id = request_data.get('user_id')
            if user_id and user_id in self.exclude_users.ids:
                return True

        return False

    def _matches_pattern(self, request_data):
        """Vérifie si le pattern match la requête"""
        self.ensure_one()

        if not self.pattern:
            return False

        flags = re.IGNORECASE if self.pattern_flags == 'i' else 0
        if self.pattern_flags == 'm':
            flags |= re.MULTILINE
        if self.pattern_flags == 's':
            flags |= re.DOTALL

        try:
            regex = re.compile(self.pattern, flags)
        except re.error as e:
            _logger.error(f"WAF règle {self.name}: pattern regex invalide: {e}")
            return False

        content_to_check = []

        if self.inspect_target in ('url', 'all'):
            content_to_check.append(request_data.get('url', ''))

        if self.inspect_target in ('query_params', 'all'):
            params = request_data.get('params', {})
            if isinstance(params, dict):
                content_to_check.extend(str(v) for v in params.values())

        if self.inspect_target in ('body', 'all'):
            body = request_data.get('body', '')
            if isinstance(body, dict):
                content_to_check.append(json.dumps(body))
            else:
                content_to_check.append(str(body))

        if self.inspect_target in ('headers', 'all'):
            headers = request_data.get('headers', {})
            if isinstance(headers, dict):
                content_to_check.extend(str(v) for v in headers.values())

        if self.inspect_target in ('cookies', 'all'):
            cookies = request_data.get('cookies', {})
            if isinstance(cookies, dict):
                content_to_check.extend(str(v) for v in cookies.values())

        for content in content_to_check:
            if regex.search(content):
                return True

        return False

    def _get_matched_content(self, request_data):
        """Retourne le contenu qui a matché (pour le log)"""
        self.ensure_one()
        parts = []

        if self.inspect_target in ('url', 'all'):
            parts.append(f"URL: {request_data.get('url', '')}")
        if self.inspect_target in ('body', 'all') and request_data.get('body'):
            parts.append(f"Body: {str(request_data.get('body'))[:200]}")
        if self.inspect_target in ('query_params', 'all') and request_data.get('params'):
            parts.append(f"Params: {request_data.get('params')}")

        return ' | '.join(parts)

    @api.model
    def get_all_rules(self):
        """Retourne toutes les règles WAF formatées pour l'API"""
        rules = self.search([], order='priority desc')
        return [{
            'id': rule.id,
            'name': rule.name,
            'active': rule.active,
            'priority': rule.priority,
            'rule_type': rule.rule_type,
            'pattern': rule.pattern,
            'inspect_target': rule.inspect_target,
            'action': rule.action,
            'total_matches': rule.total_matches,
            'total_blocks': rule.total_blocks,
            'last_triggered': rule.last_triggered.isoformat() if rule.last_triggered else None,
            'description': rule.description,
            'cwe_id': rule.cwe_id,
            'owasp_category': rule.owasp_category,
        } for rule in rules]


class WAFLog(models.Model):
    """Logs des événements WAF"""
    _name = 'quelyos.waf.log'
    _description = 'Log WAF'
    _order = 'timestamp desc'

    timestamp = fields.Datetime('Date/Heure', default=fields.Datetime.now, required=True, index=True)
    rule_id = fields.Many2one('quelyos.waf.rule', string='Règle', ondelete='set null')
    rule_name = fields.Char('Nom règle', related='rule_id.name', store=True)

    ip_address = fields.Char('Adresse IP', index=True)
    url = fields.Char('URL')
    matched_content = fields.Text('Contenu détecté')

    action_taken = fields.Selection([
        ('block', 'Bloqué'),
        ('log', 'Loggé'),
        ('sanitize', 'Nettoyé'),
    ], string='Action')

    user_id = fields.Many2one('res.users', string='Utilisateur')

    @api.model
    def get_recent_logs(self, limit=100):
        """Retourne les logs WAF récents"""
        logs = self.search([], limit=limit, order='timestamp desc')
        return [{
            'id': log.id,
            'timestamp': log.timestamp.isoformat() if log.timestamp else None,
            'rule_name': log.rule_name,
            'ip_address': log.ip_address,
            'url': log.url,
            'action_taken': log.action_taken,
            'matched_content': log.matched_content[:200] if log.matched_content else None,
        } for log in logs]

    @api.model
    def get_statistics(self, days=7):
        """Statistiques WAF sur N jours"""
        date_from = datetime.now() - timedelta(days=days)

        self.env.cr.execute("""
            SELECT r.name, COUNT(*) as count
            FROM quelyos_waf_log l
            JOIN quelyos_waf_rule r ON l.rule_id = r.id
            WHERE l.timestamp >= %s
            GROUP BY r.name
            ORDER BY count DESC
            LIMIT 10
        """, [date_from])
        by_rule = [{'rule': r[0], 'count': r[1]} for r in self.env.cr.fetchall()]

        self.env.cr.execute("""
            SELECT action_taken, COUNT(*) as count
            FROM quelyos_waf_log
            WHERE timestamp >= %s
            GROUP BY action_taken
        """, [date_from])
        by_action = dict(self.env.cr.fetchall())

        self.env.cr.execute("""
            SELECT ip_address, COUNT(*) as count
            FROM quelyos_waf_log
            WHERE timestamp >= %s AND action_taken = 'block'
            GROUP BY ip_address
            ORDER BY count DESC
            LIMIT 10
        """, [date_from])
        top_blocked_ips = [{'ip': r[0], 'count': r[1]} for r in self.env.cr.fetchall()]

        self.env.cr.execute("""
            SELECT DATE(timestamp) as day,
                   COUNT(*) FILTER (WHERE action_taken = 'block') as blocked,
                   COUNT(*) FILTER (WHERE action_taken = 'log') as logged
            FROM quelyos_waf_log
            WHERE timestamp >= %s
            GROUP BY DATE(timestamp)
            ORDER BY day
        """, [date_from])
        timeline = [{'date': str(r[0]), 'blocked': r[1], 'logged': r[2]} for r in self.env.cr.fetchall()]

        return {
            'period_days': days,
            'total_events': sum(by_action.values()) if by_action else 0,
            'total_blocked': by_action.get('block', 0),
            'by_rule': by_rule,
            'by_action': by_action,
            'top_blocked_ips': top_blocked_ips,
            'timeline': timeline,
        }

    @api.autovacuum
    def _gc_old_logs(self):
        """Nettoyer les logs de plus de 30 jours"""
        limit_date = datetime.now() - timedelta(days=30)
        old_logs = self.search([('timestamp', '<', limit_date)])
        count = len(old_logs)
        old_logs.unlink()
        _logger.info(f"WAF logs: {count} entrées supprimées")
