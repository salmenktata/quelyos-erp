#!/bin/bash

# Script de téléchargement des addons OCA Stock
# Usage: ./scripts/download-oca-stock.sh

set -e

echo "📥 Téléchargement des addons OCA Stock"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
OCA_REPO="https://github.com/OCA/stock-logistics-warehouse.git"
OCA_BRANCH="18.0"
TMP_DIR="/tmp/oca-stock-$(date +%s)"

MODULES=(
  "stock_change_qty_reason"
  "stock_inventory"
  "stock_location_lockdown"
  "stock_demand_estimate"
)

echo -e "${BLUE}Repository OCA :${NC} $OCA_REPO"
echo -e "${BLUE}Branche :${NC} $OCA_BRANCH"
echo ""

# Cloner le repository OCA
echo -e "${YELLOW}📦 Clonage du repository OCA...${NC}"
git clone --depth 1 --branch "$OCA_BRANCH" "$OCA_REPO" "$TMP_DIR"
echo -e "${GREEN}✓${NC} Repository cloné dans $TMP_DIR"
echo ""

# Copier les modules
echo -e "${YELLOW}📋 Copie des modules...${NC}"
for module in "${MODULES[@]}"; do
  if [ -d "$TMP_DIR/$module" ]; then
    # Backup si le module existe déjà
    if [ -d "odoo-backend/addons/$module" ]; then
      echo -e "${YELLOW}⚠${NC}  $module existe déjà, création backup..."
      mv "odoo-backend/addons/$module" "odoo-backend/addons/${module}.backup.$(date +%s)"
    fi

    cp -r "$TMP_DIR/$module" "odoo-backend/addons/"
    echo -e "${GREEN}✓${NC} $module copié"
  else
    echo -e "❌ $module non trouvé dans le repository OCA"
  fi
done
echo ""

# Nettoyer
echo -e "${YELLOW}🧹 Nettoyage...${NC}"
rm -rf "$TMP_DIR"
echo -e "${GREEN}✓${NC} Fichiers temporaires supprimés"
echo ""

echo -e "${GREEN}✅ Téléchargement terminé !${NC}"
echo ""
echo "Modules téléchargés :"
for module in "${MODULES[@]}"; do
  if [ -d "odoo-backend/addons/$module" ]; then
    echo "  ✓ $module"
  fi
done
echo ""
echo "📝 Prochaine étape :"
echo "   ./scripts/install-oca-stock.sh"
