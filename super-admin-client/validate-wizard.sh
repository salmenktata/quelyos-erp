#!/bin/bash

# Script de validation Wizard Installation Guidée
# Vérifie que tous les fichiers sont présents et configurés

set -e

echo "🔍 Validation Wizard Installation Guidée"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASS=0
FAIL=0

# Fonction de test
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1 (MANQUANT)"
    ((FAIL++))
  fi
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $1 contient: $2"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1 ne contient pas: $2"
    ((FAIL++))
  fi
}

echo "📦 Vérification fichiers wizard..."
echo ""

# Hooks
check_file "src/hooks/useInstallWizard.ts"

# Composants
check_file "src/components/wizard/InstallWizard.tsx"
check_file "src/components/wizard/WizardStepper.tsx"
check_file "src/components/wizard/index.ts"

# Steps
check_file "src/components/wizard/steps/Step1TenantInfo.tsx"
check_file "src/components/wizard/steps/Step2PlanSelection.tsx"
check_file "src/components/wizard/steps/Step3SeedConfig.tsx"
check_file "src/components/wizard/steps/Step4Validation.tsx"
check_file "src/components/wizard/steps/Step5Progress.tsx"
check_file "src/components/wizard/steps/index.ts"

# Pages
check_file "src/pages/InstallWizardPage.tsx"

# Mock API
check_file "src/lib/api/mockWizardApi.ts"

# Documentation
check_file "WIZARD_INSTALL.md"
check_file "TEST_WIZARD_GUIDE.md"
check_file "TEST_RESULTS.md"

echo ""
echo "🔧 Vérification configuration..."
echo ""

# Routes
check_content "src/components/AuthenticatedApp.tsx" "/tenants/install"
check_content "src/components/AuthenticatedApp.tsx" "InstallWizardPage"

# Bouton dans Tenants
check_content "src/pages/Tenants.tsx" "Installation Guidée"
check_content "src/pages/Tenants.tsx" "navigate('/tenants/install')"
check_content "src/pages/Tenants.tsx" "Sparkles"

# Mock API intégré
check_content "src/components/wizard/steps/Step5Progress.tsx" "mockWizardApi"
check_content "src/components/wizard/steps/Step5Progress.tsx" "MOCK_ENABLED"

echo ""
echo "🎨 Vérification dark mode..."
echo ""

# Dark mode classes
check_content "src/components/wizard/WizardStepper.tsx" "dark:bg-"
check_content "src/components/wizard/steps/Step1TenantInfo.tsx" "dark:bg-"
check_content "src/components/wizard/steps/Step2PlanSelection.tsx" "dark:bg-"
check_content "src/components/wizard/steps/Step5Progress.tsx" "dark:bg-"

echo ""
echo "🔒 Vérification anonymisation Odoo..."
echo ""

# Termes génériques (pas "Odoo")
check_content "src/components/wizard/steps/Step5Progress.tsx" "infrastructure backend"
check_content "src/components/wizard/steps/Step5Progress.tsx" "Provisioning"

echo ""
echo "⚙️  Vérification configuration..."
echo ""

# Variable MOCK
if grep -q "VITE_MOCK_WIZARD=true" .env.local 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Mode MOCK activé (.env.local)"
  ((PASS++))
else
  echo -e "${YELLOW}⚠${NC} Mode MOCK non activé (.env.local)"
  echo "  Pour tester sans backend, ajouter: VITE_MOCK_WIZARD=true"
fi

# Serveur
if curl -s http://localhost:9000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Serveur super-admin actif (port 9000)"
  ((PASS++))
else
  echo -e "${RED}✗${NC} Serveur super-admin non actif (port 9000)"
  ((FAIL++))
  echo "  Démarrer avec: npm run dev"
fi

echo ""
echo "========================================"
echo -e "Résultats: ${GREEN}${PASS} PASS${NC} | ${RED}${FAIL} FAIL${NC}"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ Validation réussie !${NC}"
  echo ""
  echo "🚀 Étapes suivantes:"
  echo "  1. Ouvrir http://localhost:9000/tenants"
  echo "  2. Cliquer sur 'Installation Guidée' ✨"
  echo "  3. Tester les 5 étapes du wizard"
  echo "  4. Consulter TEST_WIZARD_GUIDE.md pour checklist complète"
  exit 0
else
  echo -e "${RED}❌ Validation échouée${NC}"
  echo ""
  echo "Fichiers manquants ou configuration incorrecte."
  exit 1
fi
