# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import datetime


class MarketingCampaign(models.Model):
    _name = 'quelyos.marketing.campaign'
    _description = 'Marketing Campaign'
    _order = 'create_date desc'

    name = fields.Char(string='Nom', required=True)
    channel = fields.Selection([
        ('email', 'Email'),
        ('sms', 'SMS'),
    ], string='Canal', required=True, default='email')

    status = fields.Selection([
        ('draft', 'Brouillon'),
        ('scheduled', 'Planifiée'),
        ('sending', 'En cours d\'envoi'),
        ('sent', 'Envoyée'),
        ('cancelled', 'Annulée'),
    ], string='Statut', default='draft', required=True)

    # Contenu Email
    subject = fields.Char(string='Objet')
    content = fields.Html(string='Contenu Email')
    template_id = fields.Many2one(
        'quelyos.email.template',
        string='Template Email'
    )

    # Contenu SMS
    sms_message = fields.Text(string='Message SMS')

    # Destinataires
    contact_list_id = fields.Many2one(
        'quelyos.contact.list',
        string='Liste de contacts'
    )
    recipient_count = fields.Integer(
        string='Nombre de destinataires',
        compute='_compute_recipient_count'
    )

    # Planification
    scheduled_date = fields.Datetime(string='Date planifiée')
    sent_date = fields.Datetime(string='Date d\'envoi')

    # Statistiques
    stats_sent = fields.Integer(string='Envoyés', default=0)
    stats_delivered = fields.Integer(string='Délivrés', default=0)
    stats_opened = fields.Integer(string='Ouverts', default=0)
    stats_clicked = fields.Integer(string='Cliqués', default=0)
    stats_bounced = fields.Integer(string='Rebonds', default=0)
    stats_unsubscribed = fields.Integer(string='Désabonnés', default=0)

    # Taux calculés
    delivery_rate = fields.Float(
        string='Taux de délivrabilité',
        compute='_compute_rates'
    )
    open_rate = fields.Float(
        string='Taux d\'ouverture',
        compute='_compute_rates'
    )
    click_rate = fields.Float(
        string='Taux de clic',
        compute='_compute_rates'
    )

    # Métadonnées
    active = fields.Boolean(default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        default=lambda self: self.env.company
    )
    created_by = fields.Many2one(
        'res.users',
        string='Créé par',
        default=lambda self: self.env.user
    )

    @api.depends('contact_list_id')
    def _compute_recipient_count(self):
        for record in self:
            if record.contact_list_id:
                record.recipient_count = record.contact_list_id.contact_count
            else:
                record.recipient_count = 0

    @api.depends('stats_sent', 'stats_delivered', 'stats_opened', 'stats_clicked')
    def _compute_rates(self):
        for record in self:
            if record.stats_sent > 0:
                record.delivery_rate = (record.stats_delivered / record.stats_sent) * 100
                record.open_rate = (record.stats_opened / record.stats_sent) * 100
                record.click_rate = (record.stats_clicked / record.stats_sent) * 100
            else:
                record.delivery_rate = 0
                record.open_rate = 0
                record.click_rate = 0

    def action_schedule(self):
        """Planifie la campagne"""
        self.ensure_one()
        if not self.scheduled_date:
            raise ValueError("Date planifiée requise")
        self.status = 'scheduled'

    def action_send(self):
        """Lance l'envoi de la campagne"""
        self.ensure_one()
        self.status = 'sending'

        if self.channel == 'email':
            self._send_email_campaign()
        elif self.channel == 'sms':
            self._send_sms_campaign()

    def _send_email_campaign(self):
        """Envoi de campagne email via Brevo/SMTP"""
        if not self.contact_list_id:
            return

        contacts = self.contact_list_id.get_contacts()
        sent_count = 0

        for contact in contacts:
            if contact.email:
                # TODO: Intégrer envoi via email_config
                sent_count += 1

        self.write({
            'stats_sent': sent_count,
            'sent_date': datetime.now(),
            'status': 'sent',
        })

    def _send_sms_campaign(self):
        """Envoi de campagne SMS via quelyos_sms_tn"""
        if not self.contact_list_id:
            return

        contacts = self.contact_list_id.get_contacts()
        sent_count = 0

        # Utilise le module quelyos_sms_tn si disponible
        sms_service = self.env.get('quelyos.sms.service')

        for contact in contacts:
            if contact.mobile:
                if sms_service:
                    try:
                        sms_service.send_sms(contact.mobile, self.sms_message)
                        sent_count += 1
                    except Exception:
                        pass
                else:
                    sent_count += 1  # Simulation en dev

        self.write({
            'stats_sent': sent_count,
            'sent_date': datetime.now(),
            'status': 'sent',
        })

    def action_cancel(self):
        """Annule la campagne"""
        self.ensure_one()
        self.status = 'cancelled'

    def action_duplicate(self):
        """Duplique la campagne"""
        self.ensure_one()
        return self.copy({
            'name': f"{self.name} (copie)",
            'status': 'draft',
            'stats_sent': 0,
            'stats_delivered': 0,
            'stats_opened': 0,
            'stats_clicked': 0,
            'sent_date': False,
        })

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'name': self.name,
            'channel': self.channel,
            'status': self.status,
            'subject': self.subject or '',
            'content': self.content or '',
            'sms_message': self.sms_message or '',
            'contact_list_id': self.contact_list_id.id if self.contact_list_id else None,
            'contact_list_name': self.contact_list_id.name if self.contact_list_id else '',
            'recipient_count': self.recipient_count,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'sent_date': self.sent_date.isoformat() if self.sent_date else None,
            'stats': {
                'sent': self.stats_sent,
                'delivered': self.stats_delivered,
                'opened': self.stats_opened,
                'clicked': self.stats_clicked,
                'bounced': self.stats_bounced,
                'unsubscribed': self.stats_unsubscribed,
            },
            'rates': {
                'delivery': round(self.delivery_rate, 1),
                'open': round(self.open_rate, 1),
                'click': round(self.click_rate, 1),
            },
            'created_at': self.create_date.isoformat() if self.create_date else None,
            'updated_at': self.write_date.isoformat() if self.write_date else None,
        }


class EmailTemplate(models.Model):
    _name = 'quelyos.email.template'
    _description = 'Email Template'
    _order = 'name'

    name = fields.Char(string='Nom', required=True)
    category = fields.Selection([
        ('welcome', 'Bienvenue'),
        ('ecommerce', 'E-commerce'),
        ('promo', 'Promotion'),
        ('newsletter', 'Newsletter'),
        ('loyalty', 'Fidélité'),
        ('transactional', 'Transactionnel'),
        ('reminder', 'Relance'),
        ('custom', 'Personnalisé'),
    ], string='Catégorie', default='custom')
    subject = fields.Char(string='Objet par défaut')
    content = fields.Html(string='Contenu HTML')
    preview_text = fields.Char(string='Texte de prévisualisation')
    active = fields.Boolean(default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'subject': self.subject or '',
            'content': self.content or '',
            'preview_text': self.preview_text or '',
        }
