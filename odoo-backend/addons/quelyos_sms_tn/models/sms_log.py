# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import re


class SMSLog(models.Model):
    _name = 'quelyos.sms.log'
    _description = 'Historique SMS'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True
    )

    mobile = fields.Char(
        string='Numéro mobile',
        required=True,
        help='Numéro au format international (+216...)'
    )

    message = fields.Text(
        string='Message',
        required=True
    )

    status = fields.Selection([
        ('pending', 'En attente'),
        ('sent', 'Envoyé'),
        ('delivered', 'Délivré'),
        ('failed', 'Échec'),
        ('fallback_email', 'Fallback email')
    ], string='Statut', default='pending', required=True, tracking=True)

    notification_type = fields.Selection([
        ('abandoned_cart', 'Panier abandonné'),
        ('order_confirmation', 'Confirmation commande'),
        ('shipping_update', 'Mise à jour livraison'),
        ('marketing', 'Marketing'),
        ('test', 'Test'),
        ('other', 'Autre')
    ], string='Type notification', default='other', required=True, index=True)

    partner_id = fields.Many2one(
        'res.partner',
        string='Contact',
        ondelete='set null'
    )

    order_id = fields.Many2one(
        'sale.order',
        string='Commande',
        ondelete='set null'
    )

    cost = fields.Float(
        string='Coût (DT)',
        digits=(16, 3),
        default=0.0,
        help='Coût de l\'envoi SMS'
    )

    retry_count = fields.Integer(
        string='Tentatives',
        default=0,
        help='Nombre de tentatives d\'envoi'
    )

    max_retries = fields.Integer(
        string='Max tentatives',
        default=3
    )

    error_message = fields.Text(
        string='Message d\'erreur',
        readonly=True
    )

    provider_response = fields.Text(
        string='Réponse provider',
        readonly=True,
        help='Réponse JSON du provider SMS'
    )

    sent_date = fields.Datetime(
        string='Date d\'envoi',
        readonly=True
    )

    delivered_date = fields.Datetime(
        string='Date de livraison',
        readonly=True
    )

    # Computed fields
    message_length = fields.Integer(
        string='Longueur message',
        compute='_compute_message_length',
        store=True
    )

    is_international = fields.Boolean(
        string='International',
        compute='_compute_is_international',
        store=True,
        help='SMS envoyé hors Tunisie'
    )

    can_retry = fields.Boolean(
        string='Peut réessayer',
        compute='_compute_can_retry'
    )

    @api.depends('message')
    def _compute_message_length(self):
        """Compute message length"""
        for record in self:
            record.message_length = len(record.message) if record.message else 0

    @api.depends('mobile')
    def _compute_is_international(self):
        """Check if SMS is international (not +216)"""
        for record in self:
            record.is_international = record.mobile and not record.mobile.startswith('+216')

    @api.depends('status', 'retry_count', 'max_retries')
    def _compute_can_retry(self):
        """Check if SMS can be retried"""
        for record in self:
            record.can_retry = (
                record.status == 'failed' and
                record.retry_count < record.max_retries
            )

    @api.constrains('mobile')
    def _check_mobile_format(self):
        """Validate mobile number format"""
        for record in self:
            if not record.mobile:
                continue

            # Remove spaces and dashes
            mobile = re.sub(r'[\s\-]', '', record.mobile)

            # Check format: +XXX... or 00XXX... (min 10 digits)
            if not re.match(r'^(\+|00)\d{10,15}$', mobile):
                raise ValidationError(_(
                    'Format de numéro invalide. '
                    'Utilisez le format international : +216XXXXXXXX'
                ))

    @api.constrains('message')
    def _check_message_length(self):
        """Validate message length"""
        for record in self:
            if record.message and len(record.message) > 612:  # 4 SMS max
                raise ValidationError(_(
                    'Le message est trop long (%d caractères). '
                    'Maximum : 612 caractères (4 SMS).'
                ) % len(record.message))

    def action_retry(self):
        """Retry sending SMS"""
        self.ensure_one()

        if not self.can_retry:
            raise ValidationError(_('Ce SMS ne peut pas être renvoyé.'))

        self.write({
            'status': 'pending',
            'error_message': False,
        })

        return True

    def action_mark_sent(self):
        """Mark SMS as sent (manual)"""
        self.ensure_one()

        self.write({
            'status': 'sent',
            'sent_date': fields.Datetime.now(),
        })

        return True

    def action_mark_failed(self, error_message=None):
        """Mark SMS as failed"""
        self.ensure_one()

        self.write({
            'status': 'failed',
            'error_message': error_message or 'Échec envoi',
        })

        return True

    def to_frontend_config(self):
        """Convert to frontend format (camelCase)"""
        self.ensure_one()

        return {
            'id': self.id,
            'mobile': self.mobile,
            'message': self.message,
            'status': self.status,
            'notificationType': self.notification_type,
            'cost': self.cost,
            'retryCount': self.retry_count,
            'errorMessage': self.error_message,
            'sentDate': self.sent_date.isoformat() if self.sent_date else None,
            'createdAt': self.create_date.isoformat() if self.create_date else None,
            'isInternational': self.is_international,
            'messageLength': self.message_length,
        }

    @api.model
    def check_quota_available(self, company_id=None):
        """
        Check if SMS quota is available for company
        Returns: (bool, remaining_sms, quota_limit)
        """
        if not company_id:
            company_id = self.env.company.id

        # Get company's subscription
        company = self.env['res.company'].browse(company_id)
        tenant = self.env['quelyos.tenant'].search([('company_id', '=', company_id)], limit=1)

        if not tenant or not tenant.subscription_id:
            return False, 0, 0

        subscription = tenant.subscription_id
        plan = subscription.plan_id

        # Get SMS quota from plan (assume we add this field)
        sms_quota = getattr(plan, 'sms_quota', 0)

        if sms_quota <= 0:
            return False, 0, 0

        # Count SMS sent this month
        from datetime import datetime
        first_day = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        sms_sent = self.search_count([
            ('company_id', '=', company_id),
            ('status', 'in', ['sent', 'delivered']),
            ('create_date', '>=', first_day)
        ])

        remaining = sms_quota - sms_sent

        return remaining > 0, remaining, sms_quota
