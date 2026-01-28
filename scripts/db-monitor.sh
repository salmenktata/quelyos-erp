#!/bin/bash
# =============================================================================
# Database Monitor - Quelyos ERP
# =============================================================================
#
# Surveille les connexions et performances de PostgreSQL
#
# Usage:
#   ./scripts/db-monitor.sh              # Affiche les stats une fois
#   ./scripts/db-monitor.sh --watch      # Mode surveillance continue
#   ./scripts/db-monitor.sh --kill-idle  # Kill les connexions idle > 10min
#
# =============================================================================

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-odoo}"
POSTGRES_DB="${POSTGRES_DB:-quelyos}"

export PGPASSWORD="${POSTGRES_PASSWORD:-odoo}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =============================================================================
# FONCTIONS
# =============================================================================

run_query() {
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "$1" 2>/dev/null
}

show_connection_stats() {
    echo -e "${BLUE}=== Statistiques Connexions ===${NC}"
    echo ""

    # Connexions par état
    echo -e "${YELLOW}Par état:${NC}"
    run_query "
        SELECT state, count(*)
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
        GROUP BY state
        ORDER BY count DESC;
    "

    # Connexions max
    local max_conn=$(run_query "SHOW max_connections;" | xargs)
    local current=$(run_query "SELECT count(*) FROM pg_stat_activity;" | xargs)
    local percent=$((current * 100 / max_conn))

    echo ""
    echo -e "${YELLOW}Utilisation:${NC} $current / $max_conn ($percent%)"

    if [ $percent -gt 80 ]; then
        echo -e "${RED}ATTENTION: Utilisation élevée des connexions!${NC}"
    fi
}

show_active_queries() {
    echo ""
    echo -e "${BLUE}=== Requêtes Actives ===${NC}"

    run_query "
        SELECT
            pid,
            now() - pg_stat_activity.query_start AS duration,
            state,
            LEFT(query, 80) as query
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
          AND state = 'active'
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY duration DESC
        LIMIT 10;
    "
}

show_slow_queries() {
    echo ""
    echo -e "${BLUE}=== Requêtes Lentes (> 5s) ===${NC}"

    run_query "
        SELECT
            pid,
            now() - pg_stat_activity.query_start AS duration,
            LEFT(query, 100) as query
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
          AND state = 'active'
          AND now() - pg_stat_activity.query_start > interval '5 seconds'
        ORDER BY duration DESC;
    "
}

show_locks() {
    echo ""
    echo -e "${BLUE}=== Verrous en Attente ===${NC}"

    run_query "
        SELECT
            blocked_locks.pid AS blocked_pid,
            blocked_activity.usename AS blocked_user,
            blocking_locks.pid AS blocking_pid,
            blocking_activity.usename AS blocking_user,
            LEFT(blocked_activity.query, 60) AS blocked_statement
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_stat_activity blocked_activity
            ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_catalog.pg_locks blocking_locks
            ON blocking_locks.locktype = blocked_locks.locktype
            AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
            AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
            AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
            AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
            AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
            AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
            AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
            AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
            AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
            AND blocking_locks.pid != blocked_locks.pid
        JOIN pg_catalog.pg_stat_activity blocking_activity
            ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted
        LIMIT 10;
    "
}

show_table_stats() {
    echo ""
    echo -e "${BLUE}=== Tables les Plus Volumineuses ===${NC}"

    run_query "
        SELECT
            schemaname || '.' || relname AS table,
            pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
            n_live_tup AS rows
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
        LIMIT 10;
    "
}

show_cache_stats() {
    echo ""
    echo -e "${BLUE}=== Cache Hit Ratio ===${NC}"

    run_query "
        SELECT
            'Buffer cache' AS cache,
            ROUND(100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0), 2) AS hit_ratio
        FROM pg_stat_database
        WHERE datname = '$POSTGRES_DB'
        UNION ALL
        SELECT
            'Index cache' AS cache,
            ROUND(100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0), 2) AS hit_ratio
        FROM pg_statio_user_indexes;
    "
}

kill_idle_connections() {
    echo -e "${YELLOW}Killing idle connections > 10 minutes...${NC}"

    local killed=$(run_query "
        SELECT count(*)
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
          AND state = 'idle'
          AND now() - state_change > interval '10 minutes'
          AND pid != pg_backend_pid();
    " | xargs)

    run_query "
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '$POSTGRES_DB'
          AND state = 'idle'
          AND now() - state_change > interval '10 minutes'
          AND pid != pg_backend_pid();
    " > /dev/null

    echo -e "${GREEN}Killed $killed idle connections${NC}"
}

watch_mode() {
    echo -e "${GREEN}Mode surveillance (Ctrl+C pour arrêter)${NC}"
    echo ""

    while true; do
        clear
        echo -e "${GREEN}=== Database Monitor - $(date) ===${NC}"
        show_connection_stats
        show_active_queries
        show_slow_queries
        sleep 5
    done
}

# =============================================================================
# MAIN
# =============================================================================

case "${1:-}" in
    --watch|-w)
        watch_mode
        ;;
    --kill-idle)
        kill_idle_connections
        ;;
    --locks)
        show_locks
        ;;
    --tables)
        show_table_stats
        ;;
    --cache)
        show_cache_stats
        ;;
    --full)
        show_connection_stats
        show_active_queries
        show_slow_queries
        show_locks
        show_table_stats
        show_cache_stats
        ;;
    --help|-h)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  (none)       Affiche les stats de base"
        echo "  --watch      Mode surveillance continue"
        echo "  --kill-idle  Kill les connexions idle > 10min"
        echo "  --locks      Affiche les verrous"
        echo "  --tables     Affiche les stats des tables"
        echo "  --cache      Affiche le cache hit ratio"
        echo "  --full       Affiche toutes les stats"
        ;;
    *)
        show_connection_stats
        show_active_queries
        ;;
esac
