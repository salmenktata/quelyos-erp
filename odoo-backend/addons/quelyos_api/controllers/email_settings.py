# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import logging

_logger = logging.getLogger(__name__)


class EmailSettingsController(http.Controller):

    @http.route('/api/admin/email/config', type='jsonrpc', auth='user', methods=['POST'])
    def get_email_config(self, **kwargs):
        """Get email configuration for current company"""
        try:
            if not request.env.user.has_group('base.group_system'):
                return {'success': False, 'error': 'Accès non autorisé'}

            EmailConfig = request.env['quelyos.email.config']
            config = EmailConfig.get_config_for_company()

            return {
                'success': True,
                'config': config.to_frontend_config()
            }

        except Exception as e:
            _logger.error("Error fetching email config: %s", str(e))
            return {'success': False, 'error': 'Erreur lors de la récupération de la configuration'}

    @http.route('/api/admin/email/config/update', type='jsonrpc', auth='user', methods=['POST'])
    def update_email_config(self, **kwargs):
        """Update email configuration"""
        try:
            if not request.env.user.has_group('base.group_system'):
                return {'success': False, 'error': 'Accès non autorisé'}

            EmailConfig = request.env['quelyos.email.config']
            config = EmailConfig.get_config_for_company()

            update_vals = {}

            # Provider
            if 'provider' in kwargs:
                update_vals['provider'] = kwargs['provider']

            # SMTP fields
            if 'smtpHost' in kwargs:
                update_vals['smtp_host'] = kwargs['smtpHost']
            if 'smtpPort' in kwargs:
                update_vals['smtp_port'] = kwargs['smtpPort']
            if 'smtpUser' in kwargs:
                update_vals['smtp_user'] = kwargs['smtpUser']
            if 'smtpPassword' in kwargs and kwargs['smtpPassword'] != '***':
                update_vals['smtp_password'] = kwargs['smtpPassword']
            if 'smtpEncryption' in kwargs:
                update_vals['smtp_encryption'] = kwargs['smtpEncryption']

            # API Key (for Brevo, SendGrid, Mailgun)
            if 'apiKey' in kwargs and kwargs['apiKey'] != '***':
                update_vals['api_key'] = kwargs['apiKey']

            # Sender
            if 'emailFrom' in kwargs:
                update_vals['email_from'] = kwargs['emailFrom']
            if 'emailFromName' in kwargs:
                update_vals['email_from_name'] = kwargs['emailFromName']

            # Active
            if 'isActive' in kwargs:
                update_vals['is_active'] = kwargs['isActive']

            # Module activation
            if 'storeEnabled' in kwargs:
                update_vals['store_enabled'] = kwargs['storeEnabled']
            if 'financeEnabled' in kwargs:
                update_vals['finance_enabled'] = kwargs['financeEnabled']
            if 'marketingEnabled' in kwargs:
                update_vals['marketing_enabled'] = kwargs['marketingEnabled']
            if 'crmEnabled' in kwargs:
                update_vals['crm_enabled'] = kwargs['crmEnabled']
            if 'hrEnabled' in kwargs:
                update_vals['hr_enabled'] = kwargs['hrEnabled']
            if 'stockEnabled' in kwargs:
                update_vals['stock_enabled'] = kwargs['stockEnabled']

            if update_vals:
                config.write(update_vals)

            return {
                'success': True,
                'config': config.to_frontend_config()
            }

        except Exception as e:
            _logger.error("Error updating email config: %s", str(e))
            return {'success': False, 'error': 'Erreur lors de la mise à jour de la configuration'}

    @http.route('/api/admin/email/test', type='jsonrpc', auth='user', methods=['POST'])
    def test_email_connection(self, **kwargs):
        """Test email connection and optionally send test email"""
        try:
            if not request.env.user.has_group('base.group_system'):
                return {'success': False, 'error': 'Accès non autorisé'}

            EmailConfig = request.env['quelyos.email.config']
            config = EmailConfig.get_config_for_company()

            result = config.test_connection()

            # Optionally send test email
            test_recipient = kwargs.get('testEmail')
            if result.get('success') and test_recipient:
                send_result = self._send_test_email(config, test_recipient)
                if not send_result.get('success'):
                    return send_result

            return result

        except Exception as e:
            _logger.error("Error testing email connection: %s", str(e))
            return {'success': False, 'error': 'Erreur lors du test de connexion'}

    def _send_test_email(self, config, recipient):
        """Send a test email"""
        try:
            if config.provider == 'smtp':
                return self._send_smtp_test(config, recipient)
            elif config.provider == 'brevo':
                return self._send_brevo_test(config, recipient)
            elif config.provider == 'sendgrid':
                return self._send_sendgrid_test(config, recipient)

            return {'success': False, 'error': 'Provider non supporté pour envoi test'}

        except Exception as e:
            _logger.error("Error sending test email: %s", str(e))
            return {'success': False, 'error': 'Erreur lors de l\'envoi de l\'email de test'}

    def _send_smtp_test(self, config, recipient):
        """Send test email via SMTP"""
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        try:
            msg = MIMEMultipart()
            msg['From'] = f"{config.email_from_name or 'Quelyos'} <{config.email_from}>"
            msg['To'] = recipient
            msg['Subject'] = 'Test Email - Quelyos Configuration'

            body = """
            Ceci est un email de test envoyé depuis la configuration Quelyos.

            Si vous recevez ce message, votre configuration email est correcte !

            ---
            Quelyos ERP
            """
            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            if config.smtp_encryption == 'ssl':
                server = smtplib.SMTP_SSL(config.smtp_host, config.smtp_port, timeout=10)
            else:
                server = smtplib.SMTP(config.smtp_host, config.smtp_port, timeout=10)
                if config.smtp_encryption == 'tls':
                    server.starttls()

            if config.smtp_user and config.smtp_password:
                server.login(config.smtp_user, config.smtp_password)

            server.sendmail(config.email_from, recipient, msg.as_string())
            server.quit()

            return {'success': True, 'message': f'Email de test envoyé à {recipient}'}

        except Exception as e:
            _logger.error("SMTP send error: %s", str(e))
            return {'success': False, 'error': 'Erreur d\'envoi SMTP'}

    def _send_brevo_test(self, config, recipient):
        """Send test email via Brevo"""
        import requests

        try:
            payload = {
                'sender': {
                    'name': config.email_from_name or 'Quelyos',
                    'email': config.email_from
                },
                'to': [{'email': recipient}],
                'subject': 'Test Email - Quelyos Configuration',
                'textContent': 'Ceci est un email de test. Votre configuration Brevo est correcte !'
            }

            response = requests.post(
                'https://api.brevo.com/v3/smtp/email',
                headers={
                    'api-key': config.api_key,
                    'Content-Type': 'application/json'
                },
                json=payload,
                timeout=10
            )

            if response.status_code in [200, 201]:
                return {'success': True, 'message': f'Email de test envoyé à {recipient}'}
            else:
                return {'success': False, 'error': f'Erreur Brevo: {response.text}'}

        except Exception as e:
            _logger.error("Brevo send error: %s", str(e))
            return {'success': False, 'error': 'Erreur d\'envoi Brevo'}

    def _send_sendgrid_test(self, config, recipient):
        """Send test email via SendGrid"""
        import requests

        try:
            payload = {
                'personalizations': [{'to': [{'email': recipient}]}],
                'from': {
                    'email': config.email_from,
                    'name': config.email_from_name or 'Quelyos'
                },
                'subject': 'Test Email - Quelyos Configuration',
                'content': [{'type': 'text/plain', 'value': 'Ceci est un email de test. Votre configuration SendGrid est correcte !'}]
            }

            response = requests.post(
                'https://api.sendgrid.com/v3/mail/send',
                headers={
                    'Authorization': f'Bearer {config.api_key}',
                    'Content-Type': 'application/json'
                },
                json=payload,
                timeout=10
            )

            if response.status_code in [200, 202]:
                return {'success': True, 'message': f'Email de test envoyé à {recipient}'}
            else:
                return {'success': False, 'error': f'Erreur SendGrid: {response.text}'}

        except Exception as e:
            _logger.error("SendGrid send error: %s", str(e))
            return {'success': False, 'error': 'Erreur d\'envoi SendGrid'}
