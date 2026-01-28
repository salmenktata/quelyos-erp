# -*- coding: utf-8 -*-
"""
Secrets Management pour Quelyos ERP

Gestion sécurisée des secrets avec:
- Chiffrement des secrets en DB
- Rotation automatique
- Audit des accès
- Support HashiCorp Vault (optionnel)

IMPORTANT: Ne jamais logger les secrets en clair!
"""

import os
import base64
import hashlib
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from functools import lru_cache
import json

_logger = logging.getLogger(__name__)

# Essayer d'importer cryptography pour le chiffrement
try:
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False
    _logger.warning("cryptography not installed. Secrets will not be encrypted.")


# =============================================================================
# CONFIGURATION
# =============================================================================

# Clé de chiffrement (à définir via variable d'environnement)
ENCRYPTION_KEY = os.environ.get('QUELYOS_ENCRYPTION_KEY')
ENCRYPTION_SALT = os.environ.get('QUELYOS_ENCRYPTION_SALT', 'quelyos-salt-2024')

# Durée de vie des secrets en cache (secondes)
SECRET_CACHE_TTL = int(os.environ.get('SECRET_CACHE_TTL', 300))

# Vault configuration (optionnel)
VAULT_ADDR = os.environ.get('VAULT_ADDR')
VAULT_TOKEN = os.environ.get('VAULT_TOKEN')


# =============================================================================
# CHIFFREMENT
# =============================================================================

def _derive_key(password: str, salt: bytes = None) -> bytes:
    """Dérive une clé de chiffrement à partir d'un mot de passe"""
    if not CRYPTO_AVAILABLE:
        return password.encode()

    salt = salt or ENCRYPTION_SALT.encode()
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))


def _get_fernet() -> Optional['Fernet']:
    """Retourne l'instance Fernet pour le chiffrement"""
    if not CRYPTO_AVAILABLE:
        return None

    if not ENCRYPTION_KEY:
        _logger.warning("QUELYOS_ENCRYPTION_KEY not set. Encryption disabled.")
        return None

    key = _derive_key(ENCRYPTION_KEY)
    return Fernet(key)


def encrypt_secret(value: str) -> str:
    """
    Chiffre une valeur secrète.

    Args:
        value: Valeur en clair

    Returns:
        Valeur chiffrée en base64
    """
    fernet = _get_fernet()
    if not fernet:
        # Fallback: base64 simple (pas sécurisé, juste pour éviter le clair)
        return base64.b64encode(value.encode()).decode()

    encrypted = fernet.encrypt(value.encode())
    return encrypted.decode()


def decrypt_secret(encrypted_value: str) -> str:
    """
    Déchiffre une valeur secrète.

    Args:
        encrypted_value: Valeur chiffrée

    Returns:
        Valeur en clair
    """
    fernet = _get_fernet()
    if not fernet:
        # Fallback: base64 simple
        return base64.b64decode(encrypted_value.encode()).decode()

    decrypted = fernet.decrypt(encrypted_value.encode())
    return decrypted.decode()


# =============================================================================
# SECRETS MANAGER
# =============================================================================

class SecretsManager:
    """
    Gestionnaire centralisé des secrets.

    Usage:
        secrets = SecretsManager()
        api_key = secrets.get('stripe_api_key')
        secrets.set('stripe_api_key', 'sk_live_...', rotate_after=30)
    """

    def __init__(self):
        self._cache: Dict[str, tuple] = {}  # key -> (value, expiry)
        self._vault_client = None

        if VAULT_ADDR and VAULT_TOKEN:
            self._init_vault()

    def _init_vault(self):
        """Initialise le client Vault si disponible"""
        try:
            import hvac
            self._vault_client = hvac.Client(url=VAULT_ADDR, token=VAULT_TOKEN)
            if self._vault_client.is_authenticated():
                _logger.info("Connected to HashiCorp Vault")
            else:
                _logger.warning("Vault authentication failed")
                self._vault_client = None
        except ImportError:
            _logger.info("hvac not installed, Vault support disabled")
        except Exception as e:
            _logger.error(f"Vault connection failed: {e}")

    def get(self, key: str, default: str = None) -> Optional[str]:
        """
        Récupère un secret.

        Ordre de priorité:
        1. Cache mémoire
        2. Variables d'environnement
        3. HashiCorp Vault
        4. Base de données Odoo

        Args:
            key: Nom du secret
            default: Valeur par défaut

        Returns:
            Valeur du secret ou default
        """
        # 1. Cache
        if key in self._cache:
            value, expiry = self._cache[key]
            if expiry > datetime.now():
                return value
            del self._cache[key]

        # 2. Variables d'environnement
        env_key = f"QUELYOS_SECRET_{key.upper()}"
        env_value = os.environ.get(env_key)
        if env_value:
            self._cache_secret(key, env_value)
            return env_value

        # 3. Vault
        if self._vault_client:
            try:
                result = self._vault_client.secrets.kv.v2.read_secret_version(
                    path=f"quelyos/{key}"
                )
                value = result['data']['data'].get('value')
                if value:
                    self._cache_secret(key, value)
                    return value
            except Exception as e:
                _logger.debug(f"Vault read failed for {key}: {e}")

        # 4. Base de données (via Odoo)
        db_value = self._get_from_db(key)
        if db_value:
            self._cache_secret(key, db_value)
            return db_value

        return default

    def set(
        self,
        key: str,
        value: str,
        rotate_after: int = None,
        store_in: str = 'db'
    ) -> bool:
        """
        Définit un secret.

        Args:
            key: Nom du secret
            value: Valeur du secret
            rotate_after: Jours avant rotation obligatoire
            store_in: Où stocker ('db', 'vault', 'env')

        Returns:
            True si succès
        """
        try:
            if store_in == 'vault' and self._vault_client:
                self._vault_client.secrets.kv.v2.create_or_update_secret(
                    path=f"quelyos/{key}",
                    secret={'value': value, 'rotate_after': rotate_after}
                )
            elif store_in == 'db':
                self._store_in_db(key, value, rotate_after)
            else:
                _logger.warning(f"Cannot store secret in {store_in}")
                return False

            self._cache_secret(key, value)
            self._log_access(key, 'write')
            return True

        except Exception as e:
            _logger.error(f"Failed to set secret {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Supprime un secret"""
        try:
            if key in self._cache:
                del self._cache[key]

            if self._vault_client:
                self._vault_client.secrets.kv.v2.delete_metadata_and_all_versions(
                    path=f"quelyos/{key}"
                )

            self._delete_from_db(key)
            self._log_access(key, 'delete')
            return True

        except Exception as e:
            _logger.error(f"Failed to delete secret {key}: {e}")
            return False

    def rotate(self, key: str, new_value: str) -> bool:
        """
        Effectue une rotation de secret.

        1. Sauvegarde l'ancienne valeur
        2. Met à jour avec la nouvelle
        3. Log la rotation
        """
        old_value = self.get(key)

        if self.set(key, new_value):
            self._log_access(key, 'rotate', {'old_hash': self._hash_value(old_value)})
            return True

        return False

    def check_rotation_needed(self) -> list:
        """Vérifie quels secrets doivent être rotés"""
        secrets_to_rotate = []
        # Implémenter selon le stockage utilisé
        return secrets_to_rotate

    def _cache_secret(self, key: str, value: str):
        """Met en cache un secret"""
        expiry = datetime.now() + timedelta(seconds=SECRET_CACHE_TTL)
        self._cache[key] = (value, expiry)

    def _hash_value(self, value: str) -> str:
        """Hash une valeur pour les logs (ne pas exposer le secret)"""
        if not value:
            return 'none'
        return hashlib.sha256(value.encode()).hexdigest()[:16]

    def _log_access(self, key: str, action: str, extra: dict = None):
        """Log un accès à un secret"""
        log_data = {
            'action': action,
            'secret_key': key,
            'timestamp': datetime.utcnow().isoformat(),
        }
        if extra:
            log_data.update(extra)

        _logger.info(f"Secret access: {json.dumps(log_data)}")

    def _get_from_db(self, key: str) -> Optional[str]:
        """Récupère un secret depuis la DB Odoo"""
        try:
            from odoo import api, SUPERUSER_ID
            from odoo.modules.registry import Registry

            # Cette fonction sera appelée dans un contexte Odoo
            # Implémenter selon le modèle de stockage
            return None
        except Exception:
            return None

    def _store_in_db(self, key: str, value: str, rotate_after: int = None):
        """Stocke un secret chiffré en DB"""
        encrypted = encrypt_secret(value)
        # Implémenter le stockage en DB
        pass

    def _delete_from_db(self, key: str):
        """Supprime un secret de la DB"""
        pass


# Instance singleton
_secrets_manager = None


def get_secrets_manager() -> SecretsManager:
    """Retourne l'instance singleton du gestionnaire de secrets"""
    global _secrets_manager
    if _secrets_manager is None:
        _secrets_manager = SecretsManager()
    return _secrets_manager


# =============================================================================
# HELPERS
# =============================================================================

def get_secret(key: str, default: str = None) -> Optional[str]:
    """Helper pour récupérer un secret rapidement"""
    return get_secrets_manager().get(key, default)


def require_secret(key: str) -> str:
    """
    Récupère un secret obligatoire.
    Lève une exception si le secret n'existe pas.
    """
    value = get_secret(key)
    if value is None:
        raise ValueError(f"Required secret not found: {key}")
    return value


# =============================================================================
# SECRETS PRÉDÉFINIS
# =============================================================================

class SecretKeys:
    """Noms des secrets utilisés dans l'application"""
    # Paiement
    STRIPE_API_KEY = 'stripe_api_key'
    STRIPE_WEBHOOK_SECRET = 'stripe_webhook_secret'
    PAYPAL_CLIENT_ID = 'paypal_client_id'
    PAYPAL_CLIENT_SECRET = 'paypal_client_secret'

    # Email
    SMTP_PASSWORD = 'smtp_password'
    SENDGRID_API_KEY = 'sendgrid_api_key'

    # OAuth
    GOOGLE_CLIENT_SECRET = 'google_client_secret'
    FACEBOOK_APP_SECRET = 'facebook_app_secret'

    # Intégrations
    SENTRY_DSN = 'sentry_dsn'
    SLACK_WEBHOOK_URL = 'slack_webhook_url'

    # Interne
    JWT_SECRET = 'jwt_secret'
    WEBHOOK_SECRET = 'webhook_secret'
