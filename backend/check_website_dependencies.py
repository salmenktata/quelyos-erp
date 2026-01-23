#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour vérifier les dépendances du module website dans Odoo
et aider à le désinstaller
"""

import odoorpc

# Configuration
ODOO_HOST = 'localhost'
ODOO_PORT = 8069
ODOO_DB = 'quelyos'
ODOO_USER = 'admin'
ODOO_PASSWORD = 'admin'  # Modifier si nécessaire

def check_website_module():
    """Vérifie le module website et ses dépendances"""

    try:
        # Connexion à Odoo
        print("🔌 Connexion à Odoo...")
        odoo = odoorpc.ODOO(ODOO_HOST, port=ODOO_PORT)
        odoo.login(ODOO_DB, ODOO_USER, ODOO_PASSWORD)
        print("✅ Connecté avec succès\n")

        # Récupérer le module website
        Module = odoo.env['ir.module.module']
        website = Module.search_read(
            [('name', '=', 'website')],
            ['name', 'state', 'shortdesc', 'summary']
        )

        if not website:
            print("❌ Module 'website' non trouvé")
            return

        website = website[0]
        print("=== MODULE WEBSITE ===")
        print(f"Nom: {website['name']}")
        print(f"État: {website['state']}")
        print(f"Description: {website['shortdesc']}")
        print()

        # Trouver les modules qui dépendent de website
        print("=== MODULES INSTALLÉS QUI DÉPENDENT DE 'WEBSITE' ===")

        # Rechercher via les dépendances
        Dependency = odoo.env['ir.module.module.dependency']
        deps = Dependency.search_read(
            [('name', '=', 'website')],
            ['module_id']
        )

        dependent_module_ids = [d['module_id'][0] for d in deps if d.get('module_id')]

        if dependent_module_ids:
            dependent_modules = Module.search_read(
                [
                    ('id', 'in', dependent_module_ids),
                    ('state', 'in', ['installed', 'to upgrade'])
                ],
                ['name', 'shortdesc', 'state']
            )

            if dependent_modules:
                print(f"⚠️  {len(dependent_modules)} module(s) installé(s) dépendent de 'website':\n")
                for mod in dependent_modules:
                    print(f"  • {mod['name']}")
                    print(f"    └─ {mod['shortdesc']}")
                    print(f"    └─ État: {mod['state']}\n")

                print("\n⚠️  IMPORTANT:")
                print("Vous devez d'abord désinstaller ces modules avant de désinstaller 'website'\n")

                print("📋 COMMANDES POUR DÉSINSTALLER:")
                print("\nOption 1 - Via l'interface Odoo:")
                print("  1. Allez dans Apps")
                print("  2. Désinstallez chaque module listé ci-dessus")
                print("  3. Puis désinstallez 'Site Web'\n")

                print("Option 2 - Via la ligne de commande:")
                module_names = ','.join([m['name'] for m in dependent_modules])
                print(f"  docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo \\")
                print(f"    --db_password=odoo --uninstall {module_names},website --stop-after-init\n")

            else:
                print("✅ Aucun module installé ne dépend de 'website'")
                print("\n📋 VOUS POUVEZ DÉSINSTALLER 'WEBSITE':")
                print("\nOption 1 - Via l'interface:")
                print("  Apps → Rechercher 'Site Web' → Désinstaller")
                print("\nOption 2 - Via commande:")
                print("  docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo \\")
                print("    --db_password=odoo --uninstall website --stop-after-init")
        else:
            print("✅ Aucune dépendance trouvée")

    except Exception as e:
        print(f"❌ Erreur: {e}")
        print("\n💡 SOLUTION ALTERNATIVE:")
        print("Vérifiez manuellement dans Odoo:")
        print("  1. Apps → Site Web → Informations")
        print("  2. Notez les modules qui apparaissent en dépendance")
        print("  3. Désinstallez-les d'abord")

if __name__ == '__main__':
    check_website_module()
