# Quelyos SMS Tunisie

Module d'envoi de SMS via API Tunisie SMS pour les notifications e-commerce.

## Fonctionnalités

- ✅ Envoi de SMS via API Tunisie SMS
- ✅ Notifications automatiques :
  - Paniers abandonnés (délai configurable)
  - Confirmation de commande
  - Mise à jour statut livraison
- ✅ Gestion quotas SMS par abonnement
- ✅ Historique complet des envois
- ✅ File d'attente avec retry automatique
- ✅ Fallback email en cas d'échec critique
- ✅ Multi-tenant (par entreprise)

## Installation

```bash
# 1. Le module est dans addons/quelyos_sms_tn
cd odoo-backend/addons/quelyos_sms_tn

# 2. Installer le module
docker exec -it quelyos-odoo odoo-bin -i quelyos_sms_tn -d quelyos

# 3. Redémarrer Odoo
docker-compose restart odoo-backend
```

## Configuration

### 1. Obtenir une API Key Tunisie SMS

1. S'inscrire sur [Tunisie SMS](https://tunisiesms.tn)
2. Obtenir votre API Key depuis le dashboard
3. Configurer un nom d'expéditeur (max 11 caractères)

### 2. Configurer dans le Backoffice Dashboard

**URL** : `http://localhost:5175/store/settings/notifications`

Remplir :
- **API Key** : Votre clé API Tunisie SMS
- **Nom expéditeur** : Nom affiché (ex: "Quelyos", max 11 car.)
- **Endpoint** : `https://api.tunisiesms.tn/api/v1/send` (pré-rempli)

### 3. Activer les Notifications

Dans la même page, activer les toggles :
- ☑️ SMS paniers abandonnés (délai en heures)
- ☑️ SMS confirmation commande
- ☑️ SMS mise à jour livraison

## Configuration Quotas SMS

Modifier les plans d'abonnement dans Odoo ou via code :

```python
# Exemple : Ajouter quotas SMS aux plans
starter_plan = env['quelyos.subscription.plan'].search([('code', '=', 'starter')], limit=1)
starter_plan.write({
    'sms_quota': 100,  # 100 SMS/mois
    'sms_overage_price': 0.05  # 50 millimes par SMS supplémentaire
})

professional_plan = env['quelyos.subscription.plan'].search([('code', '=', 'professional')], limit=1)
professional_plan.write({
    'sms_quota': 500,  # 500 SMS/mois
    'sms_overage_price': 0.045
})

enterprise_plan = env['quelyos.subscription.plan'].search([('code', '=', 'enterprise')], limit=1)
enterprise_plan.write({
    'sms_quota': 2000,  # 2000 SMS/mois
    'sms_overage_price': 0.040
})
```

## Utilisation

### Envoi Manuel (Code Python)

```python
# Dans un modèle Odoo
provider = self.env['quelyos.sms.provider.tunisie']

# Envoi simple
sms_log = provider.send_sms(
    mobile='+216 12 345 678',
    message='Votre commande #ORDER-123 est confirmée. Merci !',
    notification_type='order_confirmation',
    order_id=order.id
)

# Envoi avec retry automatique
sms_log = provider.send_sms_with_retry(
    mobile='+216 12 345 678',
    message='Votre commande est en cours de livraison.',
    notification_type='shipping_update',
    partner_id=partner.id,
    order_id=order.id,
    max_retries=3
)

# Vérifier statut
if sms_log.status == 'sent':
    print('SMS envoyé avec succès')
elif sms_log.status == 'failed':
    print(f'Échec : {sms_log.error_message}')
```

### Envoi via Dashboard (Test)

1. Aller sur `/store/settings/notifications`
2. Section "Test SMS"
3. Entrer numéro et message
4. Cliquer "Envoyer le test"

### Hooks Automatiques

Les SMS sont envoyés automatiquement via hooks :

**Paniers abandonnés** :
- Cron existant dans `sale_order.py` (ligne ~450)
- Ajouter après envoi email :
```python
if sms_config.abandoned_cart_sms_enabled:
    provider.send_sms(
        mobile=order.partner_id.mobile,
        message=f"Panier abandonné #{order.name}. Complétez votre commande !",
        notification_type='abandoned_cart',
        order_id=order.id
    )
```

**Confirmation commande** :
- Hook sur `sale.order.action_confirm()`
- SMS envoyé immédiatement après confirmation

**Statut livraison** :
- Hook sur changement `delivery_state` du picking
- SMS envoyé quand le statut change

## File d'Attente et Retry

Le module gère automatiquement les échecs :

- **Cron** : Traite la file toutes les 5 minutes (`ir_cron_sms_queue`)
- **Retry** : 3 tentatives avec backoff exponentiel (2s, 4s, 8s)
- **Fallback** : Email envoyé si SMS critique échoue (commande, livraison)

## Coûts SMS

Le module calcule automatiquement les coûts :

- **SMS local** (Tunisie) : 0.050 DT (50 millimes)
- **SMS international** : 0.150 DT (150 millimes)
- **Multi-part** : 160 caractères = 1 SMS, 320 = 2 SMS, etc.

## Historique et Logs

### Via Dashboard

**URL** : `http://localhost:5175/store/settings/notifications`

Section "Historique récent" affiche :
- 10 derniers SMS envoyés
- Numéro, message, statut, date

### Via Odoo Backend

**Menu** : SMS > Historique

Filtres disponibles :
- Par statut (envoyé, échec, en attente)
- Par type (panier abandonné, commande, etc.)
- Par date

## Multi-Tenant

Le module est **100% multi-tenant** :

- Chaque entreprise (company) a sa propre configuration SMS
- Les quotas sont liés au tenant via `quelyos.tenant.subscription_id`
- Les règles de sécurité isolent les données par entreprise
- La file d'attente traite les SMS de toutes les entreprises

```python
# Config automatique par entreprise
config = env['quelyos.sms.config'].get_config_for_company(company_id=42)

# Vérifier quota pour une entreprise
quota_ok, remaining, total = env['quelyos.sms.log'].with_context(
    allowed_company_ids=[42]
).check_quota_available(company_id=42)
```

## API Endpoints

Tous les endpoints sont disponibles pour le dashboard React :

- `POST /api/admin/sms/config` - Récupérer configuration
- `POST /api/admin/sms/config/update` - Mettre à jour config
- `POST /api/admin/sms/send-test` - Envoyer SMS de test
- `POST /api/admin/sms/history` - Historique envois
- `POST /api/admin/sms/quota` - Quota disponible
- `POST /api/admin/sms/preferences` - Préférences notifications
- `POST /api/admin/sms/preferences/update` - Mettre à jour préférences

**Authentification** : Requiert `base.group_system` (admin)

## Troubleshooting

### SMS non envoyés

**1. Vérifier configuration**
```bash
# Logs Odoo
docker logs -f quelyos-odoo | grep SMS

# Vérifier config en DB
docker exec -it quelyos-odoo odoo-bin shell -d quelyos
>>> config = env['quelyos.sms.config'].search([])
>>> print(config.is_active, config.api_key)
```

**2. Tester API manuellement**
```bash
curl -X POST https://api.tunisiesms.tn/api/v1/send \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "sender": "Quelyos",
    "recipients": ["+21612345678"],
    "message": "Test SMS"
  }'
```

**3. Vérifier quotas**
```python
# En Odoo shell
quota_ok, remaining, total = env['quelyos.sms.log'].check_quota_available()
print(f'Quota: {remaining}/{total} SMS restants')
```

### File d'attente bloquée

```bash
# Relancer le cron manuellement
docker exec -it quelyos-odoo odoo-bin shell -d quelyos
>>> env['quelyos.sms.provider.tunisie'].process_pending_sms_queue()
```

### Erreur "API Key invalide"

1. Vérifier API Key dans dashboard Tunisie SMS
2. Vérifier format : doit être une chaîne d'au moins 10 caractères
3. Re-saisir dans `/store/settings/notifications`

## Sécurité

- ✅ API Key stockée avec `groups='base.group_system'` (admin uniquement)
- ✅ Endpoints protégés avec `auth='user'` + vérification admin
- ✅ Règles multi-company (isolation des données)
- ✅ Validation format numéros (international)
- ✅ Limitation longueur messages (4 SMS max = 612 caractères)

## Support

Pour toute question ou problème :
- Consulter les logs : `docker logs -f quelyos-odoo`
- Vérifier la documentation : `.claude/SMS_INTEGRATION.md`
- Tester l'API Tunisie SMS directement

## Licence

AGPL-3 (conformément aux modules Odoo community)

## Crédits

Développé pour Quelyos Suite
Compatible Odoo 19 Community
