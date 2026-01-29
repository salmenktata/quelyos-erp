#!/bin/bash

# Script de tests E2E Marketplace Thèmes
# Usage: ./scripts/test-marketplace.sh [test_suite]

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8069}"
COOKIE_FILE="/tmp/quelyos_test_session.txt"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction d'authentification
login_user() {
    local email=$1
    local password=$2

    print_info "Authentification: $email"

    curl -s -c "$COOKIE_FILE" -X POST "$BACKEND_URL/web/session/authenticate" \
        -H "Content-Type: application/json" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"method\": \"call\",
            \"params\": {
                \"db\": \"quelyos\",
                \"login\": \"$email\",
                \"password\": \"$password\"
            },
            \"id\": 1
        }" > /dev/null

    if [ $? -eq 0 ]; then
        print_success "Authentifié: $email"
    else
        print_error "Échec authentification: $email"
        exit 1
    fi
}

# Test Suite 1: Flow Designer
test_suite_1() {
    print_header "TEST SUITE 1: FLOW DESIGNER"

    # Test 1.1: Création profil designer
    print_info "Test 1.1: Création profil designer"

    response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/designers/create" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "display_name": "Jane Designer",
                "email": "jane@designstudio.com",
                "bio": "Experte en design moderne",
                "portfolio_url": "https://janedesign.com"
            },
            "id": 1
        }')

    if echo "$response" | grep -q '"success":true'; then
        print_success "Profil designer créé"
        designer_id=$(echo "$response" | grep -o '"designer_id":[0-9]*' | grep -o '[0-9]*')
        echo "Designer ID: $designer_id"
    else
        print_error "Échec création profil designer"
        echo "$response"
    fi

    # Test 1.2: Soumission thème
    print_info "Test 1.2: Soumission thème"

    config_json='{
        "id": "test-theme",
        "name": "Test Theme",
        "colors": {"primary": "#000000"},
        "layouts": {"homepage": {"sections": []}}
    }'

    response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/submissions/create" \
        -H "Content-Type: application/json" \
        -d "{
            \"jsonrpc\": \"2.0\",
            \"method\": \"call\",
            \"params\": {
                \"name\": \"Modern Fashion\",
                \"description\": \"Thème élégant pour boutiques de mode\",
                \"category\": \"fashion\",
                \"config_json\": $(echo "$config_json" | jq -c | jq -R),
                \"is_premium\": true,
                \"price\": 49.00
            },
            \"id\": 2
        }")

    if echo "$response" | grep -q '"success":true'; then
        print_success "Soumission thème créée"
        submission_id=$(echo "$response" | grep -o '"submission_id":[0-9]*' | grep -o '[0-9]*')
        echo "Submission ID: $submission_id"
    else
        print_error "Échec soumission thème"
        echo "$response"
    fi

    # Test 1.3: Soumettre pour validation
    if [ ! -z "$submission_id" ]; then
        print_info "Test 1.3: Soumettre pour validation"

        response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/submissions/$submission_id/submit" \
            -H "Content-Type: application/json" \
            -d '{
                "jsonrpc": "2.0",
                "method": "call",
                "params": {},
                "id": 3
            }')

        if echo "$response" | grep -q '"success":true'; then
            print_success "Soumission envoyée pour validation"
        else
            print_error "Échec soumission validation"
            echo "$response"
        fi
    fi

    # Test 1.4: Onboarding Stripe Connect
    if [ ! -z "$designer_id" ]; then
        print_info "Test 1.4: Onboarding Stripe Connect"

        response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/designers/stripe-connect/onboard" \
            -H "Content-Type: application/json" \
            -d "{
                \"jsonrpc\": \"2.0\",
                \"method\": \"call\",
                \"params\": {
                    \"designer_id\": $designer_id
                },
                \"id\": 4
            }")

        if echo "$response" | grep -q '"success":true'; then
            print_success "Onboarding Stripe initié"
            account_link=$(echo "$response" | grep -o '"account_link_url":"[^"]*"' | cut -d'"' -f4)
            print_info "URL onboarding: $account_link"
            print_warning "Action manuelle requise: Compléter l'onboarding Stripe"
        else
            print_error "Échec onboarding Stripe"
            echo "$response"
        fi
    fi
}

# Test Suite 2: Flow Admin
test_suite_2() {
    print_header "TEST SUITE 2: FLOW ADMIN"

    # Test 2.1: Liste soumissions en attente
    print_info "Test 2.1: Liste soumissions en attente"

    response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/submissions/pending" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "method": "call",
            "params": {},
            "id": 5
        }')

    if echo "$response" | grep -q '"success":true'; then
        print_success "Liste soumissions récupérée"
        count=$(echo "$response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
        echo "Soumissions en attente: $count"
    else
        print_error "Échec récupération soumissions"
        echo "$response"
    fi

    # Test 2.2: Approuver soumission (nécessite submission_id)
    read -p "Entrer Submission ID à approuver (ou Enter pour skip): " submission_id_approve

    if [ ! -z "$submission_id_approve" ]; then
        print_info "Test 2.2: Approuver soumission $submission_id_approve"

        response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/submissions/$submission_id_approve/approve" \
            -H "Content-Type: application/json" \
            -d '{
                "jsonrpc": "2.0",
                "method": "call",
                "params": {},
                "id": 6
            }')

        if echo "$response" | grep -q '"success":true'; then
            print_success "Soumission approuvée"
        else
            print_error "Échec approbation soumission"
            echo "$response"
        fi
    fi

    # Test 2.4: Consulter analytics
    print_info "Test 2.4: Consulter analytics"

    response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/analytics/overview" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "method": "call",
            "params": {},
            "id": 7
        }')

    if echo "$response" | grep -q '"success":true'; then
        print_success "Analytics récupérées"
        total_revenue=$(echo "$response" | grep -o '"total_revenue":[0-9.]*' | grep -o '[0-9.]*')
        total_sales=$(echo "$response" | grep -o '"total_sales":[0-9]*' | grep -o '[0-9]*')
        echo "Total revenus: $total_revenue EUR"
        echo "Total ventes: $total_sales"
    else
        print_error "Échec récupération analytics"
        echo "$response"
    fi
}

# Test Suite 3: Flow Client
test_suite_3() {
    print_header "TEST SUITE 3: FLOW CLIENT"

    # Test 3.1: Liste marketplace publique
    print_info "Test 3.1: Liste marketplace publique"

    response=$(curl -s -X POST "$BACKEND_URL/api/themes/marketplace" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "limit": 10,
                "offset": 0
            },
            "id": 8
        }')

    if echo "$response" | grep -q '"success":true'; then
        print_success "Liste marketplace récupérée"
        count=$(echo "$response" | grep -o '"total":[0-9]*' | grep -o '[0-9]*')
        echo "Thèmes disponibles: $count"
    else
        print_error "Échec récupération marketplace"
        echo "$response"
    fi

    # Test 3.3: Achat thème premium
    read -p "Entrer Theme ID à acheter (ou Enter pour skip): " theme_id_buy
    read -p "Entrer Tenant ID (ou Enter pour skip): " tenant_id_buy

    if [ ! -z "$theme_id_buy" ] && [ ! -z "$tenant_id_buy" ]; then
        print_info "Test 3.3: Achat thème premium"

        response=$(curl -s -b "$COOKIE_FILE" -X POST "$BACKEND_URL/api/themes/$theme_id_buy/stripe/create-payment-intent" \
            -H "Content-Type: application/json" \
            -d "{
                \"jsonrpc\": \"2.0\",
                \"method\": \"call\",
                \"params\": {
                    \"theme_id\": $theme_id_buy,
                    \"tenant_id\": $tenant_id_buy
                },
                \"id\": 9
            }")

        if echo "$response" | grep -q '"success":true'; then
            print_success "Payment Intent créé"
            client_secret=$(echo "$response" | grep -o '"client_secret":"[^"]*"' | cut -d'"' -f4)
            print_info "Client secret: ${client_secret:0:20}..."
            print_warning "Action manuelle requise: Confirmer paiement via frontend"
        else
            print_error "Échec création Payment Intent"
            echo "$response"
        fi
    fi
}

# Test Suite 4: Validation données
test_suite_4() {
    print_header "TEST SUITE 4: VALIDATION DONNÉES"

    print_info "Validation base de données..."

    # Vérifier designers
    docker exec quelyos-db psql -U odoo -d quelyos -c "
        SELECT COUNT(*) as designers_count FROM quelyos_theme_designer;
    " 2>/dev/null || print_warning "Impossible de se connecter à la DB"

    # Vérifier soumissions
    docker exec quelyos-db psql -U odoo -d quelyos -c "
        SELECT status, COUNT(*) FROM quelyos_theme_submission GROUP BY status;
    " 2>/dev/null

    # Vérifier purchases
    docker exec quelyos-db psql -U odoo -d quelyos -c "
        SELECT status, COUNT(*) FROM quelyos_theme_purchase GROUP BY status;
    " 2>/dev/null

    # Vérifier revenues
    docker exec quelyos-db psql -U odoo -d quelyos -c "
        SELECT payout_status, COUNT(*), SUM(amount) as total
        FROM quelyos_theme_revenue GROUP BY payout_status;
    " 2>/dev/null
}

# Menu principal
show_menu() {
    print_header "TESTS E2E MARKETPLACE THÈMES"
    echo "1. Test Suite 1: Flow Designer"
    echo "2. Test Suite 2: Flow Admin"
    echo "3. Test Suite 3: Flow Client"
    echo "4. Test Suite 4: Validation données"
    echo "5. Tous les tests"
    echo "6. Quitter"
    echo ""
    read -p "Choisir une option (1-6): " choice

    case $choice in
        1)
            login_user "designer@test.com" "test123"
            test_suite_1
            ;;
        2)
            login_user "admin@test.com" "admin123"
            test_suite_2
            ;;
        3)
            test_suite_3
            ;;
        4)
            test_suite_4
            ;;
        5)
            login_user "designer@test.com" "test123"
            test_suite_1
            login_user "admin@test.com" "admin123"
            test_suite_2
            test_suite_3
            test_suite_4
            ;;
        6)
            print_info "Tests terminés"
            exit 0
            ;;
        *)
            print_error "Option invalide"
            show_menu
            ;;
    esac
}

# Point d'entrée
main() {
    print_header "SETUP TESTS E2E"

    # Vérifier que le backend est accessible
    print_info "Vérification backend: $BACKEND_URL"

    if curl -s "$BACKEND_URL/web/health" > /dev/null; then
        print_success "Backend accessible"
    else
        print_error "Backend inaccessible: $BACKEND_URL"
        exit 1
    fi

    # Vérifier que Docker est démarré
    if docker ps | grep -q "quelyos-odoo"; then
        print_success "Conteneur Odoo démarré"
    else
        print_warning "Conteneur Odoo non démarré"
    fi

    # Menu interactif
    show_menu
}

# Exécution
main
