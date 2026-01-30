# -*- coding: utf-8 -*-
"""
Modèle Backup Schedule pour la programmation des backups automatiques par tenant
"""

from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta
import logging

_logger = logging.getLogger(__name__)


class QuelyosBackupSchedule(models.Model):
    _name = 'quelyos.backup.schedule'
    _description = 'Backup Schedule (per tenant)'
    _order = 'tenant_id, create_date desc'

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        help='Tenant pour lequel programmer les backups automatiques'
    )

    enabled = fields.Boolean(
        string='Activé',
        default=True,
        help='Active/désactive le schedule'
    )

    frequency = fields.Selection([
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
    ], string='Fréquence', required=True, default='daily')

    day_of_week = fields.Integer(
        string='Jour de la semaine',
        help='0=Dimanche, 1=Lundi, ..., 6=Samedi (pour fréquence hebdomadaire)'
    )

    day_of_month = fields.Integer(
        string='Jour du mois',
        help='1-28 (pour fréquence mensuelle)'
    )

    hour = fields.Integer(
        string='Heure',
        required=True,
        default=2,
        help='Heure d\'exécution (0-23)'
    )

    minute = fields.Integer(
        string='Minute',
        required=True,
        default=0,
        help='Minute d\'exécution (0-59)'
    )

    backup_type = fields.Selection([
        ('tenant', 'Tenant'),
    ], string='Type de backup', required=True, default='tenant')

    retention_count = fields.Integer(
        string='Rétention (backups)',
        required=True,
        default=7,
        help='Nombre de backups à conserver (les plus anciens sont supprimés)'
    )

    last_run = fields.Datetime(
        string='Dernière exécution',
        readonly=True
    )

    next_run = fields.Datetime(
        string='Prochaine exécution',
        compute='_compute_next_run',
        store=True
    )

    last_backup_id = fields.Many2one(
        'quelyos.backup',
        string='Dernier backup',
        readonly=True
    )

    last_status = fields.Selection([
        ('success', 'Succès'),
        ('failed', 'Échec'),
    ], string='Dernier statut', readonly=True)

    notification_email = fields.Char(
        string='Email notification',
        help='Email pour recevoir notifications (optionnel, par défaut super-admin)'
    )

    @api.depends('enabled', 'frequency', 'day_of_week', 'day_of_month', 'hour', 'minute', 'last_run')
    def _compute_next_run(self):
        """Calcule la prochaine exécution du backup"""
        for record in self:
            if not record.enabled:
                record.next_run = False
                continue

            # Partir de last_run ou maintenant
            base_time = record.last_run or fields.Datetime.now()

            if record.frequency == 'daily':
                # Prochaine occurrence à hour:minute
                next_time = base_time.replace(
                    hour=record.hour,
                    minute=record.minute,
                    second=0,
                    microsecond=0
                )

                # Si déjà passé aujourd'hui, prendre demain
                if next_time <= fields.Datetime.now():
                    next_time += timedelta(days=1)

            elif record.frequency == 'weekly':
                # Trouver prochain jour de la semaine
                current_weekday = base_time.weekday()
                target_weekday = (record.day_of_week - 1) % 7  # Convertir 0=dimanche → 6

                days_ahead = (target_weekday - current_weekday) % 7
                if days_ahead == 0 and base_time.hour >= record.hour:
                    days_ahead = 7

                next_time = base_time + timedelta(days=days_ahead)
                next_time = next_time.replace(
                    hour=record.hour,
                    minute=record.minute,
                    second=0,
                    microsecond=0
                )

            elif record.frequency == 'monthly':
                # Prochaine occurrence au jour du mois
                next_time = base_time.replace(
                    day=record.day_of_month,
                    hour=record.hour,
                    minute=record.minute,
                    second=0,
                    microsecond=0
                )

                # Si déjà passé ce mois, prendre le mois suivant
                if next_time <= fields.Datetime.now():
                    # Ajouter un mois
                    if next_time.month == 12:
                        next_time = next_time.replace(year=next_time.year + 1, month=1)
                    else:
                        next_time = next_time.replace(month=next_time.month + 1)

            else:
                next_time = False

            record.next_run = next_time

    @api.constrains('tenant_id')
    def _check_unique_tenant(self):
        """Un seul schedule actif par tenant"""
        for record in self:
            existing = self.search([
                ('tenant_id', '=', record.tenant_id.id),
                ('id', '!=', record.id),
                ('enabled', '=', True)
            ])
            if existing:
                raise ValidationError(
                    f"Un schedule actif existe déjà pour le tenant {record.tenant_id.name}. "
                    "Désactivez-le avant d'en créer un nouveau."
                )

    @api.constrains('hour', 'minute', 'day_of_week', 'day_of_month')
    def _check_schedule_values(self):
        """Valider les valeurs de schedule"""
        for record in self:
            if not (0 <= record.hour <= 23):
                raise ValidationError("L'heure doit être entre 0 et 23")

            if not (0 <= record.minute <= 59):
                raise ValidationError("Les minutes doivent être entre 0 et 59")

            if record.frequency == 'weekly' and not (0 <= record.day_of_week <= 6):
                raise ValidationError("Le jour de la semaine doit être entre 0 (dimanche) et 6 (samedi)")

            if record.frequency == 'monthly' and not (1 <= record.day_of_month <= 28):
                raise ValidationError("Le jour du mois doit être entre 1 et 28")

    def execute_scheduled_backup(self):
        """Exécute le backup schedulé (appelé par cron)"""
        self.ensure_one()

        if not self.enabled:
            _logger.warning(f"Schedule {self.id} désactivé, skip")
            return

        _logger.info(
            f"[SCHEDULE] Exécution backup automatique - "
            f"Tenant: {self.tenant_id.code} | Schedule ID: {self.id}"
        )

        try:
            # Créer le backup
            Backup = self.env['quelyos.backup'].sudo()
            backup = Backup.create({
                'type': 'tenant',
                'tenant_id': self.tenant_id.id,
                'status': 'pending',
                'triggered_by': self.env.ref('base.user_admin').id,  # System user
            })

            # Exécuter backup en background (threading)
            db_name = self.env.cr.dbname

            def _execute_backup_thread():
                try:
                    import odoo
                    from odoo.api import Environment
                    from odoo.modules.registry import Registry
                    registry = Registry(db_name)
                    with registry.cursor() as cr:
                        env = Environment(cr, odoo.SUPERUSER_ID, {})
                        backup_record = env['quelyos.backup'].browse(backup.id)
                        backup_record.execute_tenant_backup()
                        cr.commit()

                        # MAJ schedule après succès
                        schedule = env['quelyos.backup.schedule'].browse(self.id)
                        schedule.write({
                            'last_run': fields.Datetime.now(),
                            'last_backup_id': backup.id,
                            'last_status': 'success',
                        })
                        cr.commit()

                        # Gérer rétention
                        schedule._cleanup_old_backups()

                        # Notification succès
                        schedule._send_notification('success', backup_record)

                except Exception as e:
                    _logger.error(f"Scheduled backup failed: {e}", exc_info=True)

                    # MAJ schedule après échec
                    try:
                        with registry.cursor() as cr:
                            env = Environment(cr, odoo.SUPERUSER_ID, {})
                            schedule = env['quelyos.backup.schedule'].browse(self.id)
                            schedule.write({
                                'last_run': fields.Datetime.now(),
                                'last_status': 'failed',
                            })
                            cr.commit()

                            # Notification échec
                            schedule._send_notification('failed', None, str(e))
                    except Exception as notif_error:
                        _logger.error(f"Failed to send notification: {notif_error}")

            import threading
            thread = threading.Thread(target=_execute_backup_thread)
            thread.daemon = True
            thread.start()

            _logger.info(f"[SCHEDULE] Backup lancé en background - Backup ID: {backup.id}")

        except Exception as e:
            _logger.error(f"Failed to start scheduled backup: {e}", exc_info=True)
            self.write({
                'last_run': fields.Datetime.now(),
                'last_status': 'failed',
            })
            self._send_notification('failed', None, str(e))

    def _cleanup_old_backups(self):
        """Supprime les backups anciens selon retention_count"""
        self.ensure_one()

        Backup = self.env['quelyos.backup'].sudo()
        backups = Backup.search([
            ('tenant_id', '=', self.tenant_id.id),
            ('type', '=', 'tenant'),
            ('status', '=', 'completed')
        ], order='create_date desc')

        # Garder seulement retention_count backups
        backups_to_delete = backups[self.retention_count:]

        if backups_to_delete:
            _logger.info(
                f"[RETENTION] Suppression {len(backups_to_delete)} vieux backups "
                f"pour tenant {self.tenant_id.code}"
            )

            for backup in backups_to_delete:
                # Supprimer fichier physique
                import os
                if backup.file_path and os.path.exists(backup.file_path):
                    try:
                        os.remove(backup.file_path)
                        _logger.info(f"Deleted old backup file: {backup.file_path}")
                    except Exception as e:
                        _logger.warning(f"Could not delete backup file: {e}")

                # Supprimer record
                backup.unlink()

    def _send_notification(self, status, backup=None, error_message=None):
        """Envoie notification email"""
        self.ensure_one()

        # Email destinataire
        recipient_email = self.notification_email or self.env.ref('base.user_admin').email

        if not recipient_email:
            _logger.warning("No notification email configured, skipping")
            return

        # Template selon statut
        if status == 'success':
            subject = f"✅ Backup automatique réussi - {self.tenant_id.name}"
            body = f"""
<p>Le backup automatique du tenant <strong>{self.tenant_id.name}</strong> s'est terminé avec succès.</p>

<ul>
    <li><strong>Tenant</strong> : {self.tenant_id.name} ({self.tenant_id.code})</li>
    <li><strong>Date</strong> : {fields.Datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
    <li><strong>Taille</strong> : {backup.size_mb:.2f} MB</li>
    <li><strong>Records</strong> : {backup.records_count}</li>
    <li><strong>Fichier</strong> : {backup.filename}</li>
</ul>

<p>Prochaine exécution : {self.next_run.strftime('%Y-%m-%d %H:%M:%S') if self.next_run else 'N/A'}</p>
            """
        else:
            subject = f"❌ Échec backup automatique - {self.tenant_id.name}"
            body = f"""
<p><strong style="color: red;">Le backup automatique du tenant {self.tenant_id.name} a échoué.</strong></p>

<ul>
    <li><strong>Tenant</strong> : {self.tenant_id.name} ({self.tenant_id.code})</li>
    <li><strong>Date</strong> : {fields.Datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</li>
    <li><strong>Erreur</strong> : {error_message}</li>
</ul>

<p>Veuillez vérifier les logs Odoo pour plus de détails.</p>
            """

        # Envoyer email
        try:
            mail_values = {
                'subject': subject,
                'body_html': body,
                'email_to': recipient_email,
                'email_from': self.env.company.email or 'noreply@quelyos.com',
            }
            mail = self.env['mail.mail'].sudo().create(mail_values)
            mail.send()

            _logger.info(f"Notification email sent to {recipient_email}")

        except Exception as e:
            _logger.error(f"Failed to send notification email: {e}")

    @api.model
    def cron_execute_scheduled_backups(self):
        """Cron job : Exécute tous les backups schedulés dont next_run est passé"""
        now = fields.Datetime.now()

        schedules = self.search([
            ('enabled', '=', True),
            ('next_run', '<=', now)
        ])

        _logger.info(f"[CRON] Found {len(schedules)} schedules to execute")

        for schedule in schedules:
            try:
                schedule.execute_scheduled_backup()
            except Exception as e:
                _logger.error(
                    f"[CRON] Failed to execute schedule {schedule.id} "
                    f"for tenant {schedule.tenant_id.code}: {e}",
                    exc_info=True
                )
