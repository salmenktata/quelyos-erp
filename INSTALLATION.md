# 🚀 Installation Rapide - Quelyos Suite

## Installation Automatique en 1 Clic

Quelyos Suite s'installe automatiquement avec **TOUS ses prérequis** via le module `quelyos_installer`.

---

## 📦 Méthode 1 : Installation Interface Odoo (Recommandée)

### Étape 1 : Préparer Odoo 19

```bash
# Cloner le projet
git clone https://github.com/salmenktata/quelyosSuite.git
cd quelyosSuite

# Démarrer Odoo 19 avec Docker
docker-compose up -d
```

### Étape 2 : Installer Quelyos Suite

1. **Ouvrir Odoo** : http://localhost:8069
2. **Créer base de données** : `quelyos` (si première installation)
3. **Aller dans Apps** > `Update Apps List`
4. **Rechercher** : `Quelyos Suite`
5. **Cliquer** : `Install` ✅

⏳ **Durée** : 2-5 minutes  
✅ **Résultat** : Tous les modules installés automatiquement !

### Étape 3 : Vérifier Installation

```bash
# Vérifier modules installés
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT name, state FROM ir_module_module 
   WHERE name IN ('quelyos_installer', 'quelyos_api');"

# Tester API
curl http://localhost:8069/api/health
```

---

## ⚡ Méthode 2 : Installation CLI (Rapide)

```bash
# Installation directe via odoo-bin
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i quelyos_installer \
    --stop-after-init

# Redémarrer Odoo
docker restart quelyos-odoo

# Tester
curl http://localhost:8069/api/health
```

---

## 🎯 Ce qui est installé automatiquement

### ✅ Modules Odoo Core
- base, mail, web, sale_management
- stock, account, crm
- website, website_sale
- delivery, payment
- product

### ✅ Module Principal Quelyos
- **quelyos_api** : 764 endpoints, 101 modèles, 12 modules OCA natifs

### ✅ Dépendances Python
- qrcode, Pillow, faker (auto-installées)

### ⚙️ Configuration Auto
- Tenant par défaut créé
- Base de données initialisée
- API REST activée

---

## 🔧 Configuration Post-Installation

### 1. Démarrer les Frontends

```bash
# Dashboard (ERP) - Port 5175
cd dashboard-client
npm install && npm run dev

# E-commerce - Port 3001
cd vitrine-client
npm install && npm run dev

# Site Vitrine - Port 3000
cd vitrine-quelyos
npm install && npm run dev
```

### 2. Accéder à Quelyos Suite

**Dashboard (ERP Complet)** : http://localhost:5175  
**E-commerce** : http://localhost:3001  
**Site Vitrine** : http://localhost:3000  
**API Backend** : http://localhost:8069/api/

**Identifiants par défaut** :
- Email : `admin@quelyos.com`
- Password : (voir `odoo-backend/addons/quelyos_api/data/default_admin_tenant.xml`)

---

## 📚 Modules OCA (Optionnels)

Les modules OCA sont **recommandés** mais **pas obligatoires**.  
Quelyos Suite fonctionne avec ses **12 modules OCA natifs fusionnés**.

### Installation modules OCA externes (si souhaité)

```bash
# Cloner repos OCA
cd odoo-backend/addons
git clone -b 19.0 https://github.com/OCA/stock-logistics-warehouse.git oca-stock

# Liens symboliques
ln -s oca-stock/stock_inventory .
ln -s oca-stock/stock_warehouse_calendar .

# Installer
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i stock_inventory,stock_warehouse_calendar \
    --stop-after-init

docker restart quelyos-odoo
```

---

## 🐛 Dépannage Rapide

### Module quelyos_installer introuvable

```bash
# Vérifier présence module
ls -la odoo-backend/addons/quelyos_installer

# Update Apps List dans Odoo
```

### Dépendances Python manquantes

```bash
# Installer manuellement
docker exec -it quelyos-odoo pip install qrcode Pillow faker
```

### Base de données vide

```bash
# Recréer base
docker exec -it quelyos-postgres dropdb -U quelyos quelyos
docker exec -it quelyos-postgres createdb -U quelyos quelyos

# Réinstaller
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i quelyos_installer \
    --stop-after-init
```

---

## 📊 Vérification Complète

```bash
# 1. Modules installés
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT COUNT(*) FROM ir_module_module WHERE state='installed';"

# 2. Tenant créé
docker exec quelyos-postgres psql -U quelyos -d quelyos -c \
  "SELECT * FROM quelyos_tenant;"

# 3. API fonctionnelle
curl http://localhost:8069/api/health

# 4. Endpoints disponibles
curl http://localhost:8069/api/products
```

---

## 📖 Documentation Complète

- **README-DEV.md** : Documentation technique détaillée
- **docs/** : Guides d'utilisation par module
- **quelyos_installer/README.md** : Détails module installer

---

## 🎉 Installation Réussie !

Si tout fonctionne, vous devriez voir :

```
✅ Modules Odoo Core installés
✅ Module quelyos_api installé
✅ Tenant par défaut créé
✅ API REST accessible
✅ Frontends démarrés
```

**Quelyos Suite est prêt à l'emploi !** 🚀

---

**Support** : https://github.com/salmenktata/quelyosSuite/issues  
**Version** : 19.0.1.0.0  
**Licence** : LGPL-3
