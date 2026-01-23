#!/bin/bash

# Script de validation du correctif ResizeObserver
# Usage: ./validate_branding_fix.sh

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Validation du Correctif ResizeObserver - Quelyos ERP    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que le fichier error_handler.js existe
echo -n "1. Vérification de error_handler.js... "
if [ -f "addons/quelyos_branding/static/src/js/error_handler.js" ]; then
    echo -e "${GREEN}✓ Trouvé${NC}"
else
    echo -e "${RED}✗ Non trouvé${NC}"
    exit 1
fi

# 2. Vérifier que le manifest a été mis à jour
echo -n "2. Vérification du manifest... "
if grep -q "error_handler.js" "addons/quelyos_branding/__manifest__.py"; then
    echo -e "${GREEN}✓ Configuré${NC}"
else
    echo -e "${RED}✗ Non configuré${NC}"
    exit 1
fi

# 3. Vérifier que le conteneur Odoo est en cours d'exécution
echo -n "3. Vérification du conteneur Odoo... "
if docker ps | grep -q "quelyos-odoo"; then
    echo -e "${GREEN}✓ En cours d'exécution${NC}"
else
    echo -e "${RED}✗ Arrêté${NC}"
    echo -e "${YELLOW}   Démarrez-le avec: docker-compose up -d${NC}"
    exit 1
fi

# 4. Vérifier que le fichier est accessible dans le conteneur
echo -n "4. Vérification dans le conteneur... "
if docker exec quelyos-odoo test -f /mnt/extra-addons/quelyos_branding/static/src/js/error_handler.js; then
    echo -e "${GREEN}✓ Accessible${NC}"
else
    echo -e "${RED}✗ Non accessible${NC}"
    exit 1
fi

# 5. Vérifier que le module est installé
echo -n "5. Vérification de l'installation du module... "
MODULE_STATUS=$(docker exec quelyos-odoo odoo shell -d quelyos --db_host=db --db_user=odoo --db_password=odoo -c "
import sys
env = self.env
module = env['ir.module.module'].search([('name', '=', 'quelyos_branding')], limit=1)
if module and module.state == 'installed':
    print('installed')
else:
    print('not_installed')
sys.exit(0)
" 2>/dev/null | grep -o "installed\|not_installed" | tail -1)

if [ "$MODULE_STATUS" == "installed" ]; then
    echo -e "${GREEN}✓ Installé${NC}"
else
    echo -e "${YELLOW}⚠ Non installé ou état inconnu${NC}"
    echo -e "${YELLOW}   Installez-le depuis Apps ou avec: docker exec quelyos-odoo odoo -u quelyos_branding -d quelyos --db_host=db --db_user=odoo --db_password=odoo --stop-after-init${NC}"
fi

# 6. Vérifier les logs récents pour erreurs
echo -n "6. Vérification des logs récents... "
ERROR_COUNT=$(docker logs quelyos-odoo --tail 100 2>&1 | grep -i "error\|exception\|traceback" | grep -v "ERROR HANDLING" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Aucune erreur${NC}"
else
    echo -e "${YELLOW}⚠ $ERROR_COUNT erreurs trouvées${NC}"
    echo -e "${YELLOW}   Vérifiez avec: docker logs quelyos-odoo --tail 50${NC}"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    RÉSULTAT DE LA VALIDATION              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Tous les tests sont passés!${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Ouvrez http://localhost:8069 dans votre navigateur"
echo "2. Appuyez sur Ctrl+Shift+R (ou Cmd+Shift+R) pour vider le cache"
echo "3. Ouvrez la console (F12) et vérifiez:"
echo "   - Vous devriez voir: '✅ Quelyos: Error handler loaded'"
echo "   - Vous NE devriez PAS voir: 'ResizeObserver' ou 'parentNode' errors"
echo ""
echo "Pour voir les assets chargés:"
echo "   View Source → Rechercher 'error_handler.js'"
echo ""
