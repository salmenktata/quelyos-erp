#!/bin/bash

# Script d'installation complète de Quelyos Suite (Fresh Install)
# Inclut l'installation automatique des modules OCA
# Usage: ./scripts/fresh-install.sh

set -e

echo "🚀 Quelyos Suite - Installation Complète"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
INSTALL_OCA=${INSTALL_OCA:-true}  # Par défaut, installer les modules OCA
ODOO_DB=${ODOO_DB:-odoo_db}

echo -e "${BLUE}Configuration :${NC}"
echo "  - Installation OCA : $INSTALL_OCA"
echo "  - Base de données : $ODOO_DB"
echo ""

# Vérifier prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker non installé${NC}"
    echo "   Installer Docker : https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker installé"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker Compose installé"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non installé${NC}"
    echo "   Installer Node.js : https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js installé ($(node --version))"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git non installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git installé"

echo ""

# Étape 1 : Installation dépendances Node
echo -e "${BLUE}📦 Étape 1/6 : Installation dépendances Node...${NC}"
if [ -f "package.json" ]; then
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    echo -e "${GREEN}✓${NC} Dépendances installées"
else
    echo -e "${YELLOW}⚠${NC}  Pas de package.json racine, skip"
fi
echo ""

# Étape 2 : Téléchargement modules OCA (si activé)
if [ "$INSTALL_OCA" = true ]; then
    echo -e "${BLUE}🎁 Étape 2/6 : Téléchargement modules OCA...${NC}"
    if [ -f "scripts/download-oca-stock.sh" ]; then
        ./scripts/download-oca-stock.sh
        echo -e "${GREEN}✓${NC} Modules OCA téléchargés"
    else
        echo -e "${YELLOW}⚠${NC}  Script download-oca-stock.sh non trouvé, skip"
    fi
else
    echo -e "${YELLOW}⏭️  Étape 2/6 : Modules OCA désactivés${NC}"
fi
echo ""

# Étape 3 : Démarrage Odoo Backend
echo -e "${BLUE}🐳 Étape 3/6 : Démarrage Odoo Backend...${NC}"
cd odoo-backend

# Vérifier si conteneurs existent déjà
if docker-compose ps | grep -q "odoo"; then
    echo -e "${YELLOW}⚠${NC}  Conteneurs Odoo déjà démarrés"
    docker-compose restart
else
    docker-compose up -d
fi

echo -e "${YELLOW}⏳ Attente démarrage Odoo (30 secondes)...${NC}"
sleep 30

cd ..
echo -e "${GREEN}✓${NC} Odoo démarré"
echo ""

# Étape 4 : Installation quelyos_api
echo -e "${BLUE}📦 Étape 4/6 : Installation module quelyos_api...${NC}"
docker-compose -f odoo-backend/docker-compose.yml exec -T odoo \
    odoo-bin -c /etc/odoo/odoo.conf \
    -d "$ODOO_DB" \
    -i quelyos_api \
    --stop-after-init \
    --log-level=warn

echo -e "${GREEN}✓${NC} quelyos_api installé"
echo ""

# Étape 5 : Installation modules OCA (si activé)
if [ "$INSTALL_OCA" = true ]; then
    echo -e "${BLUE}🎁 Étape 5/6 : Installation modules OCA...${NC}"
    if [ -f "scripts/install-oca-stock.sh" ]; then
        ./scripts/install-oca-stock.sh
        echo -e "${GREEN}✓${NC} Modules OCA installés"
    else
        echo -e "${YELLOW}⚠${NC}  Script install-oca-stock.sh non trouvé, skip"
    fi
else
    echo -e "${YELLOW}⏭️  Étape 5/6 : Modules OCA désactivés${NC}"
fi
echo ""

# Étape 6 : Démarrage frontends
echo -e "${BLUE}🎨 Étape 6/6 : Démarrage des frontends...${NC}"
echo -e "${YELLOW}ℹ️  Les frontends doivent être démarrés manuellement :${NC}"
echo ""
echo "  Terminal 1 (Dashboard Backoffice) :"
echo "    cd dashboard-client && npm run dev"
echo ""
echo "  Terminal 2 (Site Vitrine) :"
echo "    cd vitrine-quelyos && npm run dev"
echo ""
echo "  Terminal 3 (E-commerce) :"
echo "    cd vitrine-client && npm run dev"
echo ""
echo -e "${BLUE}💡 Ou utiliser le script :${NC}"
echo "    ./scripts/dev-start.sh all"
echo ""

# Résumé
echo -e "${GREEN}✅ Installation Quelyos Suite terminée !${NC}"
echo ""
echo -e "${BLUE}📊 Services disponibles :${NC}"
echo "  - Odoo Backend  : http://localhost:8069 (admin / admin)"
echo "  - API REST      : http://localhost:8069/api/ecommerce/*"
echo ""
echo -e "${BLUE}🚀 Frontends (après démarrage manuel) :${NC}"
echo "  - Backoffice    : http://localhost:5175"
echo "  - Site Vitrine  : http://localhost:3000"
echo "  - E-commerce    : http://localhost:3001"
echo ""
echo -e "${BLUE}📚 Documentation :${NC}"
echo "  - README.md"
echo "  - ARCHITECTURE.md"
echo "  - docs/OCA_INTEGRATION.md"
echo ""
if [ "$INSTALL_OCA" = true ]; then
    echo -e "${BLUE}🎁 Modules OCA installés :${NC}"
    echo "  ✓ stock_change_qty_reason (Ajustements avec raison)"
    echo "  ✓ stock_inventory (Inventaire OCA)"
    echo "  ✓ stock_location_lockdown (Verrouillage emplacements)"
    echo "  ✓ stock_demand_estimate (Estimation demande)"
    echo ""
fi
echo -e "${GREEN}Bon développement ! 🎉${NC}"
