# -*- coding: utf-8 -*-
"""
API Analytics pour Quelyos ERP

Analytics d'utilisation de l'API:
- Tracking des appels
- Métriques de performance
- Patterns d'utilisation
- Rapports de consommation
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from functools import wraps
from collections import defaultdict

_logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
ANALYTICS_PREFIX = 'quelyos:analytics:'


@dataclass
class APICallMetrics:
    """Métriques d'un appel API"""
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    user_id: Optional[int]
    api_key: Optional[str]
    timestamp: datetime
    request_size: int = 0
    response_size: int = 0
    error: Optional[str] = None


class APIAnalytics:
    """Service d'analytics API"""

    def __init__(self):
        self._redis = None
        self._buffer: List[APICallMetrics] = []
        self._buffer_size = 100
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            self._redis = redis.from_url(REDIS_URL)
            self._redis.ping()
        except Exception as e:
            _logger.warning(f"Redis not available for analytics: {e}")

    def track(self, metrics: APICallMetrics):
        """Enregistre un appel API"""
        self._buffer.append(metrics)

        # Flush si buffer plein
        if len(self._buffer) >= self._buffer_size:
            self._flush()

    def _flush(self):
        """Envoie le buffer vers Redis"""
        if not self._redis or not self._buffer:
            return

        pipe = self._redis.pipeline()
        now = datetime.utcnow()

        for m in self._buffer:
            # Clés temporelles
            minute_key = m.timestamp.strftime('%Y-%m-%d:%H:%M')
            hour_key = m.timestamp.strftime('%Y-%m-%d:%H')
            day_key = m.timestamp.strftime('%Y-%m-%d')

            # Compteur global
            pipe.hincrby(
                f"{ANALYTICS_PREFIX}calls:{day_key}",
                m.endpoint,
                1
            )

            # Temps de réponse (pour moyenne)
            pipe.lpush(
                f"{ANALYTICS_PREFIX}latency:{hour_key}:{m.endpoint}",
                m.response_time_ms
            )
            pipe.ltrim(
                f"{ANALYTICS_PREFIX}latency:{hour_key}:{m.endpoint}",
                0, 999  # Garder 1000 dernières valeurs
            )

            # Erreurs
            if m.error or m.status_code >= 400:
                pipe.hincrby(
                    f"{ANALYTICS_PREFIX}errors:{day_key}",
                    f"{m.endpoint}:{m.status_code}",
                    1
                )

            # Par utilisateur
            if m.user_id:
                pipe.hincrby(
                    f"{ANALYTICS_PREFIX}users:{day_key}",
                    str(m.user_id),
                    1
                )

            # Par API key
            if m.api_key:
                pipe.hincrby(
                    f"{ANALYTICS_PREFIX}apikeys:{day_key}",
                    m.api_key[:16],  # Tronquer pour confidentialité
                    1
                )

            # Bande passante
            pipe.incrby(
                f"{ANALYTICS_PREFIX}bandwidth:{day_key}:in",
                m.request_size
            )
            pipe.incrby(
                f"{ANALYTICS_PREFIX}bandwidth:{day_key}:out",
                m.response_size
            )

        # Expiration des clés (30 jours)
        for key_pattern in ['calls:', 'latency:', 'errors:', 'users:', 'apikeys:', 'bandwidth:']:
            pattern = f"{ANALYTICS_PREFIX}{key_pattern}*"
            for key in self._redis.scan_iter(pattern):
                pipe.expire(key, 86400 * 30)

        pipe.execute()
        self._buffer.clear()

    def get_overview(self, days: int = 7) -> Dict[str, Any]:
        """Vue d'ensemble des analytics"""
        if not self._redis:
            return {}

        now = datetime.utcnow()
        overview = {
            'period_days': days,
            'total_calls': 0,
            'total_errors': 0,
            'avg_response_time_ms': 0,
            'bandwidth': {'in': 0, 'out': 0},
            'top_endpoints': [],
            'top_users': [],
            'daily_calls': [],
        }

        latencies = []

        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')

            # Appels par endpoint
            calls = self._redis.hgetall(f"{ANALYTICS_PREFIX}calls:{day_key}")
            day_total = sum(int(v) for v in calls.values())
            overview['total_calls'] += day_total
            overview['daily_calls'].append({
                'date': day_key,
                'calls': day_total,
            })

            # Erreurs
            errors = self._redis.hgetall(f"{ANALYTICS_PREFIX}errors:{day_key}")
            overview['total_errors'] += sum(int(v) for v in errors.values())

            # Bande passante
            bw_in = self._redis.get(f"{ANALYTICS_PREFIX}bandwidth:{day_key}:in")
            bw_out = self._redis.get(f"{ANALYTICS_PREFIX}bandwidth:{day_key}:out")
            overview['bandwidth']['in'] += int(bw_in or 0)
            overview['bandwidth']['out'] += int(bw_out or 0)

        # Top endpoints (agrégé)
        endpoint_totals: Dict[str, int] = defaultdict(int)
        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')
            calls = self._redis.hgetall(f"{ANALYTICS_PREFIX}calls:{day_key}")
            for endpoint, count in calls.items():
                endpoint_totals[endpoint.decode() if isinstance(endpoint, bytes) else endpoint] += int(count)

        overview['top_endpoints'] = sorted(
            [{'endpoint': k, 'calls': v} for k, v in endpoint_totals.items()],
            key=lambda x: x['calls'],
            reverse=True
        )[:10]

        # Top users
        user_totals: Dict[str, int] = defaultdict(int)
        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')
            users = self._redis.hgetall(f"{ANALYTICS_PREFIX}users:{day_key}")
            for user_id, count in users.items():
                user_totals[user_id.decode() if isinstance(user_id, bytes) else user_id] += int(count)

        overview['top_users'] = sorted(
            [{'user_id': k, 'calls': v} for k, v in user_totals.items()],
            key=lambda x: x['calls'],
            reverse=True
        )[:10]

        # Calcul latence moyenne
        for day_offset in range(min(days, 1)):  # Seulement dernières 24h pour perf
            date = now - timedelta(days=day_offset)
            hour_key = date.strftime('%Y-%m-%d:%H')
            for endpoint in endpoint_totals.keys():
                values = self._redis.lrange(
                    f"{ANALYTICS_PREFIX}latency:{hour_key}:{endpoint}",
                    0, 100
                )
                latencies.extend(float(v) for v in values)

        if latencies:
            overview['avg_response_time_ms'] = round(sum(latencies) / len(latencies), 2)

        # Taux d'erreur
        if overview['total_calls'] > 0:
            overview['error_rate'] = round(
                overview['total_errors'] / overview['total_calls'] * 100, 2
            )
        else:
            overview['error_rate'] = 0

        return overview

    def get_endpoint_stats(
        self,
        endpoint: str,
        days: int = 7
    ) -> Dict[str, Any]:
        """Statistiques détaillées pour un endpoint"""
        if not self._redis:
            return {}

        now = datetime.utcnow()
        stats = {
            'endpoint': endpoint,
            'period_days': days,
            'total_calls': 0,
            'total_errors': 0,
            'latency': {
                'avg': 0,
                'min': 0,
                'max': 0,
                'p50': 0,
                'p95': 0,
                'p99': 0,
            },
            'daily': [],
        }

        all_latencies = []

        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')

            # Appels
            calls = self._redis.hget(f"{ANALYTICS_PREFIX}calls:{day_key}", endpoint)
            day_calls = int(calls or 0)
            stats['total_calls'] += day_calls

            # Erreurs
            errors_data = self._redis.hgetall(f"{ANALYTICS_PREFIX}errors:{day_key}")
            day_errors = sum(
                int(v) for k, v in errors_data.items()
                if (k.decode() if isinstance(k, bytes) else k).startswith(endpoint)
            )
            stats['total_errors'] += day_errors

            stats['daily'].append({
                'date': day_key,
                'calls': day_calls,
                'errors': day_errors,
            })

            # Latences
            for hour in range(24):
                hour_dt = date.replace(hour=hour)
                hour_key = hour_dt.strftime('%Y-%m-%d:%H')
                values = self._redis.lrange(
                    f"{ANALYTICS_PREFIX}latency:{hour_key}:{endpoint}",
                    0, -1
                )
                all_latencies.extend(float(v) for v in values)

        # Calcul percentiles
        if all_latencies:
            all_latencies.sort()
            n = len(all_latencies)

            stats['latency'] = {
                'avg': round(sum(all_latencies) / n, 2),
                'min': round(all_latencies[0], 2),
                'max': round(all_latencies[-1], 2),
                'p50': round(all_latencies[int(n * 0.5)], 2),
                'p95': round(all_latencies[int(n * 0.95)], 2),
                'p99': round(all_latencies[int(n * 0.99)], 2),
            }

        return stats

    def get_user_stats(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Statistiques pour un utilisateur"""
        if not self._redis:
            return {}

        now = datetime.utcnow()
        stats = {
            'user_id': user_id,
            'period_days': days,
            'total_calls': 0,
            'daily': [],
        }

        for day_offset in range(days):
            date = now - timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')

            calls = self._redis.hget(
                f"{ANALYTICS_PREFIX}users:{day_key}",
                str(user_id)
            )
            day_calls = int(calls or 0)
            stats['total_calls'] += day_calls
            stats['daily'].append({
                'date': day_key,
                'calls': day_calls,
            })

        return stats


# Singleton
_analytics = None


def get_analytics() -> APIAnalytics:
    """Retourne le service analytics"""
    global _analytics
    if _analytics is None:
        _analytics = APIAnalytics()
    return _analytics


def track_api_call():
    """
    Décorateur pour tracker les appels API.

    Usage:
        @track_api_call()
        def my_endpoint(self, **kwargs):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            from odoo.http import request
            import time

            start = time.time()

            # Extraire infos request
            endpoint = request.httprequest.path
            method = request.httprequest.method
            user_id = request.env.uid if hasattr(request, 'env') else None
            api_key = request.httprequest.headers.get('X-API-Key')
            request_size = request.httprequest.content_length or 0

            try:
                result = func(self, *args, **kwargs)

                # Calculer taille réponse
                response_size = 0
                if isinstance(result, dict):
                    response_size = len(json.dumps(result))
                elif isinstance(result, (str, bytes)):
                    response_size = len(result)

                # Tracker
                metrics = APICallMetrics(
                    endpoint=endpoint,
                    method=method,
                    status_code=200,
                    response_time_ms=(time.time() - start) * 1000,
                    user_id=user_id,
                    api_key=api_key,
                    timestamp=datetime.utcnow(),
                    request_size=request_size,
                    response_size=response_size,
                )
                get_analytics().track(metrics)

                return result

            except Exception as e:
                # Tracker l'erreur
                metrics = APICallMetrics(
                    endpoint=endpoint,
                    method=method,
                    status_code=500,
                    response_time_ms=(time.time() - start) * 1000,
                    user_id=user_id,
                    api_key=api_key,
                    timestamp=datetime.utcnow(),
                    request_size=request_size,
                    error=str(e),
                )
                get_analytics().track(metrics)
                raise

        return wrapper
    return decorator
