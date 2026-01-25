#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour forcer la création des tenants via XML-RPC Odoo
En mode upgrade, force le reload des données XML
"""

import xmlrpc.client
import sys

# Configuration Odoo
ODOO_URL = "http://localhost:8069"
ODOO_DB = "quelyos"
ODOO_USERNAME = "admin"
ODOO_PASSWORD = "admin"  # À modifier si différent

def upgrade_module():
    """Upgrade le module quelyos_api via XML-RPC"""

    print("🔄 Upgrade du module quelyos_api via XML-RPC...")
    print("")

    # Connexion
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')

    try:
        uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
        if not uid:
            print("❌ Erreur: Authentification échouée")
            print("   Vérifiez ODOO_USERNAME et ODOO_PASSWORD")
            return False
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

    print(f"✅ Authentifié (user_id: {uid})")
    print("")

    # API Models
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')

    try:
        # Trouver le module
        module_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'ir.module.module', 'search',
            [[('name', '=', 'quelyos_api')]]
        )

        if not module_ids:
            print("❌ Module quelyos_api non trouvé")
            return False

        module_id = module_ids[0]

        # Lire l'état actuel
        module = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'ir.module.module', 'read',
            [module_id],
            {'fields': ['name', 'state', 'installed_version']}
        )[0]

        print(f"📦 Module trouvé:")
        print(f"   Nom: {module['name']}")
        print(f"   État: {module['state']}")
        print(f"   Version: {module.get('installed_version', 'N/A')}")
        print("")

        # Bouton Upgrade
        print("🚀 Lancement de l'upgrade...")

        result = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'ir.module.module', 'button_immediate_upgrade',
            [[module_id]]
        )

        print("✅ Upgrade lancé avec succès !")
        print("")
        print("⏳ L'upgrade peut prendre quelques secondes...")
        print("   Odoo va redémarrer automatiquement")
        print("")

        # Attendre un peu
        import time
        time.sleep(3)

        # Vérifier le résultat
        try:
            module_after = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'ir.module.module', 'read',
                [module_id],
                {'fields': ['name', 'state', 'installed_version']}
            )[0]

            print("📊 État après upgrade:")
            print(f"   État: {module_after['state']}")
            print(f"   Version: {module_after.get('installed_version', 'N/A')}")
        except:
            print("⚠️  Odoo redémarre, impossible de vérifier l'état")

        print("")
        print("🎉 Upgrade terminé !")
        print("")
        print("🌐 Testez les tenants:")
        print("   - Boutique Sport: http://localhost:3000?tenant=sport")
        print("   - Marque Mode: http://localhost:3000?tenant=mode")
        print("")
        print("💡 Vérifiez dans Odoo:")
        print("   Menu → Quelyos → Tenants / Boutiques")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de l'upgrade: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = upgrade_module()
    sys.exit(0 if success else 1)
