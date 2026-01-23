#!/bin/bash
# Script de désinstallation du module Site Web et de ses dépendances

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Désinstallation du Module Site Web - Quelyos ERP        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Modules à désinstaller (dans l'ordre)
DEPENDENT_MODULES="website_crm,website_mail,website_payment,website_sms"
MAIN_MODULE="website"

echo -e "${YELLOW}Étape 1/3: Désinstallation des modules dépendants...${NC}"
echo "Modules: $DEPENDENT_MODULES"
echo ""

docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall "$DEPENDENT_MODULES" \
  --stop-after-init

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Modules dépendants désinstallés avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la désinstallation des modules dépendants${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Étape 2/3: Désinstallation du module Site Web...${NC}"
echo ""

docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall "$MAIN_MODULE" \
  --stop-after-init

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Module Site Web désinstallé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la désinstallation du module Site Web${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Étape 3/3: Redémarrage d'Odoo...${NC}"
echo ""

docker-compose restart odoo

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Odoo redémarré avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors du redémarrage d'Odoo${NC}"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DÉSINSTALLATION RÉUSSIE!              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Vérification:"
echo "  1. Ouvrez http://localhost:8069"
echo "  2. Allez dans Apps"
echo "  3. Recherchez 'Site Web'"
echo "  4. Le module devrait afficher 'Non installé'"
echo ""
echo -e "${GREEN}✅ Désinstallation terminée!${NC}"
