# Documentation API - Nouvelles Routes Phase 2 & 3

**Version Backend** : 19.0.1.36.0
**Date** : 2026-01-30
**Modules** : Stock (Réservations + Late Availability) + Marketing (Link Tracker + A/B Testing + Analytics)

---

## Table des Matières

- [1. Stock - Réservations Manuelles](#1-stock---réservations-manuelles)
- [2. Stock - Late Availability Filter](#2-stock---late-availability-filter)
- [3. Marketing - Link Tracker](#3-marketing---link-tracker)
- [4. Marketing - A/B Testing](#4-marketing---ab-testing)
- [5. Marketing - Analytics Graphiques](#5-marketing---analytics-graphiques)
- [6. Authentification](#6-authentification)
- [7. Codes d'Erreur](#7-codes-derreur)

---

## 1. Stock - Réservations Manuelles

### 1.1. Lister les Réservations

**Endpoint** : `POST /api/stock/reservations`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Récupère la liste des réservations manuelles avec filtres optionnels.

**Paramètres** :

```json
{
  "state": "active",           // optionnel: 'draft', 'active', 'released', 'expired'
  "product_id": 123,           // optionnel: filtrer par produit
  "location_id": 45,           // optionnel: filtrer par emplacement
  "limit": 50,                 // optionnel: nombre max (défaut: 50)
  "offset": 0                  // optionnel: pagination (défaut: 0)
}
```

**Réponse** :

```json
{
  "success": true,
  "reservations": [
    {
      "id": 1,
      "name": "RES/00001",
      "product_id": 123,
      "product_name": "T-shirt Noir XL",
      "product_sku": "TSH-BLK-XL",
      "reserved_qty": 50.0,
      "unit": "Unité(s)",
      "location_id": 8,
      "location_name": "WH/Stock",
      "reservation_date": "2026-01-30T10:00:00",
      "expiration_date": "2026-02-15T23:59:59",
      "reason": "event",
      "reason_label": "Événement spécial",
      "notes": "Réservation pour salon e-commerce",
      "state": "active",
      "state_label": "Active",
      "user_id": 2,
      "user_name": "Admin",
      "stock_available_at_creation": 120.0,
      "create_date": "2026-01-30T09:45:00",
      "write_date": "2026-01-30T10:00:00"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

### 1.2. Détails d'une Réservation

**Endpoint** : `POST /api/stock/reservations/<int:reservation_id>`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Récupère les détails complets d'une réservation.

**Exemple** : `POST /api/stock/reservations/1`

**Réponse** :

```json
{
  "success": true,
  "reservation": {
    "id": 1,
    "name": "RES/00001",
    "product_id": 123,
    "product_name": "T-shirt Noir XL",
    "product_sku": "TSH-BLK-XL",
    "reserved_qty": 50.0,
    "unit": "Unité(s)",
    "location_id": 8,
    "location_name": "WH/Stock",
    "reservation_date": "2026-01-30T10:00:00",
    "expiration_date": "2026-02-15T23:59:59",
    "reason": "event",
    "reason_label": "Événement spécial",
    "notes": "Réservation pour salon e-commerce",
    "state": "active",
    "state_label": "Active",
    "user_id": 2,
    "user_name": "Admin",
    "stock_available_at_creation": 120.0,
    "create_date": "2026-01-30T09:45:00",
    "write_date": "2026-01-30T10:00:00"
  }
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Réservation 999 introuvable"
}
```

---

### 1.3. Créer une Réservation

**Endpoint** : `POST /api/stock/reservations/create`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Crée une nouvelle réservation manuelle (état initial : `draft`).

**Paramètres** :

```json
{
  "product_id": 123,              // requis
  "reserved_qty": 50.0,           // requis
  "location_id": 8,               // requis
  "reason": "event",              // requis: 'event', 'special_order', 'vip_customer', 'promotion', 'sample', 'other'
  "expiration_date": "2026-02-15T23:59:59",  // optionnel
  "notes": "Réservation pour salon e-commerce",  // optionnel
  "tenant_id": 1                  // optionnel (multi-tenant)
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "reservation": {
    "id": 1,
    "name": "RES/00001",
    "state": "draft",
    // ... (même structure que détails)
  }
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Champ requis: product_id"
}
```

```json
{
  "success": false,
  "error": "Stock insuffisant pour T-shirt Noir XL à l'emplacement WH/Stock.\nDisponible : 30 Unité(s)\nDemandé : 50 Unité(s)"
}
```

---

### 1.4. Activer une Réservation

**Endpoint** : `POST /api/stock/reservations/<int:reservation_id>/activate`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Active une réservation en état `draft`. Vérifie que le stock disponible est suffisant.

**Exemple** : `POST /api/stock/reservations/1/activate`

**Réponse** :

```json
{
  "success": true,
  "message": "Réservation activée avec succès",
  "reservation": {
    "id": 1,
    "name": "RES/00001",
    "state": "active",
    "reservation_date": "2026-01-30T14:23:45",
    // ...
  }
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Seules les réservations en brouillon peuvent être activées"
}
```

---

### 1.5. Libérer une Réservation

**Endpoint** : `POST /api/stock/reservations/<int:reservation_id>/release`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Libère manuellement une réservation active (passe à l'état `released`).

**Exemple** : `POST /api/stock/reservations/1/release`

**Réponse** :

```json
{
  "success": true,
  "message": "Réservation libérée avec succès",
  "reservation": {
    "id": 1,
    "name": "RES/00001",
    "state": "released",
    // ...
  }
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Seules les réservations actives peuvent être libérées"
}
```

---

### 1.6. Supprimer une Réservation

**Endpoint** : `POST /api/stock/reservations/<int:reservation_id>/delete`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Supprime une réservation (uniquement si `draft`, `released` ou `expired`).

**Exemple** : `POST /api/stock/reservations/1/delete`

**Réponse** :

```json
{
  "success": true,
  "message": "Réservation supprimée avec succès"
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Impossible de supprimer une réservation active"
}
```

---

## 2. Stock - Late Availability Filter

### 2.1. Lister Commandes par Disponibilité

**Endpoint** : `POST /api/orders/fulfillment-status`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Liste les commandes filtrées par disponibilité future du stock.

**Paramètres** :

```json
{
  "priority": "short",         // optionnel: 'immediate', 'short', 'medium', 'long', 'backorder'
  "can_fulfill_now": true,     // optionnel: true/false
  "state": "sale",             // optionnel: 'draft', 'sale', etc.
  "limit": 50,                 // optionnel (défaut: 50)
  "offset": 0                  // optionnel (défaut: 0)
}
```

**Réponse** :

```json
{
  "success": true,
  "orders": [
    {
      "id": 42,
      "name": "SO/2026/001",
      "date_order": "2026-01-28T15:30:00",
      "state": "sale",
      "amount_total": 450.50,
      "customer_name": "Jean Dupont",
      "can_fulfill_now": false,
      "expected_fulfillment_date": "2026-02-05",
      "fulfillment_priority": "short",
      "missing_stock": [
        {
          "product_id": 123,
          "product_name": "T-shirt Noir XL",
          "sku": "TSH-BLK-XL",
          "qty_needed": 10.0,
          "qty_available": 3.0,
          "qty_missing": 7.0,
          "estimated_date": "2026-02-05",
          "estimated_days": 6
        }
      ]
    }
  ],
  "total": 28,
  "limit": 50,
  "offset": 0
}
```

**Priorités** :

| Priorité | Description | Délai |
|----------|-------------|-------|
| `immediate` | Stock complet, livrable maintenant | 0 jour |
| `short` | Court terme | < 7 jours |
| `medium` | Moyen terme | 7-30 jours |
| `long` | Long terme | > 30 jours |
| `backorder` | Aucune date estimée | N/A |

---

### 2.2. Détails Disponibilité Commande

**Endpoint** : `POST /api/orders/<int:order_id>/fulfillment-detail`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Analyse détaillée de la disponibilité pour chaque ligne de commande.

**Exemple** : `POST /api/orders/42/fulfillment-detail`

**Réponse** :

```json
{
  "success": true,
  "order": {
    "id": 42,
    "name": "SO/2026/001",
    "state": "sale",
    "can_fulfill_now": false,
    "expected_fulfillment_date": "2026-02-05",
    "fulfillment_priority": "short",
    "missing_stock_summary": [
      {
        "product_id": 123,
        "product_name": "T-shirt Noir XL",
        "sku": "TSH-BLK-XL",
        "qty_needed": 10.0,
        "qty_available": 3.0,
        "qty_missing": 7.0,
        "estimated_date": "2026-02-05",
        "estimated_days": 6
      }
    ],
    "lines_detail": [
      {
        "line_id": 1,
        "product_id": 123,
        "product_name": "T-shirt Noir XL",
        "sku": "TSH-BLK-XL",
        "qty_ordered": 10.0,
        "qty_available": 15.0,
        "qty_available_unreserved": 8.0,
        "qty_reserved_manual": 5.0,
        "qty_available_after_manual_reservations": 3.0,
        "is_sufficient": false
      },
      {
        "line_id": 2,
        "product_id": 456,
        "product_name": "Jean Bleu Slim 32",
        "sku": "JEA-BLU-32",
        "qty_ordered": 5.0,
        "qty_available": 20.0,
        "qty_available_unreserved": 18.0,
        "qty_reserved_manual": 0.0,
        "qty_available_after_manual_reservations": 20.0,
        "is_sufficient": true
      }
    ]
  }
}
```

---

### 2.3. Statistiques Disponibilité Globales

**Endpoint** : `POST /api/orders/fulfillment-stats`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : KPIs globaux de disponibilité des commandes en attente.

**Réponse** :

```json
{
  "success": true,
  "stats": {
    "by_priority": {
      "immediate": 45,
      "short": 28,
      "medium": 12,
      "long": 5,
      "backorder": 3
    },
    "ready_count": 45,
    "waiting_count": 48,
    "total_pending": 93,
    "blocked_value": 15420.75
  }
}
```

**Champs** :

- `by_priority` : Nombre de commandes par priorité
- `ready_count` : Commandes livrables maintenant (`can_fulfill_now=true`)
- `waiting_count` : Commandes en attente de stock (`can_fulfill_now=false`)
- `total_pending` : Total commandes non annulées/terminées
- `blocked_value` : Valeur totale (€) des commandes en attente de stock

---

## 3. Marketing - Link Tracker

### 3.1. Lister Liens d'une Campagne

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/links`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Liste tous les liens trackés d'une campagne email.

**Exemple** : `POST /api/marketing/campaigns/5/links`

**Paramètres** :

```json
{
  "limit": 50,     // optionnel (défaut: 50)
  "offset": 0      // optionnel (défaut: 0)
}
```

**Réponse** :

```json
{
  "success": true,
  "campaign_id": 5,
  "links": [
    {
      "id": 12,
      "name": "quelyos.com/promo",
      "url": "https://quelyos.com/promo-hiver",
      "token": "a8f9c2_xY3kL9pQr2vN",
      "campaign_id": 5,
      "campaign_name": "Campagne Hiver 2026",
      "click_count": 145,
      "unique_click_count": 98,
      "last_click_date": "2026-01-30T14:23:45",
      "create_date": "2026-01-25T10:00:00"
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

---

### 3.2. Détails d'un Lien Tracké

**Endpoint** : `POST /api/marketing/links/<int:link_id>`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Détails complets d'un lien avec historique des clics.

**Exemple** : `POST /api/marketing/links/12`

**Réponse** :

```json
{
  "success": true,
  "link": {
    "id": 12,
    "name": "quelyos.com/promo",
    "url": "https://quelyos.com/promo-hiver",
    "token": "a8f9c2_xY3kL9pQr2vN",
    "campaign_id": 5,
    "campaign_name": "Campagne Hiver 2026",
    "click_count": 145,
    "unique_click_count": 98,
    "last_click_date": "2026-01-30T14:23:45",
    "create_date": "2026-01-25T10:00:00"
  }
}
```

---

### 3.3. Statistiques d'un Lien

**Endpoint** : `POST /api/marketing/links/<int:link_id>/stats`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Analytics détaillées (par pays, par jour) pour un lien.

**Exemple** : `POST /api/marketing/links/12/stats`

**Réponse** :

```json
{
  "success": true,
  "link": {
    "id": 12,
    "name": "quelyos.com/promo",
    "url": "https://quelyos.com/promo-hiver",
    "click_count": 145,
    "unique_click_count": 98
  },
  "stats": {
    "total_clicks": 145,
    "unique_clicks": 98,
    "by_country": [
      {"country": "FR", "clicks": 85},
      {"country": "BE", "clicks": 32},
      {"country": "TN", "clicks": 18},
      {"country": "CH", "clicks": 7},
      {"country": "Unknown", "clicks": 3}
    ],
    "by_day": [
      {"day": "2026-01-24", "clicks": 12},
      {"day": "2026-01-25", "clicks": 45},
      {"day": "2026-01-26", "clicks": 38},
      {"day": "2026-01-27", "clicks": 28},
      {"day": "2026-01-28", "clicks": 15},
      {"day": "2026-01-29", "clicks": 5},
      {"day": "2026-01-30", "clicks": 2}
    ]
  }
}
```

---

### 3.4. Redirection Publique (Non Authentifiée)

**Endpoint** : `GET /r/<string:token>`
**Type** : `http`
**Auth** : Public (aucune)

**Description** : Redirige vers l'URL cible et enregistre le clic.

**Exemple** : `GET /r/a8f9c2_xY3kL9pQr2vN`

**Réponse** : HTTP 302 Redirect vers l'URL cible

**Métadonnées capturées** :
- IP du visiteur
- User Agent
- Referer
- Timestamp du clic

---

## 4. Marketing - A/B Testing

### 4.1. Lister Variantes d'une Campagne

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/variants`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Liste toutes les variantes A/B d'une campagne.

**Exemple** : `POST /api/marketing/campaigns/5/variants`

**Réponse** :

```json
{
  "success": true,
  "campaign_id": 5,
  "ab_testing_enabled": true,
  "variants": [
    {
      "id": 1,
      "name": "Campagne Hiver 2026 - Variante A",
      "campaign_id": 5,
      "campaign_name": "Campagne Hiver 2026",
      "variant_letter": "A",
      "subject": "🎁 -30% sur toute la collection hiver !",
      "body": "<html>...</html>",
      "stats_sent": 1000,
      "stats_delivered": 985,
      "stats_opened": 420,
      "stats_clicked": 85,
      "stats_bounced": 15,
      "stats_unsubscribed": 3,
      "open_rate": 42.64,
      "click_rate": 20.24,
      "bounce_rate": 1.50,
      "conversion_score": 42.92,
      "is_winner": true
    },
    {
      "id": 2,
      "name": "Campagne Hiver 2026 - Variante B",
      "campaign_id": 5,
      "variant_letter": "B",
      "subject": "Soldes Hiver : Jusqu'à -50% !",
      "body": "<html>...</html>",
      "stats_sent": 1000,
      "stats_delivered": 990,
      "stats_opened": 380,
      "stats_clicked": 65,
      "stats_bounced": 10,
      "open_rate": 38.38,
      "click_rate": 17.11,
      "bounce_rate": 1.00,
      "conversion_score": 37.73,
      "is_winner": false
    }
  ],
  "variant_count": 2,
  "winner": {
    "id": 1,
    "variant_letter": "A",
    "conversion_score": 42.92
  }
}
```

**Score de Conversion** :
```
conversion_score = (open_rate × 0.4) + (click_rate × 0.4) + ((100 - bounce_rate) × 0.2)
```

---

### 4.2. Créer une Variante

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/variants/create`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Crée une nouvelle variante pour tester une campagne (max 3 variantes).

**Exemple** : `POST /api/marketing/campaigns/5/variants/create`

**Paramètres** :

```json
{
  "variant_letter": "B",                           // requis: 'A', 'B', ou 'C'
  "subject": "Soldes Hiver : Jusqu'à -50% !",     // requis
  "body": "<html>...</html>"                       // requis (HTML)
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Variante B créée avec succès",
  "variant": {
    "id": 2,
    "name": "Campagne Hiver 2026 - Variante B",
    "campaign_id": 5,
    "variant_letter": "B",
    "subject": "Soldes Hiver : Jusqu'à -50% !",
    "body": "<html>...</html>",
    "stats_sent": 0,
    "stats_delivered": 0,
    "stats_opened": 0,
    "stats_clicked": 0,
    "open_rate": 0.0,
    "click_rate": 0.0,
    "conversion_score": 0.0,
    "is_winner": false
  }
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Maximum 3 variantes par campagne (A, B, C)"
}
```

---

### 4.3. Détails d'une Variante

**Endpoint** : `POST /api/marketing/campaigns/variants/<int:variant_id>`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Détails complets d'une variante spécifique.

**Exemple** : `POST /api/marketing/campaigns/variants/1`

**Réponse** :

```json
{
  "success": true,
  "variant": {
    "id": 1,
    "name": "Campagne Hiver 2026 - Variante A",
    "campaign_id": 5,
    "campaign_name": "Campagne Hiver 2026",
    "variant_letter": "A",
    "subject": "🎁 -30% sur toute la collection hiver !",
    "body": "<html>...</html>",
    "stats_sent": 1000,
    "stats_delivered": 985,
    "stats_opened": 420,
    "stats_clicked": 85,
    "stats_bounced": 15,
    "stats_unsubscribed": 3,
    "open_rate": 42.64,
    "click_rate": 20.24,
    "bounce_rate": 1.50,
    "conversion_score": 42.92,
    "is_winner": true
  }
}
```

---

### 4.4. Sélectionner Variante Gagnante

**Endpoint** : `POST /api/marketing/campaigns/variants/<int:variant_id>/select-winner`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Marque une variante comme gagnante et copie son contenu dans la campagne parente.

**Exemple** : `POST /api/marketing/campaigns/variants/1/select-winner`

**Réponse** :

```json
{
  "success": true,
  "message": "Variante A sélectionnée comme gagnante",
  "variant": {
    "id": 1,
    "variant_letter": "A",
    "is_winner": true,
    "conversion_score": 42.92
  },
  "campaign_updated": true
}
```

**Effet** :
- Toutes les autres variantes sont marquées `is_winner=false`
- Le `subject` et `body` de la variante gagnante sont copiés dans la campagne parente

---

### 4.5. Mettre à Jour une Variante

**Endpoint** : `POST /api/marketing/campaigns/variants/<int:variant_id>/update`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Modifie le contenu d'une variante existante.

**Exemple** : `POST /api/marketing/campaigns/variants/2/update`

**Paramètres** :

```json
{
  "subject": "Nouveau sujet modifié",   // optionnel
  "body": "<html>...</html>"            // optionnel
}
```

**Réponse** :

```json
{
  "success": true,
  "message": "Variante mise à jour avec succès",
  "variant": {
    "id": 2,
    "subject": "Nouveau sujet modifié",
    "body": "<html>...</html>",
    // ...
  }
}
```

---

### 4.6. Supprimer une Variante

**Endpoint** : `POST /api/marketing/campaigns/variants/<int:variant_id>/delete`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Supprime une variante (impossible si c'est la variante gagnante).

**Exemple** : `POST /api/marketing/campaigns/variants/2/delete`

**Réponse** :

```json
{
  "success": true,
  "message": "Variante supprimée avec succès"
}
```

**Erreurs** :

```json
{
  "success": false,
  "error": "Impossible de supprimer la variante gagnante"
}
```

---

## 5. Marketing - Analytics Graphiques

### 5.1. Timeline (Évolution 7 Jours)

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/analytics/timeline`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Données pour graphique line chart (Chart.js) - Évolution sur 7 jours.

**Exemple** : `POST /api/marketing/campaigns/5/analytics/timeline`

**Réponse** :

```json
{
  "success": true,
  "chart_data": {
    "labels": [
      "2026-01-24",
      "2026-01-25",
      "2026-01-26",
      "2026-01-27",
      "2026-01-28",
      "2026-01-29",
      "2026-01-30"
    ],
    "datasets": [
      {
        "label": "Ouverts",
        "data": [60, 85, 92, 78, 65, 45, 32],
        "borderColor": "rgb(59, 130, 246)",
        "backgroundColor": "rgba(59, 130, 246, 0.1)",
        "tension": 0.4
      },
      {
        "label": "Cliqués",
        "data": [12, 23, 28, 19, 15, 8, 5],
        "borderColor": "rgb(34, 197, 94)",
        "backgroundColor": "rgba(34, 197, 94, 0.1)",
        "tension": 0.4
      },
      {
        "label": "Bounces",
        "data": [2, 3, 1, 2, 1, 0, 1],
        "borderColor": "rgb(239, 68, 68)",
        "backgroundColor": "rgba(239, 68, 68, 0.1)",
        "tension": 0.4
      }
    ]
  }
}
```

**Usage Chart.js** :

```javascript
const ctx = document.getElementById('timelineChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: response.chart_data,
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});
```

---

### 5.2. Funnel (Entonnoir Conversion)

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/analytics/funnel`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Données pour graphique bar chart - Entonnoir de conversion.

**Exemple** : `POST /api/marketing/campaigns/5/analytics/funnel`

**Réponse** :

```json
{
  "success": true,
  "chart_data": {
    "labels": ["Envoyés", "Livrés", "Ouverts", "Cliqués"],
    "datasets": [{
      "label": "Funnel de conversion",
      "data": [2000, 1970, 840, 168],
      "backgroundColor": [
        "rgba(59, 130, 246, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(168, 85, 247, 0.8)"
      ]
    }],
    "percentages": {
      "delivered": 98.5,
      "opened": 42.6,
      "clicked": 20.0
    }
  }
}
```

**Usage Chart.js** :

```javascript
const ctx = document.getElementById('funnelChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: response.chart_data,
  options: {
    indexAxis: 'y',
    responsive: true
  }
});
```

---

### 5.3. Devices (Répartition Par Appareil)

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/analytics/devices`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Données pour graphique pie chart - Répartition mobile/desktop/tablet.

**Exemple** : `POST /api/marketing/campaigns/5/analytics/devices`

**Réponse** :

```json
{
  "success": true,
  "chart_data": {
    "labels": ["Mobile", "Desktop", "Tablet", "Inconnu"],
    "datasets": [{
      "label": "Répartition par device",
      "data": [85, 52, 18, 5],
      "backgroundColor": [
        "rgba(59, 130, 246, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(156, 163, 175, 0.8)"
      ]
    }]
  }
}
```

**Détection Device** :

| User Agent contient | Catégorie |
|---------------------|-----------|
| `mobile`, `android`, `iphone` | Mobile |
| `tablet`, `ipad` | Tablet |
| Autre (non vide) | Desktop |
| Vide | Inconnu |

---

### 5.4. Heatmap (Clics Par Lien)

**Endpoint** : `POST /api/marketing/campaigns/<int:campaign_id>/analytics/heatmap`
**Type** : `jsonrpc`
**Auth** : Bearer Token

**Description** : Heatmap des clics sur liens dans l'email avec positions estimées.

**Exemple** : `POST /api/marketing/campaigns/5/analytics/heatmap`

**Réponse** :

```json
{
  "success": true,
  "heatmap": {
    "all_links": [
      {
        "link_id": 12,
        "url": "https://quelyos.com/promo-hiver",
        "name": "quelyos.com/promo",
        "click_count": 145,
        "unique_click_count": 98,
        "position": "top"
      },
      {
        "link_id": 13,
        "url": "https://quelyos.com/nouveautes",
        "name": "quelyos.com/nouveautes",
        "click_count": 85,
        "unique_click_count": 62,
        "position": "middle"
      },
      {
        "link_id": 14,
        "url": "https://quelyos.com/contact",
        "name": "quelyos.com/contact",
        "click_count": 12,
        "unique_click_count": 10,
        "position": "bottom"
      }
    ],
    "top_10": [
      // 10 premiers liens triés par click_count desc
    ],
    "position_stats": {
      "top": 145,
      "middle": 85,
      "bottom": 12,
      "unknown": 0
    },
    "total_links": 8
  }
}
```

**Positions** :

| Position | Calcul |
|----------|--------|
| `top` | URL dans les 0-33% du body HTML |
| `middle` | URL dans les 33-66% du body |
| `bottom` | URL dans les 66-100% du body |
| `unknown` | URL non trouvée dans body |

---

## 6. Authentification

**Toutes les routes** (sauf `/r/<token>` publique) **requièrent un Bearer Token**.

**Header requis** :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtention du token** :

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Réponse** :

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
  "expires_in": 3600
}
```

**Erreur authentification** :

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Token invalide ou expiré"
}
```

---

## 7. Codes d'Erreur

| Code HTTP | Description | Exemple |
|-----------|-------------|---------|
| `200` | Succès | Réponse normale |
| `400` | Requête invalide | Paramètre requis manquant |
| `401` | Non autorisé | Token manquant/invalide |
| `403` | Interdit | Permissions insuffisantes |
| `404` | Non trouvé | Ressource introuvable |
| `409` | Conflit | Contrainte violée (ex: variant_unique) |
| `500` | Erreur serveur | Erreur interne Odoo |

**Format erreur standard** :

```json
{
  "success": false,
  "error": "Message d'erreur lisible"
}
```

**Exemples** :

```json
{
  "success": false,
  "error": "Champ requis: product_id"
}
```

```json
{
  "success": false,
  "error": "Stock insuffisant pour T-shirt Noir XL à l'emplacement WH/Stock.\nDisponible : 30 Unité(s)\nDemandé : 50 Unité(s)"
}
```

```json
{
  "success": false,
  "error": "Maximum 3 variantes par campagne (A, B, C)"
}
```

---

## 📊 Résumé Routes

**Total : 23 nouvelles routes**

| Module | Catégorie | Routes | Auth |
|--------|-----------|--------|------|
| Stock | Réservations | 6 | Bearer |
| Stock | Late Availability | 3 | Bearer |
| Marketing | Link Tracker | 4 | Bearer + 1 Publique |
| Marketing | A/B Testing | 6 | Bearer |
| Marketing | Analytics | 4 | Bearer |

**Format de données** : JSON
**Protocole** : HTTP/HTTPS
**Type** : JSON-RPC (sauf redirections)

---

## 🔗 Liens Utiles

- **Base URL** : `https://api.quelyos.com` (production) ou `http://localhost:8069` (dev)
- **Postman Collection** : `docs/postman/quelyos-api-v2.json`
- **Code Source Backend** : `odoo-backend/addons/quelyos_api/`
- **Health Check** : `GET /web/health` → `{"status": "pass"}`

---

**Version** : 1.0.0
**Dernière mise à jour** : 2026-01-30
**Mainteneur** : Quelyos Team
