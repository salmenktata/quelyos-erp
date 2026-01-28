# -*- coding: utf-8 -*-
"""
Background Jobs Queue pour Quelyos ERP

File d'attente pour tâches asynchrones:
- Envoi d'emails
- Génération de rapports
- Synchronisation de données
- Traitements lourds

Utilise Celery avec Redis comme broker.
"""

import os
import logging
import json
from typing import Any, Dict, Optional, Callable
from datetime import datetime, timedelta
from functools import wraps
from enum import Enum
import uuid

_logger = logging.getLogger(__name__)

# Configuration
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')
JOB_QUEUE_PREFIX = 'quelyos:jobs:'


class JobStatus(Enum):
    """États possibles d'un job"""
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    RETRYING = 'retrying'
    CANCELLED = 'cancelled'


class JobPriority(Enum):
    """Priorités des jobs"""
    LOW = 1
    NORMAL = 5
    HIGH = 10
    CRITICAL = 20


# =============================================================================
# JOB REGISTRY
# =============================================================================

class JobRegistry:
    """Registre des handlers de jobs"""

    _handlers: Dict[str, Callable] = {}

    @classmethod
    def register(cls, job_type: str):
        """Décorateur pour enregistrer un handler de job"""
        def decorator(func):
            cls._handlers[job_type] = func
            _logger.debug(f"Registered job handler: {job_type}")
            return func
        return decorator

    @classmethod
    def get_handler(cls, job_type: str) -> Optional[Callable]:
        """Récupère le handler pour un type de job"""
        return cls._handlers.get(job_type)

    @classmethod
    def list_types(cls) -> list:
        """Liste tous les types de jobs enregistrés"""
        return list(cls._handlers.keys())


# Alias pour faciliter l'usage
job_handler = JobRegistry.register


# =============================================================================
# JOB QUEUE SERVICE
# =============================================================================

class JobQueue:
    """
    Service de file d'attente de jobs.

    Usage:
        queue = JobQueue()

        # Ajouter un job
        job_id = queue.enqueue('send_email', {
            'to': 'user@example.com',
            'subject': 'Hello',
            'body': 'World'
        })

        # Vérifier le statut
        status = queue.get_status(job_id)

        # Annuler un job
        queue.cancel(job_id)
    """

    def __init__(self):
        self._redis = None
        self._init_redis()

    def _init_redis(self):
        """Initialise la connexion Redis"""
        try:
            import redis
            self._redis = redis.from_url(REDIS_URL)
            self._redis.ping()
            _logger.info("Job queue connected to Redis")
        except Exception as e:
            _logger.warning(f"Redis not available for job queue: {e}")
            self._redis = None

    def enqueue(
        self,
        job_type: str,
        payload: Dict[str, Any],
        priority: JobPriority = JobPriority.NORMAL,
        delay: int = 0,
        max_retries: int = 3,
        timeout: int = 300,
        queue: str = 'default'
    ) -> str:
        """
        Ajoute un job à la file d'attente.

        Args:
            job_type: Type de job (doit avoir un handler enregistré)
            payload: Données du job
            priority: Priorité du job
            delay: Délai en secondes avant exécution
            max_retries: Nombre max de tentatives
            timeout: Timeout en secondes
            queue: Nom de la file

        Returns:
            ID du job créé
        """
        job_id = str(uuid.uuid4())

        job_data = {
            'id': job_id,
            'type': job_type,
            'payload': payload,
            'priority': priority.value,
            'status': JobStatus.PENDING.value,
            'created_at': datetime.utcnow().isoformat(),
            'scheduled_at': (datetime.utcnow() + timedelta(seconds=delay)).isoformat(),
            'max_retries': max_retries,
            'retry_count': 0,
            'timeout': timeout,
            'queue': queue,
            'result': None,
            'error': None,
        }

        if self._redis:
            # Stocker le job
            key = f"{JOB_QUEUE_PREFIX}{job_id}"
            self._redis.setex(key, 86400 * 7, json.dumps(job_data))  # TTL 7 jours

            # Ajouter à la file avec score = timestamp + (100 - priority)
            score = datetime.utcnow().timestamp() + delay - priority.value
            self._redis.zadd(f"{JOB_QUEUE_PREFIX}queue:{queue}", {job_id: score})

            _logger.info(f"Job enqueued: {job_id} ({job_type})")
        else:
            # Fallback: exécution synchrone
            _logger.warning(f"Redis unavailable, executing job {job_id} synchronously")
            self._execute_job(job_data)

        return job_id

    def get_status(self, job_id: str) -> Optional[Dict]:
        """Récupère le statut d'un job"""
        if not self._redis:
            return None

        key = f"{JOB_QUEUE_PREFIX}{job_id}"
        data = self._redis.get(key)

        if data:
            return json.loads(data)
        return None

    def cancel(self, job_id: str) -> bool:
        """Annule un job en attente"""
        if not self._redis:
            return False

        job = self.get_status(job_id)
        if not job:
            return False

        if job['status'] not in [JobStatus.PENDING.value, JobStatus.RETRYING.value]:
            return False

        # Mettre à jour le statut
        job['status'] = JobStatus.CANCELLED.value
        job['cancelled_at'] = datetime.utcnow().isoformat()

        key = f"{JOB_QUEUE_PREFIX}{job_id}"
        self._redis.setex(key, 86400, json.dumps(job))

        # Retirer de la file
        self._redis.zrem(f"{JOB_QUEUE_PREFIX}queue:{job['queue']}", job_id)

        _logger.info(f"Job cancelled: {job_id}")
        return True

    def retry(self, job_id: str) -> bool:
        """Remet un job échoué en file d'attente"""
        job = self.get_status(job_id)
        if not job:
            return False

        if job['status'] != JobStatus.FAILED.value:
            return False

        # Remettre en file
        job['status'] = JobStatus.PENDING.value
        job['retry_count'] = 0
        job['error'] = None

        key = f"{JOB_QUEUE_PREFIX}{job_id}"
        self._redis.setex(key, 86400 * 7, json.dumps(job))

        score = datetime.utcnow().timestamp()
        self._redis.zadd(f"{JOB_QUEUE_PREFIX}queue:{job['queue']}", {job_id: score})

        return True

    def get_queue_stats(self, queue: str = 'default') -> Dict:
        """Récupère les statistiques de la file"""
        if not self._redis:
            return {'error': 'Redis unavailable'}

        queue_key = f"{JOB_QUEUE_PREFIX}queue:{queue}"

        return {
            'queue': queue,
            'pending': self._redis.zcard(queue_key),
            'timestamp': datetime.utcnow().isoformat(),
        }

    def _execute_job(self, job_data: Dict) -> bool:
        """Exécute un job (appelé par le worker)"""
        job_type = job_data['type']
        handler = JobRegistry.get_handler(job_type)

        if not handler:
            _logger.error(f"No handler for job type: {job_type}")
            return False

        try:
            result = handler(job_data['payload'])
            job_data['status'] = JobStatus.COMPLETED.value
            job_data['result'] = result
            job_data['completed_at'] = datetime.utcnow().isoformat()
            return True

        except Exception as e:
            _logger.error(f"Job {job_data['id']} failed: {e}")
            job_data['error'] = str(e)

            if job_data['retry_count'] < job_data['max_retries']:
                job_data['status'] = JobStatus.RETRYING.value
                job_data['retry_count'] += 1
            else:
                job_data['status'] = JobStatus.FAILED.value

            return False


# =============================================================================
# DÉCORATEUR POUR JOBS ASYNC
# =============================================================================

def async_job(
    job_type: str = None,
    priority: JobPriority = JobPriority.NORMAL,
    queue: str = 'default',
    max_retries: int = 3
):
    """
    Décorateur pour convertir une fonction en job asynchrone.

    Usage:
        @async_job('send_welcome_email', priority=JobPriority.HIGH)
        def send_welcome_email(user_id: int, email: str):
            # Ce code sera exécuté de manière asynchrone
            send_email(email, 'Welcome!', 'Hello...')
    """
    def decorator(func):
        # Enregistrer le handler
        actual_job_type = job_type or func.__name__
        JobRegistry.register(actual_job_type)(func)

        @wraps(func)
        def wrapper(*args, **kwargs):
            # Créer le payload
            payload = {
                'args': args,
                'kwargs': kwargs,
            }

            # Enqueue le job
            queue_instance = get_job_queue()
            job_id = queue_instance.enqueue(
                actual_job_type,
                payload,
                priority=priority,
                queue=queue,
                max_retries=max_retries
            )

            return job_id

        # Ajouter méthode pour exécution synchrone
        wrapper.sync = func
        wrapper.job_type = actual_job_type

        return wrapper
    return decorator


# =============================================================================
# SINGLETON
# =============================================================================

_job_queue = None


def get_job_queue() -> JobQueue:
    """Retourne l'instance singleton de la file de jobs"""
    global _job_queue
    if _job_queue is None:
        _job_queue = JobQueue()
    return _job_queue


# =============================================================================
# JOBS PRÉDÉFINIS
# =============================================================================

@job_handler('send_email')
def handle_send_email(payload: Dict) -> Dict:
    """Handler pour l'envoi d'emails"""
    # Implémenter avec le service email d'Odoo
    _logger.info(f"Sending email to {payload.get('to')}")
    return {'sent': True}


@job_handler('generate_report')
def handle_generate_report(payload: Dict) -> Dict:
    """Handler pour génération de rapports"""
    report_type = payload.get('type')
    _logger.info(f"Generating report: {report_type}")
    return {'report_id': str(uuid.uuid4())}


@job_handler('sync_inventory')
def handle_sync_inventory(payload: Dict) -> Dict:
    """Handler pour synchronisation inventaire"""
    _logger.info("Syncing inventory...")
    return {'synced': True}


@job_handler('cleanup_sessions')
def handle_cleanup_sessions(payload: Dict) -> Dict:
    """Handler pour nettoyage des sessions expirées"""
    _logger.info("Cleaning up expired sessions...")
    return {'cleaned': True}
