#!/bin/bash
# =============================================================================
# Graceful Shutdown Script pour Quelyos ERP
# =============================================================================
#
# Arrête proprement tous les services en:
# 1. Arrêtant d'accepter de nouvelles connexions
# 2. Attendant que les requêtes en cours se terminent
# 3. Fermant les connexions DB proprement
# 4. Sauvegardant l'état si nécessaire
#
# Usage:
#   ./scripts/graceful-shutdown.sh [service]
#   ./scripts/graceful-shutdown.sh all
#   ./scripts/graceful-shutdown.sh backoffice
#   ./scripts/graceful-shutdown.sh backend
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
SHUTDOWN_TIMEOUT=${SHUTDOWN_TIMEOUT:-30}  # Timeout en secondes
DRAIN_TIMEOUT=${DRAIN_TIMEOUT:-10}        # Temps pour drainer les connexions

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# FONCTIONS DE SHUTDOWN
# =============================================================================

shutdown_frontend() {
    local name=$1
    local port=$2
    local pid_file="/tmp/quelyos-${name}.pid"

    log_info "Arrêt graceful de $name (port $port)..."

    # Trouver le PID
    local pid=""
    if [ -f "$pid_file" ]; then
        pid=$(cat "$pid_file")
    else
        pid=$(lsof -ti:$port 2>/dev/null || true)
    fi

    if [ -z "$pid" ]; then
        log_warning "$name n'est pas en cours d'exécution"
        return 0
    fi

    # Envoyer SIGTERM (graceful)
    log_info "Envoi SIGTERM à $name (PID: $pid)"
    kill -TERM $pid 2>/dev/null || true

    # Attendre que le processus se termine
    local waited=0
    while kill -0 $pid 2>/dev/null && [ $waited -lt $SHUTDOWN_TIMEOUT ]; do
        sleep 1
        waited=$((waited + 1))
        echo -n "."
    done
    echo ""

    # Vérifier si le processus s'est arrêté
    if kill -0 $pid 2>/dev/null; then
        log_warning "$name n'a pas répondu au SIGTERM, envoi SIGKILL"
        kill -KILL $pid 2>/dev/null || true
        sleep 1
    fi

    # Nettoyer le fichier PID
    rm -f "$pid_file"

    log_success "$name arrêté"
}

shutdown_backend() {
    log_info "Arrêt graceful du backend Odoo..."

    cd "$PROJECT_DIR/odoo-backend"

    # Vérifier si Docker est utilisé
    if [ -f "docker-compose.yml" ]; then
        # Arrêt graceful via Docker
        log_info "Arrêt des conteneurs Docker..."

        # Envoyer SIGTERM aux conteneurs
        docker-compose stop -t $SHUTDOWN_TIMEOUT || true

        log_success "Backend Docker arrêté"
    else
        # Arrêt du processus Odoo directement
        local pid=$(pgrep -f "odoo-bin" || true)
        if [ -n "$pid" ]; then
            log_info "Envoi SIGTERM à Odoo (PID: $pid)"
            kill -TERM $pid 2>/dev/null || true

            # Attendre
            local waited=0
            while kill -0 $pid 2>/dev/null && [ $waited -lt $SHUTDOWN_TIMEOUT ]; do
                sleep 1
                waited=$((waited + 1))
            done

            if kill -0 $pid 2>/dev/null; then
                log_warning "Odoo n'a pas répondu, envoi SIGKILL"
                kill -KILL $pid 2>/dev/null || true
            fi

            log_success "Odoo arrêté"
        else
            log_warning "Odoo n'est pas en cours d'exécution"
        fi
    fi
}

drain_connections() {
    log_info "Drainage des connexions en cours ($DRAIN_TIMEOUT secondes)..."

    # Attendre que les requêtes en cours se terminent
    sleep $DRAIN_TIMEOUT

    log_success "Drainage terminé"
}

pre_shutdown_checks() {
    log_info "Vérifications pré-arrêt..."

    # Vérifier les jobs en cours
    # (À adapter selon votre système de background jobs)

    # Vérifier les transactions DB ouvertes
    if command -v psql &> /dev/null; then
        local active_queries=$(psql -h localhost -U odoo -d quelyos -t -c \
            "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%';" 2>/dev/null || echo "0")

        if [ "$active_queries" -gt 0 ]; then
            log_warning "$active_queries requêtes actives en cours"
        fi
    fi

    log_success "Vérifications terminées"
}

save_state() {
    log_info "Sauvegarde de l'état..."

    # Créer un snapshot de l'état actuel si nécessaire
    local state_file="$PROJECT_DIR/.shutdown-state-$(date +%Y%m%d_%H%M%S).json"

    echo "{
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"services\": {
    \"backoffice\": $(lsof -ti:5175 > /dev/null 2>&1 && echo \"true\" || echo \"false\"),
    \"vitrine\": $(lsof -ti:3000 > /dev/null 2>&1 && echo \"true\" || echo \"false\"),
    \"ecommerce\": $(lsof -ti:3001 > /dev/null 2>&1 && echo \"true\" || echo \"false\"),
    \"backend\": $(docker ps -q -f name=quelyos 2>/dev/null | grep -q . && echo \"true\" || echo \"false\")
  }
}" > "$state_file"

    log_success "État sauvegardé dans $state_file"
}

# =============================================================================
# MAIN
# =============================================================================

shutdown_all() {
    echo -e "${GREEN}=== Graceful Shutdown Quelyos ERP ===${NC}"
    echo ""

    # Phase 1: Vérifications
    pre_shutdown_checks

    # Phase 2: Sauvegarder l'état
    save_state

    # Phase 3: Arrêter les frontends (plus de nouvelles requêtes)
    log_info "Phase 1: Arrêt des frontends..."
    shutdown_frontend "backoffice" 5175
    shutdown_frontend "vitrine" 3000
    shutdown_frontend "ecommerce" 3001

    # Phase 4: Drainer les connexions
    drain_connections

    # Phase 5: Arrêter le backend
    log_info "Phase 2: Arrêt du backend..."
    shutdown_backend

    echo ""
    log_success "=== Arrêt graceful terminé ==="
}

# Parser les arguments
case "${1:-all}" in
    all)
        shutdown_all
        ;;
    backoffice)
        shutdown_frontend "backoffice" 5175
        ;;
    vitrine)
        shutdown_frontend "vitrine" 3000
        ;;
    ecommerce)
        shutdown_frontend "ecommerce" 3001
        ;;
    backend)
        shutdown_backend
        ;;
    *)
        echo "Usage: $0 [all|backoffice|vitrine|ecommerce|backend]"
        exit 1
        ;;
esac
