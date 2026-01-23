# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.addons.quelyos_ecommerce.controllers.base_controller import BaseEcommerceController
from odoo.addons.quelyos_ecommerce.controllers.rate_limiter import rate_limit
import logging
import requests

_logger = logging.getLogger(__name__)


class EcommerceWebhooksController(BaseEcommerceController):
    """Controller pour les webhooks vers le frontend avec sécurité renforcée."""

    def _send_webhook(self, event, data):
        """
        Envoie un webhook au frontend Next.js.

        Args:
            event: Type d'événement (stock_change, order_confirmed, product_updated)
            data: Données de l'événement
        """
        try:
            config = request.env['ecommerce.config'].sudo().search([], limit=1)

            if not config:
                _logger.warning("Configuration e-commerce non trouvée")
                return False

            # Vérifier si le webhook est activé
            webhook_enabled = False
            if event == 'stock_change':
                webhook_enabled = config.webhook_stock_change
            elif event == 'order_confirmed':
                webhook_enabled = config.webhook_order_confirmed
            elif event == 'product_updated':
                webhook_enabled = config.webhook_product_updated

            if not webhook_enabled:
                _logger.info(f"Webhook {event} désactivé")
                return False

            # Validation URL frontend
            if not config.frontend_url:
                _logger.error("Frontend URL non configurée")
                return False

            # Construire l'URL du webhook
            webhook_url = f"{config.frontend_url}/api/webhooks/odoo"

            # Préparer les données
            payload = {
                'event': event,
                'data': data,
                'timestamp': request.env.cr.now().isoformat(),
            }

            # SÉCURITÉ: Vérifier que webhook_secret est configuré
            if not config.webhook_secret:
                _logger.error("Webhook secret non configuré - envoi refusé pour sécurité")
                return False

            # Envoyer le webhook avec secret pour authentification
            response = requests.post(
                webhook_url,
                json=payload,
                headers={
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': config.webhook_secret,
                },
                timeout=5
            )

            if response.status_code == 200:
                _logger.info(f"Webhook {event} envoyé avec succès")
                return True
            else:
                _logger.warning(f"Webhook {event} échoué: {response.status_code}")
                return False

        except requests.exceptions.Timeout:
            _logger.error(f"Webhook {event} timeout")
            return False
        except Exception as e:
            _logger.error(f"Erreur lors de l'envoi du webhook {event}: {str(e)}", exc_info=True)
            return False

    @http.route('/api/ecommerce/webhooks/test', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
    @rate_limit(limit=5, window=300)  # 5 tests par 5 minutes max (protection spam)
    def test_webhook(self, **kwargs):
        """
        Endpoint de test pour vérifier que les webhooks fonctionnent.

        Body JSON:
        {
            "event": "test",
            "data": {...}
        }
        """
        try:
            params = request.jsonrequest

            # Validation event (whitelist)
            event = params.get('event', 'test')
            input_validator = request.env['input.validator']
            event = input_validator.validate_string(event, field_name='event', max_length=50)

            # Whitelist des events autorisés pour test
            allowed_events = ['test', 'stock_change', 'order_confirmed', 'product_updated']
            if event not in allowed_events:
                return self._handle_error(
                    Exception(f'Event non autorisé: {event}'),
                    "test webhook"
                )

            # Données de test (sanitize)
            data = params.get('data', {})
            if not isinstance(data, dict):
                data = {}

            success = self._send_webhook(event, data)

            _logger.info(f"Test webhook {event} - success={success}")

            return self._success_response(
                message='Webhook envoyé' if success else 'Échec envoi webhook'
            )

        except Exception as e:
            return self._handle_error(e, "test webhook")


class ProductWebhookController(BaseEcommerceController):
    """Extension pour envoyer webhooks lors de changements de stock."""

    @http.route('/api/ecommerce/webhooks/stock-change', type='json', auth='user', methods=['POST'], csrf=False)
    @rate_limit(limit=100, window=60)
    def notify_stock_change(self, **kwargs):
        """
        Notifie le frontend d'un changement de stock.
        À appeler depuis une automated action Odoo.

        SÉCURITÉ: Endpoint protégé par authentification utilisateur.
        Pour automated actions, utiliser un utilisateur technique dédié.

        Body JSON:
        {
            "product_id": 123,
            "stock_qty": 10
        }
        """
        try:
            params = request.jsonrequest

            # Validation des paramètres requis
            self._validate_required_params(params, ['product_id', 'stock_qty'])

            # Validation product_id et stock_qty
            input_validator = request.env['input.validator']
            product_id = input_validator.validate_id(params.get('product_id'), 'product_id')
            stock_qty = input_validator.validate_positive_float(params.get('stock_qty'), 'stock_qty')

            # Vérifier que le produit existe
            product = request.env['product.product'].sudo().browse(product_id)
            if not product.exists():
                return self._handle_error(
                    Exception('Produit non trouvé'),
                    "notification stock"
                )

            # Envoyer le webhook
            webhooks_controller = EcommerceWebhooksController()
            success = webhooks_controller._send_webhook('stock_change', {
                'product_id': product_id,
                'product_name': product.name,
                'stock_qty': stock_qty,
            })

            _logger.info(f"Notification stock pour produit {product_id}: {stock_qty} - success={success}")

            return self._success_response(
                message='Notification envoyée' if success else 'Échec notification'
            )

        except Exception as e:
            return self._handle_error(e, "notification stock")
