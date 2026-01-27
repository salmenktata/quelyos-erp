# Intégration Modules OCA dans Quelyos API

## Stratégie d'Installation

Les modules OCA (Odoo Community Association) sont intégrés dans Quelyos Suite pour enrichir les fonctionnalités Stock sans modifier le core Odoo.

### Approche "Auto-Install"

Les modules OCA sont installés automatiquement lors du premier démarrage de Quelyos Suite via un hook post-installation.

## Modules OCA Intégrés

### Stock Management
- `stock_change_qty_reason` : Ajustements stock avec raisons
- `stock_inventory` : Gestion inventaire améliorée (OCA)
- `stock_location_lockdown` : Verrouillage emplacements pendant inventaire
- `stock_demand_estimate` : Estimation demande future

## Installation Fresh Install

### Automatique (Recommandé)

Lors d'un fresh install de Quelyos Suite, les modules OCA sont automatiquement :

1. **Copiés** depuis le repository OCA vers `odoo-backend/addons/`
2. **Installés** lors du premier démarrage d'Odoo
3. **Configurés** avec les paramètres par défaut

```bash
# Fresh install Quelyos Suite
git clone https://github.com/salmenktata/quelyosSuite.git
cd quelyosSuite

# Les modules OCA sont déjà présents dans odoo-backend/addons/
# Démarrer Odoo
cd odoo-backend && docker-compose up -d

# Les modules OCA s'installent automatiquement
```

### Manuelle (Optionnelle)

Si vous préférez installer manuellement :

```bash
# Télécharger les modules
./scripts/download-oca-stock.sh

# Installer dans Odoo
./scripts/install-oca-stock.sh
```

## Configuration

### Activer/Désactiver Modules OCA

Fichier de configuration : `odoo-backend/config/oca.conf`

```ini
[oca]
# Auto-install OCA modules on first run
auto_install = true

# Modules OCA à installer automatiquement
stock_modules = stock_change_qty_reason,stock_inventory,stock_location_lockdown,stock_demand_estimate
```

### Désactiver Auto-Install

Pour un fresh install **SANS** modules OCA :

```bash
# Créer fichier de config
echo "[oca]
auto_install = false" > odoo-backend/config/oca.conf

# Puis démarrer normalement
cd odoo-backend && docker-compose up -d
```

## Dépendances dans __manifest__.py

Les modules OCA ne sont **PAS** listés dans `depends` de `quelyos_api/__manifest__.py` car :

1. ✅ **Optionnels** : Quelyos fonctionne sans eux (dégradation gracieuse)
2. ✅ **Auto-détection** : Le code vérifie dynamiquement si modules installés
3. ✅ **Pas de breaking** : Si module OCA absent, fonctionnalités désactivées proprement

### Vérification Dynamique

```python
# Exemple dans stock_oca.py
if not request.env['ir.module.module'].sudo().search([
    ('name', '=', 'stock_change_qty_reason'),
    ('state', '=', 'installed')
]):
    return {
        'success': False,
        'error': 'Module OCA non installé',
        'error_code': 'MODULE_NOT_INSTALLED'
    }
```

## Architecture

```
quelyosSuite/
├── odoo-backend/
│   ├── addons/
│   │   ├── quelyos_api/              # Module principal Quelyos
│   │   ├── stock_change_qty_reason/   # Module OCA (auto-copié)
│   │   ├── stock_inventory/           # Module OCA (auto-copié)
│   │   ├── stock_location_lockdown/   # Module OCA (auto-copié)
│   │   └── stock_demand_estimate/     # Module OCA (auto-copié)
│   ├── config/
│   │   └── oca.conf                   # Config OCA (optionnel)
│   └── docker-compose.yml
├── scripts/
│   ├── download-oca-stock.sh          # Télécharge modules OCA
│   ├── install-oca-stock.sh           # Installe modules OCA
│   └── fresh-install.sh               # Install complète auto
└── docs/
    └── OCA_INTEGRATION.md             # Doc complète
```

## Fresh Install Script

Pour un fresh install one-click avec modules OCA :

```bash
# Utiliser le script fresh-install.sh
./scripts/fresh-install.sh

# Ce script :
# 1. Clone Quelyos Suite
# 2. Copie modules OCA
# 3. Démarre Odoo avec Docker
# 4. Installe quelyos_api + modules OCA
# 5. Configure données de démo
```

## Mise à Jour Modules OCA

Pour mettre à jour les modules OCA vers une version plus récente :

```bash
# Re-télécharger depuis OCA
./scripts/download-oca-stock.sh

# Upgrade dans Odoo
cd odoo-backend
docker-compose exec odoo odoo-bin -c /etc/odoo/odoo.conf \
  -d odoo_db \
  -u stock_change_qty_reason,stock_inventory,stock_location_lockdown,stock_demand_estimate \
  --stop-after-init

docker-compose restart
```

## Contributions OCA

Si vous améliorez un module OCA, pensez à contribuer upstream :

1. Fork du repository OCA concerné
2. Appliquez vos modifications
3. Pull Request vers OCA
4. Intégration dans Quelyos Suite après merge OCA

Voir : https://odoo-community.org/page/Contribute

## Troubleshooting

### Modules OCA non installés automatiquement

```bash
# Vérifier config
cat odoo-backend/config/oca.conf

# Forcer installation manuelle
./scripts/install-oca-stock.sh
```

### Conflits de Version

Si modules OCA incompatibles avec Odoo 19 :

1. Vérifier versions disponibles sur GitHub OCA
2. Tester version 18.0 (souvent compatible)
3. Contribuer adaptation Odoo 19 à OCA

## Support

- **Issues GitHub** : https://github.com/salmenktata/quelyosSuite/issues/52
- **Documentation** : `docs/OCA_INTEGRATION.md`
- **OCA Support** : https://odoo-community.org
