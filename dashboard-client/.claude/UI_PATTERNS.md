# Patterns UI Obligatoires - Dashboard Quelyos

> **LIRE CE FICHIER AVANT DE CRÉER TOUTE NOUVELLE PAGE**

Ce document définit les patterns UI/UX obligatoires pour le dashboard React/TypeScript.
Non-respect = dette technique à corriger immédiatement.

---

## 1. Structure de Base (Obligatoire)

### Imports Obligatoires

```tsx
// Layout & Navigation
import { Layout } from '@/components/Layout'
import { Breadcrumbs, PageNotice, Button } from '@/components/common'

// Notices du module (remplacer [module] par: finance, store, stock, crm, marketing, hr)
import { [module]Notices } from '@/lib/notices'

// Icônes - TOUJOURS lucide-react
import { Plus, Pencil, Trash2, RefreshCw, AlertCircle } from 'lucide-react'

// Navigation
import { useNavigate } from 'react-router-dom'
```

### Structure JSDoc (En-tête)

```tsx
/**
 * [Nom de la Page] - [Description courte]
 *
 * Fonctionnalités :
 * - [Fonctionnalité 1]
 * - [Fonctionnalité 2]
 * - [Fonctionnalité 3]
 * - [Fonctionnalité 4]
 * - [Fonctionnalité 5]
 */
```

### Template Complet

```tsx
/**
 * [PageName] - [Description]
 *
 * Fonctionnalités :
 * - [Feature 1]
 * - [Feature 2]
 * - [Feature 3]
 */
import { Layout } from '@/components/Layout'
import { Breadcrumbs, PageNotice, Button, SkeletonTable } from '@/components/common'
import { [module]Notices } from '@/lib/notices'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageName() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useMyHook()

  // Loading State
  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
          <SkeletonTable rows={5} columns={4} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        {/* 1. Breadcrumbs - TOUJOURS en premier */}
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: '[Module]', href: '/[module]' },
            { label: '[Page]' },
          ]}
        />

        {/* 2. Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              [Titre de la page]
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              [Description courte]
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/[module]/[action]')}
          >
            [Action principale]
          </Button>
        </div>

        {/* 3. PageNotice - APRÈS le header */}
        <PageNotice config={[module]Notices.[page]} className="mb-2" />

        {/* 4. Error State */}
        {isError && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="flex-1 text-red-800 dark:text-red-200">
                Une erreur est survenue lors du chargement des données.
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
          </div>
        )}

        {/* 5. Contenu principal */}
        {/* ... */}

        {/* 6. Empty State (si liste vide) */}
        {data?.length === 0 && (
          <div className="text-center py-12">
            <[Icon] className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Aucun élément
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Commencez par créer votre premier élément.
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/[module]/new')}
            >
              Créer
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
```

---

## 2. Composants Obligatoires

### Button - JAMAIS de bouton manuel

```tsx
// ✅ CORRECT
import { Button } from '@/components/common'

<Button variant="primary" icon={<Plus className="w-4 h-4" />}>
  Ajouter
</Button>

<Button variant="secondary" onClick={handleCancel}>
  Annuler
</Button>

<Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
  Supprimer
</Button>

// ❌ INTERDIT
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
  Ajouter
</button>

<Link to="/path" className="px-4 py-2 bg-cyan-600 text-white rounded-lg">
  Action
</Link>
```

**Variants disponibles** : `primary`, `secondary`, `ghost`, `danger`, `subtle`, `default`

### SkeletonTable - Pour les listes

```tsx
// ✅ CORRECT
import { SkeletonTable } from '@/components/common'

if (isLoading) {
  return <SkeletonTable rows={5} columns={4} />
}

// ❌ INTERDIT - Skeleton manuel
<div className="animate-pulse">
  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200" />)}
</div>
```

### Icônes - TOUJOURS lucide-react

```tsx
// ✅ CORRECT
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'

<Plus className="w-4 h-4" />

// ❌ INTERDIT
import { PlusIcon } from '@heroicons/react/24/outline'
```

**Icônes courantes** :
- Actions : `Plus`, `Pencil`, `Trash2`, `Eye`, `Download`, `Upload`
- Navigation : `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ArrowLeft`
- Feedback : `AlertCircle`, `CheckCircle`, `XCircle`, `Info`
- UI : `Search`, `Filter`, `RefreshCw`, `MoreVertical`, `X`

---

## 3. Dark Mode - Classes Obligatoires

### Pattern Systématique

Chaque élément visuel DOIT avoir sa variante `dark:` :

```tsx
// Backgrounds
className="bg-white dark:bg-gray-800"
className="bg-gray-50 dark:bg-gray-900"
className="bg-gray-100 dark:bg-gray-700"

// Textes
className="text-gray-900 dark:text-white"           // Titres, texte principal
className="text-gray-700 dark:text-gray-300"        // Texte secondaire
className="text-gray-500 dark:text-gray-400"        // Texte tertiaire, descriptions
className="text-gray-600 dark:text-gray-400"        // Labels

// Borders
className="border-gray-200 dark:border-gray-700"
className="border-gray-300 dark:border-gray-600"

// Hover
className="hover:bg-gray-50 dark:hover:bg-gray-700"
className="hover:bg-gray-100 dark:hover:bg-gray-800"
```

### Badges Colorés

```tsx
// Success
className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"

// Warning
className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"

// Error
className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"

// Info
className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
```

### Cards

```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    Titre
  </h3>
  <p className="text-gray-500 dark:text-gray-400">
    Description
  </p>
</div>
```

---

## 4. Formulaires

### Labels

```tsx
// ✅ CORRECT
<label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
  Nom <span className="text-rose-600 dark:text-rose-400">*</span>
</label>

// ❌ INTERDIT
<label className="text-gray-700">Nom</label>
```

### Inputs

```tsx
// ✅ CORRECT
<input
  type="text"
  className="w-full px-3 py-2 bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
/>

// ❌ INTERDIT
<input className="border rounded px-3 py-2" />
```

### Select

```tsx
<select className="w-full px-3 py-2 bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 rounded-lg">
  <option>Option 1</option>
</select>
```

---

## 5. Tables

### Structure

```tsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Colonne
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className="px-6 py-4 text-gray-900 dark:text-white">
          Valeur
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 6. États

### Loading (avec SkeletonTable)

```tsx
if (isLoading) {
  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <SkeletonTable rows={5} columns={4} />
      </div>
    </Layout>
  )
}
```

### Error

```tsx
{isError && (
  <div
    role="alert"
    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
  >
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      <p className="flex-1 text-red-800 dark:text-red-200">
        Une erreur est survenue lors du chargement des données.
      </p>
      <Button
        variant="ghost"
        size="sm"
        icon={<RefreshCw className="w-4 h-4" />}
        onClick={() => refetch()}
      >
        Réessayer
      </Button>
    </div>
  </div>
)}
```

### Empty

```tsx
{data?.length === 0 && (
  <div className="text-center py-12">
    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
      Aucun élément trouvé
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mt-1">
      Commencez par en créer un nouveau.
    </p>
    <Button variant="primary" className="mt-4" onClick={() => navigate('/module/new')}>
      Créer
    </Button>
  </div>
)}
```

---

## 7. Responsive

### Padding

```tsx
// ✅ CORRECT
className="p-4 md:p-8"

// ❌ INTERDIT
className="p-6"
```

### Grids

```tsx
// KPIs
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// 2 colonnes
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// 3 colonnes
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Flex Direction

```tsx
className="flex flex-col md:flex-row gap-4"
```

---

## 8. Checklist Pré-Commit

Avant de soumettre une nouvelle page, vérifier :

- [ ] JSDoc complet en en-tête (5+ fonctionnalités)
- [ ] Import `Layout` depuis `@/components/Layout`
- [ ] Import `Breadcrumbs, PageNotice, Button` depuis `@/components/common`
- [ ] `<Layout>` wrapper tout le contenu
- [ ] `<Breadcrumbs>` en premier dans le Layout
- [ ] `<PageNotice>` après le header
- [ ] Boutons avec composant `Button` (pas de `<button>` manuel)
- [ ] Loading state avec `SkeletonTable` ou `Skeleton`
- [ ] Error state avec `role="alert"`
- [ ] Empty state si applicable
- [ ] TOUTES les classes ont variante `dark:`
- [ ] Icônes depuis `lucide-react` uniquement
- [ ] Padding responsive `p-4 md:p-8`

---

## 9. Fichiers de Référence

| Pattern | Fichier exemple |
|---------|-----------------|
| Dashboard | `src/pages/hr/page.tsx` |
| Liste + Table | `src/pages/finance/transactions/page.tsx` |
| Formulaire création | `src/pages/hr/employees/new/page.tsx` |
| Détail/Édition | `src/pages/hr/employees/[id]/page.tsx` |
| Settings | `src/pages/finance/settings/page.tsx` |

---

## 10. Configuration Menu (OBLIGATOIRE)

Toute nouvelle page DOIT être ajoutée dans le menu du module.

**Fichier** : `src/config/modules.ts`

### Structure

```ts
// Dans MODULES, trouver le module concerné
{
  id: 'hr',
  name: 'RH',
  // ...
  sections: [
    {
      title: 'Nom de la section',  // Groupe de menu
      items: [
        {
          name: 'Nom affiché',      // Label dans le menu
          path: '/hr/ma-page',      // Route (doit correspondre au fichier)
          icon: MonIcon,            // Icône lucide-react
        },
      ],
    },
  ],
}
```

### Exemple : Ajouter une page "Évaluations" dans HR

1. **Créer le fichier** : `src/pages/hr/evaluations/page.tsx`

2. **Ajouter dans le menu** (`src/config/modules.ts`) :

```ts
// Importer l'icône en haut du fichier
import { ClipboardCheck } from 'lucide-react'

// Dans la section HR > Personnel, ajouter :
{
  title: 'Personnel',
  items: [
    { name: 'Employés', path: '/hr/employees', icon: UsersRound },
    { name: 'Départements', path: '/hr/departments', icon: Boxes },
    { name: 'Évaluations', path: '/hr/evaluations', icon: ClipboardCheck },  // ← NOUVEAU
  ],
},
```

3. **Ajouter la notice** (`src/lib/notices/hr-notices.ts`) :

```ts
evaluations: {
  pageId: 'hr-evaluations',
  title: 'Évaluations',
  purpose: "Gérez les entretiens et évaluations de performance.",
  icon: ClipboardCheck as LucideIcon,
  moduleColor: 'violet',
  sections: [...],
},
```

### Checklist Menu

- [ ] Icône importée en haut de `modules.ts`
- [ ] Item ajouté dans la bonne section du module
- [ ] `path` correspond au fichier créé (`/module/page` → `pages/module/page/page.tsx`)
- [ ] `name` en français, concis (1-3 mots)
- [ ] Notice créée dans `[module]-notices.ts`

### Sections par Module

| Module | Sections typiques |
|--------|-------------------|
| Finance | Tableau de bord, Transactions, Budgets, Rapports, Configuration |
| Store | Boutique, Produits, Commandes, Livraison, Configuration |
| Stock | Tableau de bord, Inventaire, Mouvements, Alertes, Configuration |
| CRM | Tableau de bord, Pipeline, Clients, Activités, Configuration |
| Marketing | Campagnes, Contacts, Automation, Configuration |
| HR | Tableau de bord, Personnel, Temps & Présences, Congés, Configuration |

---

## 11. Notices par Module

Chaque module a ses notices définies dans `src/lib/notices/` :

| Module | Fichier | Import |
|--------|---------|--------|
| Finance | `finance-notices.ts` | `financeNotices` |
| Store | `store-notices.ts` | `storeNotices` |
| Stock | `stock-notices.ts` | `stockNotices` |
| CRM | `crm-notices.ts` | `crmNotices` |
| Marketing | `marketing-notices.ts` | `marketingNotices` |
| HR | `hr-notices.ts` | `hrNotices` |

Pour ajouter une notice à une nouvelle page :

1. Ouvrir `src/lib/notices/[module]-notices.ts`
2. Ajouter la config avec `pageId`, `title`, `purpose`, `sections`
3. Utiliser dans la page : `<PageNotice config={[module]Notices.[page]} />`
