#!/usr/bin/env python3
"""Migre les contraintes CHECK restantes"""

import re
from pathlib import Path

MODELS_DIR = Path(__file__).parent.parent / 'addons' / 'quelyos_api' / 'models'

# Contraintes CHECK à migrer
CHECK_CONSTRAINTS = {
    'product_review.py': {
        'rating_range': ('rating', 'rating >= 1 and rating <= 5', 'La note doit être entre 1 et 5'),
    },
    'stock_reservation.py': {
        'reserved_qty_positive': ('reserved_qty', 'reserved_qty > 0', 'La quantité réservée doit être positive'),
    },
    'stock_scrap.py': {
        'scrap_qty_positive': ('scrap_qty', 'scrap_qty > 0', 'La quantité doit être positive'),
    },
    'testimonial.py': {
        'rating_range': ('rating', 'rating >= 1 and rating <= 5', 'La note doit être entre 1 et 5'),
    },
}


def migrate_check_constraint(file_path, constraint_name, field, condition, message):
    """Migre une contrainte CHECK"""
    with open(file_path, 'r') as f:
        content = f.read()

    # Vérifier si déjà migré
    if f'_check_{constraint_name}' in content:
        print(f"  ⚠️  Déjà migré")
        return False

    # Supprimer la contrainte CHECK de _sql_constraints
    pattern = rf"\(\s*'{constraint_name}'\s*,\s*'CHECK\([^)]+\)'\s*,\s*'[^']+'\s*\),?\s*\n"
    new_content = re.sub(pattern, '', content, flags=re.IGNORECASE)

    # Si _sql_constraints devient vide, le supprimer entièrement
    if re.search(r'_sql_constraints\s*=\s*\[\s*\]', new_content):
        new_content = re.sub(r'\s*_sql_constraints\s*=\s*\[\s*\]\s*\n', '\n', new_content)

    # Ajouter les imports si nécessaires
    if 'from odoo.exceptions import ValidationError' not in new_content:
        import_match = re.search(r'(from odoo import[^\n]+\n)', new_content)
        if import_match:
            pos = import_match.end()
            new_content = new_content[:pos] + 'from odoo.exceptions import ValidationError\n' + new_content[pos:]

    if 'from odoo.tools.translate import _' not in new_content:
        import_match = re.search(r'(from odoo\.exceptions import[^\n]+\n)', new_content)
        if import_match:
            pos = import_match.end()
            new_content = new_content[:pos] + 'from odoo.tools.translate import _\n' + new_content[pos:]

    # Générer la méthode
    method = f'''
    @api.constrains('{field}')
    def _check_{constraint_name}(self):
        """Contrainte: {message}"""
        for record in self:
            if not ({condition}):
                raise ValidationError(_('{message}'))
'''

    # Insérer la méthode
    class_match = re.search(r'(class \w+\(models\.Model\):.*?)((?=\n    @api\.model)|(?=\n    def )|(?=\nclass )|$)', new_content, re.DOTALL)
    if class_match:
        class_content = class_match.group(1)
        rest = class_match.group(2)
        new_class_content = class_content.rstrip() + '\n' + method + '\n'
        new_content = new_content.replace(class_match.group(0), new_class_content + rest)

    with open(file_path, 'w') as f:
        f.write(new_content)

    return True


def main():
    print("🔧 Migration contraintes CHECK\n")

    migrated = 0
    for filename, constraints in CHECK_CONSTRAINTS.items():
        file_path = MODELS_DIR / filename
        if not file_path.exists():
            print(f"⚠️  {filename}: Fichier non trouvé")
            continue

        print(f"📝 {filename}")
        for name, (field, condition, message) in constraints.items():
            print(f"  → {name}: {field}")
            if migrate_check_constraint(file_path, name, field, condition, message):
                print(f"    ✅ Migré")
                migrated += 1

        print()

    print(f"✅ {migrated} contrainte(s) CHECK migrée(s)")


if __name__ == '__main__':
    main()
