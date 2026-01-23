#!/bin/bash
# Script pour vérifier si quelyos_ecommerce est installé dans Odoo

ODOO_URL="http://localhost:8069"
DB="quelyos"
USER="admin"
PASS="admin"

echo "=== Vérification statut module quelyos_ecommerce ==="
echo ""

# Authentification
AUTH_RESPONSE=$(curl -s -X POST \
  "${ODOO_URL}/web/session/authenticate" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"params\": {
      \"db\": \"${DB}\",
      \"login\": \"${USER}\",
      \"password\": \"${PASS}\"
    }
  }" \
  -c /tmp/odoo_cookies.txt)

if ! echo "$AUTH_RESPONSE" | grep -q "\"uid\""; then
  echo "❌ Échec authentification"
  exit 1
fi

echo "✓ Authentifié"

# Vérifier statut du module
MODULE_STATUS=$(curl -s -X POST \
  "${ODOO_URL}/web/dataset/call_kw" \
  -H "Content-Type: application/json" \
  -b /tmp/odoo_cookies.txt \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "model": "ir.module.module",
      "method": "search_read",
      "args": [[["name", "=", "quelyos_ecommerce"]]],
      "kwargs": {
        "fields": ["name", "state", "installed_version", "shortdesc"]
      }
    },
    "id": 1
  }')

echo ""

if echo "$MODULE_STATUS" | grep -q '"state": "installed"'; then
  echo "✅ Module quelyos_ecommerce est INSTALLÉ"

  # Extraire infos
  VERSION=$(echo "$MODULE_STATUS" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    result = data.get('result', [])
    if result:
        print(result[0].get('installed_version', 'N/A'))
except:
    print('N/A')
" 2>/dev/null)

  echo "  Version: $VERSION"
  echo ""
  echo "Les APIs devraient être disponibles :"
  echo "  - GET /api/ecommerce/products"
  echo "  - GET /api/ecommerce/cart"
  echo "  - GET /api/ecommerce/categories"
  echo ""
  echo "Vous pouvez maintenant tester avec: ./test_api_simple.sh"

elif echo "$MODULE_STATUS" | grep -q '"state": "uninstalled"'; then
  echo "⚠️  Module quelyos_ecommerce est DÉTECTÉ mais NON INSTALLÉ"
  echo ""
  echo "📋 Pour installer:"
  echo "  1. Ouvrir http://localhost:8069/odoo?debug=1"
  echo "  2. Aller dans Apps"
  echo "  3. Update Apps List (bouton rafraîchir)"
  echo "  4. Rechercher 'quelyos_ecommerce'"
  echo "  5. Cliquer sur Install"

elif echo "$MODULE_STATUS" | grep -q '"state": "to upgrade"'; then
  echo "⚠️  Module quelyos_ecommerce nécessite une MISE À JOUR"
  echo ""
  echo "📋 Pour mettre à jour:"
  echo "  1. Ouvrir http://localhost:8069/odoo?debug=1"
  echo "  2. Aller dans Apps"
  echo "  3. Rechercher 'quelyos_ecommerce'"
  echo "  4. Cliquer sur Upgrade"

elif echo "$MODULE_STATUS" | grep -q '"result": \[\]'; then
  echo "❌ Module quelyos_ecommerce NON DÉTECTÉ par Odoo"
  echo ""
  echo "🔧 Actions à faire:"
  echo "  1. Vérifier que le module existe: ls -la addons/quelyos_ecommerce/"
  echo "  2. Redémarrer Odoo: docker-compose restart odoo"
  echo "  3. Dans Odoo: Apps → Update Apps List"

else
  echo "❓ État du module inconnu"
  echo "$MODULE_STATUS" | python3 -m json.tool 2>/dev/null || echo "$MODULE_STATUS"
fi

rm -f /tmp/odoo_cookies.txt
echo ""
