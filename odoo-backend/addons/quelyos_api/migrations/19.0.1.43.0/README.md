# Migration 19.0.1.43.0 - Q1 2026: Stock/Ventes

**Date** : 2026-01-31  
**Type** : Refactoring (isolation Odoo)  
**Breaking Change** : Non (backward-compatible)

## Résumé

Migration Q1 2026 - Modèles prioritaires Stock/Ventes.  
Renommage champs sans préfixe → `x_*` pour éviter collisions futures avec Odoo.

## Champs Migrés

### sale.order (6 champs - STOCKÉS)
- `recovery_token` → `x_recovery_token`
- `recovery_email_sent_date` → `x_recovery_email_sent_date`
- `can_fulfill_now` → `x_can_fulfill_now`
- `expected_fulfillment_date` → `x_expected_fulfillment_date`
- `missing_stock_details` → `x_missing_stock_details`
- `fulfillment_priority` → `x_fulfillment_priority`

### stock.quant (2 champs - STOCKÉS)
- `adjustment_cost` → `x_adjustment_cost`
- `low_stock_threshold` → `x_low_stock_threshold`

### stock.location (3 champs - STOCKÉS)
- `is_locked` → `x_is_locked`
- `lock_reason` → `x_lock_reason`
- `locked_by_id` → `x_locked_by_id`

### crm.stage (1 champ - NON STOCKÉ)
- `is_global` → `x_is_global`

**Total Q1** : 12 champs

## Compatibilité

✅ **Migration SQL automatique** (champs stockés)  
✅ **Alias backward-compatible** (related fields)  
✅ **Endpoints API** continuent de fonctionner  
✅ **Aucune régression** attendue

## Dépréciation

Les anciens noms de champs sont **DEPRECATED** et seront supprimés en **Q4 2026**.

## Tests

```bash
# Upgrade module (exécute migration SQL)
docker exec odoo-backend odoo-bin -d quelyos_db -u quelyos_api --stop-after-init

# Vérifier structure SQL
docker exec -it postgres psql -U odoo -d quelyos_db -c "\d sale_order" | grep x_

# Vérifier isolation
./scripts/check-odoo-isolation.sh
```

## Voir aussi

- Phase 1: product.product (19.0.1.42.0)
- `.claude/MIGRATION_FIELDS_PREFIX.md`
