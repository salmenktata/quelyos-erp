#!/usr/bin/env python3
"""
Script de correction automatique des erreurs JSX dans les pages settings.
Ajoute les balises </div> manquantes avant </Layout>.
"""

import os
import sys
from pathlib import Path

# Liste des fichiers à corriger
FILES = [
    # Stock Settings
    "src/pages/stock/settings/alerts/page.tsx",
    "src/pages/stock/settings/page.tsx",
    "src/pages/stock/settings/reordering/page.tsx",
    "src/pages/stock/settings/units/page.tsx",
    "src/pages/stock/settings/valuation/page.tsx",

    # Store Settings
    "src/pages/store/settings/brand/page.tsx",
    "src/pages/store/settings/contact/page.tsx",
    "src/pages/store/settings/features/page.tsx",
    "src/pages/store/settings/payment-methods/page.tsx",
    "src/pages/store/settings/returns/page.tsx",

    # Finance Settings
    "src/pages/finance/settings/notifications/page.tsx",
    "src/pages/finance/settings/security/page.tsx",

    # CRM Settings
    "src/pages/crm/settings/categories/page.tsx",
    "src/pages/crm/settings/page.tsx",
    "src/pages/crm/settings/pricelists/page.tsx",
    "src/pages/crm/settings/scoring/page.tsx",
    "src/pages/crm/settings/stages/page.tsx",

    # Marketing Settings
    "src/pages/marketing/settings/email/page.tsx",
    "src/pages/marketing/settings/page.tsx",
    "src/pages/marketing/settings/sms/page.tsx",
]

def fix_jsx_closing_tags(filepath: Path) -> bool:
    """
    Ajoute </div> manquante avant </Layout> si nécessaire.
    Retourne True si le fichier a été modifié.
    """
    if not filepath.exists():
        print(f"⚠️  Fichier non trouvé : {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Trouver la dernière occurrence de </Layout>
    layout_index = None
    for i in range(len(lines) - 1, -1, -1):
        if '</Layout>' in lines[i]:
            layout_index = i
            break

    if layout_index is None:
        print(f"⚠️  Pas de </Layout> trouvé : {filepath.name}")
        return False

    # Vérifier combien de </div> il y a avant </Layout>
    div_before_layout = 0
    for i in range(layout_index - 1, max(0, layout_index - 5), -1):
        if '</div>' in lines[i]:
            div_before_layout += 1

    # Si aucune </div> juste avant </Layout>, en ajouter une
    if div_before_layout == 0:
        # Obtenir l'indentation de </Layout>
        layout_indent = len(lines[layout_index]) - len(lines[layout_index].lstrip())
        # Ajouter </div> avec la même indentation
        new_line = ' ' * layout_indent + '</div>\n'
        lines.insert(layout_index, new_line)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        print(f"🔨 Corrigé : {filepath.name}")
        return True
    else:
        print(f"✅ Déjà correct : {filepath.name}")
        return False

def main():
    print("🔧 Correction automatique des erreurs JSX - Pages Settings")
    print("=" * 60)

    base_dir = Path(__file__).parent.parent
    fixed_count = 0
    skipped_count = 0

    for file_path in FILES:
        full_path = base_dir / file_path
        if fix_jsx_closing_tags(full_path):
            fixed_count += 1
        else:
            skipped_count += 1

    print()
    print("=" * 60)
    print(f"✅ Correction terminée !")
    print(f"   - Fichiers corrigés : {fixed_count}")
    print(f"   - Fichiers ignorés : {skipped_count}")

    if fixed_count > 0:
        print()
        print("💡 Prochaines étapes :")
        print("   1. Vérifier : pnpm type-check")
        print("   2. Commit : git add . && git commit -m 'fix(ui): correction JSX pages settings'")
        print("   3. Push : git push")

    return 0 if fixed_count > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
