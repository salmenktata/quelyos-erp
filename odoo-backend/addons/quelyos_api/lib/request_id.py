# -*- coding: utf-8 -*-
"""
Request ID / Correlation ID Middleware

Génère et propage un ID unique pour chaque requête permettant:
- Traçabilité des requêtes à travers les services
- Corrélation des logs
- Debug distribué
- Analyse des performances

Headers:
- X-Request-ID: ID unique de la requête (généré si absent)
- X-Correlation-ID: ID de corrélation (pour chaîner les appels)
"""

import uuid
import logging
import threading
from functools import wraps
from typing import Optional
from contextvars import ContextVar

_logger = logging.getLogger(__name__)

# Context variable pour stocker le request ID dans le thread courant
_request_id: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
_correlation_id: ContextVar[Optional[str]] = ContextVar('correlation_id', default=None)

# Header names
REQUEST_ID_HEADER = 'X-Request-ID'
CORRELATION_ID_HEADER = 'X-Correlation-ID'


def generate_request_id() -> str:
    """Génère un ID de requête unique"""
    return str(uuid.uuid4())


def get_request_id() -> Optional[str]:
    """Récupère le request ID du contexte courant"""
    return _request_id.get()


def get_correlation_id() -> Optional[str]:
    """Récupère le correlation ID du contexte courant"""
    return _correlation_id.get()


def set_request_id(request_id: str) -> None:
    """Définit le request ID dans le contexte courant"""
    _request_id.set(request_id)


def set_correlation_id(correlation_id: str) -> None:
    """Définit le correlation ID dans le contexte courant"""
    _correlation_id.set(correlation_id)


class RequestIdMiddleware:
    """
    Middleware pour gérer les Request IDs.

    Usage dans Odoo:
        from ..lib.request_id import RequestIdMiddleware

        @http.route(...)
        def my_endpoint(self, **kwargs):
            with RequestIdMiddleware.from_request(request):
                # Le request ID est maintenant disponible
                logger.info("Processing request")
    """

    def __init__(self, request_id: str = None, correlation_id: str = None):
        self.request_id = request_id or generate_request_id()
        self.correlation_id = correlation_id or self.request_id
        self._token_request_id = None
        self._token_correlation_id = None

    def __enter__(self):
        self._token_request_id = _request_id.set(self.request_id)
        self._token_correlation_id = _correlation_id.set(self.correlation_id)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._token_request_id:
            _request_id.reset(self._token_request_id)
        if self._token_correlation_id:
            _correlation_id.reset(self._token_correlation_id)
        return False

    @classmethod
    def from_request(cls, request) -> 'RequestIdMiddleware':
        """Crée un middleware à partir d'une requête Odoo"""
        headers = request.httprequest.headers if hasattr(request, 'httprequest') else {}

        request_id = headers.get(REQUEST_ID_HEADER) or generate_request_id()
        correlation_id = headers.get(CORRELATION_ID_HEADER) or request_id

        return cls(request_id=request_id, correlation_id=correlation_id)


def with_request_id(func):
    """
    Décorateur pour ajouter automatiquement le request ID à une fonction.

    Usage:
        @http.route(...)
        @with_request_id
        def my_endpoint(self, **kwargs):
            # request ID automatiquement disponible
            pass
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        from odoo.http import request

        with RequestIdMiddleware.from_request(request):
            return func(*args, **kwargs)

    return wrapper


def add_request_id_to_response(response):
    """
    Ajoute les headers de request ID à une réponse.

    Usage:
        response = request.make_response(data)
        add_request_id_to_response(response)
    """
    request_id = get_request_id()
    correlation_id = get_correlation_id()

    if request_id:
        response.headers[REQUEST_ID_HEADER] = request_id
    if correlation_id:
        response.headers[CORRELATION_ID_HEADER] = correlation_id

    return response


class RequestIdLogFilter(logging.Filter):
    """
    Filtre de logging qui ajoute le request ID aux logs.

    Usage:
        handler = logging.StreamHandler()
        handler.addFilter(RequestIdLogFilter())
        handler.setFormatter(logging.Formatter(
            '%(asctime)s | %(request_id)s | %(levelname)s | %(message)s'
        ))
    """

    def filter(self, record):
        record.request_id = get_request_id() or '-'
        record.correlation_id = get_correlation_id() or '-'
        return True


def setup_request_id_logging():
    """Configure le logging pour inclure les request IDs"""
    # Ajouter le filtre au logger racine
    root_logger = logging.getLogger()
    request_filter = RequestIdLogFilter()

    for handler in root_logger.handlers:
        handler.addFilter(request_filter)

    _logger.info("Request ID logging configured")


# =============================================================================
# INTÉGRATION AVEC AUTRES SERVICES
# =============================================================================

def get_outgoing_headers() -> dict:
    """
    Retourne les headers à inclure dans les appels vers d'autres services.

    Usage:
        headers = get_outgoing_headers()
        requests.get('http://other-service/api', headers=headers)
    """
    headers = {}

    request_id = get_request_id()
    correlation_id = get_correlation_id()

    if request_id:
        headers[REQUEST_ID_HEADER] = request_id
    if correlation_id:
        headers[CORRELATION_ID_HEADER] = correlation_id

    return headers


class RequestIdSession:
    """
    Session requests avec propagation automatique des IDs.

    Usage:
        session = RequestIdSession()
        response = session.get('http://other-service/api')
    """

    def __init__(self):
        import requests
        self._session = requests.Session()

    def _prepare_headers(self, headers: dict = None) -> dict:
        result = get_outgoing_headers()
        if headers:
            result.update(headers)
        return result

    def get(self, url, **kwargs):
        kwargs['headers'] = self._prepare_headers(kwargs.get('headers'))
        return self._session.get(url, **kwargs)

    def post(self, url, **kwargs):
        kwargs['headers'] = self._prepare_headers(kwargs.get('headers'))
        return self._session.post(url, **kwargs)

    def put(self, url, **kwargs):
        kwargs['headers'] = self._prepare_headers(kwargs.get('headers'))
        return self._session.put(url, **kwargs)

    def delete(self, url, **kwargs):
        kwargs['headers'] = self._prepare_headers(kwargs.get('headers'))
        return self._session.delete(url, **kwargs)
