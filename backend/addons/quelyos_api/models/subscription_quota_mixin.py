# -*- coding: utf-8 -*-
from odoo import api, models, _
from odoo.exceptions import ValidationError


class SubscriptionQuotaMixin(models.AbstractModel):
    """
    Mixin pour vérifier les quotas d'abonnement
    Peut être hérité par res.partner ou directement utilisé dans quelyos.subscription
    """
    _name = 'subscription.quota.mixin'
    _description = 'Mixin pour vérifier les quotas d\'abonnement'

    @api.model
    def check_subscription_quota(self, partner_id, resource_type):
        """
        Vérifie si le partenaire a atteint sa limite de quota pour une ressource

        :param partner_id: ID du res.partner
        :param resource_type: 'users', 'products' ou 'orders'
        :return: dict avec current, limit, is_limit_reached, percentage
        :raises: ValidationError si pas d'abonnement actif
        """
        # Rechercher l'abonnement actif du partner
        subscription = self.env['quelyos.subscription'].search([
            ('partner_id', '=', partner_id),
            ('state', 'in', ['trial', 'active'])
        ], limit=1)

        if not subscription:
            raise ValidationError(_(
                "Aucun abonnement actif trouvé pour ce client. "
                "Veuillez contacter l'administrateur."
            ))

        return subscription.check_quota(resource_type)

    @api.model
    def enforce_quota(self, partner_id, resource_type):
        """
        Bloque l'action si le quota est atteint

        :param partner_id: ID du res.partner
        :param resource_type: 'users', 'products' ou 'orders'
        :raises: ValidationError si quota atteint
        """
        quota_info = self.check_subscription_quota(partner_id, resource_type)

        if quota_info['is_limit_reached']:
            resource_labels = {
                'users': _('utilisateurs'),
                'products': _('produits'),
                'orders': _('commandes'),
            }
            raise ValidationError(_(
                "Limite de quota atteinte pour %s.\n"
                "Utilisation actuelle: %d / %d (%d%%)\n"
                "Veuillez mettre à niveau votre abonnement pour augmenter cette limite."
            ) % (
                resource_labels.get(resource_type, resource_type),
                quota_info['current'],
                quota_info['limit'],
                int(quota_info['percentage'])
            ))
