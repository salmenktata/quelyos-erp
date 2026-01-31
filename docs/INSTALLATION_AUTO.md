# 📦 Installation Automatique Quelyos Suite - Documentation Technique

**Date** : 2026-02-01  
**Version** : 19.0.1.0.0  
**Statut** : ✅ OPÉRATIONNEL

---

## 🎯 Objectif

Permettre l'installation de **Quelyos Suite** en 1 clic sur une instance Odoo 19 vierge avec **TOUS les prérequis** installés automatiquement.

---

## 🏗️ Architecture Module Installer

### Module `quelyos_installer`

**Rôle** : Orchestrateur d'installation automatique

**Emplacement** : `odoo-backend/addons/quelyos_installer/`

**Structure** :
```
quelyos_installer/
├── __init__.py
├── __manifest__.py (dépendances complètes)
├── hooks.py (hooks installation)
├── data/
│   └── installer_data.xml
├── security/
│   └── ir.model.access.csv
└── README.md
```

---

## 📋 Dépendances Gérées Automatiquement

### 1. Modules Odoo Core (Community)

**Installés automatiquement** via `depends` dans `__manifest__.py` :

```python
'depends': [
    # Fondations
    'base', 'mail', 'web', 'web_tour',
    
    # Métier
    'sale_management',  # Ventes
    'crm',              # CRM
    'stock',            # Stocks
    'stock_account',    # Comptabilité stocks
    'account',          # Comptabilité
    'website',          # Site web
    'website_sale',     # E-commerce
    'website_sale_delivery',  # Livraison e-commerce
    'product',          # Produits
    'delivery',         # Livraison
    'payment',          # Paiements
    'contacts',         # Contacts
    
    # OCA (si disponibles)
    'stock_inventory',
    'stock_warehouse_calendar',
    
    # Principal
    'quelyos_api',  # Backend complet Quelyos
]
```

### 2. Dépendances Python

**Auto-installées** via `pre_init_hook` :

```python
required_packages = ['qrcode', 'Pillow', 'faker']

for package in required_packages:
    if not installed:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', package
        ])
```

**Vérification** avant installation, installation seulement si manquant.

### 3. Modules OCA (Optionnels)

**Recommandés mais pas obligatoires** :
- `stock_inventory` - Inventaire avancé
- `stock_warehouse_calendar` - Calendrier entrepôt

**Si absents** : Log warning + instructions installation  
**Si présents** : Installation automatique via `depends`

---

## 🔄 Flux d'Installation

### Étape 1 : Pré-Installation (`pre_init_hook`)

```python
def pre_init_hook(cr):
    # 1. Vérifier et installer dépendances Python
    _install_python_dependencies()
    
    # 2. Vérifier modules OCA disponibles
    _check_oca_modules(cr)
```

**Actions** :
- ✅ Installation `qrcode`, `Pillow`, `faker` si manquants
- ✅ Vérification modules OCA
- ⚠️ Avertissements si modules recommandés absents

### Étape 2 : Installation Modules Odoo

**Automatique via dépendances** :
- Odoo installe `base`, `mail`, `web`, etc.
- Odoo installe `sale_management`, `stock`, `account`, etc.
- Odoo installe `quelyos_api` (backend complet)

**Durée** : 2-5 minutes selon puissance serveur

### Étape 3 : Post-Installation (`post_init_hook`)

```python
def post_init_hook(cr, registry):
    # 1. Vérifier quelyos_api installé
    # 2. Vérifier tenant par défaut créé
    # 3. Afficher résumé installation
```

**Actions** :
- ✅ Validation `quelyos_api` installé
- ✅ Vérification tenant par défaut
- ✅ Configuration paramètres système
- 📊 Affichage résumé complet

### Étape 4 : Données Initiales

**Fichier** : `data/installer_data.xml`

```xml
<record id="quelyos_suite_config" model="ir.config_parameter">
    <field name="key">quelyos.suite_installed</field>
    <field name="value">True</field>
</record>
```

**Enregistre** :
- `quelyos.suite_installed` : True
- `quelyos.suite_version` : 19.0.1.0.0
- `quelyos.suite_install_date` : timestamp

---

## 🧪 Tests Automatiques

### Vérification Post-Installation

```bash
# 1. Module installer installé
psql -U quelyos -d quelyos -c \
  "SELECT state FROM ir_module_module 
   WHERE name='quelyos_installer';"
# Attendu: installed

# 2. Module quelyos_api installé
psql -U quelyos -d quelyos -c \
  "SELECT state FROM ir_module_module 
   WHERE name='quelyos_api';"
# Attendu: installed

# 3. Tenant créé
psql -U quelyos -d quelyos -c \
  "SELECT COUNT(*) FROM quelyos_tenant;"
# Attendu: >= 1

# 4. Config enregistrée
psql -U quelyos -d quelyos -c \
  "SELECT value FROM ir_config_parameter 
   WHERE key='quelyos.suite_installed';"
# Attendu: True

# 5. API fonctionnelle
curl http://localhost:8069/api/health
# Attendu: {"status": "ok"}
```

---

## 📊 Logs Installation

### Format Logs

```
============================================================
🚀 QUELYOS SUITE - Installation Automatique
============================================================

📦 Vérification dépendances Python...
✅ Package Python 'qrcode' déjà installé
✅ Package Python 'Pillow' déjà installé
✅ Package Python 'faker' déjà installé

🔍 Vérification modules OCA...
✅ Module OCA 'stock_inventory' trouvé (état: installed)
✅ Module OCA 'stock_warehouse_calendar' trouvé (état: installed)

✅ Pré-installation terminée
============================================================

[... installation Odoo ...]

============================================================
⚙️  QUELYOS SUITE - Configuration Post-Installation
============================================================

✅ Module quelyos_api installé avec succès
✅ Tenant par défaut créé (1 tenant(s) trouvé(s))

============================================================
🎉 QUELYOS SUITE - Installation Terminée avec Succès !
============================================================

📊 Modules installés :
   - Odoo Core (base, sale, stock, account, crm, website, etc.)
   - Quelyos API (backend complet + 12 modules OCA natifs)
   - Modules OCA (si disponibles)

🔧 Configuration :
   - Tenant par défaut : Admin Tenant
   - Base de données : Configurée
   - API REST : http://localhost:8069/api/

✅ Quelyos Suite est prêt à l'emploi !
============================================================
```

---

## 🐛 Gestion Erreurs

### Erreur : Dépendance Python manquante

**Problème** : `pip install` échoue

**Solution** :
```bash
# Installation manuelle
docker exec -it quelyos-odoo pip install qrcode Pillow faker

# Réessayer installation
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i quelyos_installer \
    --stop-after-init
```

### Erreur : Module OCA manquant

**Problème** : `stock_inventory` not found

**Solution** : Modules OCA optionnels, installation continue
```
⚠️  MODULES OCA MANQUANTS (warning, pas d'erreur)
    
Installation continue avec modules OCA natifs fusionnés.
Voir instructions installation OCA dans logs.
```

### Erreur : quelyos_api non installé

**Problème** : Dépendance circulaire ou module manquant

**Solution** :
```bash
# Vérifier présence quelyos_api
ls -la odoo-backend/addons/quelyos_api

# Installer manuellement
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -i quelyos_api \
    --stop-after-init
```

---

## 🔄 Mise à Jour Module Installer

### Upgrade

```bash
# Méthode 1 : Interface Odoo
# Apps > Quelyos Suite > Upgrade

# Méthode 2 : CLI
docker exec -it quelyos-odoo odoo-bin \
    -d quelyos \
    -u quelyos_installer \
    --stop-after-init

docker restart quelyos-odoo
```

### Vérifier Version

```bash
psql -U quelyos -d quelyos -c \
  "SELECT value FROM ir_config_parameter 
   WHERE key='quelyos.suite_version';"
```

---

## 🗑️ Désinstallation

### Hook de Désinstallation

```python
def uninstall_hook(cr, registry):
    # Log warning
    # Conservation données par défaut
    # Instructions suppression manuelle
```

**Conservation par défaut** :
- Tenants (`quelyos_tenant`)
- Abonnements (`quelyos_subscription`)
- Données métier (produits, commandes)

**Suppression complète** :
```bash
# Désinstaller module
# Apps > Quelyos Suite > Uninstall

# Supprimer données manuellement
psql -U quelyos -d quelyos -c "DROP SCHEMA public CASCADE;"
psql -U quelyos -d quelyos -c "CREATE SCHEMA public;"
```

---

## 📝 Checklist Installation

- [ ] ✅ Docker/Odoo 19 démarré
- [ ] ✅ Base `quelyos` créée
- [ ] ✅ Module `quelyos_installer` dans `addons/`
- [ ] ✅ Apps > Update Apps List
- [ ] ✅ Recherche "Quelyos Suite"
- [ ] ✅ Clic "Install"
- [ ] ✅ Attente 2-5 minutes
- [ ] ✅ Vérification logs (succès)
- [ ] ✅ Test API : `curl http://localhost:8069/api/health`
- [ ] ✅ Démarrage frontends
- [ ] ✅ Connexion Dashboard : http://localhost:5175

---

## 🎯 Résumé Technique

**Module** : `quelyos_installer`  
**Type** : Application (apparaît dans Apps)  
**Auto-install** : False (manuel par admin)  
**Hooks** : pre_init, post_init, uninstall  
**Dépendances** : 15+ modules Odoo Core + quelyos_api  
**Python deps** : qrcode, Pillow, faker  
**Durée installation** : 2-5 minutes  
**Résultat** : Quelyos Suite 100% opérationnel

---

**Dernière mise à jour** : 2026-02-01  
**Responsable** : Claude Code  
**Statut** : ✅ OPÉRATIONNEL - INSTALLATION AUTOMATIQUE FONCTIONNELLE
