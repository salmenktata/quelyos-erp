#!/bin/bash

# Script pour installer le module quelyos_ecommerce dans Odoo

echo "🔧 Installation du module Quelyos E-commerce..."
echo ""

# Variables
ODOO_URL="http://localhost:8069"
DB_NAME="quelyos"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="admin"

echo "📋 Étapes d'installation:"
echo "1. Ouvrez votre navigateur"
echo "2. Allez sur: ${ODOO_URL}"
echo "3. Connectez-vous avec:"
echo "   - Email: ${ADMIN_LOGIN}"
echo "   - Password: ${ADMIN_PASSWORD}"
echo "4. Cliquez sur l'icône Apps (grille en haut à droite)"
echo "5. Cliquez sur 'Update Apps List' dans le menu déroulant"
echo "6. Attendez la fin de la mise à jour"
echo "7. Dans la barre de recherche, tapez: quelyos"
echo "8. Vous devriez voir 'Quelyos E-commerce'"
echo "9. Cliquez sur 'Install' ou 'Activer'"
echo "10. Attendez la fin de l'installation (peut prendre 30s-1min)"
echo ""
echo "✅ Une fois installé, le module créera automatiquement:"
echo "   - Les routes API: /api/ecommerce/*"
echo "   - Les menus dans Odoo"
echo "   - Les données de configuration"
echo ""
echo "🔍 Pour vérifier que ça fonctionne:"
echo "   curl http://localhost:8069/api/ecommerce/products"
echo ""
echo "📱 Le frontend affichera alors vos produits sur:"
echo "   http://localhost:3000"
echo ""
