# -*- coding: utf-8 -*-
"""
API Versioning pour Quelyos ERP

Permet de gérer plusieurs versions de l'API en parallèle:
- Version par URL path (/api/v1/, /api/v2/)
- Version par header (Accept-Version: v1)
- Deprecation warnings
- Migration progressive

Features:
- Routing automatique vers la bonne version
- Transformations de réponse entre versions
- Documentation des changements
"""

import logging
from functools import wraps
from typing import Dict, Any, Callable, Optional
from datetime import datetime

_logger = logging.getLogger(__name__)


# =============================================================================
# CONFIGURATION
# =============================================================================

# Version actuelle de l'API
CURRENT_VERSION = 'v1'

# Versions supportées
SUPPORTED_VERSIONS = ['v1']

# Versions dépréciées (avec date de fin de support)
DEPRECATED_VERSIONS = {
    # 'v0': '2024-06-01',  # Exemple
}

# Header pour spécifier la version
VERSION_HEADER = 'Accept-Version'
VERSION_RESPONSE_HEADER = 'API-Version'
DEPRECATION_HEADER = 'Deprecation'
SUNSET_HEADER = 'Sunset'


# =============================================================================
# CLASSES
# =============================================================================

class APIVersion:
    """Représente une version de l'API"""

    def __init__(self, version: str):
        self.version = version
        self.is_deprecated = version in DEPRECATED_VERSIONS
        self.sunset_date = DEPRECATED_VERSIONS.get(version)

    @property
    def is_supported(self) -> bool:
        return self.version in SUPPORTED_VERSIONS

    @property
    def is_current(self) -> bool:
        return self.version == CURRENT_VERSION

    def __str__(self) -> str:
        return self.version

    def __eq__(self, other) -> bool:
        if isinstance(other, str):
            return self.version == other
        return self.version == other.version


class VersionedResponse:
    """Wrapper pour réponses versionnées"""

    def __init__(self, data: Any, version: str):
        self.data = data
        self.version = version
        self.headers = {
            VERSION_RESPONSE_HEADER: version,
        }

        # Ajouter headers de dépréciation si nécessaire
        if version in DEPRECATED_VERSIONS:
            self.headers[DEPRECATION_HEADER] = 'true'
            self.headers[SUNSET_HEADER] = DEPRECATED_VERSIONS[version]


# =============================================================================
# TRANSFORMATIONS ENTRE VERSIONS
# =============================================================================

class VersionTransformer:
    """
    Transforme les données entre différentes versions de l'API.

    Permet la rétro-compatibilité en transformant les nouvelles structures
    vers les anciennes pour les clients utilisant d'anciennes versions.
    """

    # Registre des transformations
    _transformations: Dict[str, Dict[str, Callable]] = {}

    @classmethod
    def register(cls, from_version: str, to_version: str, transformer: Callable):
        """
        Enregistre une transformation entre deux versions.

        Args:
            from_version: Version source
            to_version: Version cible
            transformer: Fonction de transformation (data) -> data
        """
        key = f"{from_version}->{to_version}"
        cls._transformations[key] = transformer
        _logger.debug(f"Registered transformation: {key}")

    @classmethod
    def transform(cls, data: Any, from_version: str, to_version: str) -> Any:
        """
        Transforme les données d'une version à une autre.

        Args:
            data: Données à transformer
            from_version: Version actuelle des données
            to_version: Version cible

        Returns:
            Données transformées
        """
        if from_version == to_version:
            return data

        key = f"{from_version}->{to_version}"

        if key in cls._transformations:
            return cls._transformations[key](data)

        # Si pas de transformation directe, essayer de chaîner
        _logger.warning(f"No direct transformation for {key}, returning as-is")
        return data


# =============================================================================
# DÉCORATEURS
# =============================================================================

def versioned(
    min_version: str = None,
    max_version: str = None,
    deprecated_in: str = None
):
    """
    Décorateur pour marquer un endpoint avec des contraintes de version.

    Args:
        min_version: Version minimum requise
        max_version: Version maximum (endpoint supprimé après)
        deprecated_in: Version où l'endpoint est déprécié

    Usage:
        @versioned(min_version='v1', deprecated_in='v2')
        @http.route('/api/products', ...)
        def get_products(self, **kwargs):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            from odoo.http import request

            # Extraire la version demandée
            requested_version = extract_version(request)

            # Vérifier les contraintes
            if min_version and requested_version < min_version:
                return {
                    'success': False,
                    'error': f'This endpoint requires API version {min_version} or higher',
                    'error_code': 'VERSION_TOO_LOW',
                    'required_version': min_version,
                }

            if max_version and requested_version > max_version:
                return {
                    'success': False,
                    'error': f'This endpoint was removed in API version {max_version}',
                    'error_code': 'ENDPOINT_REMOVED',
                    'max_version': max_version,
                }

            # Exécuter la fonction
            result = func(self, *args, **kwargs)

            # Ajouter warning de dépréciation si nécessaire
            if deprecated_in and requested_version >= deprecated_in:
                if isinstance(result, dict):
                    result['_deprecated'] = True
                    result['_deprecation_message'] = (
                        f'This endpoint is deprecated since version {deprecated_in}'
                    )

            return result

        # Stocker les métadonnées de version
        wrapper._versioning = {
            'min_version': min_version,
            'max_version': max_version,
            'deprecated_in': deprecated_in,
        }

        return wrapper
    return decorator


def version_router(*version_handlers: tuple):
    """
    Route vers différentes implémentations selon la version.

    Usage:
        @version_router(
            ('v1', get_products_v1),
            ('v2', get_products_v2),
        )
        @http.route('/api/products', ...)
        def get_products(self, **kwargs):
            pass
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            from odoo.http import request

            requested_version = extract_version(request)

            # Trouver le handler approprié
            for version, handler in version_handlers:
                if requested_version == version:
                    return handler(self, *args, **kwargs)

            # Fallback sur la fonction décorée
            return func(self, *args, **kwargs)

        return wrapper
    return decorator


# =============================================================================
# HELPERS
# =============================================================================

def extract_version(request) -> str:
    """
    Extrait la version de l'API depuis la requête.

    Ordre de priorité:
    1. Header Accept-Version
    2. Path URL (/api/v1/...)
    3. Query param ?version=v1
    4. Version par défaut
    """
    # 1. Header
    version = request.httprequest.headers.get(VERSION_HEADER)
    if version and version in SUPPORTED_VERSIONS:
        return version

    # 2. Path URL
    path = request.httprequest.path
    for v in SUPPORTED_VERSIONS:
        if f'/api/{v}/' in path or path.startswith(f'/api/{v}'):
            return v

    # 3. Query param
    version = request.httprequest.args.get('version')
    if version and version in SUPPORTED_VERSIONS:
        return version

    # 4. Défaut
    return CURRENT_VERSION


def add_version_headers(response, version: str = None):
    """Ajoute les headers de version à une réponse"""
    version = version or CURRENT_VERSION

    response.headers[VERSION_RESPONSE_HEADER] = version

    if version in DEPRECATED_VERSIONS:
        response.headers[DEPRECATION_HEADER] = 'true'
        response.headers[SUNSET_HEADER] = DEPRECATED_VERSIONS[version]

    return response


def get_api_info() -> Dict:
    """Retourne les informations sur les versions de l'API"""
    return {
        'current_version': CURRENT_VERSION,
        'supported_versions': SUPPORTED_VERSIONS,
        'deprecated_versions': DEPRECATED_VERSIONS,
    }


# =============================================================================
# TRANSFORMATIONS PRÉDÉFINIES
# =============================================================================

# Exemple de transformation v1 -> v2 (quand v2 sera créée)
# VersionTransformer.register('v2', 'v1', lambda data: {
#     # Transformer le nouveau format vers l'ancien
#     'products': data.get('items', []),  # v2 utilise 'items', v1 'products'
#     'total': data.get('total_count', 0),
# })
