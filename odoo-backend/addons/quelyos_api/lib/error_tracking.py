# -*- coding: utf-8 -*-
"""
Error Tracking avec Sentry

Capture et reporte les erreurs vers Sentry pour:
- Monitoring en temps réel
- Alertes sur nouvelles erreurs
- Stack traces détaillées
- Context utilisateur
"""

import os
import logging
from functools import wraps
from typing import Dict, Any, Optional

_logger = logging.getLogger(__name__)

# Sentry SDK (optionnel)
try:
    import sentry_sdk
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    _logger.info("Sentry SDK not installed. Error tracking disabled.")


class ErrorTracker:
    """Service de tracking d'erreurs avec Sentry"""

    def __init__(self):
        self.enabled = False
        self.dsn = os.environ.get('SENTRY_DSN')

        if not SENTRY_AVAILABLE:
            _logger.info("Sentry SDK not available")
            return

        if not self.dsn:
            _logger.info("SENTRY_DSN not configured, error tracking disabled")
            return

        try:
            # Configuration Sentry
            sentry_sdk.init(
                dsn=self.dsn,
                environment=os.environ.get('ENVIRONMENT', 'development'),
                release=os.environ.get('APP_VERSION', 'unknown'),

                # Intégrations
                integrations=[
                    LoggingIntegration(
                        level=logging.ERROR,
                        event_level=logging.ERROR,
                    ),
                ],

                # Options
                traces_sample_rate=float(os.environ.get('SENTRY_TRACES_RATE', '0.1')),
                profiles_sample_rate=float(os.environ.get('SENTRY_PROFILES_RATE', '0.1')),

                # Filtrage
                before_send=self._before_send,

                # PII
                send_default_pii=False,
            )

            self.enabled = True
            _logger.info("Sentry error tracking enabled")

        except Exception as e:
            _logger.error(f"Failed to initialize Sentry: {e}")

    def _before_send(self, event: Dict, hint: Dict) -> Optional[Dict]:
        """
        Filtre les événements avant envoi à Sentry.
        Permet de:
        - Supprimer les données sensibles
        - Ignorer certaines erreurs
        - Enrichir le contexte
        """
        # Ignorer les erreurs de health check
        if 'health' in str(event.get('request', {}).get('url', '')):
            return None

        # Supprimer les données sensibles des headers
        if 'request' in event and 'headers' in event['request']:
            sensitive_headers = ['Authorization', 'Cookie', 'X-Session-Id']
            for header in sensitive_headers:
                if header in event['request']['headers']:
                    event['request']['headers'][header] = '[REDACTED]'

        # Supprimer les mots de passe des données
        if 'request' in event and 'data' in event['request']:
            data = event['request']['data']
            if isinstance(data, dict):
                for key in ['password', 'token', 'secret', 'api_key']:
                    if key in data:
                        data[key] = '[REDACTED]'

        return event

    def capture_exception(
        self,
        error: Exception = None,
        context: Dict[str, Any] = None,
        user: Dict[str, Any] = None,
        tags: Dict[str, str] = None,
        level: str = 'error'
    ):
        """
        Capture une exception et l'envoie à Sentry.

        Args:
            error: L'exception à capturer (None = exception courante)
            context: Données de contexte additionnelles
            user: Informations utilisateur {id, email, username}
            tags: Tags pour filtrage {module, action, etc.}
            level: Niveau de sévérité (error, warning, info)
        """
        if not self.enabled:
            return

        try:
            with sentry_sdk.push_scope() as scope:
                # Ajouter le contexte
                if context:
                    for key, value in context.items():
                        scope.set_context(key, value)

                # Ajouter les tags
                if tags:
                    for key, value in tags.items():
                        scope.set_tag(key, value)

                # Ajouter l'utilisateur
                if user:
                    scope.set_user(user)

                # Définir le niveau
                scope.level = level

                # Capturer
                if error:
                    sentry_sdk.capture_exception(error)
                else:
                    sentry_sdk.capture_exception()

        except Exception as e:
            _logger.error(f"Failed to capture exception in Sentry: {e}")

    def capture_message(
        self,
        message: str,
        level: str = 'info',
        context: Dict[str, Any] = None,
        tags: Dict[str, str] = None
    ):
        """
        Envoie un message à Sentry (sans exception).

        Args:
            message: Le message à envoyer
            level: Niveau (info, warning, error)
            context: Données de contexte
            tags: Tags pour filtrage
        """
        if not self.enabled:
            return

        try:
            with sentry_sdk.push_scope() as scope:
                if context:
                    for key, value in context.items():
                        scope.set_context(key, value)

                if tags:
                    for key, value in tags.items():
                        scope.set_tag(key, value)

                sentry_sdk.capture_message(message, level=level)

        except Exception as e:
            _logger.error(f"Failed to capture message in Sentry: {e}")

    def set_user(self, user_id: int, email: str = None, username: str = None):
        """Définit l'utilisateur pour le scope actuel"""
        if not self.enabled:
            return

        sentry_sdk.set_user({
            'id': str(user_id),
            'email': email,
            'username': username,
        })

    def add_breadcrumb(
        self,
        message: str,
        category: str = 'default',
        level: str = 'info',
        data: Dict = None
    ):
        """
        Ajoute un breadcrumb pour tracer le parcours utilisateur.

        Les breadcrumbs apparaissent dans le contexte des erreurs.
        """
        if not self.enabled:
            return

        sentry_sdk.add_breadcrumb(
            message=message,
            category=category,
            level=level,
            data=data or {},
        )


# Instance singleton
_error_tracker = None


def get_error_tracker() -> ErrorTracker:
    """Retourne l'instance singleton du tracker d'erreurs"""
    global _error_tracker
    if _error_tracker is None:
        _error_tracker = ErrorTracker()
    return _error_tracker


def track_errors(
    capture_args: bool = False,
    tags: Dict[str, str] = None,
    reraise: bool = True
):
    """
    Décorateur pour tracker automatiquement les erreurs d'une fonction.

    Usage:
        @track_errors(tags={'module': 'checkout'})
        def process_payment(self, order_id, **kwargs):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            tracker = get_error_tracker()

            try:
                return func(*args, **kwargs)

            except Exception as e:
                context = {
                    'function': func.__name__,
                    'module': func.__module__,
                }

                if capture_args:
                    context['args'] = str(args)[:500]
                    context['kwargs'] = str(kwargs)[:500]

                tracker.capture_exception(
                    error=e,
                    context={'function_context': context},
                    tags=tags or {},
                )

                if reraise:
                    raise

        return wrapper
    return decorator


# =============================================================================
# INTÉGRATION ODOO
# =============================================================================

def setup_odoo_error_tracking():
    """
    Configure le tracking d'erreurs pour Odoo.
    À appeler au démarrage du module.
    """
    tracker = get_error_tracker()

    if not tracker.enabled:
        return

    # Hook sur les erreurs HTTP Odoo
    try:
        from odoo.http import Root

        original_dispatch = Root.dispatch

        def patched_dispatch(self):
            try:
                return original_dispatch(self)
            except Exception as e:
                from odoo.http import request

                # Extraire le contexte utilisateur
                user = None
                if hasattr(request, 'env') and request.env.user:
                    user = {
                        'id': str(request.env.user.id),
                        'email': request.env.user.email,
                        'username': request.env.user.login,
                    }

                tracker.capture_exception(
                    error=e,
                    user=user,
                    tags={'source': 'odoo_http'},
                )
                raise

        Root.dispatch = patched_dispatch
        _logger.info("Odoo error tracking hook installed")

    except Exception as e:
        _logger.warning(f"Could not install Odoo error tracking hook: {e}")
