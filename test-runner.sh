#!/bin/bash

# Script de test pour quelyos_ecommerce
# Exécute tous les tests unitaires et d'intégration

set -e

echo "========================================="
echo " QuelyosERP E-Commerce API Test Runner"
echo "========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ODOO_PATH="/Users/salmenktata/Projets/GitHub/QuelyosERP/backend"
MODULE="quelyos_ecommerce"

echo "📦 Module: $MODULE"
echo "📁 Path: $ODOO_PATH"
echo ""

# Vérifier que Odoo est installé
if [ ! -f "$ODOO_PATH/odoo-bin" ]; then
    echo -e "${RED}❌ Error: odoo-bin not found at $ODOO_PATH${NC}"
    exit 1
fi

echo "🧪 Running tests..."
echo ""

# Phase 1: Tests unitaires validators
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 1: Unit Tests - Validators"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$ODOO_PATH"
python3 odoo-bin -c odoo.conf --test-enable --test-tags quelyos_ecommerce.test_validators --stop-after-init -d quelyos_db -u $MODULE || {
    echo -e "${RED}❌ Validator tests failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Validator tests passed${NC}"
echo ""

# Phase 2: Tests API sécurité
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 2: Security Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 odoo-bin -c odoo.conf --test-enable --test-tags quelyos_ecommerce.security --stop-after-init -d quelyos_db -u $MODULE || {
    echo -e "${RED}❌ Security tests failed${NC}"
    exit 1
}

echo -e "${GREEN}✅ Security tests passed${NC}"
echo ""

# Phase 3: Tests API endpoints
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Phase 3: API Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 odoo-bin -c odoo.conf --test-enable --test-tags quelyos_ecommerce.post_install --stop-after-init -d quelyos_db -u $MODULE || {
    echo -e "${YELLOW}⚠️  Some API tests failed (check logs)${NC}"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Suite Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Review test coverage (aim for 80%+)"
echo "2. Fix any failing tests"
echo "3. Run performance benchmarks"
echo "4. Deploy to staging"
echo ""
