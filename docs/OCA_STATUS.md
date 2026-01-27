# État de l'Intégration OCA Stock - Quelyos Suite

## 📊 État Actuel (27 Jan 2026)

### ✅ Complété

**Phase 1 : Backend API (100%)**
- ✅ 4 modules OCA téléchargés (version 18.0)
- ✅ Scripts d'installation créés
  - `scripts/download-oca-stock.sh` (branch 18.0)
  - `scripts/install-oca-stock.sh`
  - `scripts/fresh-install.sh`
- ✅ 5 endpoints API REST créés (`quelyos_api/controllers/stock_oca.py`)
  - `/api/stock/change-reasons` - Liste raisons changement
  - `/api/stock/adjust-with-reason` - Ajustement avec raison
  - `/api/stock/inventories-oca` - Liste inventaires
  - `/api/stock/location-locks` - Liste verrous
  - `/api/stock/location/<id>/lock` - Verrouiller/déverrouiller
- ✅ Documentation complète (`odoo-backend/addons/quelyos_api/README_OCA.md`)

**Phase 2 : Frontend UI (100%)**
- ✅ 5 méthodes API dans `dashboard-client/src/lib/api.ts`
- ✅ 5 hooks React dans `dashboard-client/src/hooks/useStock.ts`
- ✅ 3 types TypeScript dans `dashboard-client/src/types/stock.ts`
- ✅ 3 pages React complètes
  - `StockChangeReasons.tsx`
  - `InventoriesOCA.tsx`
  - `LocationLocks.tsx`
- ✅ Routes et navigation intégrées
- ✅ Détection dynamique modules OCA

### ⚠️ Blocage Technique Identifié

**Problème : Incompatibilité Odoo 18.0 → 19.0**

Les modules OCA sont détectés par Odoo 19.0 (`state: uninstalled`) MAIS l'installation échoue avec l'erreur :

```
ValueError: Invalid field 'category_id' in 'res.groups'
while parsing /mnt/extra-addons/stock_change_qty_reason/security/stock_security.xml:3
```

**Cause** : Le modèle `res.groups` a changé entre Odoo 18.0 et 19.0. Le champ `category_id` a été supprimé ou renommé.

**Modules Testés** :
- ❌ `stock_change_qty_reason` (18.0.1.0.0) - Erreur `category_id`
- ⏸️ `stock_inventory` (18.0.1.1.2) - Non testé (blocage premier module)
- ⏸️ `stock_location_lockdown` (18.0.1.0.0) - Non testé
- ⏸️ `stock_demand_estimate` (18.0.1.1.0) - Non testé

## 🔄 Solutions Possibles

### Option 1 : Attendre Migration OCA vers 19.0 (Recommandé)
**Avantages** :
- ✅ Modules officiels, maintenus par OCA
- ✅ Pas de risque de régression
- ✅ Mises à jour automatiques via OCA

**Inconvénients** :
- ❌ Délai inconnu (OCA migration en cours)
- ❌ Fonctionnalités indisponibles temporairement

**Action** :
1. Surveiller repository OCA : https://github.com/OCA/stock-logistics-warehouse
2. Surveiller branches `19.0` ou PR de migration
3. Réinstaller dès disponibilité

### Option 2 : Patcher Modules OCA 18.0 pour Odoo 19.0
**Avantages** :
- ✅ Fonctionnalités disponibles immédiatement
- ✅ Contrôle total sur compatibilité

**Inconvénients** :
- ❌ Maintenance manuelle requise
- ❌ Risque de bugs/régressions
- ❌ Divergence avec OCA upstream

**Actions Requises** :
1. Fork modules OCA
2. Créer branche `19.0-compat`
3. Patcher fichiers XML (remplacer `category_id` par équivalent 19.0)
4. Tester fonctionnalités
5. Maintenir divergence jusqu'à migration officielle

### Option 3 : Downgrade Odoo 19.0 → 18.0 (Non Recommandé)
**Avantages** :
- ✅ Modules OCA compatibles immédiatement

**Inconvénients** :
- ❌ Perte des fonctionnalités Odoo 19.0
- ❌ Régression technologique
- ❌ Migration 18.0 → 19.0 requise plus tard

## 📋 Décision et Prochaines Étapes

### Décision Temporaire : **Option 1** (Attendre Migration OCA)

**Justification** :
- Odoo 19.0 apporte des améliorations significatives
- Les modules OCA sont en cours de migration vers 19.0
- L'infrastructure frontend/backend est déjà prête

**Actions Immédiates** :
1. ✅ Documenter l'état actuel (ce fichier)
2. ✅ Committer modifications scripts (branch 18.0, corrections)
3. 🔄 Créer Issue GitHub pour suivi migration OCA
4. 🔄 Ajouter surveillance OCA repository (notifications)

**Frontend/Backend Prêt** :
- ✓ Les 5 endpoints API retourneront `MODULE_NOT_INSTALLED` gracieusement
- ✓ Les 3 pages React afficheront un message d'aide
- ✓ Ré-activation automatique dès installation modules OCA

## 🔗 Ressources

- **OCA Repository** : https://github.com/OCA/stock-logistics-warehouse
- **Odoo 19.0 Changes** : https://www.odoo.com/documentation/19.0/developer/changelog.html
- **Issue Quelyos #52** : Intégration OCA Stock
- **Commits Phase 1** : 806bbe3
- **Commits Phase 2** : 7aa89e3, bf2a444

## 📝 Notes Techniques

### Modules OCA Disponibles (Branch 18.0)

| Module | Version | Description | État |
|--------|---------|-------------|------|
| stock_change_qty_reason | 18.0.1.0.0 | Raisons ajustement stock | ❌ Incompatible 19.0 |
| stock_inventory | 18.0.1.1.2 | Inventaires groupés OCA | ⏸️ Blocage dépendance |
| stock_location_lockdown | 18.0.1.0.0 | Verrouillage emplacements | ⏸️ Blocage dépendance |
| stock_demand_estimate | 18.0.1.1.0 | Estimation demande | ⏸️ Blocage dépendance |

### Changements Odoo 18.0 → 19.0 Identifiés

1. **res.groups** :
   - Champ `category_id` supprimé/renommé
   - Impact : Fichiers security XML des modules OCA

2. **@route(type='json')** :
   - Déprécié en faveur de `@route(type='jsonrpc')`
   - Impact : Warnings dans quelyos_api (non bloquant)

---

**Dernière Mise à Jour** : 27 Janvier 2026
**Auteur** : Quelyos Development Team
**Contact** : salmen.ktata@gmail.com
