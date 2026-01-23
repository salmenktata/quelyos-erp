# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import logging
import requests
import json

_logger = logging.getLogger(__name__)


class EcommerceWebhooksController(http.Controller):
    """Controller pour les webhooks vers le frontend."""

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

            # Construire l'URL du webhook
            webhook_url = f"{config.frontend_url}/api/webhooks/odoo"

            # Préparer les données
            payload = {
                'event': event,
                'data': data,
                'timestamp': request.env.cr.now().isoformat(),
            }

            # Envoyer le webhook
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
            _logger.error(f"Erreur lors de l'envoi du webhook {event}: {str(e)}")
            return False

    @http.route('/api/ecommerce/webhooks/test', type='json', auth='user', methods=['POST'], csrf=False, cors='*')
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
            event = params.get('event', 'test')
            data = params.get('data', {})

            success = self._send_webhook(event, data)

            return {
                'success': success,
                'message': 'Webhook envoyé' if success else 'Échec envoi webhook',
            }

        except Exception as e:
            _logger.error(f"Erreur lors du test webhook: {str(e)}")
            return {
                'success': False,
                'error': str(e),
            }


# Automated actions pour déclencher les webhooks automatiquement
class ProductProduct(http.Controller):
    """Extension pour envoyer webhooks lors de changements de stock."""

    @http.route('/api/ecommerce/webhooks/stock-change', type='json', auth='none', methods=['POST'], csrf=False)
    def notify_stock_change(self, product_id, stock_qty):
        """
        Notifie le frontend d'un changement de stock.
        À appeler depuis une automated action Odoo.
        """
        try:
            webhooks_controller = EcommerceWebhooksController()
            success = webhooks_controller._send_webhook('stock_change', {
                'product_id': product_id,
                'stock_qty': stock_qty,
            })

            return {'success': success}

        except Exception as e:
            _logger.error(f"Erreur notification stock: {str(e)}")
            return {'success': False, 'error': str(e)}
