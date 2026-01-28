# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import smtplib
import logging

_logger = logging.getLogger(__name__)


class EmailConfig(models.Model):
    _name = 'quelyos.email.config'
    _description = 'Configuration Email Globale'

    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company
    )

    provider = fields.Selection([
        ('smtp', 'SMTP personnalisé'),
        ('brevo', 'Brevo (Sendinblue)'),
        ('sendgrid', 'SendGrid'),
        ('mailgun', 'Mailgun'),
    ], string='Provider', default='smtp')

    # SMTP Configuration
    smtp_host = fields.Char(string='Serveur SMTP')
    smtp_port = fields.Integer(string='Port', default=587)
    smtp_user = fields.Char(string='Utilisateur')
    smtp_password = fields.Char(
        string='Mot de passe',
        groups='base.group_system'
    )
    smtp_encryption = fields.Selection([
        ('none', 'Aucun'),
        ('tls', 'TLS'),
        ('ssl', 'SSL'),
    ], string='Chiffrement', default='tls')

    # API Provider Configuration
    api_key = fields.Char(
        string='API Key',
        groups='base.group_system'
    )

    # Sender Configuration
    email_from = fields.Char(string='Email expéditeur')
    email_from_name = fields.Char(string='Nom affiché')

    is_active = fields.Boolean(string='Actif', default=False)

    # Module activation flags
    store_enabled = fields.Boolean(string='Store activé', default=True)
    finance_enabled = fields.Boolean(string='Finance activé', default=False)
    marketing_enabled = fields.Boolean(string='Marketing activé', default=False)
    crm_enabled = fields.Boolean(string='CRM activé', default=False)
    hr_enabled = fields.Boolean(string='RH activé', default=False)
    stock_enabled = fields.Boolean(string='Stock activé', default=False)

    @api.constrains('email_from')
    def _check_email_from(self):
        """Validate email format"""
        import re
        for record in self:
            if record.email_from:
                if not re.match(r'^[^@]+@[^@]+\.[^@]+$', record.email_from):
                    raise ValidationError(_("L'adresse email expéditeur n'est pas valide."))

    @api.constrains('smtp_port')
    def _check_smtp_port(self):
        """Validate SMTP port"""
        for record in self:
            if record.smtp_port and (record.smtp_port < 1 or record.smtp_port > 65535):
                raise ValidationError(_("Le port SMTP doit être entre 1 et 65535."))

    def to_frontend_config(self):
        """Convert to frontend format (camelCase)"""
        self.ensure_one()

        return {
            'provider': self.provider,
            'smtpHost': self.smtp_host or '',
            'smtpPort': self.smtp_port,
            'smtpUser': self.smtp_user or '',
            'smtpPassword': '***' if self.smtp_password else '',
            'smtpEncryption': self.smtp_encryption,
            'apiKey': '***' if self.api_key else '',
            'emailFrom': self.email_from or '',
            'emailFromName': self.email_from_name or '',
            'isActive': self.is_active,
            'storeEnabled': self.store_enabled,
            'financeEnabled': self.finance_enabled,
            'marketingEnabled': self.marketing_enabled,
            'crmEnabled': self.crm_enabled,
            'hrEnabled': self.hr_enabled,
            'stockEnabled': self.stock_enabled,
        }

    @api.model
    def get_config_for_company(self, company_id=None):
        """Get or create email config for company"""
        if not company_id:
            company_id = self.env.company.id

        config = self.search([('company_id', '=', company_id)], limit=1)

        if not config:
            config = self.create({
                'company_id': company_id,
                'provider': 'smtp',
                'smtp_port': 587,
                'smtp_encryption': 'tls',
            })

        return config

    def test_connection(self):
        """Test email connection"""
        self.ensure_one()

        if self.provider == 'smtp':
            return self._test_smtp_connection()
        elif self.provider == 'brevo':
            return self._test_brevo_connection()
        elif self.provider == 'sendgrid':
            return self._test_sendgrid_connection()
        elif self.provider == 'mailgun':
            return self._test_mailgun_connection()

        return {'success': False, 'message': _('Provider non supporté')}

    def _test_smtp_connection(self):
        """Test SMTP connection"""
        if not self.smtp_host or not self.smtp_port:
            return {'success': False, 'message': _('Configuration SMTP incomplète')}

        try:
            if self.smtp_encryption == 'ssl':
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10)
                if self.smtp_encryption == 'tls':
                    server.starttls()

            if self.smtp_user and self.smtp_password:
                server.login(self.smtp_user, self.smtp_password)

            server.quit()
            return {'success': True, 'message': _('Connexion SMTP réussie')}

        except smtplib.SMTPAuthenticationError:
            return {'success': False, 'message': _('Erreur authentification SMTP')}
        except smtplib.SMTPConnectError:
            return {'success': False, 'message': _('Impossible de se connecter au serveur SMTP')}
        except Exception as e:
            _logger.error("SMTP test error: %s", str(e))
            return {'success': False, 'message': str(e)}

    def _test_brevo_connection(self):
        """Test Brevo API connection"""
        if not self.api_key:
            return {'success': False, 'message': _('API Key Brevo manquante')}

        try:
            import requests
            response = requests.get(
                'https://api.brevo.com/v3/account',
                headers={'api-key': self.api_key},
                timeout=10
            )
            if response.status_code == 200:
                return {'success': True, 'message': _('Connexion Brevo réussie')}
            else:
                return {'success': False, 'message': _('API Key Brevo invalide')}
        except Exception as e:
            _logger.error("Brevo test error: %s", str(e))
            return {'success': False, 'message': str(e)}

    def _test_sendgrid_connection(self):
        """Test SendGrid API connection"""
        if not self.api_key:
            return {'success': False, 'message': _('API Key SendGrid manquante')}

        try:
            import requests
            response = requests.get(
                'https://api.sendgrid.com/v3/user/profile',
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=10
            )
            if response.status_code == 200:
                return {'success': True, 'message': _('Connexion SendGrid réussie')}
            else:
                return {'success': False, 'message': _('API Key SendGrid invalide')}
        except Exception as e:
            _logger.error("SendGrid test error: %s", str(e))
            return {'success': False, 'message': str(e)}

    def _test_mailgun_connection(self):
        """Test Mailgun API connection"""
        if not self.api_key:
            return {'success': False, 'message': _('API Key Mailgun manquante')}

        # Mailgun requires domain validation - simplified test
        return {'success': True, 'message': _('Configuration Mailgun enregistrée (validation manuelle requise)')}
