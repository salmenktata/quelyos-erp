# -*- coding: utf-8 -*-
"""
Migration 19.0.1.2.0 : Ajout préfixe x_ aux champs maintenance.equipment (10 champs)
"""

import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """Migration progressive avec renommage colonnes SQL"""
    _logger.info("=== Migration maintenance.equipment : Préfixe x_ (10 champs) ===")

    fields_to_migrate = [
        ('mtbf_hours', 'x_mtbf_hours'),
        ('mttr_hours', 'x_mttr_hours'),
        ('uptime_percentage', 'x_uptime_percentage'),
        ('is_critical', 'x_is_critical'),
        ('serial_number', 'x_serial_number'),
        ('purchase_date', 'x_purchase_date'),
        ('warranty_end_date', 'x_warranty_end_date'),
        ('next_preventive_date', 'x_next_preventive_date'),
        ('failure_count', 'x_failure_count'),
        ('last_failure_date', 'x_last_failure_date'),
    ]

    for old_name, new_name in fields_to_migrate:
        cr.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='maintenance_equipment' 
            AND column_name=%s
        """, (new_name,))

        if cr.fetchone():
            _logger.info(f"Colonne {new_name} existe déjà, skip")
            continue

        cr.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='maintenance_equipment' 
            AND column_name=%s
        """, (old_name,))

        if not cr.fetchone():
            _logger.warning(f"Colonne {old_name} n'existe pas, skip")
            continue

        _logger.info(f"Migration {old_name} → {new_name}")
        cr.execute(f"""
            ALTER TABLE maintenance_equipment 
            RENAME COLUMN {old_name} TO {new_name}
        """)

        cr.execute("""
            UPDATE ir_model_fields 
            SET name=%s 
            WHERE model='maintenance.equipment' 
            AND name=%s
        """, (new_name, old_name))

    _logger.info("=== Migration terminée avec succès (10 champs) ===")
