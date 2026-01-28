# -*- coding: utf-8 -*-
"""
Health Check Endpoints pour monitoring et load balancers

Endpoints:
- /api/health          : Health check simple (liveness)
- /api/health/ready    : Readiness check (toutes dépendances)
- /api/health/detailed : Health détaillé avec métriques
"""

import logging
import time
import os
from datetime import datetime
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)

# Version de l'API (à incrémenter à chaque release)
API_VERSION = "1.0.0"
START_TIME = time.time()


class HealthController(http.Controller):
    """Endpoints de health check pour Kubernetes, load balancers, monitoring"""

    @http.route('/api/health', type='http', auth='none', methods=['GET'], csrf=False)
    def health_liveness(self, **kwargs):
        """
        Liveness probe - Le service est-il vivant?

        Utilisé par Kubernetes pour redémarrer le pod si KO.
        Doit être rapide et sans dépendances externes.

        Returns:
            200 OK si le service répond
            503 Service Unavailable sinon
        """
        return request.make_response(
            '{"status":"ok","timestamp":"' + datetime.utcnow().isoformat() + '"}',
            headers=[
                ('Content-Type', 'application/json'),
                ('Cache-Control', 'no-cache, no-store, must-revalidate'),
            ]
        )

    @http.route('/api/health/ready', type='http', auth='none', methods=['GET'], csrf=False)
    def health_readiness(self, **kwargs):
        """
        Readiness probe - Le service est-il prêt à recevoir du trafic?

        Vérifie toutes les dépendances critiques:
        - Base de données PostgreSQL
        - Cache Redis

        Returns:
            200 OK si toutes les dépendances sont OK
            503 Service Unavailable si une dépendance est KO
        """
        checks = {
            'database': self._check_database(),
            'redis': self._check_redis(),
        }

        all_healthy = all(c['status'] == 'ok' for c in checks.values())
        status_code = 200 if all_healthy else 503

        response_data = {
            'status': 'ok' if all_healthy else 'degraded',
            'timestamp': datetime.utcnow().isoformat(),
            'checks': checks,
        }

        import json
        response = request.make_response(
            json.dumps(response_data),
            headers=[
                ('Content-Type', 'application/json'),
                ('Cache-Control', 'no-cache'),
            ]
        )
        response.status_code = status_code
        return response

    @http.route('/api/health/detailed', type='http', auth='none', methods=['GET'], csrf=False)
    def health_detailed(self, **kwargs):
        """
        Health check détaillé avec métriques.

        Retourne des informations complètes sur l'état du système:
        - Uptime
        - Version
        - État des dépendances
        - Métriques de performance

        Note: Cet endpoint peut être plus lent, ne pas utiliser pour probes K8s.
        """
        checks = {
            'database': self._check_database(),
            'redis': self._check_redis(),
            'disk': self._check_disk(),
            'memory': self._check_memory(),
        }

        all_healthy = all(
            c['status'] == 'ok'
            for c in checks.values()
            if c['status'] != 'unknown'
        )

        uptime_seconds = time.time() - START_TIME

        response_data = {
            'status': 'ok' if all_healthy else 'degraded',
            'timestamp': datetime.utcnow().isoformat(),
            'version': API_VERSION,
            'uptime_seconds': round(uptime_seconds, 2),
            'uptime_human': self._format_uptime(uptime_seconds),
            'environment': os.environ.get('ENVIRONMENT', 'development'),
            'checks': checks,
            'metrics': self._get_metrics(),
        }

        import json
        return request.make_response(
            json.dumps(response_data, indent=2),
            headers=[
                ('Content-Type', 'application/json'),
                ('Cache-Control', 'no-cache'),
            ]
        )

    def _check_database(self) -> dict:
        """Vérifie la connexion à PostgreSQL"""
        start = time.time()
        try:
            # Simple query pour vérifier la connexion
            request.env.cr.execute("SELECT 1")
            request.env.cr.fetchone()
            latency = (time.time() - start) * 1000

            return {
                'status': 'ok',
                'latency_ms': round(latency, 2),
            }
        except Exception as e:
            _logger.error(f"Database health check failed: {e}")
            return {
                'status': 'error',
                'error': str(e),
            }

    def _check_redis(self) -> dict:
        """Vérifie la connexion à Redis"""
        start = time.time()
        try:
            from ..lib.cache import get_cache_service
            cache = get_cache_service()

            if not cache.enabled:
                return {
                    'status': 'disabled',
                    'message': 'Redis not configured',
                }

            # Ping Redis
            cache.redis_client.ping()
            latency = (time.time() - start) * 1000

            # Stats Redis
            stats = cache.get_stats()

            return {
                'status': 'ok',
                'latency_ms': round(latency, 2),
                'hit_rate': stats.get('hit_rate', 0),
            }
        except Exception as e:
            _logger.error(f"Redis health check failed: {e}")
            return {
                'status': 'error',
                'error': str(e),
            }

    def _check_disk(self) -> dict:
        """Vérifie l'espace disque disponible"""
        try:
            import shutil
            total, used, free = shutil.disk_usage("/")

            free_percent = (free / total) * 100
            status = 'ok' if free_percent > 10 else 'warning' if free_percent > 5 else 'critical'

            return {
                'status': status,
                'total_gb': round(total / (1024**3), 2),
                'used_gb': round(used / (1024**3), 2),
                'free_gb': round(free / (1024**3), 2),
                'free_percent': round(free_percent, 2),
            }
        except Exception as e:
            return {
                'status': 'unknown',
                'error': str(e),
            }

    def _check_memory(self) -> dict:
        """Vérifie l'utilisation mémoire"""
        try:
            import resource
            usage = resource.getrusage(resource.RUSAGE_SELF)

            return {
                'status': 'ok',
                'rss_mb': round(usage.ru_maxrss / 1024, 2),  # macOS: bytes, Linux: KB
            }
        except Exception as e:
            return {
                'status': 'unknown',
                'error': str(e),
            }

    def _get_metrics(self) -> dict:
        """Récupère les métriques de performance"""
        try:
            from ..lib.rate_limiter import get_rate_limiter
            from ..lib.cache import get_cache_service

            cache = get_cache_service()
            cache_stats = cache.get_stats() if cache.enabled else {}

            return {
                'cache': {
                    'enabled': cache.enabled,
                    'hit_rate': cache_stats.get('hit_rate', 0),
                    'total_commands': cache_stats.get('total_commands', 0),
                },
            }
        except Exception:
            return {}

    def _format_uptime(self, seconds: float) -> str:
        """Formate l'uptime en format lisible"""
        days, remainder = divmod(int(seconds), 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, secs = divmod(remainder, 60)

        parts = []
        if days:
            parts.append(f"{days}d")
        if hours:
            parts.append(f"{hours}h")
        if minutes:
            parts.append(f"{minutes}m")
        parts.append(f"{secs}s")

        return " ".join(parts)
