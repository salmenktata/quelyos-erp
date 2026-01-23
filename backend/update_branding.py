#!/usr/bin/env python3
"""
Script pour mettre à jour le module quelyos_branding via XML-RPC
"""

import xmlrpc.client

# Configuration
url = 'http://localhost:8069'
db = 'quelyos'
username = 'admin'
password = 'admin'

print("🔄 Connexion à Odoo...")

# Connexion
common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

if not uid:
    print("❌ Échec de l'authentification")
    exit(1)

print(f"✅ Connecté en tant qu'utilisateur {uid}")

# Accès aux modèles
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

print("🔍 Recherche du module quelyos_branding...")

# Rechercher le module
module_ids = models.execute_kw(db, uid, password,
    'ir.module.module', 'search',
    [[('name', '=', 'quelyos_branding')]])

if not module_ids:
    print("❌ Module quelyos_branding non trouvé")
    exit(1)

module_id = module_ids[0]
print(f"✅ Module trouvé (ID: {module_id})")

# Lire l'état du module
module_info = models.execute_kw(db, uid, password,
    'ir.module.module', 'read',
    [module_id], {'fields': ['name', 'state']})

print(f"📦 État actuel: {module_info[0]['state']}")

# Mettre à jour le module
print("🔄 Mise à jour du module...")
try:
    models.execute_kw(db, uid, password,
        'ir.module.module', 'button_immediate_upgrade',
        [[module_id]])
    print("✅ Module mis à jour avec succès!")
    print("🎉 Les modifications CSS/JS pour masquer les modules non installables sont maintenant actives")
    print("🔄 Veuillez rafraîchir votre navigateur (Ctrl+Shift+R) pour voir les changements")
except Exception as e:
    print(f"❌ Erreur lors de la mise à jour: {e}")
    exit(1)
