#!/bin/bash

# Script de vérification automatique du dark mode
# Usage: ./scripts/check-dark-mode.sh [path]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TARGET_PATH="${1:-src/}"
ERRORS=0

echo "🔍 Vérification du dark mode dans: $TARGET_PATH"
echo "================================================"
echo ""

# 1. Vérifier les classes sans variante dark
echo "📋 1. Classes de texte sans variante dark..."
MISSING_DARK=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E 'className="[^"]*text-(gray|white|black)-[0-9]+([ "]|$)' "$TARGET_PATH" \
  | grep -v 'dark:' || true)

if [ -n "$MISSING_DARK" ]; then
  echo -e "${RED}❌ Trouvé des classes text-* sans dark:${NC}"
  echo "$MISSING_DARK" | head -n 10
  echo ""
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✓ Toutes les classes text-* ont une variante dark${NC}"
fi
echo ""

# 2. Vérifier les backgrounds sans variante dark
echo "📋 2. Classes de background sans variante dark..."
MISSING_BG_DARK=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E 'className="[^"]*bg-(gray|white|black|blue|red|green|yellow|indigo|purple|pink)-[0-9]+([ /"]|$)' "$TARGET_PATH" \
  | grep -v 'dark:' || true)

if [ -n "$MISSING_BG_DARK" ]; then
  echo -e "${RED}❌ Trouvé des classes bg-* sans dark:${NC}"
  echo "$MISSING_BG_DARK" | head -n 10
  echo ""
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✓ Toutes les classes bg-* ont une variante dark${NC}"
fi
echo ""

# 3. Vérifier les borders sans variante dark
echo "📋 3. Classes de border sans variante dark..."
MISSING_BORDER_DARK=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E 'className="[^"]*border-(gray|white|black|blue|red|green)-[0-9]+([ "]|$)' "$TARGET_PATH" \
  | grep -v 'dark:' || true)

if [ -n "$MISSING_BORDER_DARK" ]; then
  echo -e "${RED}❌ Trouvé des classes border-* sans dark:${NC}"
  echo "$MISSING_BORDER_DARK" | head -n 10
  echo ""
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✓ Toutes les classes border-* ont une variante dark${NC}"
fi
echo ""

# 4. Vérifier les font-semibold et font-bold sans couleur explicite
echo "📋 4. Textes en gras sans couleur explicite..."
BOLD_NO_COLOR=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E 'className="[^"]*font-(semibold|bold)[^"]*"[^>]*>[^<]*[A-Za-z]' "$TARGET_PATH" \
  | grep -v 'text-' || true)

if [ -n "$BOLD_NO_COLOR" ]; then
  echo -e "${YELLOW}⚠️  Trouvé des textes en gras sans couleur explicite${NC}"
  echo "$BOLD_NO_COLOR" | head -n 5
  echo ""
else
  echo -e "${GREEN}✓ Tous les textes en gras ont une couleur${NC}"
fi
echo ""

# 5. Vérifier les <h1>, <h2>, <h3> sans classes de couleur
echo "📋 5. Titres sans classes de couleur..."
HEADINGS_NO_COLOR=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E '<h[1-6][^>]*className="[^"]*"[^>]*>' "$TARGET_PATH" \
  | grep -v 'text-' || true)

if [ -n "$HEADINGS_NO_COLOR" ]; then
  echo -e "${YELLOW}⚠️  Trouvé des titres sans couleur explicite${NC}"
  echo "$HEADINGS_NO_COLOR" | head -n 5
  echo ""
else
  echo -e "${GREEN}✓ Tous les titres ont une couleur${NC}"
fi
echo ""

# 6. Vérifier divide-y sans variante dark
echo "📋 6. Classes divide sans variante dark..."
MISSING_DIVIDE_DARK=$(grep -rn --include="*.tsx" --include="*.jsx" \
  -E 'className="[^"]*divide-y[^"]*"' "$TARGET_PATH" \
  | grep -v 'dark:divide' || true)

if [ -n "$MISSING_DIVIDE_DARK" ]; then
  echo -e "${RED}❌ Trouvé des classes divide-y sans dark:divide${NC}"
  echo "$MISSING_DIVIDE_DARK" | head -n 5
  echo ""
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✓ Toutes les classes divide-y ont une variante dark${NC}"
fi
echo ""

# Résumé
echo "================================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Tous les tests sont passés !${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS erreurs critiques trouvées${NC}"
  echo ""
  echo "💡 Pour corriger automatiquement :"
  echo "   - Ajouter dark:text-white après chaque text-gray-900"
  echo "   - Ajouter dark:text-gray-400 après chaque text-gray-600"
  echo "   - Ajouter dark:border-gray-700 après chaque border-gray-200"
  echo "   - Ajouter dark:bg-gray-800 après chaque bg-white"
  exit 1
fi
