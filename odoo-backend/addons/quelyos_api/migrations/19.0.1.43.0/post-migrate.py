# -*- coding: utf-8 -*-
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """
    Migration 19.0.1.43.0 - Q1 2026: Stock/Ventes fields → x_ prefix
    
    Modèles migrés:
    - sale.order (6 champs)
    - stock.quant (2 champs)
    - stock.location (3 champs)
    
    Total: 11 champs renommés pour isolation Odoo.
    """
    _logger.info("=== Migration 19.0.1.43.0: Q1 Stock/Ventes → x_ prefix ===")
    
    # Mapping: table → [(old_field, new_field), ...]
    migrations = {
        'sale_order': [
            ('recovery_token', 'x_recovery_token'),
            ('recovery_email_sent_date', 'x_recovery_email_sent_date'),
            ('can_fulfill_now', 'x_can_fulfill_now'),
            ('expected_fulfillment_date', 'x_expected_fulfillment_date'),
            ('missing_stock_details', 'x_missing_stock_details'),
            ('fulfillment_priority', 'x_fulfillment_priority'),
        ],
        'stock_quant': [
            ('adjustment_cost', 'x_adjustment_cost'),
            ('low_stock_threshold', 'x_low_stock_threshold'),
        ],
        'stock_location': [
            ('is_locked', 'x_is_locked'),
            ('lock_reason', 'x_lock_reason'),
            ('locked_by_id', 'x_locked_by_id'),
        ],
    }
    
    total_migrated = 0
    
    for table, fields in migrations.items():
        model_name = table.replace('_', '.')
        _logger.info(f"\n--- Migration table {table} ({model_name}) ---")
        
        for old_name, new_name in fields:
            # Vérifier si nouvelle colonne existe déjà
            cr.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name=%s 
                AND column_name=%s
            """, (table, new_name))
            
            if cr.fetchone():
                _logger.info(f"  {new_name} existe déjà, skip")
                continue
            
            # Vérifier si ancienne colonne existe
            cr.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name=%s 
                AND column_name=%s
            """, (table, old_name))
            
            if not cr.fetchone():
                _logger.warning(f"  {old_name} n'existe pas, skip")
                continue
            
            # Renommer colonne SQL (opération atomique)
            _logger.info(f"  ✓ Renommage {old_name} → {new_name}")
            cr.execute(f"""
                ALTER TABLE {table} 
                RENAME COLUMN {old_name} TO {new_name}
            """)
            
            # Mettre à jour métadonnées Odoo (ir.model.fields)
            cr.execute("""
                UPDATE ir_model_fields 
                SET name=%s 
                WHERE model=%s 
                AND name=%s
            """, (new_name, model_name, old_name))
            
            total_migrated += 1
    
    _logger.info(f"\n=== Migration 19.0.1.43.0 terminée: {total_migrated} champs migrés ===")
