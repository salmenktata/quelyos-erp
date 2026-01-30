#!/usr/bin/env python3
"""
Migration automatique _sql_constraints → @api.constrains
Convertit toutes les contraintes SQL UNIQUE en méthodes Python Odoo 19
"""

import re
from pathlib import Path

MODELS_DIR = Path(__file__).parent.parent / 'addons' / 'quelyos_api' / 'models'


def extract_unique_fields(sql):
    """Extrait les champs d'une contrainte UNIQUE"""
    match = re.search(r'UNIQUE\s*\(([^)]+)\)', sql, re.IGNORECASE)
    if match:
        fields_str = match.group(1)
        # Nettoyer et séparer les champs
        fields = [f.strip() for f in fields_str.split(',')]
        return fields
    return []


def generate_constraint_method(name, sql, message, fields):
    """Génère une méthode de contrainte Python"""
    method_name = f'_check_{name}'
    fields_str = ', '.join(f"'{f}'" for f in fields)

    # Construire la condition de recherche
    domain_parts = [f"('{f}', '=', record.{f})" for f in fields]
    domain_str = ',\n                '.join(domain_parts)

    method = f'''
    @api.constrains({fields_str})
    def {method_name}(self):
        """Contrainte: {message}"""
        for record in self:
            # Chercher un doublon
            duplicate = self.search([
                {domain_str},
                ('id', '!=', record.id)
            ], limit=1)

            if duplicate:
                raise ValidationError(_('{message}'))
'''
    return method


def migrate_file(file_path):
    """Migre un fichier Python"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Vérifier si _sql_constraints existe
    if '_sql_constraints' not in content:
        return False

    # Extraire les contraintes
    pattern = r'_sql_constraints\s*=\s*\[(.*?)\]'
    match = re.search(pattern, content, re.DOTALL)

    if not match:
        return False

    constraints_text = match.group(1)
    constraint_pattern = r"\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)"
    constraints = re.findall(constraint_pattern, constraints_text, re.DOTALL)

    if not constraints:
        # Essayer avec double quotes
        constraint_pattern = r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)'
        constraints = re.findall(constraint_pattern, constraints_text, re.DOTALL)

    if not constraints:
        print(f"  ⚠️  Impossible de parser les contraintes, skip")
        return False

    print(f"📝 {file_path.name}")
    print(f"  → {len(constraints)} contrainte(s) trouvée(s)")

    # Ajouter les imports si nécessaires
    new_content = content

    if 'from odoo.exceptions import ValidationError' not in new_content:
        # Ajouter après les imports odoo
        new_content = new_content.replace(
            'from odoo import',
            'from odoo import',
            1
        )
        # Trouver la ligne d'import odoo et ajouter après
        import_match = re.search(r'(from odoo import[^\n]+\n)', new_content)
        if import_match:
            insert_pos = import_match.end()
            new_content = (
                new_content[:insert_pos] +
                'from odoo.exceptions import ValidationError\n' +
                new_content[insert_pos:]
            )

    if 'from odoo.tools.translate import _' not in new_content:
        import_match = re.search(r'(from odoo\.exceptions import[^\n]+\n)', new_content)
        if import_match:
            insert_pos = import_match.end()
            new_content = (
                new_content[:insert_pos] +
                'from odoo.tools.translate import _\n' +
                new_content[insert_pos:]
            )

    # Générer les méthodes de contrainte
    methods = []
    for name, sql, message in constraints:
        if 'UNIQUE' in sql.upper():
            fields = extract_unique_fields(sql)
            if fields:
                method = generate_constraint_method(name, sql, message, fields)
                methods.append(method)
                print(f"    ✓ {name}: {', '.join(fields)}")
        else:
            print(f"    ⚠️  {name}: Non-UNIQUE, à migrer manuellement")

    if not methods:
        print(f"  ⚠️  Aucune contrainte UNIQUE à migrer")
        return False

    # Supprimer _sql_constraints
    new_content = re.sub(
        r'\s*_sql_constraints\s*=\s*\[.*?\]\s*\n',
        '\n',
        new_content,
        flags=re.DOTALL
    )

    # Trouver où insérer les méthodes (à la fin de la classe, avant la prochaine classe ou EOF)
    # On les insère juste après la définition des champs
    class_match = re.search(r'(class \w+\(models\.Model\):.*?)((?=\n    @api\.model)|(?=\n    def )|(?=\nclass )|$)', new_content, re.DOTALL)

    if class_match:
        class_content = class_match.group(1)
        rest = class_match.group(2)

        # Insérer les méthodes
        new_class_content = class_content.rstrip() + '\n' + '\n'.join(methods) + '\n'
        new_content = new_content.replace(class_match.group(0), new_class_content + rest)

    # Écrire le fichier
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ Migré avec succès\n")
    return True


def main():
    """Fonction principale"""
    print("🔧 Migration automatique _sql_constraints → @api.constrains")
    print("="*60)
    print()

    # Lister les fichiers
    py_files = [f for f in MODELS_DIR.glob('*.py') if f.name != '__init__.py']

    # Filtrer ceux déjà migrés
    py_files_with_constraints = []
    for f in py_files:
        content = f.read_text()
        if '_sql_constraints' in content:
            py_files_with_constraints.append(f)

    print(f"Fichiers à migrer: {len(py_files_with_constraints)}")
    print()

    migrated = 0
    skipped = 0

    for file_path in sorted(py_files_with_constraints):
        try:
            if migrate_file(file_path):
                migrated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"❌ {file_path.name}: Erreur - {e}\n")
            skipped += 1

    print("="*60)
    print(f"✅ Migration terminée!")
    print(f"   Fichiers migrés: {migrated}")
    print(f"   Fichiers skipped: {skipped}")
    print()
    print("📋 Prochaines étapes:")
    print("   1. Vérifier les modifications: git diff")
    print("   2. Tester: /upgrade-odoo")
    print("   3. Vérifier que les warnings ont disparu")


if __name__ == '__main__':
    main()
