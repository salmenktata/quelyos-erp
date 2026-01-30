# -*- coding: utf-8 -*-
"""
Rate Limiting - Protection contre les abus et DDoS
Gère les limites de requêtes par IP, utilisateur et endpoint
"""

import time
import hashlib
from datetime import datetime, timedelta
from odoo import models, fields, api
import logging

_logger = logging.getLogger(__name__)


class RateLimitRule(models.Model):
    """Règles de rate limiting configurables"""
    _name = 'quelyos.rate.limit.rule'
    _description = 'Règle de Rate Limiting'
    _order = 'priority desc, id'

    name = fields.Char('Nom', required=True)
    active = fields.Boolean('Actif', default=True)
    priority = fields.Integer('Priorité', default=10, help="Plus élevé = prioritaire")

    # Cible
    target_type = fields.Selection([
        ('global', 'Global'),
        ('endpoint', 'Endpoint spécifique'),
        ('ip', 'IP spécifique'),
        ('user', 'Utilisateur spécifique'),
    ], string='Type de cible', default='endpoint', required=True)

    endpoint_pattern = fields.Char('Pattern Endpoint', help="Ex: /api/auth/*, /api/super-admin/*")
    ip_address = fields.Char('Adresse IP')
    user_id = fields.Many2one('res.users', string='Utilisateur')

    # Limites
    requests_limit = fields.Integer('Limite requêtes', default=100, required=True)
    time_window = fields.Integer('Fenêtre (secondes)', default=60, required=True)
    burst_limit = fields.Integer('Limite burst', default=20, help="Requêtes max instantanées")

    # Actions
    action_type = fields.Selection([
        ('block', 'Bloquer'),
        ('throttle', 'Ralentir'),
        ('captcha', 'Demander CAPTCHA'),
        ('warn', 'Avertir seulement'),
    ], string='Action', default='block', required=True)

    block_duration = fields.Integer('Durée blocage (secondes)', default=300)

    # Statistiques
    total_hits = fields.Integer('Total requêtes', readonly=True, default=0)
    total_blocks = fields.Integer('Total blocages', readonly=True, default=0)
    last_triggered = fields.Datetime('Dernier déclenchement', readonly=True)

    @api.model
    def check_rate_limit(self, ip_address, endpoint, user_id=None):
        """
        Vérifie si une requête est autorisée selon les règles de rate limiting
        Retourne: (allowed: bool, rule: record, retry_after: int)
        """
        # Chercher les règles applicables
        domain = [('active', '=', True)]
        rules = self.search(domain, order='priority desc')

        for rule in rules:
            if rule._matches_request(ip_address, endpoint, user_id):
                allowed, retry_after = rule._check_limit(ip_address, endpoint, user_id)
                if not allowed:
                    rule.sudo().write({
                        'total_blocks': rule.total_blocks + 1,
                        'last_triggered': fields.Datetime.now()
                    })
                    return False, rule, retry_after
                rule.sudo().write({'total_hits': rule.total_hits + 1})

        return True, None, 0

    def _matches_request(self, ip_address, endpoint, user_id):
        """Vérifie si la règle s'applique à la requête"""
        self.ensure_one()

        if self.target_type == 'global':
            return True
        elif self.target_type == 'endpoint' and self.endpoint_pattern:
            import fnmatch
            return fnmatch.fnmatch(endpoint, self.endpoint_pattern)
        elif self.target_type == 'ip' and self.ip_address:
            return ip_address == self.ip_address
        elif self.target_type == 'user' and self.user_id:
            return user_id == self.user_id.id

        return False

    def _check_limit(self, ip_address, endpoint, user_id):
        """Vérifie la limite pour cette règle"""
        self.ensure_one()

        # Clé unique pour le compteur
        key_parts = [str(self.id), ip_address or '', endpoint or '', str(user_id or '')]
        key = hashlib.md5(':'.join(key_parts).encode()).hexdigest()

        # Récupérer ou créer le compteur
        Counter = self.env['quelyos.rate.limit.counter']
        counter = Counter.sudo().search([('key', '=', key)], limit=1)

        now = datetime.now()
        window_start = now - timedelta(seconds=self.time_window)

        if not counter:
            counter = Counter.sudo().create({
                'key': key,
                'rule_id': self.id,
                'count': 1,
                'window_start': now,
                'blocked_until': False,
            })
            return True, 0

        # Vérifier si bloqué
        if counter.blocked_until and counter.blocked_until > now:
            retry_after = int((counter.blocked_until - now).total_seconds())
            return False, retry_after

        # Reset si fenêtre expirée
        if counter.window_start < window_start:
            counter.sudo().write({
                'count': 1,
                'window_start': now,
                'blocked_until': False,
            })
            return True, 0

        # Incrémenter et vérifier
        new_count = counter.count + 1

        if new_count > self.requests_limit:
            blocked_until = now + timedelta(seconds=self.block_duration)
            counter.sudo().write({
                'count': new_count,
                'blocked_until': blocked_until,
            })
            return False, self.block_duration

        counter.sudo().write({'count': new_count})
        return True, 0


class RateLimitCounter(models.Model):
    """Compteurs de rate limiting (table temporaire)"""
    _name = 'quelyos.rate.limit.counter'
    _description = 'Compteur Rate Limiting'

    key = fields.Char('Clé', required=True, index=True)
    rule_id = fields.Many2one('quelyos.rate.limit.rule', string='Règle', ondelete='cascade')
    count = fields.Integer('Compteur', default=0)
    window_start = fields.Datetime('Début fenêtre')
    blocked_until = fields.Datetime('Bloqué jusqu\'à')

    @api.autovacuum
    def _gc_expired_counters(self):
        """Nettoyer les compteurs expirés (cron)"""
        limit_date = datetime.now() - timedelta(hours=24)
        expired = self.search([('window_start', '<', limit_date)])
        expired.unlink()
        _logger.info(f"Rate limit: {len(expired)} compteurs expirés supprimés")
