# Quelyos Suite - Module d'Installation Automatique

## 🎯 Objectif

Ce module orchestre l'installation complète de **Quelyos Suite** sur une instance Odoo 19 vierge en installant automatiquement tous les prérequis et modules nécessaires.

## 📦 Ce qui est installé automatiquement

### Modules Odoo Core (Community)
- **base**, **mail**, **web** - Fondations Odoo
- **sale_management** - Gestion des ventes
- **stock** - Gestion des stocks
- **account** - Comptabilité
- **crm** - CRM
- **website**, **website_sale** - E-commerce
- **delivery**, **payment** - Livraison et paiements
- **product** - Gestion produits

### Modules OCA (Recommandés)
- **stock_inventory** - Inventaire avancé
- **stock_warehouse_calendar** - Calendrier entrepôt

### Module Principal Quelyos
- **quelyos_api** - Backend complet Quelyos (764 endpoints, 101 modèles, 12 modules OCA natifs)

### Dépendances Python
- **qrcode** - Génération QR codes
- **Pillow** - Manipulation images
- **faker** - Données de test

## 🚀 Installation

### Méthode 1 : Installation via Interface Odoo (Recommandée)

```bash
# 1. Placer le module dans addons/
cp -r quelyos_installer /path/to/odoo/addons/

# 2. Redémarrer Odoo
docker restart quelyos-odoo
# ou
sudo systemctl restart odoo

# 3. Ouvrir Odoo dans le navigateur
http://localhost:8069

# 4. Aller dans Apps > Update Apps List

# 5. Rechercher "Quelyos Suite"

# 6. Cliquer sur "Install"
# ⏳ L'installation prend 2-5 minutes
# ✅ Tous les prérequis seront installés automatiquement !
```

### Méthode 2 : Installation via CLI

```bash
# Installation directe via odoo-bin
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i quelyos_installer \
    --stop-after-init

# Redémarrer ensuite
docker restart quelyos-odoo
```

### Méthode 3 : Installation dans docker-compose

```yaml
# docker-compose.yml
services:
  odoo:
    environment:
      - ODOO_INIT=quelyos_installer
```

## ✅ Vérification Installation

Après installation, vérifier :

```bash
# 1. Vérifier module installé
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name='quelyos_installer';"

# 2. Vérifier quelyos_api installé
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT name, state FROM ir_module_module WHERE name='quelyos_api';"

# 3. Vérifier tenant créé
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT id, name FROM quelyos_tenant;"

# 4. Tester API
curl http://localhost:8069/api/health
```

## 🔧 Configuration Post-Installation

### 1. Démarrer les Frontends

```bash
# Dashboard (ERP Complet)
cd dashboard-client
npm install
npm run dev
# → http://localhost:5175

# E-commerce
cd vitrine-client
npm install
npm run dev
# → http://localhost:3001

# Site Vitrine
cd vitrine-quelyos
npm install
npm run dev
# → http://localhost:3000
```

### 2. Se Connecter

**URL** : http://localhost:5175  
**Email** : admin@quelyos.com  
**Password** : (configuré dans data/default_admin_tenant.xml)

## 📚 Modules OCA Optionnels

Les modules OCA sont **recommandés** mais **optionnels**. Si non installés, Quelyos Suite utilisera ses modules natifs fusionnés.

### Installation Modules OCA (si souhaité)

```bash
# 1. Cloner repos OCA
cd odoo-backend/addons

git clone -b 19.0 https://github.com/OCA/stock-logistics-warehouse.git oca-stock

# 2. Créer liens symboliques
ln -s oca-stock/stock_inventory .
ln -s oca-stock/stock_warehouse_calendar .

# 3. Redémarrer Odoo
docker restart quelyos-odoo

# 4. Installer modules
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i stock_inventory,stock_warehouse_calendar \
    --stop-after-init
```

## 🐛 Dépannage

### Erreur : Module quelyos_api introuvable

```bash
# Vérifier que quelyos_api existe dans addons/
ls -la /path/to/odoo/addons/quelyos_api

# Mettre à jour liste des apps
# Apps > Update Apps List
```

### Erreur : Dépendances Python manquantes

```bash
# Installer manuellement
pip install qrcode Pillow faker

# ou dans Docker
docker exec -it quelyos-odoo pip install qrcode Pillow faker
```

### Erreur : Module OCA manquant

Les modules OCA sont **optionnels**. L'installation continue sans eux.  
Voir section "Installation Modules OCA" ci-dessus.

## 📊 Architecture Installée

Après installation complète :

```
Quelyos Suite
├── Backend (Odoo 19)
│   ├── quelyos_api (764 endpoints, 101 modèles)
│   ├── Modules OCA natifs (12 modules fusionnés)
│   └── Modules Odoo Core (sale, stock, account, etc.)
│
├── Dashboard Client (React + Vite)
│   └── ERP Complet 8 modules
│
├── Vitrine Client (Next.js 16)
│   └── E-commerce B2C
│
└── Vitrine Quelyos (Next.js 14)
    └── Site Marketing
```

## 🔄 Mise à Jour

```bash
# Upgrade module installer
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -u quelyos_installer \
    --stop-after-init
```

## 🗑️ Désinstallation

```bash
# Désinstaller Quelyos Suite
# Apps > Quelyos Suite > Uninstall

# ⚠️  Les données sont conservées par défaut
# Voir logs pour instructions suppression complète
```

## 📝 Logs Installation

Les logs détaillés sont dans :
- **Docker** : `docker logs quelyos-odoo`
- **Fichier** : `/var/log/odoo/odoo.log`

Rechercher : `QUELYOS SUITE - Installation`

## 💡 Support

- **Documentation** : `README-DEV.md`
- **Issues** : https://github.com/salmenktata/quelyosSuite/issues
- **Guide complet** : `docs/`

---

**Version** : 19.0.1.0.0  
**Auteur** : Quelyos  
**Licence** : LGPL-3
