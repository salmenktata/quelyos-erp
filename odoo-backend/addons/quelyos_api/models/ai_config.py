# -*- coding: utf-8 -*-
"""
Modèle de configuration des providers IA pour le chat assistant Quelyos.
Gère le chiffrement des API keys avec Fernet (AES-128-CBC + HMAC-SHA256).
"""
import os
import logging
from datetime import datetime

from odoo import models, fields, api
from odoo.exceptions import UserError, ValidationError

try:
    from cryptography.fernet import Fernet, InvalidToken
except ImportError:
    raise ImportError("Module cryptography requis : pip install cryptography")

_logger = logging.getLogger(__name__)


class AIConfig(models.Model):
    """
    Configuration des providers IA (Groq, Claude, OpenAI).
    Les API keys sont chiffrées en BDD avec Fernet.
    """
    _name = 'quelyos.ai.config'
    _description = 'Configuration IA Chat Assistant'
    _order = 'priority asc, id desc'

    # Identification
    name = fields.Char(
        string='Nom',
        required=True,
        help='Nom du provider (ex: "Groq Production", "Claude Backup")'
    )
    provider = fields.Selection(
        selection=[
            ('groq', 'Groq (Gratuit)'),
            ('claude', 'Anthropic Claude'),
            ('openai', 'OpenAI GPT'),
        ],
        string='Type Provider',
        required=True,
        help='Type de provider IA utilisé'
    )

    # État
    is_enabled = fields.Boolean(
        string='Actif',
        default=False,
        help='Provider actuellement utilisé'
    )
    priority = fields.Integer(
        string='Priorité',
        default=1,
        help='Priorité pour le fallback (1 = highest)'
    )

    # Credentials (CHIFFRÉES)
    api_key_encrypted = fields.Text(
        string='API Key (chiffrée)',
        help='Clé API chiffrée avec Fernet'
    )

    # Configuration modèle
    model = fields.Char(
        string='Modèle',
        help='Nom du modèle (ex: llama-3.1-70b-versatile, claude-3-5-sonnet-20241022)'
    )
    max_tokens = fields.Integer(
        string='Max Tokens',
        default=800,
        help='Nombre maximum de tokens par réponse'
    )
    temperature = fields.Float(
        string='Température',
        default=0.7,
        help='Créativité du modèle (0-2)'
    )

    # Test connexion
    last_tested_at = fields.Datetime(
        string='Dernier Test',
        readonly=True
    )
    test_result = fields.Selection(
        selection=[
            ('success', 'Succès'),
            ('failed', 'Échec'),
        ],
        string='Résultat Test',
        readonly=True
    )
    test_message = fields.Text(
        string='Message Test',
        readonly=True,
        help='Détails du dernier test de connexion'
    )

    # Métriques d'usage
    total_requests = fields.Integer(
        string='Total Requêtes',
        default=0,
        readonly=True
    )
    total_tokens_used = fields.Integer(
        string='Total Tokens',
        default=0,
        readonly=True
    )
    total_cost = fields.Float(
        string='Coût Total (USD)',
        default=0.0,
        readonly=True,
        digits=(10, 6)
    )
    success_rate = fields.Float(
        string='Taux de Succès (%)',
        default=100.0,
        readonly=True,
        compute='_compute_success_rate',
        store=True
    )
    failed_requests = fields.Integer(
        string='Requêtes Échouées',
        default=0,
        readonly=True
    )
    avg_latency_ms = fields.Float(
        string='Latence Moyenne (ms)',
        default=0.0,
        readonly=True
    )

    # Métadonnées
    created_at = fields.Datetime(
        string='Créé le',
        default=fields.Datetime.now,
        readonly=True
    )
    updated_at = fields.Datetime(
        string='Modifié le',
        default=fields.Datetime.now,
        readonly=True
    )

    @api.depends('total_requests', 'failed_requests')
    def _compute_success_rate(self):
        """Calcule le taux de succès des requêtes."""
        for record in self:
            if record.total_requests > 0:
                success = record.total_requests - record.failed_requests
                record.success_rate = (success / record.total_requests) * 100.0
            else:
                record.success_rate = 100.0

    def _get_encryption_key(self):
        """Récupère la clé de chiffrement depuis l'environnement."""
        key = os.environ.get('QUELYOS_ENCRYPTION_KEY')
        if not key:
            raise UserError(
                "Variable d'environnement QUELYOS_ENCRYPTION_KEY manquante. "
                "Générer avec: python scripts/generate-encryption-key.py"
            )
        return key.encode()

    def encrypt_api_key(self, plain_key):
        """
        Chiffre une API key avec Fernet (AES-128-CBC + HMAC-SHA256).

        Args:
            plain_key (str): API key en clair

        Returns:
            str: API key chiffrée (base64)
        """
        if not plain_key:
            return None

        try:
            cipher = Fernet(self._get_encryption_key())
            encrypted = cipher.encrypt(plain_key.encode())
            return encrypted.decode()
        except Exception as e:
            _logger.error(f"Erreur chiffrement API key: {e}")
            raise UserError(f"Impossible de chiffrer l'API key: {e}")

    def decrypt_api_key(self):
        """
        Déchiffre l'API key pour usage interne uniquement.

        Returns:
            str: API key en clair
        """
        self.ensure_one()

        if not self.api_key_encrypted:
            return None

        try:
            cipher = Fernet(self._get_encryption_key())
            decrypted = cipher.decrypt(self.api_key_encrypted.encode())
            return decrypted.decode()
        except InvalidToken:
            _logger.error(f"Token de chiffrement invalide pour provider {self.name}")
            raise UserError(
                "Impossible de déchiffrer l'API key. "
                "La clé de chiffrement a peut-être changé."
            )
        except Exception as e:
            _logger.error(f"Erreur déchiffrement API key: {e}")
            raise UserError(f"Erreur lors du déchiffrement: {e}")

    @api.model_create_multi
    def create(self, vals_list):
        """Override create pour chiffrer l'API key."""
        for vals in vals_list:
            if 'api_key_encrypted' in vals and vals['api_key_encrypted']:
                plain_key = vals['api_key_encrypted']
                vals['api_key_encrypted'] = self.encrypt_api_key(plain_key)

            vals['created_at'] = fields.Datetime.now()
            vals['updated_at'] = fields.Datetime.now()

        return super(AIConfig, self).create(vals_list)

    def write(self, vals):
        """Override write pour chiffrer l'API key si modifiée."""
        if 'api_key_encrypted' in vals and vals['api_key_encrypted']:
            # Vérifier si c'est une clé en clair (pas déjà chiffrée)
            plain_key = vals['api_key_encrypted']
            # Si la clé commence par 'gAA' c'est déjà du Fernet, sinon chiffrer
            if not plain_key.startswith('gAAAAA'):
                vals['api_key_encrypted'] = self.encrypt_api_key(plain_key)

        vals['updated_at'] = fields.Datetime.now()

        return super(AIConfig, self).write(vals)

    @api.model
    def get_active_provider(self):
        """
        Retourne la configuration du provider actif avec la plus haute priorité.

        Returns:
            dict: Config du provider avec API key déchiffrée
                {
                    'id': int,
                    'provider': str,
                    'api_key': str,
                    'model': str,
                    'max_tokens': int,
                    'temperature': float,
                }
            None: Si aucun provider actif
        """
        provider = self.search([
            ('is_enabled', '=', True)
        ], order='priority asc', limit=1)

        if not provider:
            _logger.warning("Aucun provider IA actif configuré")
            return None

        try:
            api_key = provider.decrypt_api_key()
            if not api_key:
                _logger.error(f"API key vide pour provider {provider.name}")
                return None

            return {
                'id': provider.id,
                'provider': provider.provider,
                'api_key': api_key,
                'model': provider.model,
                'max_tokens': provider.max_tokens,
                'temperature': provider.temperature,
            }
        except Exception as e:
            _logger.error(f"Erreur récupération config provider {provider.name}: {e}")
            return None

    def test_connection(self):
        """
        Teste la connexion avec le provider IA.

        Returns:
            dict: {'success': bool, 'message': str, 'latency_ms': float}
        """
        self.ensure_one()

        if not self.api_key_encrypted:
            return {
                'success': False,
                'message': 'API key manquante',
                'latency_ms': 0
            }

        try:
            import requests
            import time

            api_key = self.decrypt_api_key()
            start_time = time.time()

            # Test selon le provider
            if self.provider == 'groq':
                url = 'https://api.groq.com/openai/v1/models'
                headers = {'Authorization': f'Bearer {api_key}'}
                response = requests.get(url, headers=headers, timeout=10)

            elif self.provider == 'claude':
                url = 'https://api.anthropic.com/v1/messages'
                headers = {
                    'x-api-key': api_key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                }
                payload = {
                    'model': self.model or 'claude-3-5-sonnet-20241022',
                    'max_tokens': 10,
                    'messages': [{'role': 'user', 'content': 'test'}]
                }
                response = requests.post(url, headers=headers, json=payload, timeout=10)

            elif self.provider == 'openai':
                url = 'https://api.openai.com/v1/models'
                headers = {'Authorization': f'Bearer {api_key}'}
                response = requests.get(url, headers=headers, timeout=10)

            else:
                return {
                    'success': False,
                    'message': f'Provider {self.provider} non supporté',
                    'latency_ms': 0
                }

            latency_ms = (time.time() - start_time) * 1000

            if response.status_code == 200:
                self.write({
                    'last_tested_at': fields.Datetime.now(),
                    'test_result': 'success',
                    'test_message': f'Connexion réussie ({latency_ms:.0f}ms)'
                })
                return {
                    'success': True,
                    'message': f'Connexion réussie ({latency_ms:.0f}ms)',
                    'latency_ms': latency_ms
                }
            else:
                error_msg = f'HTTP {response.status_code}: {response.text[:200]}'
                self.write({
                    'last_tested_at': fields.Datetime.now(),
                    'test_result': 'failed',
                    'test_message': error_msg
                })
                return {
                    'success': False,
                    'message': error_msg,
                    'latency_ms': latency_ms
                }

        except Exception as e:
            error_msg = f'Erreur: {str(e)}'
            self.write({
                'last_tested_at': fields.Datetime.now(),
                'test_result': 'failed',
                'test_message': error_msg
            })
            return {
                'success': False,
                'message': error_msg,
                'latency_ms': 0
            }

    def increment_usage(self, tokens_used=0, cost=0.0, latency_ms=0.0, success=True):
        """
        Incrémente les métriques d'usage du provider.

        Args:
            tokens_used (int): Nombre de tokens utilisés
            cost (float): Coût de la requête en USD
            latency_ms (float): Latence en millisecondes
            success (bool): Si la requête a réussi
        """
        self.ensure_one()

        # Calcul latence moyenne pondérée
        if self.total_requests > 0:
            new_avg_latency = (
                (self.avg_latency_ms * self.total_requests + latency_ms) /
                (self.total_requests + 1)
            )
        else:
            new_avg_latency = latency_ms

        vals = {
            'total_requests': self.total_requests + 1,
            'total_tokens_used': self.total_tokens_used + tokens_used,
            'total_cost': self.total_cost + cost,
            'avg_latency_ms': new_avg_latency,
        }

        if not success:
            vals['failed_requests'] = self.failed_requests + 1

        self.write(vals)

    @api.constrains('priority')
    def _check_priority(self):
        """Vérifie que la priorité est positive."""
        for record in self:
            if record.priority < 1:
                raise ValidationError("La priorité doit être >= 1")

    @api.constrains('temperature')
    def _check_temperature(self):
        """Vérifie que la température est dans les limites."""
        for record in self:
            if not (0 <= record.temperature <= 2):
                raise ValidationError("La température doit être entre 0 et 2")

    @api.constrains('max_tokens')
    def _check_max_tokens(self):
        """Vérifie que max_tokens est valide."""
        for record in self:
            if record.max_tokens and record.max_tokens < 1:
                raise ValidationError("Max tokens doit être >= 1")
