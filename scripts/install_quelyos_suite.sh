#!/bin/bash
# -*- coding: utf-8 -*-
#
# Script d'installation automatisée Quelyos Suite
# Installe quelyos_core qui déclenche l'installation de toute la suite
#
# Usage:
#   ./scripts/install_quelyos_suite.sh <database_name>
#   ./scripts/install_quelyos_suite.sh quelyos_production

set -e  # Arrêt en cas d'erreur

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_header() {
    echo -e "\n${BOLD}${BLUE}==================================================================================${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}==================================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "  $1"
}

# Vérifier les arguments
if [ -z "$1" ]; then
    print_error "Usage: $0 <database_name>"
    echo -e "  Exemple: $0 quelyos_production"
    exit 1
fi

DB_NAME="$1"
ODOO_BIN="${ODOO_BIN:-/opt/odoo/odoo-19/odoo-bin}"
ODOO_CONF="${ODOO_CONF:-/etc/odoo/odoo.conf}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

print_header "INSTALLATION QUELYOS SUITE"
print_info "Base de données : $DB_NAME"
print_info "Odoo binary     : $ODOO_BIN"
print_info "Odoo config     : $ODOO_CONF"

# Vérifier que Odoo existe
if [ ! -f "$ODOO_BIN" ]; then
    print_error "Odoo binary introuvable : $ODOO_BIN"
    print_info "Définir la variable ODOO_BIN si Odoo est ailleurs"
    print_info "  export ODOO_BIN=/chemin/vers/odoo-bin"
    exit 1
fi

# Vérifier que la config existe
if [ ! -f "$ODOO_CONF" ]; then
    print_error "Configuration Odoo introuvable : $ODOO_CONF"
    print_info "Définir la variable ODOO_CONF si la config est ailleurs"
    print_info "  export ODOO_CONF=/chemin/vers/odoo.conf"
    exit 1
fi

# Vérifier que la DB existe
print_header "VÉRIFICATION BASE DE DONNÉES"
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME" && echo "yes" || echo "no")

if [ "$DB_EXISTS" != "yes" ]; then
    print_error "La base de données '$DB_NAME' n'existe pas"
    print_info "Créer la DB d'abord :"
    print_info "  sudo -u postgres createdb -O odoo $DB_NAME"
    exit 1
fi

print_success "Base de données '$DB_NAME' trouvée"

# Installation de quelyos_core
print_header "INSTALLATION QUELYOS CORE ORCHESTRATOR"
print_info "Cette opération peut prendre 3-5 minutes..."
print_info "Tous les modules Quelyos seront installés automatiquement"

if sudo -u odoo "$ODOO_BIN" -c "$ODOO_CONF" -d "$DB_NAME" -i quelyos_core --stop-after-init --log-level=info; then
    print_success "Installation réussie !"
else
    print_error "Échec de l'installation"
    print_info "Voir les logs Odoo pour plus de détails :"
    print_info "  tail -f /var/log/odoo/odoo-server.log"
    exit 1
fi

# Redémarrage Odoo
print_header "REDÉMARRAGE ODOO"
print_info "Le serveur Odoo doit être redémarré pour activer tous les modules"

if command -v systemctl &> /dev/null; then
    if sudo systemctl restart odoo; then
        print_success "Service Odoo redémarré"
    else
        print_warning "Échec redémarrage automatique - Redémarrer manuellement :"
        print_info "  sudo systemctl restart odoo"
    fi
else
    print_warning "systemctl introuvable - Redémarrer Odoo manuellement"
fi

# Attendre que Odoo soit prêt
print_info "Attente du démarrage d'Odoo (15 secondes)..."
sleep 15

# Vérification post-installation
print_header "VÉRIFICATION POST-INSTALLATION"

if [ -f "$(dirname "$0")/verify_installation.py" ]; then
    if $PYTHON_BIN "$(dirname "$0")/verify_installation.py" --db "$DB_NAME"; then
        print_success "Vérification réussie"
    else
        print_warning "Certaines vérifications ont échoué - Voir détails ci-dessus"
    fi
else
    print_warning "Script de vérification introuvable"
    print_info "Vérifier manuellement dans Odoo > Apps > Quelyos"
fi

# Instructions next steps
print_header "NEXT STEPS"
print_success "Installation Quelyos Suite terminée !"
echo ""
print_info "1. Accéder à Odoo :"
print_info "   http://localhost:8069"
echo ""
print_info "2. Login admin/admin (changer le mot de passe !)"
echo ""
print_info "3. Vérifier les modules installés :"
print_info "   Apps > Filtrer par 'Quelyos'"
echo ""
print_info "4. Configurer les frontends :"
print_info "   - vitrine-quelyos  : BACKEND_URL=http://localhost:8069"
print_info "   - vitrine-client   : BACKEND_URL=http://localhost:8069"
print_info "   - dashboard-client : VITE_BACKEND_URL=http://localhost:8069"
echo ""
print_info "5. Modules installés :"
print_info "   - quelyos_core (orchestrateur)"
print_info "   - quelyos_api (multi-tenant + API REST)"
print_info "   - quelyos_stock_advanced (inventaire avancé)"
print_info "   - quelyos_finance (trésorerie + budgets)"
print_info "   - quelyos_sms_tn (notifications SMS)"
echo ""
print_info "Documentation : docs/INSTALLATION_GUIDE.md"
print_info "Troubleshooting : docs/TROUBLESHOOTING.md"
echo ""
print_success "Bonne utilisation de Quelyos Suite ! 🚀"
