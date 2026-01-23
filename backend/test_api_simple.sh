#!/bin/bash
# Script de test simple des APIs E-commerce avec curl

echo "============================================================"
echo "Test de validation format APIs E-commerce Quelyos"
echo "============================================================"

ODOO_URL="http://localhost:8069"
DB="quelyos"
USER="admin"
PASS="admin"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=== Authentification ==="
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

if echo "$AUTH_RESPONSE" | grep -q "\"uid\""; then
  echo -e "${GREEN}✓${NC} Authentification réussie"
else
  echo -e "${RED}✗${NC} Échec authentification"
  echo "$AUTH_RESPONSE"
  exit 1
fi

echo ""
echo "=== Test API GET /api/ecommerce/products ==="
PRODUCTS_RESPONSE=$(curl -s -X POST \
  "${ODOO_URL}/api/ecommerce/products" \
  -H "Content-Type: application/json" \
  -b /tmp/odoo_cookies.txt \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "limit": 3
    },
    "id": 1
  }')

echo "$PRODUCTS_RESPONSE" > /tmp/products_response.json

if echo "$PRODUCTS_RESPONSE" | grep -q "\"success\".*true"; then
  echo -e "${GREEN}✓${NC} API répond avec succès"

  # Vérifier présence des facets
  if echo "$PRODUCTS_RESPONSE" | grep -q "\"facets\""; then
    echo -e "${GREEN}✓${NC} Facets présents dans la réponse"
  else
    echo -e "${RED}✗${NC} Facets manquants"
  fi

  # Vérifier structure currency
  if echo "$PRODUCTS_RESPONSE" | grep -q "\"currency\".*\"code\""; then
    echo -e "${GREEN}✓${NC} Currency structure OK (code présent)"
  else
    echo -e "${RED}✗${NC} Currency structure invalide"
  fi

  # Vérifier is_main dans images
  if echo "$PRODUCTS_RESPONSE" | grep -q "\"is_main\""; then
    echo -e "${GREEN}✓${NC} Images structure OK (is_main présent)"
  else
    echo -e "${YELLOW}⚠${NC}  Images structure: is_main manquant (peut être normal si aucun produit)"
  fi

  # Afficher un produit exemple
  FIRST_PRODUCT=$(echo "$PRODUCTS_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    products = data.get('result', {}).get('products', [])
    if products:
        p = products[0]
        print(f\"  Exemple: {p.get('name', 'N/A')}\")
        print(f\"  - Slug: {p.get('slug', 'N/A')}\")
        print(f\"  - Prix: {p.get('list_price', 'N/A')} {p.get('currency', {}).get('code', 'N/A')}\")
        print(f\"  - Images: {len(p.get('images', []))} image(s)\")
        print(f\"  - Featured: {p.get('is_featured', False)}\")
    else:
        print('  Aucun produit trouvé')
except Exception as e:
    print(f'  Erreur parsing: {e}')
" 2>/dev/null || echo "  (Détails non disponibles - python3 requis)")
  echo "$FIRST_PRODUCT"

else
  echo -e "${RED}✗${NC} API retourne une erreur"
  echo "$PRODUCTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PRODUCTS_RESPONSE"
fi

echo ""
echo "=== Test API GET /api/ecommerce/cart ==="
CART_RESPONSE=$(curl -s -X POST \
  "${ODOO_URL}/api/ecommerce/cart" \
  -H "Content-Type: application/json" \
  -b /tmp/odoo_cookies.txt \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {},
    "id": 2
  }')

echo "$CART_RESPONSE" > /tmp/cart_response.json

if echo "$CART_RESPONSE" | grep -q "\"success\".*true"; then
  echo -e "${GREEN}✓${NC} API répond avec succès"

  # Vérifier si panier vide ou avec produits
  if echo "$CART_RESPONSE" | grep -q "\"cart\".*null"; then
    echo -e "${YELLOW}⚠${NC}  Panier vide (normal si aucun produit ajouté)"
  else
    echo -e "${GREEN}✓${NC} Panier contient des données"

    # Vérifier nested product dans lines
    if echo "$CART_RESPONSE" | grep -q "\"lines\".*\"product\""; then
      echo -e "${GREEN}✓${NC} CartLines structure OK (nested product présent)"
    else
      echo -e "${YELLOW}⚠${NC}  CartLines: nested product structure à vérifier"
    fi
  fi

else
  echo -e "${RED}✗${NC} API retourne une erreur"
  echo "$CART_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CART_RESPONSE"
fi

echo ""
echo "=== Test API GET /api/ecommerce/categories ==="
CATEGORIES_RESPONSE=$(curl -s -X POST \
  "${ODOO_URL}/api/ecommerce/categories" \
  -H "Content-Type: application/json" \
  -b /tmp/odoo_cookies.txt \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {},
    "id": 3
  }')

if echo "$CATEGORIES_RESPONSE" | grep -q "\"success\".*true"; then
  echo -e "${GREEN}✓${NC} API Catégories répond avec succès"

  # Compter les catégories
  CAT_COUNT=$(echo "$CATEGORIES_RESPONSE" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    categories = data.get('result', {}).get('categories', [])
    print(f'{len(categories)} catégorie(s) disponible(s)')
except:
    print('(Détails non disponibles)')
" 2>/dev/null || echo "(python3 requis pour détails)")
  echo "  $CAT_COUNT"

else
  echo -e "${RED}✗${NC} API Catégories retourne une erreur"
fi

# Nettoyage
rm -f /tmp/odoo_cookies.txt

echo ""
echo "============================================================"
echo "RÉSUMÉ"
echo "============================================================"
echo "Vérifiez les ✓ et ✗ ci-dessus."
echo ""
echo "Fichiers de réponse sauvegardés:"
echo "  - /tmp/products_response.json"
echo "  - /tmp/cart_response.json"
echo ""
echo "Pour voir les réponses complètes:"
echo "  cat /tmp/products_response.json | python3 -m json.tool"
echo "  cat /tmp/cart_response.json | python3 -m json.tool"
