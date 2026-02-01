#!/usr/bin/env python3
"""
Script robuste de correction automatique JSX pour pages settings.
Analyse la structure et corrige les incohérences.
"""

import re
from pathlib import Path

def analyze_and_fix_file(filepath: Path) -> bool:
    """Analyse et corrige un fichier settings."""
    if not filepath.exists():
        print(f"⚠️  Fichier non trouvé : {filepath}")
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    # Vérifier si Layout est importé
    has_layout_import = "from '@/components/Layout'" in content or 'from "@/components/Layout"' in content

    if not has_layout_import:
        print(f"ℹ️  Pas d'import Layout : {filepath.name}")
        return False

    # Chercher le return statement principal
    return_idx = None
    for i, line in enumerate(lines):
        if re.match(r'\s*return\s*\(', line) and i > 50:  # return principal (pas dans loading)
            return_idx = i
            break

    if return_idx is None:
        print(f"⚠️  Pas de return trouvé : {filepath.name}")
        return False

    # Analyser l'ouverture (ligne après return)
    open_line_idx = return_idx + 1
    open_line = lines[open_line_idx].strip()

    # Analyser la fermeture (avant-dernière ou 3ème avant dernière ligne)
    close_line_idx = len(lines) - 3  # Typiquement  );  }
    while close_line_idx > 0 and lines[close_line_idx].strip() in ['', '}', '};']:
        close_line_idx -= 1

    close_line = lines[close_line_idx].strip()

    # Détecter incohérence
    has_fragment_open = open_line == '<>'
    has_layout_open = '<Layout' in open_line
    has_fragment_close = close_line == '</>'
    has_layout_close = '</Layout>' in close_line

    modified = False

    # Corriger incohérence ouverture/fermeture
    if has_fragment_open and has_layout_close:
        # Remplacer <> par <Layout>
        lines[open_line_idx] = lines[open_line_idx].replace('<>', '<Layout>')
        modified = True
        print(f"🔧 {filepath.name}: <> → <Layout>")

    elif has_layout_open and has_fragment_close:
        # Remplacer </> par </Layout>
        lines[close_line_idx] = lines[close_line_idx].replace('</>', '</Layout>')
        modified = True
        print(f"🔧 {filepath.name}: </> → </Layout>")

    # Vérifier et ajouter </div> manquante si nécessaire
    # Compter les <div> et </div> entre return et fin
    div_open_count = 0
    div_close_count = 0
    for i in range(return_idx, len(lines)):
        div_open_count += lines[i].count('<div')
        div_close_count += lines[i].count('</div>')

    if div_open_count > div_close_count:
        missing_divs = div_open_count - div_close_count
        # Ajouter les </div> manquantes avant </Layout>
        layout_close_idx = None
        for i in range(len(lines) - 1, return_idx, -1):
            if '</Layout>' in lines[i]:
                layout_close_idx = i
                break

        if layout_close_idx:
            indent = '    '  # 4 espaces
            for _ in range(missing_divs):
                lines.insert(layout_close_idx, indent + '</div>')
            modified = True
            print(f"🔧 {filepath.name}: Ajout {missing_divs} </div> manquantes")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        return True

    print(f"✅ Déjà correct : {filepath.name}")
    return False

def main():
    print("🔧 Correction Automatique JSX - Pages Settings")
    print("=" * 60)

    base_dir = Path(__file__).parent / "dashboard-client"

    # Scanner tous les fichiers settings
    settings_files = []
    for module in ['finance', 'stock', 'store', 'crm', 'marketing']:
        settings_dir = base_dir / "src" / "pages" / module / "settings"
        if settings_dir.exists():
            settings_files.extend(settings_dir.rglob("page.tsx"))

    print(f"📁 {len(settings_files)} fichiers settings trouvés\n")

    fixed_count = 0
    for filepath in sorted(settings_files):
        if analyze_and_fix_file(filepath):
            fixed_count += 1

    print()
    print("=" * 60)
    print(f"✅ Terminé ! {fixed_count}/{len(settings_files)} fichiers corrigés")

    return 0

if __name__ == "__main__":
    main()
