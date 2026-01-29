# Commande /autofix - Correction Automatique ESLint/Prettier

## Description

Commande pour corriger automatiquement les erreurs et warnings ESLint/Prettier dans les projets frontend (vitrine-client, vitrine-quelyos, dashboard-client). Applique les corrections auto-fixables et propose des solutions pour les erreurs complexes.

## Usage

```bash
/autofix                    # Auto-fix tous les projets frontend
/autofix vitrine-client     # Auto-fix uniquement vitrine-client
/autofix dashboard-client   # Auto-fix uniquement dashboard-client
/autofix vitrine-quelyos    # Auto-fix uniquement vitrine-quelyos
```

**Exemples** :
- `/autofix` - Corrige tous les projets
- `/autofix vitrine-client` - Corrige seulement le projet vitrine-client
- `/autofix --dry-run` - Affiche les corrections sans les appliquer

---

## Workflow de la commande

### Étape 1 : Analyse Pré-Correction

**1.1. Identifier le(s) projet(s) cible(s)**

Si aucun projet spécifié → détecter automatiquement les projets avec erreurs :

```bash
# Vérifier chaque projet
cd vitrine-client && pnpm eslint src/ --format=json > /tmp/vitrine-client-eslint.json
cd dashboard-client && pnpm eslint src/ --format=json > /tmp/dashboard-client-eslint.json
cd vitrine-quelyos && pnpm eslint src/ --format=json > /tmp/vitrine-quelyos-eslint.json
```

**1.2. Analyser la distribution des problèmes**

Pour chaque projet, grouper par type de règle :

```python
import json
from collections import defaultdict

with open('/tmp/vitrine-client-eslint.json') as f:
    data = json.load(f)

by_rule = defaultdict(lambda: {'errors': 0, 'warnings': 0, 'examples': []})

for file in data:
    for msg in file['messages']:
        rule = msg['ruleId']
        severity = 'errors' if msg['severity'] == 2 else 'warnings'
        by_rule[rule][severity] += 1

        if len(by_rule[rule]['examples']) < 3:
            by_rule[rule]['examples'].append({
                'file': file['filePath'],
                'line': msg['line'],
                'message': msg['message']
            })
```

**Afficher rapport :**

```
📊 Analyse ESLint - vitrine-client

Erreurs (57) :
  @typescript-eslint/no-unused-vars: 40 erreurs
    → src/components/Button.tsx:15
    → src/hooks/useAuth.ts:22

  react/no-unescaped-entities: 12 erreurs
    → src/pages/About.tsx:45

  @next/next/no-html-link-for-pages: 5 erreurs
    → src/components/Header.tsx:78

Warnings (195) :
  @typescript-eslint/no-explicit-any: 98 warnings
  react-hooks/exhaustive-deps: 45 warnings
  ...
```

---

### Étape 2 : Stratégie de Correction

**2.1. Classifier les corrections possibles**

| Catégorie | Règles | Auto-fixable | Stratégie |
|-----------|--------|--------------|-----------|
| **Niveau 1 - Auto-fix natif** | `react/no-unescaped-entities`, `react-hooks/exhaustive-deps` | ✅ | `eslint --fix` |
| **Niveau 2 - Correction simple** | `@typescript-eslint/no-unused-vars` | ⚠️ | Préfixer par `_` |
| **Niveau 3 - Correction manuelle** | `@next/next/no-html-link-for-pages` | ❌ | Remplacer `<a>` par `<Link>` |
| **Niveau 4 - Typage progressif** | `@typescript-eslint/no-explicit-any` | ❌ | Ignorer ou typer progressivement |

**2.2. Demander confirmation stratégie**

```typescript
AskUserQuestion({
  questions: [{
    question: "Quelle stratégie de correction souhaitez-vous ?",
    header: "Stratégie",
    multiSelect: false,
    options: [
      {
        label: "Corrections sûres uniquement (Recommandé)",
        description: "Auto-fix + variables non utilisées. Pas de typage."
      },
      {
        label: "Corrections maximales",
        description: "Tout corriger sauf les 'any' TypeScript"
      },
      {
        label: "Tout corriger (⚠️ Risqué)",
        description: "Inclut typage progressif des 'any'"
      }
    ]
  }]
})
```

---

### Étape 3 : Application des Corrections

#### **3.1. Niveau 1 : ESLint --fix natif**

```bash
cd vitrine-client
pnpm eslint src/ --fix
```

**Règles auto-fixées :**
- `react/no-unescaped-entities` : `'` → `&apos;`
- `react/jsx-curly-brace-presence` : `{"string"}` → `"string"`
- `react-hooks/exhaustive-deps` : Ajoute deps manquantes
- `@typescript-eslint/no-extra-semi` : Supprime `;` superflus
- `prettier/*` : Formatage

---

#### **3.2. Niveau 2 : Variables non utilisées**

**Script de correction automatique :**

```bash
#!/bin/bash

# Corriger catch (error) → catch (_error)
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/} catch (error: unknown) {/} catch (_error: unknown) {/g' "$file"
  sed -i '' 's/} catch (error: any) {/} catch (_error: any) {/g' "$file"
  sed -i '' 's/} catch (error) {/} catch (_error) {/g' "$file"
done

# Corriger imports non utilisés
# import { Foo } from 'bar' → import { Foo as _Foo } from 'bar'
# (Nécessite analyse AST - utiliser eslint-plugin-unused-imports)
pnpm eslint src/ --fix --rule 'unused-imports/no-unused-imports: error'
```

---

#### **3.3. Niveau 3 : Corrections manuelles ciblées**

**Exemple : Remplacer `<a>` par `<Link>`**

```typescript
import { Project } from 'ts-morph';

const project = new Project();
const sourceFile = project.addSourceFileAtPath('src/components/Header.tsx');

// Trouver tous les <a href="/...">
sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement).forEach(element => {
  const openingTag = element.getOpeningElement();
  if (openingTag.getTagNameNode().getText() === 'a') {
    const href = openingTag.getAttribute('href');
    if (href?.getText().includes('/')) {
      // Remplacer par Link
      openingTag.getTagNameNode().replaceWithText('Link');
      element.getClosingElement()?.getTagNameNode().replaceWithText('Link');

      // Ajouter import si manquant
      const hasLinkImport = sourceFile.getImportDeclarations()
        .some(imp => imp.getModuleSpecifierValue() === 'next/link');

      if (!hasLinkImport) {
        sourceFile.addImportDeclaration({
          defaultImport: 'Link',
          moduleSpecifier: 'next/link'
        });
      }
    }
  }
});

sourceFile.saveSync();
```

**Règles corrigées manuellement :**
- `@next/next/no-html-link-for-pages` : `<a>` → `<Link>`
- `react-hooks/purity` : Déplacer `Date.now()` dans `useState(() => ...)`
- `react-hooks/immutability` : Corriger mutations d'état

---

#### **3.4. Niveau 4 : Typage progressif (optionnel)**

**Seulement si "Tout corriger" sélectionné**

Créer types progressivement pour remplacer `any` :

```typescript
// Avant
function fetchData(params: any): any {
  return axios.get('/api', { params });
}

// Après
interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
  };
}

async function fetchData(params: FetchParams): Promise<ApiResponse<unknown>> {
  const response = await axios.get('/api', { params });
  return response.data;
}
```

**⚠️ Attention** : Nécessite tests manuels car peut casser la compilation TypeScript.

---

### Étape 4 : Vérification Post-Correction

**4.1. Relancer ESLint**

```bash
pnpm eslint src/ --format=json > /tmp/post-fix-eslint.json
```

**4.2. Comparer avant/après**

```python
# Comparer les résultats
before = count_issues('/tmp/vitrine-client-eslint.json')
after = count_issues('/tmp/post-fix-eslint.json')

print(f"""
✅ Résultats Auto-Fix

Avant :
  Erreurs : {before['errors']}
  Warnings : {before['warnings']}

Après :
  Erreurs : {after['errors']} ({before['errors'] - after['errors']} corrigées ✓)
  Warnings : {after['warnings']} ({before['warnings'] - after['warnings']} corrigées ✓)

Restant :
  Erreurs : {after['errors']}
  Warnings : {after['warnings']}
""")
```

**4.3. Afficher problèmes restants**

Si des erreurs/warnings persistent :

```
⚠️ Problèmes restants nécessitant correction manuelle :

react-hooks/purity (2 erreurs) :
  → src/components/Timer.tsx:15 - Cannot call Date.now() during render
    Solution : Déplacer dans useState(() => Date.now())

  → src/hooks/useRandom.tsx:8 - Cannot call Math.random() during render
    Solution : Utiliser useMemo(() => Math.random(), [])

@typescript-eslint/no-explicit-any (45 warnings) :
  → src/lib/api.ts:23 - Parameter 'data' implicitly has 'any' type
    Solution : Ajouter type explicite

Voulez-vous que je corrige ces problèmes ? (y/N)
```

---

### Étape 5 : Commit des Corrections

**5.1. Afficher diff des corrections**

```bash
git diff --stat
```

**5.2. Demander confirmation commit**

```typescript
AskUserQuestion({
  questions: [{
    question: "Commiter les corrections automatiques ?",
    header: "Commit",
    multiSelect: false,
    options: [
      {
        label: "Oui, commiter (Recommandé)",
        description: `Commit : chore: auto-fix ESLint (${fixed_count} corrections)`
      },
      {
        label: "Revoir les changements d'abord",
        description: "Afficher le diff détaillé avant de décider"
      },
      {
        label: "Annuler les corrections",
        description: "Revenir à l'état initial (git restore)"
      }
    ]
  }]
})
```

**5.3. Créer commit**

```bash
git add src/
git commit -m "$(cat <<'EOF'
chore: auto-fix ESLint/Prettier

- Auto-fix natif : apostrophes, formatage, deps
- Variables non utilisées : préfixe _error dans catch blocks
- Corrections manuelles : <a> → <Link> (5 fichiers)
- Résultat : 57 erreurs → 0 erreur, 195 warnings → 98 warnings

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Corrections Courantes

### **1. Variables non utilisées**

```typescript
// ❌ Avant
catch (error) { ... }
const { data, loading } = useQuery();  // loading non utilisé

// ✅ Après
catch (_error) { ... }
const { data, loading: _loading } = useQuery();
```

---

### **2. Apostrophes non échappées (JSX)**

```tsx
// ❌ Avant
<p>L'utilisateur n'a pas de compte</p>

// ✅ Après (auto-fix ESLint)
<p>L&apos;utilisateur n&apos;a pas de compte</p>

// ✅ Alternative (template string)
<p>{`L'utilisateur n'a pas de compte`}</p>
```

---

### **3. useEffect dependencies**

```typescript
// ❌ Avant
useEffect(() => {
  fetchData();
}, []);  // fetchData manquant

// ✅ Après (auto-fix)
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Alternative (useCallback)
const fetchData = useCallback(() => { ... }, []);
useEffect(() => {
  fetchData();
}, [fetchData]);
```

---

### **4. Liens Next.js**

```tsx
// ❌ Avant
<a href="/products">Produits</a>

// ✅ Après
import Link from 'next/link';

<Link href="/products">Produits</Link>
```

---

### **5. Fonctions impures dans render**

```tsx
// ❌ Avant
function Component() {
  return <div>ID: {Math.random()}</div>;
}

// ✅ Après
function Component() {
  const [id] = useState(() => Math.random());
  return <div>ID: {id}</div>;
}
```

---

## Options Avancées

### **--dry-run** : Aperçu sans modification

```bash
/autofix --dry-run
```

Affiche les corrections qui seraient appliquées sans modifier les fichiers.

---

### **--fix-level** : Contrôle granulaire

```bash
/autofix --fix-level=safe       # Niveau 1+2 uniquement
/autofix --fix-level=aggressive # Niveau 1+2+3
/autofix --fix-level=all        # Tout (inclut typage)
```

---

### **--skip-commit** : Pas de commit automatique

```bash
/autofix --skip-commit
```

Applique les corrections mais ne crée pas de commit.

---

## Intégration CI/CD

**Script pré-commit automatique :**

```bash
#!/bin/bash
# .husky/pre-commit

# Auto-fix avant commit
pnpm autofix --fix-level=safe --skip-commit

# Vérifier si corrections réussies
if ! pnpm eslint src/ --max-warnings=100; then
  echo "❌ ESLint errors detected after auto-fix"
  echo "Run: /autofix --fix-level=aggressive"
  exit 1
fi
```

---

## Exemples d'Utilisation

### Exemple 1 : Correction Rapide Avant Commit

```bash
$ /autofix

📊 Analyse : 57 erreurs, 195 warnings

Stratégie ?
→ Corrections sûres uniquement

⏳ Application corrections...
  ✅ Auto-fix ESLint : 12 corrections
  ✅ Variables non utilisées : 40 corrections
  ✅ Apostrophes JSX : 5 corrections

✅ Résultat : 0 erreur, 98 warnings

Commiter ?
→ Oui

✅ Commit créé : chore: auto-fix ESLint (57 corrections)
```

---

### Exemple 2 : Corrections Maximales

```bash
$ /autofix vitrine-client --fix-level=aggressive

📊 Analyse vitrine-client : 20 erreurs

⏳ Corrections niveau 1-3...
  ✅ <a> → <Link> : 5 fichiers
  ✅ Date.now() → useState : 2 fichiers

✅ Résultat : 0 erreur, 45 warnings

⚠️ Warnings restants (@typescript-eslint/no-explicit-any) :
  Nécessitent typage manuel progressif
```

---

## Objectif

Automatiser les corrections ESLint/Prettier :
- 🚀 **Gain de temps** : Corrections en 1 commande
- ✅ **Qualité code** : Respecte les standards du projet
- 🔒 **Sécurité** : Mode dry-run pour prévisualiser
- 📊 **Rapport détaillé** : Avant/après avec métriques

**Un code propre en quelques secondes.**
