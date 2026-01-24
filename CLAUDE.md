# Instructions Claude Code - Quelyos ERP

## Documentation

- **Ne jamais créer de fichiers `.md`** autres que `README.md`
- Le `README.md` est le **seul document de référence** du projet
- Si une information importante doit être mémorisée, l'ajouter dans le `README.md`

---

## Architecture

```
frontend/          → Next.js 16 (boutique e-commerce)
backoffice/        → React + Vite (administration)
backend/addons/quelyos_api/  → Module Odoo (API REST)
```

---

## Conventions TypeScript (Frontend & Backoffice)

### Structure des fichiers

- Composants : `PascalCase.tsx` (ex: `ProductCard.tsx`)
- Hooks : `useCamelCase.ts` (ex: `useCart.ts`)
- Stores Zustand : `camelCaseStore.ts` (ex: `cartStore.ts`)
- Types : `src/types/index.ts` (centralisés)
- Utilitaires : `src/lib/` organisés par domaine

### Règles strictes

- Toujours utiliser TypeScript strict (`strict: true`)
- Définir les types explicitement, éviter `any`
- Utiliser Zod pour la validation des données API
- Préférer `interface` pour les objets, `type` pour les unions

### Composants React

```tsx
// Structure type d'un composant
interface Props {
  // Props typées explicitement
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks en premier
  // Logique
  // Return JSX
}
```

- Privilégier les composants fonctionnels
- Pas de `default export` pour les composants (sauf pages Next.js)
- Utiliser les Server Components par défaut, `'use client'` uniquement si nécessaire

### State Management

- Zustand pour le state global (cart, auth, wishlist)
- React Hook Form + Zod pour les formulaires
- Pas de prop drilling > 2 niveaux → utiliser un store ou context

---

## Conventions Python (Backend Odoo)

### Structure module Odoo

```
quelyos_api/
├── __manifest__.py
├── __init__.py
├── controllers/      → Endpoints API REST
├── models/           → Modèles Odoo (si extension)
├── security/         → Droits d'accès
└── views/            → Vues XML (si backend Odoo)
```

### Règles API REST

- Préfixe : `/api/v1/`
- Réponses JSON standardisées : `{ data: ..., error: ..., message: ... }`
- Codes HTTP appropriés : 200, 201, 400, 401, 404, 500
- CORS activé pour le frontend
- Validation des entrées côté serveur

### Style Python

- PEP 8 strict
- Docstrings pour les méthodes publiques
- Type hints pour les fonctions
- Utiliser `sudo()` avec précaution, documenter pourquoi

---

## Conventions CSS / Tailwind

- Tailwind CSS uniquement, pas de CSS custom sauf cas exceptionnel
- Utiliser les classes utilitaires, éviter `@apply` excessif
- Responsive : mobile-first (`sm:`, `md:`, `lg:`)
- Dark mode via `dark:` si implémenté
- Composants UI réutilisables dans `src/components/common/`

---

## Conventions API

### Endpoints standard

```
GET    /api/v1/{resource}           → Liste paginée
GET    /api/v1/{resource}/{id}      → Détail
POST   /api/v1/{resource}           → Création
PUT    /api/v1/{resource}/{id}      → Modification
DELETE /api/v1/{resource}/{id}      → Suppression
```

### Pagination

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Gestion d'erreurs

```json
{
  "error": "validation_error",
  "message": "Description lisible",
  "details": {}
}
```

---

## Tests

### Frontend (Jest + Playwright)

- Tests unitaires : `__tests__/` à côté des fichiers
- Tests E2E : `tests/` à la racine de frontend
- Nommer les tests : `*.test.ts` ou `*.spec.ts`
- Tester les comportements utilisateur, pas l'implémentation

### Commandes

```bash
npm run test          # Jest
npm run test:e2e      # Playwright
```

---

## Git

### Branches

- `main` : production
- `develop` : développement (si workflow Git Flow)
- `feature/xxx` : nouvelles fonctionnalités
- `fix/xxx` : corrections

### Commits

Format : `type: description courte`

Types : `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`

Exemples :
- `feat: add product filtering by category`
- `fix: cart total calculation with discounts`

---

## Sécurité

- Ne jamais committer de secrets (`.env`, clés API)
- Valider toutes les entrées utilisateur (Zod côté frontend, validation Odoo côté backend)
- Utiliser HTTPS en production
- CSRF protection sur les endpoints sensibles
- Sanitizer les données avant affichage (XSS)

---

## Performance

### Frontend

- Utiliser `next/image` pour les images (optimisation automatique)
- Lazy loading des composants lourds (`dynamic()`)
- Préférer Server Components pour le SEO et la performance
- Minimiser les re-renders (mémorisation si nécessaire)

### API

- Pagination obligatoire sur les listes
- Limiter les champs retournés (`fields` parameter si possible)
- Cache HTTP quand approprié

---

## Commandes de développement

```bash
# Backend Odoo
cd backend && docker-compose up -d
cd backend && ./reset.sh          # Reset complet

# Frontend
cd frontend && npm run dev

# Backoffice
cd backoffice && npm run dev

# Tests
cd frontend && npm run test
cd frontend && npm run test:e2e
```

---

## Règles pour Claude

1. Toujours lire le code existant avant de modifier
2. Respecter les patterns déjà en place dans le projet
3. Préférer les modifications minimales et ciblées
4. Ne pas sur-ingénier : simple > complexe
5. Valider avec les tests existants après modification
6. Si une dépendance est nécessaire, vérifier qu'elle n'existe pas déjà
