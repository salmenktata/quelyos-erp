#!/bin/bash
# Script de correction automatique des erreurs JSX dans les pages settings
# Ajoute les balises </div> manquantes avant </Layout>

set -e  # Exit on error

echo "🔧 Correction automatique des erreurs JSX - Pages Settings"
echo "============================================================"

# Liste des fichiers à corriger
FILES=(
  # Stock Settings
  "src/pages/stock/settings/alerts/page.tsx"
  "src/pages/stock/settings/page.tsx"
  "src/pages/stock/settings/reordering/page.tsx"
  "src/pages/stock/settings/units/page.tsx"
  "src/pages/stock/settings/valuation/page.tsx"

  # Store Settings
  "src/pages/store/settings/brand/page.tsx"
  "src/pages/store/settings/contact/page.tsx"
  "src/pages/store/settings/features/page.tsx"
  "src/pages/store/settings/payment-methods/page.tsx"
  "src/pages/store/settings/returns/page.tsx"

  # Finance Settings
  "src/pages/finance/settings/notifications/page.tsx"
  "src/pages/finance/settings/security/page.tsx"

  # CRM Settings
  "src/pages/crm/settings/categories/page.tsx"
  "src/pages/crm/settings/page.tsx"
  "src/pages/crm/settings/pricelists/page.tsx"
  "src/pages/crm/settings/scoring/page.tsx"
  "src/pages/crm/settings/stages/page.tsx"

  # Marketing Settings
  "src/pages/marketing/settings/email/page.tsx"
  "src/pages/marketing/settings/page.tsx"
  "src/pages/marketing/settings/sms/page.tsx"
)

FIXED_COUNT=0
SKIPPED_COUNT=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Fichier non trouvé : $file"
    ((SKIPPED_COUNT++))
    continue
  fi

  # Vérifier si le fichier a déjà la structure correcte
  if grep -q "^    </div>$" "$file" && grep -q "^    </Layout>$" "$file"; then
    # Compter les </div> avant </Layout>
    LAST_DIV_LINE=$(grep -n "^    </div>$" "$file" | tail -1 | cut -d: -f1)
    LAYOUT_LINE=$(grep -n "^    </Layout>$" "$file" | tail -1 | cut -d: -f1)

    if [ "$LAST_DIV_LINE" -lt "$LAYOUT_LINE" ]; then
      # La div est bien avant Layout, vérifier s'il en manque une
      DIV_COUNT=$(grep -c "^    </div>$" "$file" || echo "0")

      # Si une seule </div> avant </Layout>, il en manque probablement une
      if [ "$DIV_COUNT" -eq 1 ]; then
        echo "🔨 Correction : $file"
        # Ajouter </div> juste avant </Layout>
        sed -i.bak '/^    <\/Layout>$/i\    <\/div>' "$file"
        rm "$file.bak"
        ((FIXED_COUNT++))
      else
        echo "✅ Déjà correct : $file"
        ((SKIPPED_COUNT++))
      fi
    else
      echo "✅ Déjà correct : $file"
      ((SKIPPED_COUNT++))
    fi
  else
    echo "⚠️  Structure inattendue : $file"
    ((SKIPPED_COUNT++))
  fi
done

echo ""
echo "============================================================"
echo "✅ Correction terminée !"
echo "   - Fichiers corrigés : $FIXED_COUNT"
echo "   - Fichiers ignorés : $SKIPPED_COUNT"
echo ""
echo "🧪 Vérification TypeScript..."
pnpm type-check 2>&1 | head -20
