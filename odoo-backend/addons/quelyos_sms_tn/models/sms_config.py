# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class SMSConfig(models.Model):
    _name = 'quelyos.sms.config'
    _description = 'Configuration SMS Tunisie'

    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company
    )

    api_key = fields.Char(
        string='API Key',
        groups='base.group_system',
        help='Clé API fournie par Tunisie SMS'
    )

    sender_name = fields.Char(
        string='Nom expéditeur',
        size=11,
        help='Nom affiché comme expéditeur (max 11 caractères)'
    )

    endpoint = fields.Char(
        string='Endpoint API',
        default='https://api.tunisiesms.tn/api/v1/send',
        help='URL de l\'API Tunisie SMS'
    )

    is_active = fields.Boolean(
        string='Actif',
        default=False,
        help='Activer/désactiver l\'envoi de SMS'
    )

    # Module activation flags
    store_enabled = fields.Boolean(string='Store activé', default=True)
    finance_enabled = fields.Boolean(string='Finance activé', default=False)
    marketing_enabled = fields.Boolean(string='Marketing activé', default=False)
    crm_enabled = fields.Boolean(string='CRM activé', default=False)
    hr_enabled = fields.Boolean(string='RH activé', default=False)
    stock_enabled = fields.Boolean(string='Stock activé', default=False)

    # Preferences
    abandoned_cart_sms_enabled = fields.Boolean(
        string='SMS paniers abandonnés',
        default=False
    )

    abandoned_cart_delay = fields.Integer(
        string='Délai panier abandonné (heures)',
        default=24,
        help='Délai avant envoi SMS pour panier abandonné'
    )

    order_confirmation_sms_enabled = fields.Boolean(
        string='SMS confirmation commande',
        default=False
    )

    shipping_update_sms_enabled = fields.Boolean(
        string='SMS mise à jour livraison',
        default=False
    )

    # Statistics
    total_sms_sent = fields.Integer(
        string='Total SMS envoyés',
        compute='_compute_sms_stats',
        store=False
    )

    sms_sent_this_month = fields.Integer(
        string='SMS ce mois',
        compute='_compute_sms_stats',
        store=False
    )

    @api.constrains('sender_name')
    def _check_sender_name(self):
        """Validate sender name length"""
        for record in self:
            if record.sender_name and len(record.sender_name) > 11:
                raise ValidationError(_('Le nom de l\'expéditeur ne peut pas dépasser 11 caractères.'))

    @api.constrains('api_key')
    def _check_api_key(self):
        """Validate API key format"""
        for record in self:
            if record.api_key and len(record.api_key) < 10:
                raise ValidationError(_('La clé API semble invalide (trop courte).'))

    def _compute_sms_stats(self):
        """Compute SMS statistics"""
        for record in self:
            SMSLog = self.env['quelyos.sms.log']

            # Total sent
            record.total_sms_sent = SMSLog.search_count([
                ('company_id', '=', record.company_id.id),
                ('status', 'in', ['sent', 'delivered'])
            ])

            # This month
            from datetime import datetime
            first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            record.sms_sent_this_month = SMSLog.search_count([
                ('company_id', '=', record.company_id.id),
                ('status', 'in', ['sent', 'delivered']),
                ('create_date', '>=', first_day)
            ])

    def to_frontend_config(self):
        """Convert to frontend format (camelCase)"""
        self.ensure_one()

        return {
            'apiKey': '***' if self.api_key else '',  # Never expose API key
            'senderName': self.sender_name,
            'endpoint': self.endpoint,
            'isActive': self.is_active,
            'storeEnabled': self.store_enabled,
            'financeEnabled': self.finance_enabled,
            'marketingEnabled': self.marketing_enabled,
            'crmEnabled': self.crm_enabled,
            'hrEnabled': self.hr_enabled,
            'stockEnabled': self.stock_enabled,
            'abandonedCartSmsEnabled': self.abandoned_cart_sms_enabled,
            'abandonedCartDelay': self.abandoned_cart_delay,
            'orderConfirmationSmsEnabled': self.order_confirmation_sms_enabled,
            'shippingUpdateSmsEnabled': self.shipping_update_sms_enabled,
            'totalSmsSent': self.total_sms_sent,
            'smssentThisMonth': self.sms_sent_this_month,
        }

    @api.model
    def get_config_for_company(self, company_id=None):
        """Get or create SMS config for company"""
        if not company_id:
            company_id = self.env.company.id

        config = self.search([('company_id', '=', company_id)], limit=1)

        if not config:
            config = self.create({
                'company_id': company_id,
                'sender_name': 'Quelyos',
            })

        return config
