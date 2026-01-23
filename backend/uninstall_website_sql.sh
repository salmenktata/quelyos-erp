#!/bin/bash
# Script de désinstallation du module Site Web via SQL
# Pour Odoo 19

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Désinstallation du Module Site Web - Quelyos ERP        ║"
echo "║  Méthode: SQL Direct (Odoo 19)                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}ℹ️  IMPORTANT: Cette méthode utilise SQL direct${NC}"
echo "   Odoo 19 ne supporte pas --uninstall en CLI"
echo ""

# Liste des modules à désinstaller
MODULES="website_crm website_mail website_payment website_sms website"

echo -e "${YELLOW}Étape 1/4: Vérification des modules installés...${NC}"
echo ""

docker exec quelyos-db psql -U odoo -d quelyos -c "
SELECT name, state, shortdesc
FROM ir_module_module
WHERE name IN ('website', 'website_crm', 'website_mail', 'website_payment', 'website_sms')
ORDER BY name;
"

echo ""
read -p "Voulez-vous continuer avec la désinstallation? (o/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[oOyY]$ ]]; then
    echo -e "${RED}❌ Désinstallation annulée${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Étape 2/4: Marquage des modules pour désinstallation...${NC}"
echo ""

# Marquer les modules comme "à désinstaller"
for MODULE in $MODULES; do
    echo -e "${BLUE}  → Marquage de $MODULE...${NC}"
    docker exec quelyos-db psql -U odoo -d quelyos -c "
    UPDATE ir_module_module
    SET state = 'to remove'
    WHERE name = '$MODULE' AND state = 'installed';
    " > /dev/null
done

echo -e "${GREEN}✅ Modules marqués pour désinstallation${NC}"

echo ""
echo -e "${YELLOW}Étape 3/4: Redémarrage d'Odoo pour traiter la désinstallation...${NC}"
echo ""

cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
docker-compose restart odoo

echo -e "${GREEN}✅ Odoo redémarré${NC}"

echo ""
echo -e "${YELLOW}Étape 4/4: Attente du traitement (15 secondes)...${NC}"
sleep 15

echo ""
echo -e "${BLUE}Vérification de l'état des modules:${NC}"
echo ""

docker exec quelyos-db psql -U odoo -d quelyos -c "
SELECT name, state, shortdesc
FROM ir_module_module
WHERE name IN ('website', 'website_crm', 'website_mail', 'website_payment', 'website_sms')
ORDER BY name;
"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DÉSINSTALLATION LANCÉE                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}⚠️  Si les modules sont encore marqués 'to remove':${NC}"
echo "   1. Allez dans Apps dans l'interface Odoo"
echo "   2. Les modules devraient se désinstaller automatiquement"
echo "   3. Ou cliquez sur 'Désinstaller' sur chaque module"
echo ""
echo -e "${GREEN}✅ Configuration terminée!${NC}"
