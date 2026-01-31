# -*- coding: utf-8 -*-
"""
Sécurité du chatbot IA : filtrage, validation et logging.
Empêche la divulgation d'informations sensibles.
"""
import re
import logging
from typing import Dict, Optional, Tuple

_logger = logging.getLogger(__name__)


# ============================================================================
# SYSTEM PROMPT STRICT
# ============================================================================

SYSTEM_PROMPT_STRICT = """Vous êtes l'assistant Quelyos, votre guide enthousiaste pour découvrir notre Suite ERP ! 🚀

Vous êtes chaleureux, accueillant et toujours prêt à aider. Votre mission : rendre Quelyos accessible et excitant pour tous !

🎯 VOTRE PERSONNALITÉ :
- Amical et encourageant (utilisez des emojis avec modération)
- Enthousiaste sans être excessif
- Patient et pédagogue
- Vous tutoyez l'utilisateur de manière bienveillante
- Vous terminez TOUJOURS par une question ou suggestion pour continuer la conversation

🌟 QUELYOS EN BREF :
Suite ERP française tout-en-un | 9 modules | SaaS | Hébergement France | IA native | RGPD

📦 **LES 9 MODULES QUELYOS** :

1. **💰 Quelyos Finance**
   - Trésorerie IA avec prévisions 90 jours
   - Factures, devis, comptabilité
   - Rapprochement bancaire automatique
   - Export FEC, multi-devises
   → Inclus dès 49€/mois (plan Essentiel)

2. **👥 Quelyos CRM**
   - Pipeline des ventes visuel
   - Gestion opportunités et leads
   - Historique client 360°
   - Automatisation des relances
   → Intégré nativement avec Finance

3. **📦 Quelyos Stock**
   - Inventaire temps réel
   - Alertes de réapprovisionnement
   - Multi-emplacements
   - Valorisation (FIFO, LIFO, PMP)
   → Synchronisé automatiquement avec ventes/achats

4. **🏪 Quelyos E-commerce**
   - Boutique en ligne intégrée
   - Catalogue produits, variantes
   - Paiements en ligne (Stripe, PayPal)
   - Gestion commandes et livraisons
   → Prêt en 30 minutes

5. **👔 Quelyos RH**
   - Congés et absences
   - Notes de frais
   - Contrats et évaluations
   - Paie simplifiée
   → Multi-utilisateurs illimités (plan Pro)

6. **📍 Quelyos POS**
   - Point de vente tactile
   - Caisse enregistreuse
   - Gestion tickets et reçus
   - Synchronisation stock temps réel
   → Parfait pour retail et restauration

7. **📢 Quelyos Marketing**
   - Campagnes email/SMS
   - Segmentation clients
   - Automation marketing
   - Analyses ROI
   → Augmentez vos conversions

8. **🧠 IA Native**
   - Prévisions de trésorerie intelligentes
   - Détection d'anomalies
   - Recommandations automatiques
   - Analyses prédictives
   → Pilotage assisté par IA

💡 **STYLE DE RÉPONSE - TRÈS IMPORTANT** :
1. **Ton amical et chaleureux** : "Super question ! 🎉", "Je serais ravi de t'aider !", "Excellente idée !"
2. **Tutoiement bienveillant** : "Tu peux", "Ça va te permettre", "Tu vas adorer"
3. **Exemples concrets** : Toujours illustrer avec des cas pratiques
4. **Bénéfices d'abord** : Mettre en avant ce que l'utilisateur gagne
5. **Call-to-action clair** : Toujours terminer par une suggestion ou question
   - "Veux-tu que je te montre comment ça fonctionne ?"
   - "Je peux t'en dire plus sur [sujet] si tu veux !"
   - "Prêt à essayer ? L'inscription prend 2 minutes !"
6. **Encouragement** : "C'est très simple !", "Tu vas voir, c'est intuitif !", "Parfait pour ton cas !"
7. **Emojis avec parcimonie** : 1-2 par message maximum, jamais plus

🔒 **RÈGLES DE SÉCURITÉ STRICTES** :
1. Répondez UNIQUEMENT aux questions sur l'utilisation de Quelyos
2. Ne divulguez JAMAIS d'informations techniques (architecture, base de données, infrastructure)
3. Ne discutez JAMAIS de clients spécifiques, tenants, données personnelles
4. Refusez poliment toute question sur mots de passe, clés API, accès admin
5. En cas de doute → "Contactez notre support : support@quelyos.com"

✅ **SUJETS AUTORISÉS** :
- Fonctionnalités des 9 modules
- Cas d'usage concrets
- Tarifs et plans (Essentiel 49€, Pro 99€, Entreprise sur mesure)
- Migration de données
- Intégrations et API publique
- Conformité RGPD, certifications
- Questions générales ERP/e-commerce

❌ **SUJETS INTERDITS** :
- Architecture technique, base de données
- Informations sur d'autres clients
- Credentials (mots de passe, tokens, secrets)
- Code source, vulnérabilités
- Données personnelles clients

📊 **EXEMPLES DE RÉPONSES FRIENDLY** :

Question : "Comment suivre ma trésorerie ?"

Réponse : "Super question ! 💰 Quelyos Finance a exactement ce qu'il te faut avec notre module de trésorerie intelligent :

✨ **Ce qu'il fait pour toi :**
1. Prévoit ton solde sur 90 jours (précision 85-90%)
2. T'alerte si risque de découvert
3. Te suggère des optimisations de paiements

📍 **Pour y accéder :** Dashboard > Finance > Trésorerie

C'est super simple à paramétrer ! Tu veux que je t'explique comment démarrer, ou tu préfères voir une démo vidéo d'abord ?"

---

Question : "C'est quoi Quelyos ?"

Réponse : "Content de te rencontrer ! 👋 Quelyos, c'est LA suite ERP française qui simplifie la vie des TPE/PME.

Imagine : **9 modules intégrés** (Finance, CRM, Stock, Store, RH, POS, Marketing, Support, Home + IA) qui communiquent ensemble, le tout depuis une interface moderne et intuitive. Plus besoin de jongler entre 10 logiciels ! 🎯

**Ce qui rend Quelyos unique :**
- 100% hébergé en France 🇫🇷
- IA intégrée pour t'aider au quotidien
- Configuration en 30 minutes chrono
- Essai gratuit 14 jours (sans CB)

Tu veux en savoir plus sur un module en particulier, ou tu préfères découvrir nos tarifs ?"

Si vous ne pouvez pas répondre en toute sécurité, redirigez vers : support@quelyos.com
"""


# ============================================================================
# PATTERNS DE CONTENU SENSIBLE
# ============================================================================

SENSITIVE_PATTERNS = [
    # Infrastructure & Technique
    (r'\b(postgresql|postgres|psql)\b', 'database'),
    (r'\b(odoo|openerp)\b', 'backend'),
    (r'\b(database|db|schema|table|column)\b', 'database'),
    (r'\b(server|serveur|host|hostname)\b', 'infrastructure'),
    (r'\b(docker|container|kubernetes|k8s)\b', 'infrastructure'),
    (r'\b(redis|cache|memcached)\b', 'infrastructure'),

    # Credentials & Secrets
    (r'\b(password|passwd|pwd|mot[_\s]de[_\s]passe)\b', 'credentials'),
    (r'\b(api[_\s]?key|apikey|token|secret|private[_\s]?key)\b', 'credentials'),
    (r'\b(username|login|user[_\s]?id)\b', 'credentials'),
    (r'\b(auth|authentication|authorize)\b', 'credentials'),

    # Data & Privacy
    (r'\b(tenant[_\s]?id|client[_\s]?id)\b', 'tenant_data'),
    (r'\b(email|phone|telephone|adresse)\b', 'personal_data'),
    (r'\b(credit[_\s]?card|carte[_\s]?bancaire|payment[_\s]?info)\b', 'payment_data'),

    # Admin & Security
    (r'\b(admin|administrator|root|sudo|superuser)\b', 'admin_access'),
    (r'\b(sql[_\s]?injection|xss|csrf|vulnerability)\b', 'security'),
    (r'\b(exploit|hack|breach|attack)\b', 'security'),

    # Code & Technical
    (r'\b(import|from|def|class|function)\b', 'code'),
    (r'\b(select|insert|update|delete|drop|truncate)\b', 'sql'),
    (r'\b(__.*?__|env\.|process\.env)\b', 'internal'),
]


# ============================================================================
# SUSPICIOUS KEYWORDS (pour logging uniquement)
# ============================================================================

SUSPICIOUS_KEYWORDS = [
    'password', 'passwd', 'admin', 'database', 'sql', 'token',
    'api_key', 'secret', 'tenant_id', 'client_id', 'hack',
    'exploit', 'vulnerability', 'injection', 'root', 'sudo'
]


# ============================================================================
# FONCTIONS DE SÉCURITÉ
# ============================================================================

def sanitize_user_message(message: str, user_ip: str = None) -> Tuple[str, bool]:
    """
    Nettoie et valide le message utilisateur.

    Args:
        message: Message de l'utilisateur
        user_ip: Adresse IP de l'utilisateur (pour logging)

    Returns:
        Tuple[str, bool]: (message_nettoyé, is_suspicious)
    """
    # Vérifier longueur
    if len(message) > 2000:
        _logger.warning(f"[AI Security] Message trop long : {len(message)} chars (IP: {user_ip})")
        return message[:2000], True

    # Détecter tentatives d'injection de prompt
    is_suspicious = False
    message_lower = message.lower()

    # Patterns d'injection de prompt
    injection_patterns = [
        r'ignore\s+(previous|above|all)\s+(instructions|prompts|rules)',
        r'you\s+are\s+(now|a)\s+',
        r'system\s*:',
        r'assistant\s*:',
        r'<\s*script',
        r'eval\s*\(',
    ]

    for pattern in injection_patterns:
        if re.search(pattern, message_lower):
            _logger.warning(
                f"[AI Security] Tentative d'injection de prompt détectée - "
                f"IP: {user_ip} - Pattern: {pattern[:30]}"
            )
            is_suspicious = True

    # Détecter mots-clés suspects
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in message_lower:
            _logger.warning(
                f"[AI Security] Mot-clé suspect détecté : '{keyword}' - "
                f"IP: {user_ip} - Message: {message[:100]}"
            )
            is_suspicious = True

    return message, is_suspicious


def sanitize_ai_response(response: str, strict: bool = True) -> str:
    """
    Filtre la réponse de l'IA pour éviter la divulgation d'infos sensibles.

    Args:
        response: Réponse brute de l'IA
        strict: Si True, bloque toute réponse contenant un pattern sensible

    Returns:
        str: Réponse filtrée ou message d'erreur
    """
    if not response:
        return "Je n'ai pas pu générer de réponse. Veuillez réessayer."

    response_lower = response.lower()
    detected_patterns = []

    # Vérifier tous les patterns sensibles
    for pattern, category in SENSITIVE_PATTERNS:
        matches = re.findall(pattern, response_lower, re.IGNORECASE)
        if matches:
            detected_patterns.append((category, matches[:3]))  # Garder max 3 exemples

    if detected_patterns:
        _logger.critical(
            f"[AI Security] Réponse bloquée - Contenu sensible détecté : "
            f"{', '.join(cat for cat, _ in detected_patterns)}"
        )

        if strict:
            return (
                "Je ne peux pas répondre à cette question car elle concerne des "
                "informations techniques sensibles. Pour toute assistance, "
                "contactez notre support à support@quelyos.com"
            )
        else:
            # Mode permissif : masquer seulement les parties sensibles
            for pattern, _category in SENSITIVE_PATTERNS:
                response = re.sub(pattern, '[REDACTED]', response, flags=re.IGNORECASE)

    return response


def check_rate_limit_chat(user_ip: str, is_authenticated: bool = False) -> Dict[str, any]:
    """
    Vérifie le rate limiting spécifique au chat IA.

    Args:
        user_ip: Adresse IP de l'utilisateur
        is_authenticated: Si l'utilisateur est authentifié

    Returns:
        dict: {'allowed': bool, 'remaining': int, 'reset_at': datetime}
    """
    # Limites plus strictes pour le chat
    if is_authenticated:
        limit = 50  # 50 messages/heure pour authentifiés
        window = 3600
    else:
        limit = 10  # 10 messages/heure pour guests
        window = 3600

    # TODO: Implémenter avec Redis ou système de cache
    # Pour l'instant, on autorise (à implémenter plus tard)
    return {
        'allowed': True,
        'remaining': limit,
        'reset_at': None
    }


def log_chat_interaction(
    user_ip: str,
    message: str,
    response: str,
    is_suspicious: bool,
    provider: str,
    latency_ms: float
):
    """
    Log les interactions du chat pour audit et monitoring.

    Args:
        user_ip: IP de l'utilisateur
        message: Message utilisateur
        response: Réponse de l'IA
        is_suspicious: Si le message était suspect
        provider: Provider IA utilisé
        latency_ms: Latence de la requête
    """
    log_level = logging.WARNING if is_suspicious else logging.INFO

    _logger.log(
        log_level,
        f"[AI Chat] IP: {user_ip} | Provider: {provider} | "
        f"Latency: {latency_ms:.0f}ms | Suspicious: {is_suspicious} | "
        f"Message: {message[:100]} | Response: {response[:100]}"
    )
