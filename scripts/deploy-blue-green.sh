#!/bin/bash
# =============================================================================
# Blue/Green Deployment Script - Quelyos ERP
# =============================================================================
#
# Déploiement sans downtime avec stratégie Blue/Green:
# 1. Déploie la nouvelle version sur l'environnement inactif
# 2. Exécute les health checks
# 3. Bascule le trafic
# 4. Garde l'ancien environnement en standby pour rollback
#
# Usage:
#   ./scripts/deploy-blue-green.sh [options]
#
# Options:
#   --deploy       Déployer une nouvelle version
#   --rollback     Revenir à la version précédente
#   --status       Afficher l'état actuel
#   --promote      Promouvoir l'environnement staging
#
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
BLUE_PORT="${BLUE_PORT:-5175}"
GREEN_PORT="${GREEN_PORT:-5176}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-/api/health}"
HEALTH_CHECK_TIMEOUT=30
DRAIN_TIMEOUT=10

# Fichier d'état
STATE_FILE="$PROJECT_DIR/.deployment-state.json"

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
# GESTION DE L'ÉTAT
# =============================================================================

init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        echo '{
  "active": "blue",
  "blue": {
    "version": "unknown",
    "port": '$BLUE_PORT',
    "deployed_at": null,
    "status": "unknown"
  },
  "green": {
    "version": "unknown",
    "port": '$GREEN_PORT',
    "deployed_at": null,
    "status": "standby"
  },
  "last_deployment": null,
  "last_rollback": null
}' > "$STATE_FILE"
    fi
}

get_active_env() {
    jq -r '.active' "$STATE_FILE"
}

get_inactive_env() {
    local active=$(get_active_env)
    if [ "$active" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

get_env_port() {
    local env=$1
    jq -r ".${env}.port" "$STATE_FILE"
}

update_state() {
    local env=$1
    local field=$2
    local value=$3

    local tmp=$(mktemp)
    jq ".${env}.${field} = ${value}" "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
}

set_active() {
    local env=$1
    local tmp=$(mktemp)
    jq ".active = \"${env}\"" "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
}

# =============================================================================
# HEALTH CHECKS
# =============================================================================

wait_for_health() {
    local port=$1
    local timeout=$2
    local url="http://localhost:${port}${HEALTH_CHECK_URL}"

    log_info "Attente du health check sur $url..."

    local count=0
    while [ $count -lt $timeout ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_success "Health check OK"
            return 0
        fi
        sleep 1
        count=$((count + 1))
        echo -n "."
    done

    echo ""
    log_error "Health check timeout après ${timeout}s"
    return 1
}

check_all_health() {
    local port=$1

    log_info "Vérification complète de la santé..."

    # Health check basique
    if ! wait_for_health "$port" "$HEALTH_CHECK_TIMEOUT"; then
        return 1
    fi

    # Readiness check
    local ready_url="http://localhost:${port}/api/health/ready"
    if curl -sf "$ready_url" > /dev/null 2>&1; then
        log_success "Readiness check OK"
    else
        log_warning "Readiness check failed (non-bloquant)"
    fi

    return 0
}

# =============================================================================
# DÉPLOIEMENT
# =============================================================================

build_version() {
    local env=$1

    log_info "Construction de la nouvelle version..."

    cd "$PROJECT_DIR/dashboard-client"

    # Build avec le bon port
    local port=$(get_env_port "$env")
    VITE_PORT=$port pnpm build

    log_success "Build terminé"
}

start_environment() {
    local env=$1
    local port=$(get_env_port "$env")

    log_info "Démarrage de l'environnement $env sur le port $port..."

    cd "$PROJECT_DIR/dashboard-client"

    # Arrêter si déjà en cours
    lsof -ti:$port | xargs kill -9 2>/dev/null || true

    # Démarrer en arrière-plan
    PORT=$port pnpm preview > "/tmp/quelyos-${env}.log" 2>&1 &
    local pid=$!

    echo $pid > "/tmp/quelyos-${env}.pid"

    # Attendre le démarrage
    sleep 3

    if ! kill -0 $pid 2>/dev/null; then
        log_error "L'environnement $env n'a pas démarré"
        return 1
    fi

    log_success "Environnement $env démarré (PID: $pid)"
}

stop_environment() {
    local env=$1
    local port=$(get_env_port "$env")

    log_info "Arrêt de l'environnement $env..."

    local pid_file="/tmp/quelyos-${env}.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        kill -KILL $pid 2>/dev/null || true
        rm -f "$pid_file"
    fi

    # Forcer l'arrêt sur le port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true

    log_success "Environnement $env arrêté"
}

switch_traffic() {
    local from_env=$1
    local to_env=$2

    log_info "Basculement du trafic de $from_env vers $to_env..."

    local from_port=$(get_env_port "$from_env")
    local to_port=$(get_env_port "$to_env")

    # Ici, vous devriez mettre à jour votre load balancer/reverse proxy
    # Exemple avec nginx:
    # sed -i "s/proxy_pass http://localhost:$from_port/proxy_pass http://localhost:$to_port/" /etc/nginx/sites-enabled/quelyos
    # nginx -s reload

    # Pour le moment, on simule avec un fichier de config
    echo "ACTIVE_PORT=$to_port" > "$PROJECT_DIR/.active-port"

    log_success "Trafic basculé vers $to_env (port $to_port)"
}

drain_connections() {
    log_info "Drainage des connexions ($DRAIN_TIMEOUT secondes)..."
    sleep $DRAIN_TIMEOUT
    log_success "Drainage terminé"
}

# =============================================================================
# COMMANDES PRINCIPALES
# =============================================================================

deploy() {
    local version=${1:-$(git rev-parse --short HEAD)}

    log_info "=== Déploiement Blue/Green ==="
    log_info "Version: $version"

    # Déterminer l'environnement cible
    local active=$(get_active_env)
    local target=$(get_inactive_env)

    log_info "Environnement actif: $active"
    log_info "Cible du déploiement: $target"

    # 1. Build
    build_version "$target"

    # 2. Démarrer l'environnement cible
    start_environment "$target"

    # 3. Health checks
    local target_port=$(get_env_port "$target")
    if ! check_all_health "$target_port"; then
        log_error "Health check échoué, rollback..."
        stop_environment "$target"
        exit 1
    fi

    # 4. Basculer le trafic
    switch_traffic "$active" "$target"

    # 5. Drainer l'ancien environnement
    drain_connections

    # 6. Mettre à jour l'état
    set_active "$target"
    update_state "$target" "version" "\"$version\""
    update_state "$target" "deployed_at" "\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""
    update_state "$target" "status" '"active"'
    update_state "$active" "status" '"standby"'

    log_success "=== Déploiement terminé ==="
    log_info "Environnement actif: $target"
    log_info "Version: $version"
}

rollback() {
    log_info "=== Rollback Blue/Green ==="

    local active=$(get_active_env)
    local standby=$(get_inactive_env)
    local standby_port=$(get_env_port "$standby")

    # Vérifier que l'environnement standby est disponible
    if ! curl -sf "http://localhost:${standby_port}${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
        log_error "L'environnement standby n'est pas disponible"
        exit 1
    fi

    # Basculer le trafic
    switch_traffic "$active" "$standby"

    # Mettre à jour l'état
    set_active "$standby"
    update_state "$standby" "status" '"active"'
    update_state "$active" "status" '"standby"'

    local tmp=$(mktemp)
    jq ".last_rollback = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"

    log_success "=== Rollback terminé ==="
    log_info "Environnement actif: $standby"
}

status() {
    echo -e "${GREEN}=== État du déploiement Blue/Green ===${NC}"
    echo ""

    if [ ! -f "$STATE_FILE" ]; then
        log_warning "Aucun état de déploiement trouvé"
        return
    fi

    local active=$(get_active_env)

    echo -e "${YELLOW}Environnement actif:${NC} $active"
    echo ""

    for env in blue green; do
        local port=$(jq -r ".${env}.port" "$STATE_FILE")
        local version=$(jq -r ".${env}.version" "$STATE_FILE")
        local deployed_at=$(jq -r ".${env}.deployed_at" "$STATE_FILE")
        local env_status=$(jq -r ".${env}.status" "$STATE_FILE")

        if [ "$env" = "$active" ]; then
            echo -e "${GREEN}[$env]${NC} (ACTIF)"
        else
            echo -e "${BLUE}[$env]${NC} (standby)"
        fi

        echo "  Port: $port"
        echo "  Version: $version"
        echo "  Déployé: $deployed_at"
        echo "  Status: $env_status"

        # Health check
        if curl -sf "http://localhost:${port}${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
            echo -e "  Health: ${GREEN}OK${NC}"
        else
            echo -e "  Health: ${RED}DOWN${NC}"
        fi
        echo ""
    done
}

# =============================================================================
# MAIN
# =============================================================================

init_state

case "${1:-status}" in
    --deploy|-d)
        deploy "${2:-}"
        ;;
    --rollback|-r)
        rollback
        ;;
    --status|-s)
        status
        ;;
    --help|-h)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --deploy [version]  Déployer une nouvelle version"
        echo "  --rollback          Revenir à la version précédente"
        echo "  --status            Afficher l'état actuel"
        exit 0
        ;;
    *)
        status
        ;;
esac
