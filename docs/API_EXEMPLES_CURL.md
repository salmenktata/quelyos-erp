# Exemples cURL & Postman - Nouvelles Routes API

**Guide pratique** pour tester les 23 nouvelles routes avec cURL et Postman.

---

## 🔑 Configuration Préalable

### Variables d'Environnement

```bash
# Backend URL
export ODOO_URL="http://localhost:8069"
export ODOO_URL_PROD="https://api.quelyos.com"

# Token d'authentification (à remplacer après login)
export AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Obtenir un Token

```bash
curl -X POST "$ODOO_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "email": "admin@example.com",
      "password": "admin"
    }
  }' | jq -r '.result.access_token'
```

**Copier le token retourné et l'exporter** :

```bash
export AUTH_TOKEN="<votre_token_ici>"
```

---

## 1. Stock - Réservations Manuelles

### 1.1. Lister les Réservations

```bash
curl -X POST "$ODOO_URL/api/stock/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "state": "active",
      "limit": 10
    }
  }' | jq
```

**Avec filtre par produit** :

```bash
curl -X POST "$ODOO_URL/api/stock/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "product_id": 123,
      "limit": 20
    }
  }' | jq '.result.reservations'
```

---

### 1.2. Créer une Réservation

```bash
curl -X POST "$ODOO_URL/api/stock/reservations/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "product_id": 123,
      "reserved_qty": 50.0,
      "location_id": 8,
      "reason": "event",
      "expiration_date": "2026-02-15T23:59:59",
      "notes": "Réservation salon e-commerce Paris"
    }
  }' | jq
```

**Réponse attendue** :

```json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "message": "Réservation créée avec succès",
    "reservation": {
      "id": 1,
      "name": "RES/00001",
      "state": "draft",
      "reserved_qty": 50.0
    }
  }
}
```

---

### 1.3. Activer une Réservation

```bash
# Récupérer l'ID de la réservation créée
RESERVATION_ID=1

curl -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/activate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

### 1.4. Libérer une Réservation

```bash
curl -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/release" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

### 1.5. Supprimer une Réservation

```bash
curl -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

## 2. Stock - Late Availability

### 2.1. Commandes par Priorité

```bash
# Commandes urgentes (short = < 7 jours)
curl -X POST "$ODOO_URL/api/orders/fulfillment-status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "priority": "short",
      "limit": 20
    }
  }' | jq '.result.orders'
```

**Commandes prêtes maintenant** :

```bash
curl -X POST "$ODOO_URL/api/orders/fulfillment-status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "can_fulfill_now": true,
      "limit": 50
    }
  }' | jq '.result.orders[] | {name, customer_name, can_fulfill_now}'
```

---

### 2.2. Détails Commande

```bash
ORDER_ID=42

curl -X POST "$ODOO_URL/api/orders/$ORDER_ID/fulfillment-detail" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Extraire uniquement les produits manquants** :

```bash
curl -X POST "$ODOO_URL/api/orders/$ORDER_ID/fulfillment-detail" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.order.missing_stock_summary'
```

---

### 2.3. Statistiques Globales

```bash
curl -X POST "$ODOO_URL/api/orders/fulfillment-stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Extraire KPIs clés** :

```bash
curl -X POST "$ODOO_URL/api/orders/fulfillment-stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.stats | {ready_count, waiting_count, blocked_value}'
```

---

## 3. Marketing - Link Tracker

### 3.1. Lister Liens d'une Campagne

```bash
CAMPAIGN_ID=5

curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/links" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "limit": 10
    }
  }' | jq
```

---

### 3.2. Statistiques d'un Lien

```bash
LINK_ID=12

curl -X POST "$ODOO_URL/api/marketing/links/$LINK_ID/stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Top 5 pays** :

```bash
curl -X POST "$ODOO_URL/api/marketing/links/$LINK_ID/stats" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.stats.by_country[:5]'
```

---

### 3.3. Tester Redirection Publique

```bash
# Cette route est publique (pas de token)
TOKEN="a8f9c2_xY3kL9pQr2vN"

curl -I "$ODOO_URL/r/$TOKEN"
```

**Réponse attendue** :

```
HTTP/1.1 302 Found
Location: https://quelyos.com/promo-hiver
```

---

## 4. Marketing - A/B Testing

### 4.1. Lister Variantes

```bash
CAMPAIGN_ID=5

curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Comparer conversion_score** :

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.variants[] | {variant_letter, conversion_score, is_winner}'
```

---

### 4.2. Créer une Variante

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "variant_letter": "B",
      "subject": "Soldes Hiver : Jusqu'\''à -50% !",
      "body": "<html><body><h1>Soldes</h1><p>Ne ratez pas nos offres exceptionnelles !</p></body></html>"
    }
  }' | jq
```

---

### 4.3. Sélectionner Variante Gagnante

```bash
VARIANT_ID=1

curl -X POST "$ODOO_URL/api/marketing/campaigns/variants/$VARIANT_ID/select-winner" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

### 4.4. Mettre à Jour Variante

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/variants/$VARIANT_ID/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "subject": "🎁 Nouveauté : -40% sur tout !",
      "body": "<html><body><h1>Nouveau sujet</h1></body></html>"
    }
  }' | jq
```

---

### 4.5. Supprimer Variante

```bash
VARIANT_ID=2

curl -X POST "$ODOO_URL/api/marketing/campaigns/variants/$VARIANT_ID/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

## 5. Marketing - Analytics

### 5.1. Timeline (7 Jours)

```bash
CAMPAIGN_ID=5

curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/timeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Extraire données pour Chart.js** :

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/timeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.chart_data'
```

---

### 5.2. Funnel (Conversion)

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/funnel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Pourcentages uniquement** :

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/funnel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.chart_data.percentages'
```

---

### 5.3. Devices (Répartition)

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/devices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

---

### 5.4. Heatmap (Clics)

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/heatmap" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq
```

**Top 10 liens uniquement** :

```bash
curl -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/analytics/heatmap" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }' | jq '.result.heatmap.top_10'
```

---

## 📦 Collection Postman

### Importer dans Postman

1. **Créer une nouvelle Collection** : `Quelyos API v2 - Phase 2 & 3`

2. **Variables de Collection** :
   - `base_url` : `http://localhost:8069`
   - `auth_token` : `<votre_token>`
   - `campaign_id` : `5`
   - `order_id` : `42`

3. **Header automatique** :
   - Key: `Authorization`
   - Value: `Bearer {{auth_token}}`

4. **Format Body** :
   ```json
   {
     "jsonrpc": "2.0",
     "params": {
       // Paramètres ici
     }
   }
   ```

### Exemples Postman

**Stock - Créer Réservation** :

```
POST {{base_url}}/api/stock/reservations/create
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "jsonrpc": "2.0",
  "params": {
    "product_id": 123,
    "reserved_qty": 50,
    "location_id": 8,
    "reason": "event",
    "notes": "Test Postman"
  }
}
```

**Marketing - Timeline Analytics** :

```
POST {{base_url}}/api/marketing/campaigns/{{campaign_id}}/analytics/timeline
Headers:
  Authorization: Bearer {{auth_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "jsonrpc": "2.0",
  "params": {}
}
```

---

## 🧪 Scripts de Test Automatisés

### Test Workflow Complet Réservations

```bash
#!/bin/bash

# 1. Créer réservation
RESERVATION=$(curl -s -X POST "$ODOO_URL/api/stock/reservations/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "product_id": 123,
      "reserved_qty": 10,
      "location_id": 8,
      "reason": "event"
    }
  }')

RESERVATION_ID=$(echo $RESERVATION | jq -r '.result.reservation.id')
echo "✅ Réservation créée : RES #$RESERVATION_ID"

# 2. Activer
curl -s -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/activate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "params": {}}' | jq -r '.result.message'

# 3. Lister (vérifier état active)
curl -s -X POST "$ODOO_URL/api/stock/reservations" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "state": "active"
    }
  }' | jq '.result.reservations[] | select(.id == '$RESERVATION_ID') | .state'

# 4. Libérer
curl -s -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/release" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "params": {}}' | jq -r '.result.message'

# 5. Supprimer
curl -s -X POST "$ODOO_URL/api/stock/reservations/$RESERVATION_ID/delete" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "params": {}}' | jq -r '.result.message'

echo "✅ Workflow réservation terminé avec succès"
```

---

### Test Workflow A/B Testing

```bash
#!/bin/bash

CAMPAIGN_ID=5

# 1. Créer variante A
VARIANT_A=$(curl -s -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "variant_letter": "A",
      "subject": "Test A : -30%",
      "body": "<html><body>Variante A</body></html>"
    }
  }')

VARIANT_A_ID=$(echo $VARIANT_A | jq -r '.result.variant.id')
echo "✅ Variante A créée : #$VARIANT_A_ID"

# 2. Créer variante B
VARIANT_B=$(curl -s -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {
      "variant_letter": "B",
      "subject": "Test B : -50%",
      "body": "<html><body>Variante B</body></html>"
    }
  }')

VARIANT_B_ID=$(echo $VARIANT_B | jq -r '.result.variant.id')
echo "✅ Variante B créée : #$VARIANT_B_ID"

# 3. Lister variantes
curl -s -X POST "$ODOO_URL/api/marketing/campaigns/$CAMPAIGN_ID/variants" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "params": {}}' \
  | jq '.result.variants[] | {variant_letter, conversion_score}'

# 4. Sélectionner gagnant (A)
curl -s -X POST "$ODOO_URL/api/marketing/campaigns/variants/$VARIANT_A_ID/select-winner" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "params": {}}' | jq -r '.result.message'

echo "✅ Workflow A/B testing terminé"
```

---

## 🐛 Debugging

### Activer Logs Verbeux

```bash
# Voir logs Odoo en temps réel
docker-compose logs -f odoo
```

### Vérifier Token Valide

```bash
curl -X POST "$ODOO_URL/api/auth/verify" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "params": {}
  }'
```

### Tester Health Check

```bash
curl "$ODOO_URL/web/health"
# Réponse attendue : {"status": "pass"}
```

---

## 📝 Notes

- **Format JSON-RPC** : Toutes les routes utilisent le format `{"jsonrpc": "2.0", "params": {...}}`
- **Pagination** : Utiliser `limit` et `offset` pour paginer les résultats
- **Filtres** : Tous les filtres sont optionnels (sans filtre = récupérer tout)
- **Dates** : Format ISO 8601 (`2026-01-30T14:23:45`)
- **Erreurs** : Toujours vérifier `result.success` avant de parser les données

---

**Version** : 1.0.0
**Date** : 2026-01-30
