"""
Cache Redis
Wrapper pour accès Redis avec TTL et gestion erreurs.
"""

import json
import logging
import redis
from odoo import models, api

_logger = logging.getLogger(__name__)

# Client Redis singleton
_redis_client = None


def get_redis_client():
    """Récupérer client Redis (singleton)"""
    global _redis_client

    if _redis_client is not None:
        return _redis_client

    try:
        _redis_client = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            decode_responses=False,  # On gère le decode nous-mêmes
            socket_connect_timeout=2,
            socket_timeout=2
        )
        _redis_client.ping()
        _logger.info('[Cache] Redis connected successfully')
        return _redis_client
    except Exception as e:
        _logger.error(f'[Cache] Redis connection error: {str(e)}')
        return None


class Cache(models.AbstractModel):
    """Service cache Redis"""

    _name = 'quelyos.cache'
    _description = 'Redis Cache Service'

    @api.model
    def get(self, key):
        """
        Récupérer valeur depuis Redis.

        Args:
            key (str): Clé cache

        Returns:
            str|None: Valeur ou None si non trouvée
        """
        try:
            redis = get_redis_client()
            if not redis:
                _logger.warning('[Cache] Redis not available')
                return None

            value = redis.get(key)
            if value:
                return value.decode('utf-8')
            return None

        except Exception as e:
            _logger.error(f'[Cache] Error getting key {key}: {str(e)}')
            return None

    @api.model
    def set(self, key, value, ttl=None):
        """
        Stocker valeur dans Redis avec TTL optionnel.

        Args:
            key (str): Clé cache
            value (str): Valeur à stocker
            ttl (int): Time-to-live en secondes (None = pas d'expiration)

        Returns:
            bool: True si succès, False sinon
        """
        try:
            redis = get_redis_client()
            if not redis:
                _logger.warning('[Cache] Redis not available')
                return False

            if ttl:
                redis.setex(key, ttl, value)
            else:
                redis.set(key, value)

            return True

        except Exception as e:
            _logger.error(f'[Cache] Error setting key {key}: {str(e)}')
            return False

    @api.model
    def delete(self, key):
        """
        Supprimer clé du cache.

        Args:
            key (str): Clé à supprimer

        Returns:
            bool: True si clé supprimée, False sinon
        """
        try:
            redis = get_redis_client()
            if not redis:
                return False

            redis.delete(key)
            return True

        except Exception as e:
            _logger.error(f'[Cache] Error deleting key {key}: {str(e)}')
            return False

    @api.model
    def exists(self, key):
        """
        Vérifier si clé existe.

        Args:
            key (str): Clé à vérifier

        Returns:
            bool: True si existe, False sinon
        """
        try:
            redis = get_redis_client()
            if not redis:
                return False

            return redis.exists(key) > 0

        except Exception as e:
            _logger.error(f'[Cache] Error checking key {key}: {str(e)}')
            return False

    @api.model
    def get_json(self, key):
        """
        Récupérer valeur JSON depuis cache.

        Args:
            key (str): Clé cache

        Returns:
            dict|None: Objet JSON parsé ou None
        """
        value = self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                _logger.error(f'[Cache] Invalid JSON for key {key}')
                return None
        return None

    @api.model
    def set_json(self, key, data, ttl=None):
        """
        Stocker objet JSON dans cache.

        Args:
            key (str): Clé cache
            data (dict): Données à stocker
            ttl (int): TTL en secondes

        Returns:
            bool: True si succès
        """
        try:
            value = json.dumps(data)
            return self.set(key, value, ttl)
        except (TypeError, ValueError) as e:
            _logger.error(f'[Cache] Error serializing JSON for key {key}: {str(e)}')
            return False
