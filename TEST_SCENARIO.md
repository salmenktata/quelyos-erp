# 🧪 Scénario de Test - Phase 1 & 2

## Test 1 : Tests Unitaires Vitest ✅

### Lancer les tests
```bash
cd dashboard-client
pnpm test --run
```

**Résultat attendu** :
```
✓ src/lib/health.test.ts (9 tests)
✓ src/lib/logger.test.ts (11 tests)
✓ src/lib/stock/tree-utils.test.ts (12 tests)

Test Files  3 passed (3)
Tests  32 passed (32)
```

---

## Test 2 : Pre-commit Hook (console.log bloqué) 🚫

### Créer un fichier avec console.log interdit
```bash
# Créer un fichier temporaire avec console.log
cat > dashboard-client/src/test-precommit.ts << 'EOF'
export function testFunction() {
  console.log('This should be blocked');
  return true;
}
EOF

# Ajouter et tenter de commiter
git add dashboard-client/src/test-precommit.ts
git commit -m "test: vérification pre-commit hook"
```

**Résultat attendu** :
```
✗ Console.log trouvé dans: dashboard-client/src/test-precommit.ts
  3:  console.log('This should be blocked');

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 1 fichier(s) contiennent des console.log non autorisés
💡 Utiliser 'logger' de @/lib/logger à la place
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Le commit doit être BLOQUÉ** ❌

---

## Test 3 : Pre-commit Hook (logger autorisé) ✅

### Corriger avec logger
```bash
# Remplacer par logger
cat > dashboard-client/src/test-precommit.ts << 'EOF'
import { logger } from '@/lib/logger';

export function testFunction() {
  logger.debug('This is allowed');
  return true;
}
EOF

# Re-commiter
git add dashboard-client/src/test-precommit.ts
git commit -m "test: vérification pre-commit hook avec logger"
```

**Résultat attendu** :
```
✓ Aucun console.log non autorisé détecté
✓ TypeScript type-check passed
✓ ESLint passed
[main abc1234] test: vérification pre-commit hook avec logger
```

**Le commit doit PASSER** ✅

---

## Test 4 : Health Check API 🏥

### Démarrer les services (si pas déjà lancés)
```bash
./scripts/dev-start.sh all
```

### Attendre 10 secondes que les services démarrent
```bash
sleep 10
```

### Vérifier la santé
```bash
./scripts/check-health.sh
```

**Résultat attendu** :
```
🏥 Vérification santé des services...

Dashboard Backoffice (port 5175): ✓ HEALTHY
E-commerce Client (port 3001): ✓ HEALTHY
Vitrine Quelyos (port 3000): ✓ HEALTHY
```

---

## Test 5 : Logger centralisé 📝

### Vérifier qu'il n'y a plus de console.log
```bash
# Chercher dans dashboard-client (doit retourner 0)
grep -r "console\.\(log\|error\|warn\)" dashboard-client/src/ \
  --include="*.ts" --include="*.tsx" \
  --exclude="*.test.ts" \
  --exclude="logger.ts" \
  | wc -l
```

**Résultat attendu** : `0` ou très peu (uniquement dans commentaires)

---

## Test 6 : Monitoring Script 🔍

### Lancer le moniteur (Ctrl+C pour quitter après 10s)
```bash
node scripts/dev-monitor.js
```

**Résultat attendu** :
```
═══════════════════════════════════════════════════
   🔍 MONITEUR D'ERREURS - Mode Développement
═══════════════════════════════════════════════════

▶ Vitrine (Port 3000)
  Erreurs: 0
  Warnings: 0

▶ E-commerce (Port 3001)
  Erreurs: 0
  Warnings: 0

▶ Backoffice (Port 5175)
  Erreurs: 0
  Warnings: 0

─────────────────────────────────────────────────
Dernières erreurs capturées:

  ✓ Aucune erreur détectée
```

---

## Test 7 : Watch Mode Vitest 🔄

### Lancer en mode watch
```bash
cd dashboard-client
pnpm test
```

### Dans un autre terminal, modifier un fichier de test
```bash
# Ajouter un test simple
echo "
it('devrait passer automatiquement', () => {
  expect(true).toBe(true)
})
" >> dashboard-client/src/lib/logger.test.ts
```

**Résultat attendu** :
- Vitest détecte le changement
- Relance automatiquement les tests
- Affiche le nouveau test (33 tests au total)

---

## Test 8 : Health Check avec erreurs simulées 💥

### Provoquer une erreur
```bash
# Dans la console du navigateur (http://localhost:5175)
# Ouvrir DevTools (F12) et exécuter :
import { logError } from '/src/lib/health';
for(let i=0; i<12; i++) logError('Test error ' + i);
```

### Vérifier le health check
```bash
curl -s http://localhost:5175/api/health | jq
```

**Résultat attendu** :
```json
{
  "status": "down",
  "timestamp": "2026-01-27T...",
  "uptime": 123,
  "errors": [...],
  "metrics": {
    "errorCount": 12,
    "warningCount": 0,
    "lastErrorTime": "..."
  }
}
```

Status doit être **"down"** car > 10 erreurs

---

## 🎯 Checklist Finale

Après tous les tests :

- [ ] ✅ 32 tests Vitest passent
- [ ] ❌ Pre-commit bloque console.log interdit
- [ ] ✅ Pre-commit autorise logger
- [ ] ✅ Health check retourne "healthy"
- [ ] ✅ 0 console.log non autorisés dans le code
- [ ] ✅ Moniteur affiche dashboard sans erreurs
- [ ] ✅ Watch mode relance tests automatiquement
- [ ] ✅ Health check détecte erreurs (status "down")

---

## 🧹 Nettoyage après tests

```bash
# Supprimer le fichier de test créé
git reset HEAD dashboard-client/src/test-precommit.ts
rm dashboard-client/src/test-precommit.ts

# Restaurer le fichier de test modifié
cd dashboard-client
git checkout src/lib/logger.test.ts
```
