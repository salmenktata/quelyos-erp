# -*- coding: utf-8 -*-
"""
Hooks d'installation Quelyos Suite
Gère l'installation automatique de tous les prérequis
"""

import logging
import subprocess
import sys

_logger = logging.getLogger(__name__)


def _install_python_dependencies():
    """Installe les dépendances Python si manquantes"""
    required_packages = ['qrcode', 'Pillow', 'faker']
    
    for package in required_packages:
        try:
            __import__(package.lower())
            _logger.info(f"✅ Package Python '{package}' déjà installé")
        except ImportError:
            _logger.warning(f"⚠️  Package Python '{package}' manquant, installation...")
            try:
                subprocess.check_call([
                    sys.executable, '-m', 'pip', 'install', package
                ])
                _logger.info(f"✅ Package Python '{package}' installé avec succès")
            except subprocess.CalledProcessError as e:
                _logger.error(f"❌ Échec installation '{package}': {e}")
                raise


def _check_oca_modules(cr):
    """Vérifie si les modules OCA sont disponibles"""
    cr.execute("""
        SELECT name, state 
        FROM ir_module_module 
        WHERE name IN ('stock_inventory', 'stock_warehouse_calendar')
    """)
    
    oca_modules = cr.fetchall()
    
    if not oca_modules:
        _logger.warning("""
⚠️  MODULES OCA MANQUANTS
        
Les modules OCA suivants sont recommandés mais pas installés :
- stock_inventory (Inventaire avancé)
- stock_warehouse_calendar (Calendrier entrepôt)

Pour les installer :
1. cd odoo-backend/addons
2. git clone -b 19.0 https://github.com/OCA/stock-logistics-warehouse.git oca-stock
3. ln -s oca-stock/stock_inventory .
4. ln -s oca-stock/stock_warehouse_calendar .
5. Redémarrer Odoo

ℹ️  Quelyos Suite fonctionnera quand même sans ces modules (fonctionnalités réduites).
        """)
    else:
        for name, state in oca_modules:
            _logger.info(f"✅ Module OCA '{name}' trouvé (état: {state})")


def pre_init_hook(cr):
    """
    Hook exécuté AVANT l'installation du module
    Vérifie et installe les prérequis
    """
    _logger.info("=" * 80)
    _logger.info("🚀 QUELYOS SUITE - Installation Automatique")
    _logger.info("=" * 80)
    
    # 1. Installer dépendances Python
    _logger.info("\n📦 Vérification dépendances Python...")
    try:
        _install_python_dependencies()
    except Exception as e:
        _logger.error(f"❌ Erreur installation dépendances Python: {e}")
        # Ne pas bloquer l'installation, juste avertir
    
    # 2. Vérifier modules OCA
    _logger.info("\n🔍 Vérification modules OCA...")
    _check_oca_modules(cr)
    
    _logger.info("\n✅ Pré-installation terminée")
    _logger.info("=" * 80)


def post_init_hook(cr, registry):
    """
    Hook exécuté APRÈS l'installation du module
    Configure l'environnement Quelyos
    """
    _logger.info("=" * 80)
    _logger.info("⚙️  QUELYOS SUITE - Configuration Post-Installation")
    _logger.info("=" * 80)
    
    # 1. Vérifier que quelyos_api est bien installé
    cr.execute("""
        SELECT state FROM ir_module_module 
        WHERE name = 'quelyos_api'
    """)
    
    result = cr.fetchone()
    if result and result[0] == 'installed':
        _logger.info("✅ Module quelyos_api installé avec succès")
    else:
        _logger.error("❌ Module quelyos_api PAS installé correctement !")
        return
    
    # 2. Vérifier tenant par défaut
    cr.execute("""
        SELECT COUNT(*) FROM quelyos_tenant 
        WHERE name = 'Admin Tenant'
    """)
    
    tenant_count = cr.fetchone()[0]
    if tenant_count > 0:
        _logger.info(f"✅ Tenant par défaut créé ({tenant_count} tenant(s) trouvé(s))")
    else:
        _logger.warning("⚠️  Aucun tenant trouvé, vérifier data/default_admin_tenant.xml")
    
    # 3. Afficher résumé installation
    _logger.info("\n" + "=" * 80)
    _logger.info("🎉 QUELYOS SUITE - Installation Terminée avec Succès !")
    _logger.info("=" * 80)
    _logger.info("""
📊 Modules installés :
   - Odoo Core (base, sale, stock, account, crm, website, etc.)
   - Quelyos API (backend complet + 12 modules OCA natifs)
   - Modules OCA (si disponibles)

🔧 Configuration :
   - Tenant par défaut : Admin Tenant
   - Base de données : Configurée
   - API REST : http://localhost:8069/api/

📚 Prochaines étapes :
   1. Démarrer les frontends :
      - Dashboard (ERP): cd dashboard-client && npm run dev (port 5175)
      - E-commerce: cd vitrine-client && npm run dev (port 3001)
      - Vitrine: cd vitrine-quelyos && npm run dev (port 3000)
   
   2. Se connecter :
      - URL: http://localhost:5175
      - Email: admin@quelyos.com
      - Password: (voir configuration)

🌐 Documentation :
   - README-DEV.md : Documentation technique complète
   - docs/ : Guides d'utilisation

✅ Quelyos Suite est prêt à l'emploi !
    """)
    _logger.info("=" * 80)


def uninstall_hook(cr, registry):
    """
    Hook exécuté lors de la désinstallation
    Nettoie les données Quelyos si demandé
    """
    _logger.info("=" * 80)
    _logger.info("🗑️  QUELYOS SUITE - Désinstallation")
    _logger.info("=" * 80)
    
    _logger.warning("""
⚠️  ATTENTION : Désinstallation de Quelyos Suite

Les données suivantes seront conservées :
- Tenants (quelyos_tenant)
- Abonnements (quelyos_subscription)
- Données métier (produits, commandes, etc.)

Pour supprimer complètement les données Quelyos :
1. Aller dans Settings > Technical > Database Structure > Models
2. Rechercher "quelyos"
3. Supprimer manuellement les modèles si nécessaire

ℹ️  Les modules Odoo Core (sale, stock, etc.) restent installés.
    """)
    
    _logger.info("=" * 80)
    _logger.info("✅ Désinstallation terminée")
    _logger.info("=" * 80)
