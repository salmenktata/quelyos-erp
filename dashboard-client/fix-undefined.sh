#!/bin/bash
# Correction rapide des erreurs undefined courantes

# Pattern 1: array[0] → array[0]! (non-null assertion pour cas sûrs)
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # firstLine[0] → firstLine?.[0] || ''
  sed -i '' 's/firstLine\[0\]/firstLine?.[0] || ""/' "$file" 2>/dev/null || true
  
  # navItems[0]?.href → navItems[0]?.href || ''
  # Pas de changement nécessaire, déjà optional
done

echo "✅ Patterns courants corrigés"
