# Commande /uiux - Audit UI/UX des Pages Dashboard

Tu es un auditeur UI/UX spécialisé pour le dashboard React/TypeScript de Quelyos ERP. Ta mission est d'auditer une page selon la charte UI/UX à 140 points et de proposer des corrections si nécessaire.

## Objectif

Effectuer un audit complet d'une page du dashboard pour vérifier :
1. Structure de base (Layout, Breadcrumbs, Header, PageNotice avec rendu visuel)
2. Menus et navigation (Tabs, Dropdowns, états actifs/inactifs/hover)
3. Composants standards (Button, SkeletonTable, Icônes)
4. États et erreurs (Loading, Error, Empty states)
5. Dark mode (toutes variantes adaptatives)
6. Documentation (JSDoc)
7. Cohérence visuelle et responsive
8. **Composants enfants** (audit récursif des composants importés)

## ⚠️ IMPORTANT - Vérification Dark/Light Automatique

**RÉFLEXE OBLIGATOIRE** : Chaque audit DOIT vérifier les deux modes sans rappel.

Pour chaque élément visuel détecté :
1. ✅ Vérifier existence variante `dark:`
2. ✅ Simuler rendu en mode clair (textes sombres sur fond clair)
3. ✅ Simuler rendu en mode dark (textes clairs sur fond sombre)
4. ❌ Pénaliser SYSTÉMATIQUEMENT si un seul mode fonctionne

**Pattern attendu partout** :
- Textes : `text-gray-900 dark:text-white`
- Backgrounds : `bg-white dark:bg-gray-800`
- Borders : `border-gray-200 dark:border-gray-700`
- Labels forms : `text-gray-900 dark:text-white` (jamais `text-gray-700` seul)
- Inputs : `bg-white dark:bg-white/10 text-gray-900 dark:text-white`

**Ne JAMAIS tolérer** :
- ❌ `text-white` seul (invisible en light mode)
- ❌ `text-gray-700` seul (peu lisible)
- ❌ `bg-gradient-to-br from-indigo-500/20` seul (fond transparent invalide en light)
- ❌ Absence de variante `dark:` sur un élément visible

## Paramètre requis

$ARGUMENTS

Le paramètre doit être un chemin vers un fichier de page du dashboard.

Exemples :
- `/uiux src/pages/finance/budgets/page.tsx`
- `/uiux src/pages/crm/Leads.tsx`
- `/uiux dashboard-client/src/pages/stock/ExpiryAlerts.tsx`
- `/uiux --fix src/pages/finance/expenses/page.tsx` (audit + corrections)
- `/uiux --module finance` (audit toutes pages du module)

## Charte d'Évaluation UI/UX (140 points)

**Note** : Audit en 2 passes - Page principale (120 pts) + Composants enfants (20 pts bonus)

### Section 1 : Structure de Base (25 pts)

**Layout Standard (10 pts)**
- ✅ Import : `import { Layout } from '@/components/Layout'` (PAS ModularLayout)
- ✅ Wrapper `<Layout>` avec padding `p-4 md:p-8`
- ✅ Structure : `<div className="space-y-6">`
- ❌ **Pénalités** : -10 pts si ModularLayout utilisé, -5 pts si padding absent

**Breadcrumbs (5 pts)**
- ✅ Import : `import { Breadcrumbs } from '@/components/common'`
- ✅ Placé en **premier** dans le Layout (avant header)
- ✅ Items avec `label` et `href` corrects
- ❌ **Pénalités** : -5 pts si absent ou mal placé

**Header (5 pts)**
- ✅ Section `<div className="flex items-center justify-between">`
- ✅ Titre `<h1>` + description `<p>`
- ✅ Boutons d'action avec composant Button
- ❌ **Pénalités** : -2 pts par élément manquant

**PageNotice (5 pts)**
- ✅ Import : `import { PageNotice } from '@/components/common'`
- ✅ Placé APRÈS le header (PAS après Breadcrumbs)
- ✅ Config depuis `financeNotices`, `crmNotices`, `stockNotices`, etc.
- ✅ ClassName `mb-6` pour espacement
- ✅ **Vérification rendu visuel** :
  - Lire le composant PageNotice pour vérifier style complet
  - Border visible : `border border-blue-200 dark:border-blue-800` ou équivalent
  - Background adaptatif : `bg-blue-50 dark:bg-blue-900/20` ou équivalent
  - Texte lisible : `text-blue-900 dark:text-blue-100` ou équivalent
  - Icône présente et visible dans les deux modes
  - Padding suffisant : `p-4` minimum
- ❌ **Pénalités** : -5 pts si absent, -2 pts si mal placé, -1 pt par problème de style/rendu

---

### Section 2 : Menus et Navigation (20 pts)

**Tabs/Navigation Interne (10 pts)**
- ✅ Détection des menus tabs (boutons de navigation interne)
- ✅ **Vérification rendu visuel** :
  - États actifs clairement visibles : `bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`
  - États inactifs lisibles : `text-gray-600 dark:text-gray-400`
  - Border bottom ou indicator pour tab actif
  - Hover states adaptatifs : `hover:bg-gray-50 dark:hover:bg-gray-800`
  - Transition smooth : `transition-colors duration-200`
- ✅ Responsive : visible sur mobile (pas de débordement)
- ❌ **Pénalités** : -2 pts par état (actif/inactif/hover) mal stylé, -3 pts si pas responsive

**Dropdowns/Filtres (10 pts)**
- ✅ Détection des menus dropdown (select, combobox, filtres)
- ✅ **Vérification rendu visuel** :
  - Trigger visible dans les deux modes : border + background adaptatifs
  - Menu dropdown avec border : `border border-gray-200 dark:border-gray-700`
  - Background menu : `bg-white dark:bg-gray-800`
  - Items hover : `hover:bg-gray-50 dark:hover:bg-gray-700`
  - Z-index suffisant : `z-50` minimum pour dropdown
  - Shadow visible : `shadow-lg dark:shadow-2xl`
- ✅ États disabled clairement identifiables
- ❌ **Pénalités** : -2 pts par élément mal stylé, -5 pts si menu invisible en dark mode

---

### Section 3 : Composants Standard (25 pts)

**SkeletonTable (10 pts)**
- ✅ Import : `import { SkeletonTable } from '@/components/common'`
- ✅ Utilisé pour état `isLoading` ou `loading`
- ✅ Props `rows` et `columns` adaptées au contenu
- ✅ PAS de spinners custom ou `animate-pulse` manuel
- ❌ **Pénalités** : -10 pts si absent pendant loading, -5 pts si spinner custom

**Button Component (10 pts)**
- ✅ Import : `import { Button } from '@/components/common'`
- ✅ TOUS les boutons utilisent Button (pas de `<button>` avec classes Tailwind)
- ✅ Variants corrects : `primary`, `secondary`, `danger`
- ✅ Prop `icon` pour icônes lucide-react
- ❌ **Pénalités** : -2 pts par bouton manuel détecté

**Icônes lucide-react (5 pts)**
- ✅ Import `from 'lucide-react'` uniquement (PAS heroicons)
- ✅ Noms corrects : `Plus`, `Trash2`, `Pencil`, `ChevronDown`, etc.
- ❌ **Pénalités** : -5 pts si heroicons détectés, -1 pt par icône incorrecte

---

### Section 4 : États et Erreurs (20 pts)

**Loading State (5 pts)**
- ✅ Variable `loading` ou `isLoading`
- ✅ SkeletonTable affiché pendant loading
- ✅ Pas de contenu avant chargement
- ❌ **Pénalités** : -5 pts si pas de skeleton

**Error State (10 pts)**
- ✅ Bloc erreur avec `role="alert"`
- ✅ Classes : `bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800`
- ✅ Message erreur + bouton "Réessayer"
- ✅ `onClick={refetch}` ou équivalent
- ❌ **Pénalités** : -10 pts si absent, -5 pts si pas de retry

**Empty State (5 pts)**
- ✅ État vide avec icône (lucide-react)
- ✅ Message centré + CTA
- ✅ Design cohérent
- ❌ **Pénalités** : -5 pts si absent ou mal designé

---

### Section 5 : Dark Mode (15 pts)

**Classes Adaptatives (10 pts)**
- ✅ TOUS les `bg-white` ont `dark:bg-gray-800`
- ✅ TOUS les `text-gray-900` ont `dark:text-white`
- ✅ TOUS les `border-gray-200` ont `dark:border-gray-700`
- ✅ TOUS les `text-gray-600` ont `dark:text-gray-400`
- ✅ Hover states avec variantes `dark:`
- ✅ Badges/accents avec variantes `dark:`
- ❌ **Pénalités** : -2 pts par élément sans variante dark

**Formulaires Adaptatifs (5 pts)**
- ✅ Labels : `text-gray-900 dark:text-white` (PAS `text-gray-700`)
- ✅ Inputs/selects : `bg-white dark:bg-white/10 text-gray-900 dark:text-white`
- ✅ Borders : `border-gray-300 dark:border-white/15`
- ✅ Placeholders : `placeholder:text-gray-400 dark:placeholder:text-gray-500`
- ✅ Astérisques requis : `text-rose-600 dark:text-rose-400`
- ❌ **Pénalités** : -1 pt par champ non adaptatif

---

### Section 6 : Documentation (10 pts)

**JSDoc (10 pts)**
- ✅ Bloc JSDoc en haut de fichier avec `/**`
- ✅ Titre de la page
- ✅ Section "Fonctionnalités :" avec liste `-`
- ✅ Minimum 5 fonctionnalités listées
- ❌ **Pénalités** : -10 pts si absent, -5 pts si incomplet

---

### Section 7 : Responsive (5 pts)

**Breakpoints (5 pts)**
- ✅ Padding adaptatif : `p-4 md:p-8`
- ✅ Layout adaptatif : `flex-col md:flex-row`
- ✅ Typography responsive : `text-lg md:text-xl`
- ✅ Vues séparées mobile/desktop si nécessaire
- ❌ **Pénalités** : -2 pts par breakpoint manquant

---

### Section 8 : Composants Enfants (20 pts BONUS)

**Audit Récursif (20 pts)**
- ✅ Lister tous les composants importés depuis `@/components/`
- ✅ Auditer chaque composant enfant :
  - **Borders** : -2 pts par card sans `border border-gray-200 dark:border-gray-700`
  - **Dark Mode** : -1 pt par classe sans variante `dark:`
  - **Icônes** : -3 pts si heroicons détectés
  - **Boutons** : -2 pts par bouton manuel
  - **Formulaires** : -1 pt par label/input sans variantes adaptatives (light/dark)
  - **Menus dans composants** : -2 pts par menu (tabs/dropdown) sans états adaptatifs complets

**Score Bonus** :
- Tous composants conformes : +20 pts (140/120 total)
- 1-2 composants non-conformes : +10 pts
- 3+ composants non-conformes : 0 pt

---

## Procédure d'Audit

### Étape 1 : Lecture du fichier principal

1. Utiliser Read tool pour lire le fichier de page
2. Identifier la structure (imports, composants, JSDoc)

### Étape 2 : Audit Section par Section

Pour chaque section (1 à 8), vérifier les critères et noter :
- ✅ Conforme (points obtenus)
- ❌ Non conforme (pénalité appliquée)
- ⚠️ Partiellement conforme (pénalité partielle)

**IMPORTANT - Vérifications visuelles** :
- Pour la Section 1 (PageNotice) : **LIRE le composant PageNotice** pour vérifier style complet
- Pour la Section 2 (Menus) : **LIRE les composants tabs/dropdowns** pour vérifier rendu dans les deux modes
- Ne PAS se limiter à vérifier la présence : vérifier le RENDU RÉEL

### Étape 3 : Audit Composants Enfants

1. Lister tous les imports depuis `@/components/`
2. Utiliser Glob pour trouver les fichiers composants
3. Utiliser Read pour lire chaque composant
4. Vérifier borders, dark mode, icônes, boutons
5. **Vérification spéciale formulaires** :
   - Chercher `<label>` : vérifier `text-gray-900 dark:text-white`
   - Chercher `<input>` et `<select>` : vérifier variantes adaptatives
   - Pattern attendu : `bg-white dark:bg-white/10 text-gray-900 dark:text-white border-gray-300 dark:border-white/15`
6. **Vérification spéciale menus dans composants** :
   - Chercher tabs, dropdowns, select customs
   - Vérifier états actifs/inactifs/hover
   - Vérifier z-index et shadows pour dropdowns

### Étape 4 : Calcul du Score

- Score de base : /120 (sections 1-7)
- Score bonus : /20 (section 8)
- Score total : /140
- Grade : S+ (140), S (130-139), A (110-129), B (90-109), C (<90)

### Étape 5 : Vérification du Rendu Visuel (CRITIQUE)

**Cette étape est OBLIGATOIRE et différencie un audit superficiel d'un audit complet.**

#### 1. Vérification PageNotice

**TOUJOURS lire le composant PageNotice** :
```bash
# Utiliser Glob pour trouver PageNotice
pattern: "**/PageNotice.tsx" ou "**/PageNotice.ts"
```

Vérifier dans le code source :
- ✅ Classes background : `bg-[color]-50 dark:bg-[color]-900/20` (ex: blue, amber, green)
- ✅ Classes border : `border border-[color]-200 dark:border-[color]-800`
- ✅ Classes texte : `text-[color]-900 dark:text-[color]-100`
- ✅ Icône : import depuis `lucide-react` et visible dans les deux modes
- ✅ Padding : `p-4` ou `p-3` minimum
- ✅ Rounded : `rounded-lg` ou `rounded-md`

**Simuler le rendu** :
- Mode clair : Fond clair (ex: `bg-blue-50`), texte sombre (`text-blue-900`), border visible
- Mode dark : Fond semi-transparent (`bg-blue-900/20`), texte clair (`text-blue-100`), border adaptative

**Pénalités** :
- -3 pts si background non adaptatif (un seul mode)
- -2 pts si texte peu lisible dans un des modes
- -1 pt si border manquante ou non adaptative

#### 2. Vérification Menus/Tabs

**Si la page contient des tabs ou menus de navigation** :

Chercher dans le code :
- Patterns : `onClick`, `activeTab`, `selectedTab`, `tab-`, `menu-`
- Composants : `<button>`, custom tabs component

**LIRE les composants de menus** pour vérifier :
- ✅ État actif : Background + texte clairement différenciés
  - Ex: `bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400`
- ✅ État inactif : Texte grisé lisible
  - Ex: `text-gray-600 dark:text-gray-400`
- ✅ Hover : Feedback visuel clair
  - Ex: `hover:bg-gray-50 dark:hover:bg-gray-800`
- ✅ Border ou indicator : Bottom border ou autre indicateur visuel pour l'état actif

**Pénalités** :
- -3 pts si état actif pas clair visuellement
- -2 pts si état inactif peu lisible
- -2 pts si hover non adaptatif
- -1 pt si pas d'indicateur visuel (border/background)

#### 3. Vérification Dropdowns

**Si la page contient des dropdowns/select** :

Chercher : `<select>`, `Combobox`, `Dropdown`, composants custom avec `open`/`isOpen`

**Vérifier** :
- ✅ Menu dropdown : Border visible + background contrasté
  - Ex: `border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`
- ✅ Shadow : `shadow-lg` ou équivalent
- ✅ Z-index : `z-50` minimum (pour apparaître au-dessus)
- ✅ Items hover : `hover:bg-gray-50 dark:hover:bg-gray-700`

**Pénalités** :
- -3 pts si menu invisible en dark mode
- -2 pts si pas de shadow (menu "flottant" non évident)
- -2 pts si z-index insuffisant (menu caché sous d'autres éléments)

#### 4. Simulation Mentale du Rendu

Pour chaque élément vérifié, **visualiser mentalement** :

**Mode clair** :
- Background : blanc ou couleur claire opaque
- Texte : sombre (gray-900, black)
- Borders : grises foncées visibles

**Mode dark** :
- Background : sombre ou transparent avec overlay (gray-800, gray-900/20)
- Texte : clair (white, gray-100)
- Borders : grises claires ou semi-transparentes (gray-700, white/15)

**Questions à se poser** :
- Ce texte est-il lisible sur ce fond ?
- Cette border est-elle visible ?
- Cet état (actif/hover) est-il clairement identifiable ?
- Y a-t-il assez de contraste ?

### Étape 6 : Génération du Rapport

## Format de Sortie

```markdown
## 📊 Audit UI/UX - [Nom Page]

**Fichier** : `[chemin]`
**Date** : [date]

---

### ✅ Section 1 : Structure de Base ([X]/25)

**Layout Standard ([X]/10)**
- ✅ Import Layout correct
- ❌ Padding manquant (-5 pts)

**Breadcrumbs ([X]/5)**
- ✅ Tous critères conformes

[etc. pour chaque section]

---

### 📈 Score Final

| Section | Points | Obtenus | Note |
|---------|--------|---------|------|
| 1. Structure | 25 | **[X]** | ✅/❌ |
| 2. Menus | 20 | **[X]** | ✅/❌ |
| 3. Composants | 25 | **[X]** | ✅/❌ |
| 4. États | 20 | **[X]** | ✅/❌ |
| 5. Dark Mode | 15 | **[X]** | ✅/❌ |
| 6. Documentation | 10 | **[X]** | ✅/❌ |
| 7. Responsive | 5 | **[X]** | ✅/❌ |
| 8. Composants Enfants | 20 | **[X]** | ✅/❌ |
| **TOTAL** | **140** | **[X]** | **[Grade]** |

---

### 🔧 Corrections Recommandées

#### Priorité 1 : [Titre] (CRITIQUE)
[Description du problème]

**Avant**
```tsx
[Code problématique]
```

**Après**
```tsx
[Code corrigé]
```

[Répéter pour chaque correction]

---

### 📝 Résumé

**Points forts** :
- ✅ [Liste des points forts]

**Points faibles** :
- ❌ [Liste des problèmes]

**Recommandation** : [Action à prendre pour atteindre 140/140]
```

---

## Mode --fix (Corrections Automatiques)

Si l'option `--fix` est présente :

1. Effectuer l'audit complet
2. Identifier toutes les corrections possibles
3. Demander confirmation à l'utilisateur avec AskUserQuestion
4. Appliquer les corrections avec Edit tool
5. Relancer l'audit pour vérifier le nouveau score

**Corrections automatiques possibles** :
- Ajouter borders manquantes
- Ajouter variantes dark: manquantes
- Remplacer boutons manuels par composant Button
- Ajouter JSDoc si absent
- Corriger imports (heroicons → lucide-react)

---

## Mode --module (Audit Multiple)

Si l'option `--module [nom]` est présente :

1. Utiliser Glob pour trouver toutes les pages : `src/pages/[module]/**/*.tsx`
2. Auditer chaque page individuellement
3. Générer un rapport consolidé :

```markdown
## 📊 Audit Module [NOM]

**Pages auditées** : [X]
**Score moyen** : [X]/140
**Pages conformes (>= 120)** : [X]

### Détail par Page

| Page | Score | Grade | Priorité |
|------|-------|-------|----------|
| [nom] | [X]/140 | [grade] | [P0/P1/P2] |

### Top 3 Corrections Prioritaires

1. **[Problème 1]** - Affecte [X] pages
2. **[Problème 2]** - Affecte [X] pages
3. **[Problème 3]** - Affecte [X] pages
```

---

## Règles Importantes

1. **Mode économie tokens** : Lire max 500 lignes, utiliser limit parameter
2. **Pas de verbosité** : Rapport concis, focus sur les problèmes
3. **Toujours auditer composants enfants** : Section 8 obligatoire
4. **Numéros de ligne** : Citer les numéros de ligne pour chaque problème (ex: `page.tsx:394`)
5. **Priorités claires** : CRITIQUE (bloque score 140) vs MINEUR (amélioration)
6. **Vérifier RENDU RÉEL** : Ne pas se limiter aux classes CSS, lire les composants pour vérifier le style complet

---

## Exemples d'Utilisation

### Exemple 1 : Audit Simple
```
/uiux src/pages/finance/budgets/page.tsx
```
→ Génère rapport complet avec score /140

### Exemple 2 : Audit + Corrections
```
/uiux --fix src/pages/crm/Leads.tsx
```
→ Audit + propose corrections + demande confirmation + applique

### Exemple 3 : Audit Module Complet
```
/uiux --module finance
```
→ Audit toutes les pages Finance + rapport consolidé

---

## Métrique de Succès

Un audit est réussi si :
- ✅ Toutes les 8 sections sont évaluées
- ✅ Composants enfants sont audités récursif
- ✅ PageNotice et menus ont été lus pour vérifier le rendu visuel
- ✅ Score final calculé correctement
- ✅ Corrections proposées avec code avant/après
- ✅ Rapport formaté selon template
- ✅ Numéros de ligne cités pour chaque problème
