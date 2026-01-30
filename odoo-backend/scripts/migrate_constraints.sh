#!/bin/bash
# Migration progressive des contraintes SQL → Python
# Pour éviter les warnings Odoo 19

MODELS_DIR="$(dirname "$0")/../addons/quelyos_api/models"

echo "🔧 Migration _sql_constraints → @api.constrains"
echo ""

# Fonction pour traiter un fichier
migrate_file() {
    local file="$1"
    local basename=$(basename "$file")

    # Vérifier si le fichier a _sql_constraints
    if ! grep -q "_sql_constraints" "$file"; then
        return
    fi

    echo "📝 $basename"

    # Extraire les contraintes
    python3 <<EOF
import re

with open('$file', 'r') as f:
    content = f.read()

# Trouver _sql_constraints
pattern = r"_sql_constraints\s*=\s*\[(.*?)\]"
match = re.search(pattern, content, re.DOTALL)

if not match:
    exit(0)

constraints_text = match.group(1)
constraint_pattern = r"\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)"
constraints = re.findall(constraint_pattern, constraints_text)

for name, sql, message in constraints:
    print(f"  → {name}: {sql[:40]}...")

print(f"  ✓ {len(constraints)} contrainte(s)")
EOF

}

# Lister les fichiers concernés
echo "Analyse des fichiers..."
echo ""

for file in "$MODELS_DIR"/*.py; do
    [[ $(basename "$file") == "__init__.py" ]] && continue
    migrate_file "$file"
done

echo ""
echo "⚠️  IMPORTANT:"
echo "   Les contraintes _sql_constraints fonctionnent toujours en Odoo 19"
echo "   Les warnings sont informatifs mais non-bloquants"
echo ""
echo "📋 Options:"
echo "   1. Garder tel quel (fonctionnel, warnings mineurs)"
echo "   2. Migration manuelle progressive (recommandé)"
echo "   3. Ignorer les warnings (acceptable en production)"
