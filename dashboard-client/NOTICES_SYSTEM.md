# Système de Notices - Documentation

## Vue d'ensemble

Le système de notices permet d'afficher des informations contextuelles et bonnes pratiques sur chaque page du backoffice pour guider les utilisateurs.

## Architecture

### 1. Infrastructure (`/lib/notices/`)

#### `types.ts`
Définit les types et configurations de couleurs par module :
```typescript
interface PageNoticeConfig {
  pageId: string              // Identifiant unique (ex: "stock-products")
  title: string               // Titre de la notice
  purpose: string             // Description de l'utilité de la page
  sections: NoticeSection[]   // Sections de recommandations
  icon?: React.ComponentType  // Icône optionnelle
  moduleColor?: 'orange' | 'indigo' | 'emerald' | 'violet' | 'pink' | 'gray'
}
```

**Couleurs par module** :
- 🟠 `orange` : Stock/Warehouse
- 🟣 `indigo` : E-commerce
- 🟢 `emerald` : Finance (existant)
- 🔵 `violet` : CRM (futur)
- 🔴 `pink` : Marketing (futur)

#### `stock-notices.ts`
Configuration des 7 pages du module Stock :
- `products` : Stock & Disponibilité
- `inventory` : Inventaire Physique
- `moves` : Mouvements de Stock
- `transfers` : Transferts entre Entrepôts
- `warehouses` : Gestion des Entrepôts
- `locations` : Emplacements de Stock
- `reorderingRules` : Règles de Réapprovisionnement

#### `ecommerce-notices.ts`
Configuration des 9 pages du module E-commerce :
- `products` : Catalogue Produits
- `orders` : Commandes E-commerce
- `customers` : Base Clients
- `categories` : Catégories Produits
- `coupons` : Codes Promo & Coupons
- `featured` : Produits Vedette
- `promoBanners` : Bannières Promotionnelles
- `abandonedCarts` : Paniers Abandonnés
- `delivery` : Modes de Livraison

### 2. Composant (`/components/common/PageNotice.tsx`)

Composant générique avec :
- ✅ État pliable/dépliable avec persistance localStorage
- ✅ Animations framer-motion fluides
- ✅ Gestion hydration SSR (évite mismatches)
- ✅ Accessibilité (aria-labels, keyboard navigation)
- ✅ Gradient adapté au module

## Utilisation

### Intégrer une notice dans une page

```tsx
import { PageNotice } from '@/components/common'
import { stockNotices } from '@/lib/notices'

export default function MaPage() {
  return (
    <Layout>
      <div className="p-8">
        <Breadcrumbs items={[...]} />

        {/* Ajouter la notice ici */}
        <PageNotice config={stockNotices.products} className="mb-6" />

        {/* Contenu de la page */}
        <div>...</div>
      </div>
    </Layout>
  )
}
```

### Créer une nouvelle notice

1. Ajouter la configuration dans le fichier approprié :

```typescript
// lib/notices/mon-module-notices.ts
export const monModuleNotices: Record<string, PageNoticeConfig> = {
  maPage: {
    pageId: 'mon-module-ma-page',
    title: 'Titre de la Page',
    purpose: "Description concrète de l'utilité de la page (2-3 phrases).",
    icon: MonIcone,
    moduleColor: 'violet',
    sections: [{
      title: 'Bonnes pratiques',
      icon: Lightbulb,
      items: [
        'Recommandation 1 avec exemple chiffré si pertinent',
        'Recommandation 2 orientée action et résultats',
        'Recommandation 3 avec best practice métier',
      ]
    }]
  }
}
```

2. Exporter dans `lib/notices/index.ts` :

```typescript
export * from './mon-module-notices'
```

3. Intégrer dans la page cible.

## Règles de Rédaction

### Structure d'une Notice

- **pageId** : Format `{module}-{page}` (ex: `stock-products`)
- **title** : Titre contextuel, pas générique
- **purpose** : Utilité CONCRÈTE, pas paraphrase du titre
- **sections** : 1-2 sections max, 5-7 items par section

### Contenu des Recommandations

✅ **Bon** :
```
"Configurez min = stock sécurité + qté vendue pendant délai fournisseur"
```

❌ **Mauvais** :
```
"Configurez des seuils adaptés"
```

**Critères qualité** :
- Actions spécifiques et actionnables
- Exemples chiffrés quand pertinent
- Orienté résultats métier
- Phrases courtes (< 120 caractères)
- Ton professionnel mais accessible

## LocalStorage

Chaque notice stocke son état collapsed dans une clé unique :
```
quelyos_page_notice_collapsed_{pageId}
```

Exemple : `quelyos_page_notice_collapsed_stock-products`

## Pages Couvertes (16 total)

### Module Stock (7)
✅ Stock.tsx
✅ Inventory.tsx
✅ StockMoves.tsx
✅ StockTransfers.tsx
✅ Warehouses.tsx
✅ StockLocations.tsx
✅ stock/ReorderingRules.tsx

### Module E-commerce (9)
✅ Products.tsx
✅ Orders.tsx
✅ Customers.tsx
✅ Categories.tsx
✅ Coupons.tsx
✅ Featured.tsx
✅ PromoBanners.tsx
✅ AbandonedCarts.tsx
✅ DeliveryMethods.tsx

## Extension Future

Pour ajouter un nouveau module (CRM, Marketing, etc.) :

1. Créer `/lib/notices/{module}-notices.ts`
2. Choisir une couleur dans `MODULE_COLOR_CONFIGS`
3. Définir les configs par page
4. Exporter dans `/lib/notices/index.ts`
5. Intégrer dans les pages concernées

## Performance

- **Lazy hydration** : État SSR-safe avec `mounted`
- **localStorage** : Lecture/écriture optimisée
- **Animations** : GPU-accelerated via framer-motion
- **Bundle** : Imports dynamiques si volume élevé (future optimisation)

## Accessibilité

- ✅ Labels ARIA sur boutons expand/collapse
- ✅ Focus visible sur interactions clavier
- ✅ Couleurs contrastées (WCAG AA)
- ✅ Navigation clavier complète

## Maintenance

### Mettre à jour une notice

1. Éditer le fichier de config (`{module}-notices.ts`)
2. Pas de migration nécessaire (contenu statique)
3. Tester visuellement la page concernée

### Analyser l'usage

Ajouter tracking analytics (future) :
```typescript
// Dans PageNotice.tsx
useEffect(() => {
  if (!isCollapsed) {
    analytics.track('notice_viewed', { pageId: config.pageId })
  }
}, [isCollapsed])
```
