"""
Job Queue
Système de queue de jobs asynchrones simple.
"""

import uuid
import json
import logging
from datetime import datetime
from odoo import models, fields, api

_logger = logging.getLogger(__name__)


class JobQueue(models.Model):
    """Queue de jobs asynchrones"""

    _name = 'quelyos.job.queue'
    _description = 'Async Job Queue'
    _order = 'create_date desc'

    job_id = fields.Char(
        string='Job ID',
        required=True,
        index=True,
        default=lambda self: str(uuid.uuid4())
    )

    model_name = fields.Char(
        string='Model',
        required=True,
        help='Nom du modèle à appeler'
    )

    method_name = fields.Char(
        string='Method',
        required=True,
        help='Nom de la méthode à exécuter'
    )

    args = fields.Text(
        string='Arguments JSON',
        help='Arguments de la méthode (format JSON)'
    )

    description = fields.Char(
        string='Description',
        help='Description du job'
    )

    status = fields.Selection([
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], string='Status', default='pending', required=True, index=True)

    result = fields.Text(
        string='Result',
        help='Résultat du job (JSON)'
    )

    error = fields.Text(
        string='Error',
        help='Message d\'erreur si échec'
    )

    started_at = fields.Datetime(string='Started At')
    completed_at = fields.Datetime(string='Completed At')

    duration_ms = fields.Integer(
        string='Duration (ms)',
        compute='_compute_duration',
        store=True
    )

    @api.depends('started_at', 'completed_at')
    def _compute_duration(self):
        """Calculer durée d'exécution"""
        for record in self:
            if record.started_at and record.completed_at:
                delta = record.completed_at - record.started_at
                record.duration_ms = int(delta.total_seconds() * 1000)
            else:
                record.duration_ms = 0

    @api.model
    def enqueue(self, model_name, method_name, args=None, description=None):
        """
        Créer un nouveau job dans la queue.

        Args:
            model_name (str): Nom du modèle (ex: 'quelyos.sitemap.service')
            method_name (str): Nom de la méthode (ex: '_run_healthcheck_job')
            args (list): Arguments de la méthode
            description (str): Description du job

        Returns:
            str: UUID du job créé
        """
        job_id = str(uuid.uuid4())

        job = self.create({
            'job_id': job_id,
            'model_name': model_name,
            'method_name': method_name,
            'args': json.dumps(args or []),
            'description': description,
            'status': 'pending'
        })

        _logger.info(f'[JobQueue] Enqueued job {job_id}: {description}')

        # Exécuter immédiatement (MVP - pas de vraie queue async)
        self.env.cr.commit()  # Commit pour que le job soit visible
        job._execute()

        return job_id

    def _execute(self):
        """
        Exécuter le job.
        Pour MVP: exécution immédiate synchrone.
        TODO: Implémenter vraie queue async avec worker.
        """
        self.ensure_one()

        if self.status != 'pending':
            _logger.warning(f'[JobQueue] Job {self.job_id} already processed (status: {self.status})')
            return

        self.write({
            'status': 'running',
            'started_at': fields.Datetime.now()
        })

        try:
            # Parser arguments
            args = json.loads(self.args) if self.args else []

            # Récupérer modèle et méthode
            model = self.env[self.model_name].sudo()
            method = getattr(model, self.method_name)

            # Exécuter méthode
            _logger.info(f'[JobQueue] Executing {self.model_name}.{self.method_name}')
            result = method(*args)

            # Marquer comme complété
            self.write({
                'status': 'completed',
                'completed_at': fields.Datetime.now(),
                'result': json.dumps(result) if result else None
            })

            _logger.info(f'[JobQueue] Job {self.job_id} completed successfully')

        except Exception as e:
            error_msg = str(e)
            _logger.error(f'[JobQueue] Job {self.job_id} failed: {error_msg}', exc_info=True)

            self.write({
                'status': 'failed',
                'completed_at': fields.Datetime.now(),
                'error': error_msg
            })

    @api.model
    def get_job_status(self, job_id):
        """
        Récupérer status d'un job.

        Args:
            job_id (str): UUID du job

        Returns:
            dict: Infos sur le job
        """
        job = self.search([('job_id', '=', job_id)], limit=1)

        if not job:
            return {'error': 'Job not found'}

        return {
            'job_id': job.job_id,
            'status': job.status,
            'description': job.description,
            'started_at': job.started_at.isoformat() if job.started_at else None,
            'completed_at': job.completed_at.isoformat() if job.completed_at else None,
            'duration_ms': job.duration_ms,
            'error': job.error,
            'result': json.loads(job.result) if job.result else None
        }

    @api.model
    def cleanup_old_jobs(self, days=7):
        """
        Nettoyer vieux jobs complétés/failed.

        Args:
            days (int): Garder jobs des N derniers jours
        """
        from datetime import timedelta

        cutoff = datetime.now() - timedelta(days=days)
        old_jobs = self.search([
            ('status', 'in', ['completed', 'failed']),
            ('create_date', '<', cutoff.strftime('%Y-%m-%d %H:%M:%S'))
        ])

        if old_jobs:
            count = len(old_jobs)
            old_jobs.unlink()
            _logger.info(f'[JobQueue] Deleted {count} old jobs (> {days} days)')
