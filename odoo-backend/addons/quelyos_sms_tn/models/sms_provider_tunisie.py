# -*- coding: utf-8 -*-
import requests
import json
import logging
import time
from odoo import models, api, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class SMSProviderTunisie(models.AbstractModel):
    _name = 'quelyos.sms.provider.tunisie'
    _description = 'Provider SMS Tunisie'

    @api.model
    def send_sms(self, mobile, message, notification_type='other', partner_id=None, order_id=None):
        """
        Send SMS via Tunisie SMS API

        :param mobile: Mobile number (international format)
        :param message: SMS message content
        :param notification_type: Type of notification
        :param partner_id: Related partner ID (optional)
        :param order_id: Related order ID (optional)
        :return: SMSLog record
        """
        # Get company SMS config
        config = self.env['quelyos.sms.config'].get_config_for_company()

        # Create SMS log
        sms_log = self.env['quelyos.sms.log'].create({
            'mobile': mobile,
            'message': message,
            'notification_type': notification_type,
            'partner_id': partner_id,
            'order_id': order_id,
            'status': 'pending',
        })

        # Check if SMS is enabled
        if not config.is_active:
            _logger.warning('SMS not active for company %s', self.env.company.name)
            sms_log.write({
                'status': 'failed',
                'error_message': 'SMS désactivé'
            })
            return sms_log

        # Check quota
        quota_ok, remaining, total = sms_log.check_quota_available()
        if not quota_ok:
            _logger.warning('SMS quota exceeded for company %s (%d/%d)',
                          self.env.company.name, total - remaining, total)
            sms_log.write({
                'status': 'failed',
                'error_message': f'Quota SMS dépassé ({total - remaining}/{total})'
            })
            return sms_log

        # Send SMS
        try:
            result = self._call_tunisie_sms_api(
                config=config,
                mobile=mobile,
                message=message
            )

            if result.get('success'):
                sms_log.write({
                    'status': 'sent',
                    'sent_date': self.env.cr.now(),
                    'provider_response': json.dumps(result),
                    'cost': self._calculate_sms_cost(mobile, message),
                })
                _logger.info('SMS sent successfully to %s', mobile)
            else:
                sms_log.write({
                    'status': 'failed',
                    'error_message': result.get('error', 'Unknown error'),
                    'provider_response': json.dumps(result),
                })
                _logger.error('SMS sending failed: %s', result.get('error'))

        except Exception as e:
            _logger.exception('Exception while sending SMS to %s', mobile)
            sms_log.write({
                'status': 'failed',
                'error_message': str(e),
            })

        return sms_log

    @api.model
    def send_sms_with_retry(self, mobile, message, notification_type='other',
                           partner_id=None, order_id=None, max_retries=3):
        """
        Send SMS with automatic retry on failure

        :param max_retries: Maximum number of retry attempts
        :return: SMSLog record
        """
        sms_log = None

        for attempt in range(1, max_retries + 1):
            _logger.info('SMS send attempt %d/%d to %s', attempt, max_retries, mobile)

            if attempt == 1:
                # First attempt
                sms_log = self.send_sms(
                    mobile=mobile,
                    message=message,
                    notification_type=notification_type,
                    partner_id=partner_id,
                    order_id=order_id
                )
            else:
                # Retry
                sms_log.write({'retry_count': attempt})
                config = self.env['quelyos.sms.config'].get_config_for_company()

                try:
                    result = self._call_tunisie_sms_api(
                        config=config,
                        mobile=mobile,
                        message=message
                    )

                    if result.get('success'):
                        sms_log.write({
                            'status': 'sent',
                            'sent_date': self.env.cr.now(),
                            'provider_response': json.dumps(result),
                            'cost': self._calculate_sms_cost(mobile, message),
                        })
                        _logger.info('SMS sent successfully on retry %d', attempt)
                        return sms_log

                except Exception as e:
                    _logger.warning('Retry %d failed: %s', attempt, str(e))

            # Check if successful
            if sms_log.status == 'sent':
                return sms_log

            # Wait before retry (exponential backoff)
            if attempt < max_retries:
                wait_time = 2 ** attempt  # 2s, 4s, 8s
                _logger.info('Waiting %ds before retry...', wait_time)
                time.sleep(wait_time)

        # All retries failed - check for fallback
        if notification_type in ['order_confirmation', 'shipping_update']:
            _logger.info('Critical SMS failed, sending fallback email')
            self._send_fallback_email(sms_log)
            sms_log.write({'status': 'fallback_email'})

        return sms_log

    @api.model
    def _call_tunisie_sms_api(self, config, mobile, message):
        """
        Call Tunisie SMS API

        :param config: SMSConfig record
        :param mobile: Mobile number
        :param message: Message content
        :return: dict with success status and response
        """
        if not config.api_key:
            raise UserError(_('API Key SMS non configurée'))

        # Clean mobile number
        mobile_clean = mobile.replace(' ', '').replace('-', '')

        # Prepare payload
        payload = {
            'api_key': config.api_key,
            'sender': config.sender_name or 'Quelyos',
            'recipients': [mobile_clean],
            'message': message,
        }

        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

        try:
            response = requests.post(
                config.endpoint,
                json=payload,
                headers=headers,
                timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Check API response format (adjust based on actual Tunisie SMS API)
            if data.get('status') == 'success' or data.get('success'):
                return {
                    'success': True,
                    'response': data
                }
            else:
                return {
                    'success': False,
                    'error': data.get('message', 'Unknown error'),
                    'response': data
                }

        except requests.exceptions.RequestException as e:
            _logger.error('API call error: %s', str(e))
            return {
                'success': False,
                'error': f'Connection error: {str(e)}'
            }

    @api.model
    def _calculate_sms_cost(self, mobile, message):
        """
        Calculate SMS cost based on destination and length

        :param mobile: Mobile number
        :param message: Message content
        :return: Cost in DT
        """
        # Number of SMS parts (160 chars per SMS)
        num_parts = (len(message) - 1) // 160 + 1

        # Cost per SMS
        if mobile.startswith('+216'):
            # Local Tunisia
            cost_per_sms = 0.050  # 50 millimes
        else:
            # International
            cost_per_sms = 0.150  # 150 millimes

        return num_parts * cost_per_sms

    @api.model
    def _send_fallback_email(self, sms_log):
        """
        Send email as fallback when SMS fails (for critical notifications)

        :param sms_log: SMSLog record
        """
        if not sms_log.partner_id or not sms_log.partner_id.email:
            _logger.warning('No email available for fallback (SMS log %d)', sms_log.id)
            return

        try:
            template_id = False

            if sms_log.notification_type == 'order_confirmation':
                template_id = self.env.ref('sale.email_template_edi_sale', raise_if_not_found=False)
            elif sms_log.notification_type == 'shipping_update' and sms_log.order_id:
                # Generic notification email
                template_id = self.env.ref('mail.mail_template_data_notification_email_default', raise_if_not_found=False)

            if template_id and sms_log.order_id:
                template_id.send_mail(sms_log.order_id.id, force_send=True)
                _logger.info('Fallback email sent to %s', sms_log.partner_id.email)

        except Exception as e:
            _logger.exception('Failed to send fallback email: %s', str(e))

    @api.model
    def process_pending_sms_queue(self):
        """
        Cron job: Process pending SMS in queue
        Called every 5 minutes
        """
        _logger.info('Processing pending SMS queue...')

        # Find pending SMS (not older than 24h)
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(hours=24)

        pending_sms = self.env['quelyos.sms.log'].search([
            ('status', '=', 'pending'),
            ('create_date', '>=', cutoff_date)
        ], order='create_date', limit=100)

        _logger.info('Found %d pending SMS', len(pending_sms))

        for sms in pending_sms:
            try:
                # Get config for SMS company
                config = self.env['quelyos.sms.config'].sudo().search([
                    ('company_id', '=', sms.company_id.id)
                ], limit=1)

                if not config or not config.is_active:
                    sms.write({
                        'status': 'failed',
                        'error_message': 'SMS désactivé'
                    })
                    continue

                # Try to send
                result = self._call_tunisie_sms_api(
                    config=config,
                    mobile=sms.mobile,
                    message=sms.message
                )

                if result.get('success'):
                    sms.write({
                        'status': 'sent',
                        'sent_date': fields.Datetime.now(),
                        'provider_response': json.dumps(result),
                        'cost': self._calculate_sms_cost(sms.mobile, sms.message),
                    })
                else:
                    sms.write({
                        'retry_count': sms.retry_count + 1
                    })

                    if sms.retry_count >= sms.max_retries:
                        sms.write({
                            'status': 'failed',
                            'error_message': result.get('error', 'Max retries reached'),
                        })

                # Commit after each SMS to avoid losing work
                self.env.cr.commit()

            except Exception as e:
                _logger.exception('Error processing SMS %d: %s', sms.id, str(e))
                self.env.cr.rollback()

        _logger.info('SMS queue processing complete')

        return True
