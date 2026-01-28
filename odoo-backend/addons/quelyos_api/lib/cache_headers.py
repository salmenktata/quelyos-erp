# -*- coding: utf-8 -*-
"""
Response Caching Headers pour Quelyos API

Cache HTTP intelligent:
- ETags automatiques
- Cache-Control dynamique
- Vary headers
- Conditional requests
"""

import json
import hashlib
import logging
from typing import Any, Dict, Optional, Callable
from datetime import datetime, timedelta
from functools import wraps

_logger = logging.getLogger(__name__)


class CacheControl:
    """Configuration Cache-Control"""

    # Presets
    NO_CACHE = 'no-cache, no-store, must-revalidate'
    PRIVATE = 'private, max-age=0, must-revalidate'
    SHORT = 'public, max-age=60'            # 1 minute
    MEDIUM = 'public, max-age=300'          # 5 minutes
    LONG = 'public, max-age=3600'           # 1 heure
    STATIC = 'public, max-age=86400'        # 1 jour
    IMMUTABLE = 'public, max-age=31536000, immutable'  # 1 an

    @staticmethod
    def custom(
        public: bool = True,
        max_age: int = 0,
        s_maxage: int = None,
        must_revalidate: bool = False,
        no_cache: bool = False,
        no_store: bool = False,
        immutable: bool = False,
        stale_while_revalidate: int = None,
        stale_if_error: int = None,
    ) -> str:
        """Génère un Cache-Control personnalisé"""
        parts = []

        if no_store:
            parts.append('no-store')
        if no_cache:
            parts.append('no-cache')

        if not no_store and not no_cache:
            parts.append('public' if public else 'private')

            if max_age >= 0:
                parts.append(f'max-age={max_age}')

            if s_maxage is not None:
                parts.append(f's-maxage={s_maxage}')

            if must_revalidate:
                parts.append('must-revalidate')

            if immutable:
                parts.append('immutable')

            if stale_while_revalidate:
                parts.append(f'stale-while-revalidate={stale_while_revalidate}')

            if stale_if_error:
                parts.append(f'stale-if-error={stale_if_error}')

        return ', '.join(parts)


def compute_etag(data: Any) -> str:
    """Calcule un ETag pour les données"""
    if isinstance(data, (dict, list)):
        content = json.dumps(data, sort_keys=True, ensure_ascii=False)
    elif isinstance(data, bytes):
        content = data.decode('utf-8', errors='replace')
    else:
        content = str(data)

    # Hash MD5 (suffisant pour ETag)
    hash_value = hashlib.md5(content.encode()).hexdigest()
    return f'"{hash_value}"'


def compute_weak_etag(data: Any) -> str:
    """Calcule un ETag faible (pour variations mineures)"""
    etag = compute_etag(data)
    return f'W/{etag}'


def check_etag_match(
    request_etag: str,
    current_etag: str,
    weak: bool = False
) -> bool:
    """Vérifie si l'ETag correspond"""
    if not request_etag or not current_etag:
        return False

    # Nettoyer les ETags
    request_etag = request_etag.strip().strip('"').lstrip('W/')
    current_etag = current_etag.strip().strip('"').lstrip('W/')

    return request_etag == current_etag


def with_cache_headers(
    cache_control: str = CacheControl.SHORT,
    etag: bool = True,
    vary: list = None,
    last_modified_field: str = None,
):
    """
    Décorateur pour ajouter les headers de cache HTTP.

    Args:
        cache_control: Directive Cache-Control
        etag: Générer un ETag automatiquement
        vary: Liste des headers Vary
        last_modified_field: Champ pour Last-Modified

    Usage:
        @with_cache_headers(
            cache_control=CacheControl.MEDIUM,
            vary=['Accept-Language']
        )
        def get_products(self, **kwargs):
            return {'products': [...]}
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            from odoo.http import request, Response

            # Vérifier If-None-Match (ETag)
            if_none_match = request.httprequest.headers.get('If-None-Match')

            # Exécuter la fonction
            result = func(self, *args, **kwargs)

            # Préparer headers
            headers = {
                'Cache-Control': cache_control,
            }

            # Vary
            vary_headers = ['Accept-Encoding']
            if vary:
                vary_headers.extend(vary)
            headers['Vary'] = ', '.join(vary_headers)

            # ETag
            if etag and result:
                current_etag = compute_etag(result)
                headers['ETag'] = current_etag

                # Vérifier If-None-Match
                if if_none_match and check_etag_match(if_none_match, current_etag):
                    return Response(
                        '',
                        status=304,
                        headers=headers
                    )

            # Last-Modified
            if last_modified_field and isinstance(result, dict):
                modified = result.get(last_modified_field)
                if modified:
                    if isinstance(modified, datetime):
                        headers['Last-Modified'] = modified.strftime(
                            '%a, %d %b %Y %H:%M:%S GMT'
                        )
                    elif isinstance(modified, str):
                        try:
                            dt = datetime.fromisoformat(modified.replace('Z', '+00:00'))
                            headers['Last-Modified'] = dt.strftime(
                                '%a, %d %b %Y %H:%M:%S GMT'
                            )
                        except ValueError:
                            pass

            # Vérifier If-Modified-Since
            if_modified = request.httprequest.headers.get('If-Modified-Since')
            if if_modified and 'Last-Modified' in headers:
                # Comparer dates (simplification)
                if if_modified == headers['Last-Modified']:
                    return Response('', status=304, headers=headers)

            # Retourner avec headers
            if isinstance(result, Response):
                for key, value in headers.items():
                    result.headers[key] = value
                return result

            return Response(
                json.dumps(result),
                status=200,
                headers={
                    'Content-Type': 'application/json; charset=utf-8',
                    **headers,
                }
            )

        return wrapper
    return decorator


def no_cache():
    """Décorateur pour désactiver complètement le cache"""
    return with_cache_headers(
        cache_control=CacheControl.NO_CACHE,
        etag=False,
    )


def cache_static():
    """Décorateur pour ressources statiques"""
    return with_cache_headers(
        cache_control=CacheControl.STATIC,
        etag=True,
    )


class ConditionalResponse:
    """Helper pour réponses conditionnelles"""

    @staticmethod
    def check(request, data: Any, modified_at: datetime = None) -> Optional[Response]:
        """
        Vérifie si une réponse 304 peut être envoyée.

        Returns:
            Response 304 si conditions remplies, None sinon
        """
        from odoo.http import Response

        # Check ETag
        if_none_match = request.httprequest.headers.get('If-None-Match')
        if if_none_match:
            current_etag = compute_etag(data)
            if check_etag_match(if_none_match, current_etag):
                return Response('', status=304)

        # Check Last-Modified
        if_modified_since = request.httprequest.headers.get('If-Modified-Since')
        if if_modified_since and modified_at:
            try:
                client_date = datetime.strptime(
                    if_modified_since,
                    '%a, %d %b %Y %H:%M:%S GMT'
                )
                if modified_at <= client_date:
                    return Response('', status=304)
            except ValueError:
                pass

        return None


# Presets pour différents types de contenu
CACHE_PRESETS = {
    'products_list': {
        'cache_control': CacheControl.custom(
            public=True,
            max_age=60,
            stale_while_revalidate=300,
        ),
        'vary': ['Accept-Language', 'X-Currency'],
    },
    'product_detail': {
        'cache_control': CacheControl.custom(
            public=True,
            max_age=300,
            stale_while_revalidate=600,
        ),
        'vary': ['Accept-Language'],
    },
    'cart': {
        'cache_control': CacheControl.PRIVATE,
        'etag': True,
    },
    'user_profile': {
        'cache_control': CacheControl.NO_CACHE,
        'etag': False,
    },
    'static_content': {
        'cache_control': CacheControl.IMMUTABLE,
        'etag': True,
    },
}


def cache_preset(preset_name: str):
    """Applique un preset de cache"""
    preset = CACHE_PRESETS.get(preset_name, {})
    return with_cache_headers(**preset)
