# Quelyos Stock Advanced - Guide d'Installation et Utilisation

## 📋 Vue d'Ensemble

`quelyos_stock_advanced` est un module wrapper Quelyos qui intègre 4 modules OCA Stock dans l'écosystème Quelyos Suite.

**Architecture** : Module → Wrapper → Modules OCA → Odoo Stock

```
Frontend (React)
    ↓ API REST
quelyos_stock_advanced (Wrapper Quelyos)
    ↓ Dépend de
stock_change_qty_reason (OCA 19.0)
stock_inventory (OCA 19.0)
stock_location_lockdown (OCA 19.0)
stock_demand_estimate (OCA 19.0)
    ↓ Étendent
stock (Odoo 19.0 Standard)
```

## 🎯 Pourquoi un Module Wrapper ?

### Avantages

1. **Maintenabilité** : Modules OCA restent intacts et updateables
2. **Personnalisation** : Quelyos peut ajouter des couches métier
3. **Migration Facile** : Passer à OCA 19.0 officiel sera simple
4. **API Unifiée** : Un seul point d'entrée pour le frontend

### Alternative Rejetée

❌ **Intégration Directe** : Copier le code OCA dans `quelyos_api`
- Maintenance difficile
- Perte des updates OCA
- Fork complexe à gérer

## 🚀 Installation

### Prérequis

```bash
# Les 4 modules OCA doivent être installés
docker-compose -f odoo-backend/docker-compose.yml exec -T db psql -U odoo -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name IN (
    'stock_change_qty_reason',
    'stock_inventory',
    'stock_location_lockdown',
    'stock_demand_estimate'
  ) ORDER BY name;"
```

**Résultat Attendu** : Tous en état `installed`

### Installation Fresh Install

```bash
# Méthode recommandée (tout-en-un)
./scripts/fresh-install.sh

# Puis installer quelyos_stock_advanced
docker-compose -f odoo-backend/docker-compose.yml run --rm odoo \
  odoo -d quelyos \
  --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
  -i quelyos_stock_advanced \
  --stop-after-init
```

### Installation Manuelle

```bash
# 1. S'assurer qu'Odoo est démarré
docker-compose -f odoo-backend/docker-compose.yml up -d

# 2. Mettre à jour liste modules
docker-compose -f odoo-backend/docker-compose.yml restart odoo
sleep 15

# 3. Installer quelyos_stock_advanced
docker-compose -f odoo-backend/docker-compose.yml run --rm odoo \
  odoo -d quelyos \
  --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
  -i quelyos_stock_advanced \
  --stop-after-init

# 4. Redémarrer Odoo
docker-compose -f odoo-backend/docker-compose.yml restart odoo
```

### Vérification Installation

```bash
# Vérifier module installé
docker-compose -f odoo-backend/docker-compose.yml exec -T db psql -U odoo -d quelyos -c \
  "SELECT name, state, latest_version FROM ir_module_module WHERE name = 'quelyos_stock_advanced';"
```

**Résultat Attendu** :
```
         name          |   state   | latest_version
-----------------------+-----------+----------------
 quelyos_stock_advanced | installed | 19.0.1.0.0
```

## 📡 Utilisation des API

### 1. Raisons de Changement de Stock

#### Lister les raisons
```bash
curl -X POST http://localhost:8069/api/stock/change-reasons \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {},
    "id": 1
  }'
```

#### Ajuster avec raison
```bash
curl -X POST http://localhost:8069/api/stock/adjust-with-reason \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "product_id": 1,
      "location_id": 8,
      "new_quantity": 100.0,
      "reason_id": 1,
      "notes": "Inventaire physique"
    },
    "id": 2
  }'
```

### 2. Inventaires OCA

```bash
curl -X POST http://localhost:8069/api/stock/inventories-oca \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "limit": 10,
      "offset": 0
    },
    "id": 3
  }'
```

### 3. Verrouillage d'Emplacements

#### Lister verrous
```bash
curl -X POST http://localhost:8069/api/stock/location-locks \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {},
    "id": 4
  }'
```

#### Verrouiller emplacement
```bash
curl -X POST http://localhost:8069/api/stock/location/8/lock \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "lock": true
    },
    "id": 5
  }'
```

## 🎨 Interface React

### Pages Disponibles

Les 3 pages React sont déjà créées dans `dashboard-client` :

1. **`/stock/change-reasons`** - Gestion raisons de changement
   - Composant : `dashboard-client/src/pages/stock/StockChangeReasons.tsx`
   - Hook : `useStockChangeReasons()`

2. **`/stock/inventories-oca`** - Liste inventaires OCA
   - Composant : `dashboard-client/src/pages/stock/InventoriesOCA.tsx`
   - Hook : `useStockInventoriesOCA({ limit, offset })`

3. **`/stock/location-locks`** - Verrouillage emplacements
   - Composant : `dashboard-client/src/pages/stock/LocationLocks.tsx`
   - Hooks : `useLocationLocks()`, `useLockLocation()`

### Navigation

Menu Stock → Section "Fonctionnalités OCA" :
- Raisons Changement Stock
- Inventaires OCA
- Verrouillage Emplacements

## 🔧 Extension du Module

### Ajouter des Modèles Quelyos

Créer `models/stock_change_reason.py` :

```python
# -*- coding: utf-8 -*-
from odoo import models, fields

class StockQuantityChangeReason(models.Model):
    _inherit = 'stock.quantity.change.reason'

    # Ajouter champs personnalisés Quelyos
    quelyos_category = fields.Selection([
        ('waste', 'Déchet'),
        ('damage', 'Dommage'),
        ('theft', 'Vol'),
        ('error', 'Erreur'),
        ('other', 'Autre'),
    ], string='Catégorie Quelyos')

    quelyos_impact_value = fields.Monetary(
        string='Impact Valeur',
        compute='_compute_impact_value',
        currency_field='company_currency_id',
    )
```

Puis ajouter dans `models/__init__.py` :
```python
from . import stock_change_reason
```

### Ajouter des Endpoints API

Créer `controllers/stock_advanced.py` :

```python
# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class StockAdvancedController(http.Controller):

    @http.route('/api/stock/reason-stats', type='json', auth='user')
    def get_reason_statistics(self, **kwargs):
        """
        Statistiques d'utilisation des raisons
        """
        # Logique Quelyos personnalisée
        pass
```

## 📊 Dépendances et Relations

### Graphe de Dépendances

```
quelyos_stock_advanced (19.0.1.0.0)
├── stock (Odoo)
├── quelyos_api (19.0.1.0.0)
├── stock_change_qty_reason (19.0.1.0.0) [OCA]
├── stock_inventory (19.0.1.1.2) [OCA]
├── stock_location_lockdown (19.0.1.0.0) [OCA]
└── stock_demand_estimate (19.0.1.1.0) [OCA]
```

### Installation Cascade

Lorsque vous installez `quelyos_stock_advanced`, Odoo installe automatiquement toutes les dépendances si elles ne le sont pas déjà.

## 🐛 Troubleshooting

### Module non détecté après création

```bash
# Redémarrer Odoo pour scanner nouveaux modules
docker-compose -f odoo-backend/docker-compose.yml restart odoo
sleep 15

# Mettre à jour liste modules
docker-compose -f odoo-backend/docker-compose.yml run --rm odoo \
  odoo -d quelyos \
  --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
  -u base \
  --stop-after-init
```

### Erreur "Module not found"

Vérifier que les modules OCA sont bien installés :

```bash
docker-compose -f odoo-backend/docker-compose.yml exec -T db psql -U odoo -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name LIKE 'stock_%' AND name IN (
    'stock_change_qty_reason',
    'stock_inventory',
    'stock_location_lockdown',
    'stock_demand_estimate'
  );"
```

Si non installés, lancer :
```bash
./scripts/install-oca-stock.sh
```

### Endpoints API retournent 404

```bash
# Vérifier que quelyos_stock_advanced est bien installé
docker-compose -f odoo-backend/docker-compose.yml exec -T db psql -U odoo -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name = 'quelyos_stock_advanced';"
```

Si `uninstalled`, installer le module (voir section Installation).

### Frontend affiche "Module OCA non installé"

Le frontend détecte dynamiquement si les modules OCA sont installés. Ce message apparaît si :
1. Les modules OCA ne sont pas installés
2. L'API retourne `error_code: 'MODULE_NOT_INSTALLED'`

**Solution** : Installer les modules OCA puis `quelyos_stock_advanced`.

## 📚 Références

- **README Module** : `odoo-backend/addons/quelyos_stock_advanced/README.md`
- **Guide OCA** : `docs/OCA_INTEGRATION.md`
- **Patchs 19.0** : `docs/OCA_PATCHES_19.md`
- **État OCA** : `docs/OCA_STATUS.md`
- **Issue #52** : https://github.com/salmenktata/quelyosSuite/issues/52

---

**Version** : 19.0.1.0.0
**Dernière Mise à Jour** : 27 Janvier 2026
**Auteur** : Quelyos Development Team
