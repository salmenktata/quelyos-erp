# Quelyos Stock Advanced

## 📦 Description

Module wrapper qui intègre les fonctionnalités OCA Stock dans l'écosystème Quelyos Suite.

Ce module fait partie de l'architecture modulaire de Quelyos et enveloppe les 4 modules OCA Stock adaptés pour Odoo 19.0.

## 🎯 Fonctionnalités

### 1. Raisons de Changement de Quantité
**Module OCA** : `stock_change_qty_reason`
- Suivi des raisons lors des ajustements de stock
- Historique des modifications avec justifications
- API : `/api/stock/change-reasons`, `/api/stock/adjust-with-reason`

### 2. Inventaires Améliorés
**Module OCA** : `stock_inventory`
- Inventaires groupés (fonctionnalité restaurée d'Odoo 14)
- Comptage simultané de plusieurs produits
- API : `/api/stock/inventories-oca`

### 3. Verrouillage d'Emplacements
**Module OCA** : `stock_location_lockdown`
- Blocage d'emplacements pendant inventaire
- Prévention des mouvements concurrents
- API : `/api/stock/location-locks`, `/api/stock/location/<id>/lock`

### 4. Estimation de la Demande
**Module OCA** : `stock_demand_estimate`
- Prévisions de demande par produit/emplacement/période
- Planification des approvisionnements
- (API à venir)

## 🏗️ Architecture

```
quelyos_stock_advanced/
├── __init__.py
├── __manifest__.py              # Dépendances vers modules OCA
├── controllers/
│   ├── __init__.py
│   └── stock_oca.py            # API REST (déplacé depuis quelyos_api)
├── models/
│   └── __init__.py             # Extensions futures des modèles OCA
├── security/
│   └── ir.model.access.csv
└── README.md
```

## 🔗 Dépendances

### Modules Odoo Standard
- `stock` - Gestion de stock Odoo

### Modules Quelyos
- `quelyos_api` - API REST principale

### Modules OCA (adaptés Odoo 19.0)
- `stock_change_qty_reason` (19.0.1.0.0)
- `stock_inventory` (19.0.1.1.2)
- `stock_location_lockdown` (19.0.1.0.0)
- `stock_demand_estimate` (19.0.1.1.0)

**Note** : Les modules OCA ont été adaptés de la version 18.0 vers 19.0. Voir `docs/OCA_PATCHES_19.md` pour détails.

## 📡 Endpoints API REST

Tous les endpoints sont accessibles via `/api/stock/*` :

### GET /api/stock/change-reasons
Liste les raisons de changement de quantité configurées.

**Réponse** :
```json
{
  "success": true,
  "data": {
    "reasons": [
      {
        "id": 1,
        "name": "Casse",
        "code": "BREAKAGE",
        "active": true
      }
    ],
    "total": 1
  }
}
```

### POST /api/stock/adjust-with-reason
Ajuste le stock avec une raison de changement.

**Paramètres** :
```json
{
  "product_id": 1,
  "location_id": 8,
  "new_quantity": 100.0,
  "reason_id": 1,
  "notes": "Inventaire physique"
}
```

### GET /api/stock/inventories-oca
Liste les inventaires OCA.

**Paramètres** : `limit`, `offset`

### GET /api/stock/location-locks
Liste les emplacements verrouillés.

### POST /api/stock/location/<id>/lock
Verrouille ou déverrouille un emplacement.

**Paramètres** :
```json
{
  "lock": true
}
```

## 🚀 Installation

### Méthode 1 : Installation Automatique

Le module s'installe automatiquement avec les 4 modules OCA lors d'un fresh install :

```bash
./scripts/fresh-install.sh
```

### Méthode 2 : Installation Manuelle

```bash
# 1. Installer les modules OCA
./scripts/install-oca-stock.sh

# 2. Installer quelyos_stock_advanced
docker-compose -f odoo-backend/docker-compose.yml run --rm odoo \
  odoo -d quelyos \
  --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
  -i quelyos_stock_advanced \
  --stop-after-init
```

### Vérification Installation

```bash
docker-compose -f odoo-backend/docker-compose.yml exec -T db psql -U odoo -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name = 'quelyos_stock_advanced';"
```

## 🔧 Configuration

Aucune configuration nécessaire. Le module active automatiquement les fonctionnalités OCA.

## 📚 Documentation

- **Guide Intégration OCA** : `docs/OCA_INTEGRATION.md`
- **Patchs Odoo 19.0** : `docs/OCA_PATCHES_19.md`
- **État Intégration** : `docs/OCA_STATUS.md`
- **Issue GitHub** : [#52 - Intégration OCA Stock](https://github.com/salmenktata/quelyosSuite/issues/52)

## 🎨 Interface Utilisateur

Les interfaces React sont disponibles dans `dashboard-client` :

- `/stock/change-reasons` - Gestion des raisons
- `/stock/inventories-oca` - Inventaires OCA
- `/stock/location-locks` - Verrouillage emplacements

## 🤝 Contribution OCA

Les modules OCA sont maintenus par la communauté Odoo (OCA).

**Si vous améliorez un module OCA** :
1. Fork le repository OCA concerné
2. Appliquez vos modifications
3. Pull Request vers OCA upstream
4. Intégration dans Quelyos Suite après merge OCA

**Repository OCA** : https://github.com/OCA/stock-logistics-warehouse

## 📄 Licence

- **quelyos_stock_advanced** : LGPL-3 (Quelyos Suite)
- **Modules OCA** : AGPL-3 (Odoo Community Association)

AGPL-3 et LGPL-3 sont compatibles pour usage ensemble.

## 🐛 Support

- **Issues Quelyos** : https://github.com/salmenktata/quelyosSuite/issues
- **Issues OCA** : https://github.com/OCA/stock-logistics-warehouse/issues
- **Contact** : salmen.ktata@gmail.com

---

**Auteur** : Quelyos Development Team
**Version** : 19.0.1.0.0
**Dernière Mise à Jour** : 27 Janvier 2026
