# -*- coding: utf-8 -*-

from functools import wraps
from datetime import datetime, timedelta
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)

# Cache en mémoire pour le rate limiting
# IMPORTANT: En production, utiliser Redis pour un cache partagé entre workers
_rate_limit_cache = {}


def rate_limit(limit=100, window=60):
    """
    Décorateur de rate limiting pour protéger les endpoints contre les abus.

    Limite le nombre de requêtes par client (IP ou user) dans une fenêtre de temps.
    Protection contre:
    - Brute force (ex: 5 tentatives login/minute)
    - DoS (Denial of Service)
    - API abuse

    Args:
        limit: Nombre maximum de requêtes autorisées
        window: Fenêtre de temps en secondes

    Usage:
        @http.route('/api/ecommerce/auth/login', ...)
        @rate_limit(limit=5, window=60)  # 5 tentatives par minute
        def login(self, **kwargs):
            # ...

    Note pour production:
        Utiliser Redis au lieu du cache mémoire:
        - Permet le partage entre workers Odoo
        - Meilleure performance
        - Données persistantes

        Voir: controllers/rate_limiter_redis.py pour implémentation Redis
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Identifier le client de manière unique
            if request.session.uid:
                # Utilisateur authentifié: limiter par user
                client_id = f"user_{request.session.uid}"
            else:
                # Utilisateur anonyme: limiter par IP
                client_id = f"ip_{request.httprequest.remote_addr}"

            # Clé unique pour cet endpoint + client
            cache_key = f"{func.__name__}:{client_id}"
            now = datetime.now()

            # Nettoyer les anciennes entrées (hors fenêtre de temps)
            if cache_key in _rate_limit_cache:
                _rate_limit_cache[cache_key] = [
                    timestamp for timestamp in _rate_limit_cache[cache_key]
                    if now - timestamp < timedelta(seconds=window)
                ]
            else:
                _rate_limit_cache[cache_key] = []

            # Vérifier si la limite est atteinte
            request_count = len(_rate_limit_cache[cache_key])

            if request_count >= limit:
                # Limite dépassée - loguer et rejeter
                _logger.warning(
                    f"Rate limit exceeded for {client_id} on {func.__name__}: "
                    f"{request_count}/{limit} requests in {window}s"
                )

                return {
                    'success': False,
                    'error': 'Trop de requêtes. Veuillez réessayer plus tard.',
                    'retry_after': window,  # Secondes avant retry
                }

            # Enregistrer cette requête
            _rate_limit_cache[cache_key].append(now)

            # Exécuter la fonction
            return func(*args, **kwargs)

        return wrapper
    return decorator


def clear_rate_limit_cache():
    """
    Nettoie le cache de rate limiting (pour tests ou maintenance).

    DANGER: N'utiliser qu'en environnement de développement !
    """
    global _rate_limit_cache
    _rate_limit_cache = {}
    _logger.info("Rate limit cache cleared")


def get_rate_limit_stats(client_id=None):
    """
    Récupère les statistiques de rate limiting.

    Args:
        client_id: ID du client (optionnel). Si None, retourne stats globales.

    Returns:
        dict: Statistiques de rate limiting
    """
    if client_id:
        # Stats pour un client spécifique
        matching_keys = [k for k in _rate_limit_cache.keys() if client_id in k]
        return {
            key: len(_rate_limit_cache[key])
            for key in matching_keys
        }
    else:
        # Stats globales
        return {
            'total_clients': len(_rate_limit_cache),
            'total_requests': sum(len(v) for v in _rate_limit_cache.values()),
        }
