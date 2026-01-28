# -*- coding: utf-8 -*-
"""
Webhook System pour Quelyos ERP

Permet d'envoyer des notifications webhook aux systèmes externes lors
d'événements métier (commande créée, paiement reçu, stock mis à jour, etc.)

Features:
- Retry automatique avec exponential backoff
- Signature HMAC pour sécurité
- Queue asynchrone
- Logging des tentatives
"""

import os
import json
import hmac
import hashlib
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from functools import wraps
from concurrent.futures import ThreadPoolExecutor
import threading

_logger = logging.getLogger(__name__)

# Configuration
WEBHOOK_TIMEOUT = int(os.environ.get('WEBHOOK_TIMEOUT', 10))
WEBHOOK_MAX_RETRIES = int(os.environ.get('WEBHOOK_MAX_RETRIES', 5))
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'quelyos-webhook-secret')


# =============================================================================
# TYPES
# =============================================================================

@dataclass
class WebhookEvent:
    """Représente un événement webhook"""
    event_type: str
    payload: Dict[str, Any]
    timestamp: str = None
    event_id: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat() + 'Z'
        if self.event_id is None:
            import uuid
            self.event_id = str(uuid.uuid4())

    def to_dict(self) -> Dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, default=str)


@dataclass
class WebhookSubscription:
    """Configuration d'un abonnement webhook"""
    id: int
    url: str
    events: List[str]  # ['order.created', 'payment.received', '*']
    secret: str = None
    active: bool = True
    headers: Dict[str, str] = None

    def matches_event(self, event_type: str) -> bool:
        """Vérifie si cet abonnement correspond à l'événement"""
        if not self.active:
            return False
        if '*' in self.events:
            return True
        # Support wildcards partiels (order.*)
        for pattern in self.events:
            if pattern == event_type:
                return True
            if pattern.endswith('.*'):
                prefix = pattern[:-2]
                if event_type.startswith(prefix):
                    return True
        return False


@dataclass
class WebhookDelivery:
    """Résultat d'une tentative de livraison"""
    subscription_id: int
    event_id: str
    url: str
    status_code: int = None
    response_body: str = None
    error: str = None
    attempts: int = 0
    delivered_at: str = None
    success: bool = False


# =============================================================================
# ÉVÉNEMENTS DISPONIBLES
# =============================================================================

class WebhookEvents:
    """Types d'événements webhook disponibles"""
    # Commandes
    ORDER_CREATED = 'order.created'
    ORDER_CONFIRMED = 'order.confirmed'
    ORDER_SHIPPED = 'order.shipped'
    ORDER_DELIVERED = 'order.delivered'
    ORDER_CANCELLED = 'order.cancelled'

    # Paiements
    PAYMENT_RECEIVED = 'payment.received'
    PAYMENT_FAILED = 'payment.failed'
    PAYMENT_REFUNDED = 'payment.refunded'

    # Stock
    STOCK_LOW = 'stock.low'
    STOCK_OUT = 'stock.out'
    STOCK_UPDATED = 'stock.updated'

    # Clients
    CUSTOMER_CREATED = 'customer.created'
    CUSTOMER_UPDATED = 'customer.updated'

    # Produits
    PRODUCT_CREATED = 'product.created'
    PRODUCT_UPDATED = 'product.updated'
    PRODUCT_DELETED = 'product.deleted'


# =============================================================================
# SERVICE WEBHOOK
# =============================================================================

class WebhookService:
    """Service de gestion des webhooks"""

    def __init__(self):
        self._subscriptions: Dict[int, WebhookSubscription] = {}
        self._executor = ThreadPoolExecutor(max_workers=5)
        self._deliveries: List[WebhookDelivery] = []
        self._lock = threading.Lock()

    def register_subscription(self, subscription: WebhookSubscription) -> None:
        """Enregistre un abonnement webhook"""
        with self._lock:
            self._subscriptions[subscription.id] = subscription
            _logger.info(f"Webhook subscription registered: {subscription.id} -> {subscription.url}")

    def unregister_subscription(self, subscription_id: int) -> None:
        """Supprime un abonnement"""
        with self._lock:
            if subscription_id in self._subscriptions:
                del self._subscriptions[subscription_id]
                _logger.info(f"Webhook subscription unregistered: {subscription_id}")

    def get_subscriptions(self, event_type: str) -> List[WebhookSubscription]:
        """Récupère les abonnements correspondant à un événement"""
        with self._lock:
            return [s for s in self._subscriptions.values() if s.matches_event(event_type)]

    def emit(self, event: WebhookEvent) -> List[WebhookDelivery]:
        """
        Émet un événement vers tous les abonnements correspondants.

        Args:
            event: L'événement à émettre

        Returns:
            Liste des résultats de livraison
        """
        subscriptions = self.get_subscriptions(event.event_type)

        if not subscriptions:
            _logger.debug(f"No subscriptions for event: {event.event_type}")
            return []

        _logger.info(f"Emitting {event.event_type} to {len(subscriptions)} subscribers")

        # Livrer de manière asynchrone
        futures = []
        for subscription in subscriptions:
            future = self._executor.submit(
                self._deliver_with_retry,
                subscription,
                event
            )
            futures.append(future)

        # Collecter les résultats
        deliveries = []
        for future in futures:
            try:
                delivery = future.result(timeout=60)
                deliveries.append(delivery)
            except Exception as e:
                _logger.error(f"Webhook delivery failed: {e}")

        return deliveries

    def emit_async(self, event: WebhookEvent) -> None:
        """Émet un événement de manière asynchrone (fire and forget)"""
        self._executor.submit(self.emit, event)

    def _deliver_with_retry(
        self,
        subscription: WebhookSubscription,
        event: WebhookEvent
    ) -> WebhookDelivery:
        """Livre un webhook avec retry automatique"""
        import requests

        delivery = WebhookDelivery(
            subscription_id=subscription.id,
            event_id=event.event_id,
            url=subscription.url,
        )

        payload = event.to_json()
        signature = self._sign_payload(payload, subscription.secret or WEBHOOK_SECRET)

        headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event.event_type,
            'X-Webhook-ID': event.event_id,
            'X-Webhook-Timestamp': event.timestamp,
            'X-Webhook-Signature': signature,
        }
        if subscription.headers:
            headers.update(subscription.headers)

        # Retry avec exponential backoff
        for attempt in range(1, WEBHOOK_MAX_RETRIES + 1):
            delivery.attempts = attempt

            try:
                response = requests.post(
                    subscription.url,
                    data=payload,
                    headers=headers,
                    timeout=WEBHOOK_TIMEOUT,
                )

                delivery.status_code = response.status_code
                delivery.response_body = response.text[:1000]  # Limiter la taille

                if response.status_code < 400:
                    delivery.success = True
                    delivery.delivered_at = datetime.utcnow().isoformat() + 'Z'
                    _logger.info(
                        f"Webhook delivered: {event.event_type} -> {subscription.url} "
                        f"(attempt {attempt}, status {response.status_code})"
                    )
                    break

                # Erreur client (4xx) - ne pas retrier
                if 400 <= response.status_code < 500:
                    delivery.error = f"Client error: {response.status_code}"
                    _logger.warning(f"Webhook client error: {delivery.error}")
                    break

                # Erreur serveur (5xx) - retrier
                delivery.error = f"Server error: {response.status_code}"

            except requests.Timeout:
                delivery.error = "Timeout"
            except requests.ConnectionError as e:
                delivery.error = f"Connection error: {str(e)[:100]}"
            except Exception as e:
                delivery.error = str(e)[:200]

            # Attendre avant retry (exponential backoff)
            if attempt < WEBHOOK_MAX_RETRIES:
                delay = min(2 ** attempt, 60)  # Max 60 secondes
                _logger.warning(
                    f"Webhook delivery failed (attempt {attempt}), "
                    f"retrying in {delay}s: {delivery.error}"
                )
                time.sleep(delay)

        # Stocker la livraison
        with self._lock:
            self._deliveries.append(delivery)
            # Garder seulement les 1000 dernières
            if len(self._deliveries) > 1000:
                self._deliveries = self._deliveries[-1000:]

        return delivery

    def _sign_payload(self, payload: str, secret: str) -> str:
        """Génère une signature HMAC pour le payload"""
        return hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def get_recent_deliveries(self, limit: int = 100) -> List[Dict]:
        """Récupère les livraisons récentes"""
        with self._lock:
            return [asdict(d) for d in self._deliveries[-limit:]]


# Instance singleton
_webhook_service = None


def get_webhook_service() -> WebhookService:
    """Retourne l'instance singleton du service webhook"""
    global _webhook_service
    if _webhook_service is None:
        _webhook_service = WebhookService()
    return _webhook_service


# =============================================================================
# HELPERS
# =============================================================================

def emit_webhook(event_type: str, payload: Dict[str, Any]) -> None:
    """
    Helper pour émettre un webhook facilement.

    Usage:
        emit_webhook('order.created', {'order_id': 123, 'total': 99.99})
    """
    event = WebhookEvent(event_type=event_type, payload=payload)
    get_webhook_service().emit_async(event)


def webhook_trigger(event_type: str, payload_extractor=None):
    """
    Décorateur pour émettre un webhook après l'exécution d'une fonction.

    Usage:
        @webhook_trigger('order.created', lambda result: {'order_id': result['id']})
        def create_order(self, **kwargs):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)

            try:
                if payload_extractor:
                    payload = payload_extractor(result)
                else:
                    payload = result if isinstance(result, dict) else {'result': result}

                emit_webhook(event_type, payload)
            except Exception as e:
                _logger.error(f"Failed to emit webhook {event_type}: {e}")

            return result
        return wrapper
    return decorator


def verify_webhook_signature(payload: str, signature: str, secret: str = None) -> bool:
    """
    Vérifie la signature d'un webhook entrant.

    Usage:
        if not verify_webhook_signature(request.data, request.headers.get('X-Webhook-Signature')):
            raise ValueError("Invalid signature")
    """
    expected = hmac.new(
        (secret or WEBHOOK_SECRET).encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)
