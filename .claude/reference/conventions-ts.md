# Conventions TypeScript (Frontend & Backoffice)

## Structure des fichiers
- Composants : `PascalCase.tsx` (ex: `ProductCard.tsx`)
- Hooks : `useCamelCase.ts` (ex: `useCart.ts`)
- Stores Zustand : `camelCaseStore.ts` (ex: `cartStore.ts`)
- Types : `src/types/index.ts` (centralisés)
- Utilitaires : `src/lib/` organisés par domaine

## Règles strictes
- TypeScript strict (`strict: true`)
- Définir les types explicitement, éviter `any`
- Zod pour la validation des données API
- `interface` pour les objets, `type` pour les unions

## Composants React
```tsx
interface Props {
  // Props typées explicitement
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks en premier
  // Logique
  // Return JSX
}
```
- Composants fonctionnels uniquement
- Pas de `default export` (sauf pages Next.js)
- Server Components par défaut, `'use client'` si nécessaire

## State Management
- Zustand pour state global (cart, auth, wishlist)
- React Hook Form + Zod pour formulaires
- Pas de prop drilling > 2 niveaux

## Next.js
- Utiliser `next/image` pour les images
- Server Components par défaut
- `dynamic()` pour lazy loading composants lourds
