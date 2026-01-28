#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour installer le module quelyos_sms_tn via XML-RPC Odoo
"""

import xmlrpc.client
import sys
import time

# Configuration Odoo
ODOO_URL = "http://localhost:8069"
ODOO_DB = "quelyos"
ODOO_USERNAME = "admin"
ODOO_PASSWORD = "admin"

def install_module():
    """Installer le module quelyos_sms_tn via XML-RPC"""

    print("📦 Installation du module quelyos_sms_tn via XML-RPC...")
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
            [[('name', '=', 'quelyos_sms_tn')]]
        )

        if not module_ids:
            print("❌ Module quelyos_sms_tn non trouvé dans le chemin addons")
            print("   Vérifiez que le dossier odoo-backend/addons/quelyos_sms_tn existe")
            return False

        module_id = module_ids[0]

        # Lire l'état actuel
        module = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'ir.module.module', 'read',
            [module_id],
            {'fields': ['name', 'state', 'installed_version', 'latest_version']}
        )[0]

        print(f"📦 Module trouvé:")
        print(f"   Nom: {module['name']}")
        print(f"   État: {module['state']}")
        print(f"   Version disponible: {module.get('latest_version', 'N/A')}")
        print("")

        if module['state'] == 'installed':
            print("✅ Module déjà installé !")
            print(f"   Version installée: {module.get('installed_version', 'N/A')}")
            return True

        if module['state'] not in ['uninstalled', 'to install']:
            print(f"⚠️  État du module: {module['state']}")
            print("   Veuillez vérifier l'état manuellement dans Odoo")
            return False

        # Bouton Install
        print("🚀 Lancement de l'installation...")

        result = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'ir.module.module', 'button_immediate_install',
            [[module_id]]
        )

        print("✅ Installation lancée avec succès !")
        print("")
        print("⏳ L'installation peut prendre quelques secondes...")
        print("   Odoo va redémarrer automatiquement")
        print("")

        # Attendre un peu
        time.sleep(5)

        # Vérifier le résultat
        try:
            module_after = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'ir.module.module', 'read',
                [module_id],
                {'fields': ['name', 'state', 'installed_version']}
            )[0]

            print("📊 État après installation:")
            print(f"   État: {module_after['state']}")
            print(f"   Version: {module_after.get('installed_version', 'N/A')}")
            print("")

            if module_after['state'] == 'installed':
                print("🎉 Module quelyos_sms_tn installé avec succès !")
            else:
                print("⚠️  Installation en cours ou erreur")

        except:
            print("⚠️  Odoo redémarre, impossible de vérifier l'état")

        print("")
        print("💡 Configuration requise:")
        print("   1. Aller sur http://localhost:5175/store/settings/notifications")
        print("   2. Configurer API Key Tunisie SMS")
        print("   3. Configurer Sender Name (max 11 caractères)")
        print("   4. Activer les notifications SMS désirées")
        print("")
        print("📚 Documentation:")
        print("   odoo-backend/addons/quelyos_sms_tn/README.md")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de l'installation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = install_module()
    sys.exit(0 if success else 1)
