#!/bin/bash

# Script d'installation des addons OCA Stock
# Usage: ./scripts/install-oca-stock.sh

set -e

echo "🎁 Installation des addons OCA Stock dans Quelyos Suite"
echo "=========================================================="
echo ""

# Couleurs pour output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Modules à installer
MODULES=(
  "stock_change_qty_reason"
  "stock_inventory"
  "stock_location_lockdown"
  "stock_demand_estimate"
)

echo -e "${BLUE}Modules OCA à installer :${NC}"
for module in "${MODULES[@]}"; do
  echo "  - $module"
done
echo ""

# Vérifier que les modules sont présents
echo -e "${YELLOW}📋 Vérification présence des modules...${NC}"
for module in "${MODULES[@]}"; do
  if [ ! -d "odoo-backend/addons/$module" ]; then
    echo -e "❌ Module $module non trouvé dans odoo-backend/addons/"
    echo "   Exécutez d'abord : ./scripts/download-oca-stock.sh"
    exit 1
  fi
  echo -e "${GREEN}✓${NC} $module trouvé"
done
echo ""

# Vérifier que Docker Compose est lancé
echo -e "${YELLOW}🐳 Vérification Docker Compose...${NC}"
if ! docker-compose -f odoo-backend/docker-compose.yml ps | grep -q "odoo"; then
  echo -e "❌ Odoo n'est pas démarré"
  echo "   Démarrez Odoo avec : cd odoo-backend && docker-compose up -d"
  exit 1
fi
echo -e "${GREEN}✓${NC} Odoo est démarré"
echo ""

# Installer les modules un par un
echo -e "${BLUE}📦 Installation des modules dans Odoo...${NC}"
for module in "${MODULES[@]}"; do
  echo ""
  echo -e "${YELLOW}Installation de $module...${NC}"

  # Installer le module via Odoo CLI
  docker-compose -f odoo-backend/docker-compose.yml exec -T odoo \
    odoo-bin -c /etc/odoo/odoo.conf \
    -d odoo_db \
    -i "$module" \
    --stop-after-init \
    --log-level=warn

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $module installé avec succès"
  else
    echo -e "❌ Erreur lors de l'installation de $module"
    exit 1
  fi
done

echo ""
echo -e "${BLUE}🔄 Redémarrage d'Odoo...${NC}"
docker-compose -f odoo-backend/docker-compose.yml restart odoo

echo ""
echo -e "${GREEN}✅ Installation des addons OCA Stock terminée !${NC}"
echo ""
echo "Modules installés :"
for module in "${MODULES[@]}"; do
  echo "  ✓ $module"
done
echo ""
echo "📝 Prochaines étapes :"
echo "  1. Vérifier les modules dans Odoo : http://localhost:8069"
echo "     (Apps > Installed > rechercher les modules)"
echo "  2. Créer les UIs Quelyos dans dashboard-client/"
echo "  3. Créer les endpoints API dans quelyos_api/"
echo ""
echo "📚 Documentation : docs/OCA_INTEGRATION.md"
echo "🐛 Issues : https://github.com/salmenktata/quelyosSuite/issues/52"
