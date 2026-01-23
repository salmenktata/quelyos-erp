# -*- coding: utf-8 -*-

import time
import logging
from functools import wraps
from odoo.http import request

_api_logger = logging.getLogger('quelyos.ecommerce.api')

# Champs sensibles à masquer dans les logs
SENSITIVE_FIELDS = {
    'password', 'passwd', 'pwd', 'api_key', 'token', 'secret',
    'credit_card', 'card_number', 'cvv', 'card_cvv', 'payment_token',
    'stripe_secret', 'webhook_secret', 'access_token', 'refresh_token'
}


def log_api_call(func):
    """
    Décorateur pour logger les appels API avec timing et monitoring.

    Logs:
    - Endpoint appelé
    - Paramètres de requête (avec masquage des données sensibles)
    - Durée d'exécution
    - Résultat (success/error)
    - Informations utilisateur (ID, IP)

    Usage:
        @http.route('/api/ecommerce/products', ...)
        @log_api_call
        @rate_limit(limit=100, window=60)
        def get_products(self, **kwargs):
            # ... logique
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()

        # Identifier l'endpoint
        endpoint = func.__name__
        route = getattr(func, '_routing', {}).get('routes', [None])[0]

        # Identifier le client
        user_id = request.session.uid if request.session.uid else 'anonymous'
        ip_address = request.httprequest.remote_addr

        # Extraire et masquer les paramètres sensibles
        try:
            params = request.jsonrequest or {}
            if not isinstance(params, dict):
                params = {}

            # Masquer les champs sensibles
            safe_params = _mask_sensitive_data(params)
        except Exception:
            safe_params = {}

        # Log de début
        _api_logger.info(
            f"API Call Started | "
            f"Endpoint: {endpoint} | "
            f"Route: {route} | "
            f"User: {user_id} | "
            f"IP: {ip_address} | "
            f"Params: {safe_params}"
        )

        try:
            # Exécuter la fonction
            result = func(*args, **kwargs)

            # Calculer la durée
            elapsed = time.time() - start_time

            # Déterminer le succès
            success = result.get('success', False) if isinstance(result, dict) else True

            # Log de succès
            if success:
                _api_logger.info(
                    f"API Call Success | "
                    f"Endpoint: {endpoint} | "
                    f"User: {user_id} | "
                    f"Duration: {elapsed:.3f}s | "
                    f"Status: SUCCESS"
                )
            else:
                error_msg = result.get('error', 'Unknown error') if isinstance(result, dict) else 'Unknown'
                _api_logger.warning(
                    f"API Call Failed | "
                    f"Endpoint: {endpoint} | "
                    f"User: {user_id} | "
                    f"Duration: {elapsed:.3f}s | "
                    f"Status: FAILED | "
                    f"Error: {error_msg}"
                )

            # Monitoring: Alert si durée > 2 secondes
            if elapsed > 2.0:
                _api_logger.warning(
                    f"SLOW API CALL | "
                    f"Endpoint: {endpoint} took {elapsed:.3f}s | "
                    f"Consider optimization"
                )

            return result

        except Exception as e:
            # Calculer la durée même en cas d'erreur
            elapsed = time.time() - start_time

            # Log d'erreur
            _api_logger.error(
                f"API Call Exception | "
                f"Endpoint: {endpoint} | "
                f"User: {user_id} | "
                f"Duration: {elapsed:.3f}s | "
                f"Status: EXCEPTION | "
                f"Error: {str(e)}",
                exc_info=True
            )

            # Re-raise l'exception
            raise

    return wrapper


def _mask_sensitive_data(data, depth=0):
    """
    Masque les données sensibles dans un dictionnaire (récursif).

    Args:
        data: Dictionnaire à nettoyer
        depth: Profondeur actuelle (limite à 5 pour éviter récursion infinie)

    Returns:
        Dictionnaire avec données sensibles masquées
    """
    if depth > 5:
        return "..."

    if not isinstance(data, dict):
        return data

    masked = {}
    for key, value in data.items():
        key_lower = key.lower()

        # Vérifier si la clé contient un mot sensible
        is_sensitive = any(sensitive in key_lower for sensitive in SENSITIVE_FIELDS)

        if is_sensitive:
            # Masquer complètement
            masked[key] = "***MASKED***"
        elif isinstance(value, dict):
            # Récursion pour les dictionnaires imbriqués
            masked[key] = _mask_sensitive_data(value, depth + 1)
        elif isinstance(value, list):
            # Traiter les listes
            if value and isinstance(value[0], dict):
                masked[key] = [_mask_sensitive_data(item, depth + 1) for item in value[:3]]
                if len(value) > 3:
                    masked[key].append(f"... ({len(value) - 3} more items)")
            else:
                masked[key] = value[:10]  # Limiter les grandes listes
                if len(value) > 10:
                    masked[key].append(f"... ({len(value) - 10} more)")
        else:
            # Valeur simple
            masked[key] = value

    return masked


def get_api_statistics(hours=24):
    """
    Récupère les statistiques d'utilisation de l'API.

    NOTE: Cette fonction nécessite que les logs soient stockés dans un système
    de monitoring (ELK, Datadog, etc.) pour l'analyse.

    Args:
        hours: Nombre d'heures à analyser

    Returns:
        dict: Statistiques d'utilisation
    """
    # TODO: Implémenter l'analyse des logs
    # Cela nécessite un système de monitoring externe
    return {
        'message': 'Statistics requires external monitoring system (ELK, Datadog, etc.)',
        'hours': hours,
    }


class APIMetrics:
    """
    Classe pour collecter des métriques sur les appels API.

    Permet de tracker:
    - Nombre d'appels par endpoint
    - Durées moyennes/min/max
    - Taux d'erreur
    - Endpoints les plus lents
    """

    def __init__(self):
        self.metrics = {}

    def record_call(self, endpoint, duration, success):
        """Enregistre un appel API."""
        if endpoint not in self.metrics:
            self.metrics[endpoint] = {
                'total_calls': 0,
                'success_calls': 0,
                'failed_calls': 0,
                'total_duration': 0,
                'min_duration': float('inf'),
                'max_duration': 0,
            }

        m = self.metrics[endpoint]
        m['total_calls'] += 1

        if success:
            m['success_calls'] += 1
        else:
            m['failed_calls'] += 1

        m['total_duration'] += duration
        m['min_duration'] = min(m['min_duration'], duration)
        m['max_duration'] = max(m['max_duration'], duration)

    def get_report(self):
        """Génère un rapport des métriques."""
        report = []
        for endpoint, m in self.metrics.items():
            avg_duration = m['total_duration'] / m['total_calls'] if m['total_calls'] > 0 else 0
            success_rate = (m['success_calls'] / m['total_calls'] * 100) if m['total_calls'] > 0 else 0

            report.append({
                'endpoint': endpoint,
                'total_calls': m['total_calls'],
                'success_rate': f"{success_rate:.1f}%",
                'avg_duration': f"{avg_duration:.3f}s",
                'min_duration': f"{m['min_duration']:.3f}s",
                'max_duration': f"{m['max_duration']:.3f}s",
            })

        # Trier par nombre d'appels (décroissant)
        report.sort(key=lambda x: x['total_calls'], reverse=True)
        return report


# Instance globale pour collecter les métriques
# NOTE: En production, utiliser Redis ou une base de données pour la persistence
_global_metrics = APIMetrics()


def log_api_metrics(func):
    """
    Décorateur léger pour collecter uniquement les métriques (sans logs détaillés).
    Utile pour les endpoints à très fort trafic.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        endpoint = func.__name__

        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start_time
            success = result.get('success', False) if isinstance(result, dict) else True

            # Enregistrer les métriques
            _global_metrics.record_call(endpoint, elapsed, success)

            return result

        except Exception as e:
            elapsed = time.time() - start_time
            _global_metrics.record_call(endpoint, elapsed, False)
            raise

    return wrapper
