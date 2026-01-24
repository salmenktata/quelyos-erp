# Instructions Claude Code - Quelyos ERP

## Langue de communication

**IMPORTANT : Toutes les communications doivent être en français.**

- Réponses, explications et messages en français
- Messages de commit et documentation en français
- Code source (variables, fonctions, classes) en anglais selon les conventions

---

## Documentation

- **Ne jamais créer de fichiers `.md`** autres que `README.md` et `LOGME.md`
- Le `README.md` est le **seul document de référence** du projet
- Le `LOGME.md` est le **journal des grandes étapes** du projet
- Si une information importante doit être mémorisée, l'ajouter dans le `README.md`

### Journal de bord (LOGME.md)

**À chaque grande étape réalisée dans le projet, ajouter une ligne dans `LOGME.md`**

Format :
```
- YYYY-MM-DD : Description concise de l'étape réalisée
```

Exemples de grandes étapes :
- Ajout d'un nouveau module/fonctionnalité majeure
- Refactoring architectural important
- Migration de version
- Résolution d'un bug critique
- Déploiement en production

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

### ⚠️ ALERTE : Modifications structurelles Odoo

**IMPORTANT : Avant toute modification du schéma de base de données ou de l'API Odoo, TOUJOURS alerter l'utilisateur et demander confirmation.**

Modifications nécessitant une alerte :
- Ajout/modification/suppression de champs dans les modèles Odoo (`models/`)
- Modification du schéma de base de données (ajout de tables, colonnes, relations)
- Changement des endpoints API REST existants (URL, paramètres, réponses)
- Modification des droits d'accès (`security/`)
- Ajout de nouveaux modèles Odoo
- Modifications du `__manifest__.py` (dépendances, version)

Procédure :
1. Identifier la modification nécessaire
2. **Alerter l'utilisateur avec AskUserQuestion** en expliquant :
   - Quelle modification est nécessaire
   - Pourquoi elle est nécessaire
   - Quel sera l'impact (migration de données, API breaking change, etc.)
3. Attendre la confirmation avant de procéder
4. Si approuvé, documenter la modification dans `LOGME.md`

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

## ❌ Anti-patterns et erreurs à éviter

### TypeScript / React

**Ne JAMAIS :**
- Utiliser `any` au lieu de typer correctement
- Utiliser `as any` pour contourner les erreurs TypeScript
- Créer des composants avec plus de 300 lignes (refactoriser en sous-composants)
- Faire du prop drilling sur plus de 2 niveaux (utiliser un store ou context)
- Utiliser `useEffect` sans tableau de dépendances ou avec un tableau vide sans raison
- Muter directement le state (`array.push()` → utiliser spread operator)
- Oublier les `key` props dans les listes
- Utiliser `index` comme `key` si l'ordre peut changer
- Importer tout lodash (`import _ from 'lodash'` → `import debounce from 'lodash/debounce'`)
- Créer des styles inline complexes (utiliser Tailwind)
- Utiliser `dangerouslySetInnerHTML` sans sanitization

### Next.js spécifique

**Ne JAMAIS :**
- Utiliser `'use client'` par défaut (Server Components d'abord)
- Faire des appels API dans les Server Components sans gestion d'erreur
- Oublier le cache revalidation (`revalidate`, `cache: 'no-store'`)
- Utiliser `<img>` au lieu de `<Image>` de next/image
- Exposer des secrets dans les composants client (utiliser env variables côté serveur)
- Créer des routes API pour des données qui peuvent être fetched en SSR

### Backend Odoo

**Ne JAMAIS :**
- Modifier directement la base de données sans passer par l'ORM Odoo
- Utiliser `sudo()` sans documenter pourquoi et vérifier les droits
- Créer des endpoints sans validation des paramètres
- Retourner des erreurs Python brutes (toujours formater en JSON)
- Faire des requêtes SQL directes (`cr.execute`) sauf cas exceptionnels documentés
- Modifier les modèles standard Odoo sans héritage
- Oublier les règles de sécurité (`security/ir.model.access.csv`)
- Créer des boucles de recherche dans des boucles (N+1 queries)
- Utiliser `search()` sans limite sur de grandes tables

### API / Intégration

**Ne JAMAIS :**
- Oublier la pagination sur les listes (limite obligatoire)
- Retourner des mots de passe ou tokens dans les réponses API
- Utiliser des IDs séquentiels prévisibles pour les ressources sensibles
- Accepter des données non validées (Zod frontend + validation Odoo backend)
- Créer des endpoints qui peuvent être appelés sans authentification (sauf public)
- Modifier une API existante sans versioning (`/api/v1/` → `/api/v2/`)
- Oublier les codes HTTP appropriés (pas tout en 200)

### Git / Workflow

**Ne JAMAIS :**
- Committer directement sur `main` (passer par des branches)
- Committer des fichiers `.env`, secrets, ou clés API
- Committer `node_modules/`, `.next/`, ou dossiers build
- Faire des commits avec message vague ("fix", "update", "WIP")
- Mélanger plusieurs fonctionnalités dans un même commit
- Push `--force` sur main/master
- Ignorer les hooks de pre-commit (linter, formatter)

### Performance

**Ne JAMAIS :**
- Charger toutes les données d'une table sans pagination
- Faire des appels API dans des boucles (batching)
- Oublier la compression des images (utiliser next/image)
- Charger des librairies lourdes sans lazy loading
- Créer des re-renders inutiles (mémorisation avec `useMemo`, `useCallback` si nécessaire)
- Utiliser `console.log` en production (utiliser un logger)

### Sécurité

**Ne JAMAIS :**
- Stocker des mots de passe en clair (hashage obligatoire)
- Faire confiance aux données côté client (toujours valider côté serveur)
- Oublier CORS sur les endpoints API
- Exposer des stack traces en production
- Utiliser `eval()` ou `Function()` avec des données utilisateur
- Désactiver CSP (Content Security Policy) sans raison

---

## 🎨 Principes UX/UI Modernes (2026)

**Objectif** : Remplacer l'interface Odoo par une expérience utilisateur **exceptionnelle**, moderne et ergonomique. Toute interface développée doit être à la pointe des standards actuels du marché.

---

### 1. Design System et Cohérence Visuelle

**Palette de couleurs**

- **Mode clair** : Tons neutres (blanc, gris 50-100) avec accent brand (primaire vif)
- **Mode sombre** : Gris 900-950 avec accents adoucis (éviter blanc pur, utiliser gris 50-100)
- **Couleurs sémantiques** :
  - Succès : Vert (emerald-500)
  - Erreur : Rouge (red-500)
  - Attention : Orange (amber-500)
  - Info : Bleu (blue-500)
- **Contraste WCAG 2.1 AA minimum** : 4.5:1 pour texte normal, 3:1 pour texte large

**Typographie**

- **Hiérarchie claire** :
  - H1 : 2.25rem (36px), font-bold
  - H2 : 1.875rem (30px), font-semibold
  - H3 : 1.5rem (24px), font-semibold
  - Body : 1rem (16px), font-normal
  - Small : 0.875rem (14px)
- **Line-height** : 1.5 pour le body, 1.2 pour les titres
- **Font-family** : Inter, SF Pro, Segoe UI, ou équivalent moderne sans-serif
- **Font-weight** : Utiliser 400 (normal), 500 (medium), 600 (semibold), 700 (bold) uniquement

**Espacements**

- **Système d'espacement cohérent** : Multiples de 4px (4, 8, 12, 16, 24, 32, 48, 64)
- **Padding des conteneurs** : 16px mobile, 24px tablette, 32px desktop
- **Gap entre éléments** : 8px (tight), 16px (normal), 24px (loose)
- **Marges verticales** : 24px entre sections, 48px entre blocs majeurs

**Coins arrondis**

- **Boutons** : rounded-lg (8px)
- **Cards** : rounded-xl (12px)
- **Inputs** : rounded-md (6px)
- **Modals** : rounded-2xl (16px)
- **Badges** : rounded-full

**Ombres**

- **Légère** : `shadow-sm` (cartes au repos)
- **Moyenne** : `shadow-md` (hover, dropdowns)
- **Forte** : `shadow-lg` (modals, popovers)
- **Aucune ombre en mode sombre**, utiliser `border` subtile à la place

---

### 2. UX Patterns pour Backoffice Admin

**Navigation**

- **Sidebar persistante** (240-280px) avec icônes + labels
- **Collapsible mobile** : Hamburger menu avec overlay
- **Breadcrumbs** en haut de page pour contexte hiérarchique
- **Highlight actif** : Item de menu courant clairement identifié (bg-accent)
- **Sections groupées** : Séparer logiquement (Ventes, Produits, Clients, Config)

**Tableaux de données**

- **Dense mais lisible** : Padding 12px vertical, 16px horizontal
- **Tri visuel** : Icônes flèches avec état actif/inactif
- **Hover row** : Background subtil pour identifier ligne survolée
- **Actions inline** : Boutons icônes (modifier, supprimer) visibles au survol
- **Pagination claire** : Compteur "Affichage 1-20 sur 543" + Précédent/Suivant
- **Skeleton loading** : Afficher structure vide pendant chargement (pas de spinner seul)
- **Filtres avancés** : Dropdown multi-critères avec reset rapide
- **Recherche en temps réel** : Debounce 300ms, afficher résultats immédiats

**Formulaires**

- **1 colonne mobile, 2 colonnes desktop** pour formulaires longs
- **Labels au-dessus des inputs** (pas à gauche)
- **Validation inline** : Feedback immédiat sur blur ou submit
- **Messages d'erreur clairs** : Rouge avec icône, sous le champ concerné
- **États visuels** : Default, Focus (ring-2), Error (ring-red), Success (ring-green)
- **Auto-save indicator** : "Enregistré automatiquement il y a 3s" (si applicable)
- **Boutons d'action** : Primaire en bas à droite, Secondaire à gauche
- **Prévention des pertes** : Confirmation si quitter formulaire modifié non-sauvegardé

**Feedback utilisateur**

- **Toasts/Notifications** :
  - Position : Top-right (desktop), Top-center (mobile)
  - Auto-dismiss : 3s (succès), 5s (info), manuel (erreur)
  - Max 3 toasts empilés simultanés
- **États de chargement** :
  - Boutons : Spinner + texte "Chargement..." + disabled
  - Listes : Skeleton screens (pas juste spinner centré)
  - Pages : Layout visible + contenus en skeleton
- **Confirmations destructives** :
  - Modal avec titre explicite "Supprimer le produit ?"
  - Description conséquences "Cette action est irréversible"
  - Bouton danger (rouge) + bouton annuler (neutre)
  - Optionnel : Taper nom de l'élément pour confirmer

**Dashboards**

- **Cards métriques** : Valeur principale grande (2rem), label descriptif, variation % avec flèche
- **Graphiques** : Utiliser Chart.js ou Recharts (pas de bibliothèques lourdes)
- **Couleurs graphiques** : Palette cohérente avec design system
- **Période sélectionnable** : Tabs "7j / 30j / 12m / Personnalisé"
- **Empty states** : Illustrer avec icône + message + CTA si données vides

---

### 3. UX E-commerce Frontend

**Navigation produits**

- **Mega-menu** : Catégories avec sous-catégories + images si hover desktop
- **Fil d'Ariane** : Accueil > Catégorie > Sous-catégorie > Produit
- **Recherche intelligente** :
  - Autocomplete avec suggestions produits
  - Recherche floue (tolère fautes de frappe)
  - Afficher 5-6 suggestions max avec images miniatures

**Page catalogue**

- **Filtres sidebar gauche** (desktop) ou modal (mobile)
- **Tri** : Popularité, Prix croissant/décroissant, Nouveautés
- **Grid responsive** : 2 colonnes mobile, 3 tablette, 4 desktop
- **Lazy loading images** : Charger au scroll avec placeholder blur
- **Quick view** : Modal aperçu rapide produit sans quitter la liste
- **Infinite scroll OU pagination** : Préférer pagination pour SEO

**Fiche produit**

- **Galerie images** : Zoom au hover, thumbnails cliquables, slider mobile
- **Informations clés au-dessus du pli** : Prix, disponibilité, note, CTA
- **Sélecteurs variants** : Couleurs (pastilles), Tailles (boutons), Stock par variant visible
- **Quantité** : Input number avec +/- (min 1, max stock disponible)
- **Add to cart** : Bouton primaire large, feedback immédiat (animation + toast)
- **Tabs contenus** : Description, Caractéristiques, Avis, Livraison
- **Upsells/Cross-sells** : Section "Produits similaires" en bas de page
- **Trust signals** : Badges livraison gratuite, retour 30j, paiement sécurisé

**Panier**

- **Sticky sidebar** : Résumé panier visible en permanence (desktop)
- **Modification rapide** : Quantité, suppression sans confirmation
- **Calculs temps réel** : Sous-total, frais livraison, taxes, total
- **Codes promo** : Input dédié avec validation + affichage réduction
- **Empty state** : Illustration + "Votre panier est vide" + CTA "Continuer shopping"
- **Sauvegarde panier** : Persistance localStorage pour invités

**Checkout**

- **Progression claire** : Steps indicator (Livraison → Paiement → Confirmation)
- **1 étape = 1 écran** : Pas de formulaire géant
- **Récapitulatif toujours visible** : Sidebar avec produits + total
- **Adresse pré-remplie** : Pour clients connectés
- **Guest checkout** : Permettre achat sans compte (email requis)
- **Sécurité visible** : Icône cadenas, badge "Paiement sécurisé"
- **Confirmation** : Numéro commande, email envoyé, étapes suivantes, CTA suivi

**Compte client**

- **Menu latéral** : Commandes, Profil, Adresses, Wishlist, Déconnexion
- **Historique commandes** : États visuels (en cours, expédiée, livrée) avec tracking
- **Wishlist** : Add to cart rapide, notification si promo sur produit favori
- **Profil éditable** : Mode lecture/édition avec boutons Modifier/Enregistrer

---

### 4. Accessibilité (WCAG 2.1 AA minimum)

**Clavier**

- **Tab navigation** : Ordre logique, tous les interactifs accessibles
- **Focus visible** : ring-2 ring-blue-500 avec offset (outline-offset-2)
- **Shortcuts** : Esc fermer modal, Enter soumettre formulaire, Flèches navigation listes
- **Skip links** : "Aller au contenu principal" invisible jusqu'à focus

**Lecteurs d'écran**

- **Alt text images** : Descriptifs pour produits, vide ("") pour décoratives
- **ARIA labels** : Sur icônes-boutons sans texte (ex: `<button aria-label="Supprimer">`)
- **ARIA live regions** : Notifications, messages erreurs (polite ou assertive)
- **Landmark roles** : `<nav>`, `<main>`, `<aside>`, `<footer>` sémantiques
- **Headings hiérarchie** : 1 seul h1 par page, pas de saut de niveau

**Couleurs et contrastes**

- **Ne pas transmettre info uniquement par couleur** : Ajouter icône ou texte
- **Test contraste** : Utiliser outils (WebAIM, Stark) pour valider ratios
- **Focus indicators** : Jamais supprimer outline sans alternative visible

**Formulaires**

- **Labels explicites** : Toujours associer `<label for="id">` à `<input id="id">`
- **Erreurs descriptives** : "L'email est invalide" > "Erreur"
- **Required fields** : Attribut `required` + indicateur visuel (*)
- **Autocomplete** : Attributs HTML5 (name, email, tel, address-*)

---

### 5. Performance UX

**Temps de réponse perçus**

- **Instant (< 100ms)** : Feedback hover, focus, clics
- **Rapide (< 1s)** : Changements de page, soumissions formulaires
- **Optimistic UI** : Mettre à jour UI immédiatement, rollback si erreur API
- **Skeleton screens** : Afficher structure pendant chargement (pas spinner seul)
- **Lazy loading images** : Avec placeholder blur ou couleur dominante

**Indicateurs de progression**

- **Determiné** : Barre progression si durée connue (upload fichier)
- **Indéterminé** : Spinner si durée inconnue (requête API)
- **Pas d'indicateur** : Si action < 300ms (seuil perception humaine)

**Transitions et animations**

- **Durée** : 150-300ms pour micro-interactions, 300-500ms pour transitions complexes
- **Easing** : ease-out pour entrées, ease-in pour sorties, ease-in-out pour déplacements
- **Respect `prefers-reduced-motion`** : Désactiver animations si préférence système
- **But** : Feedback, orientation spatiale (ouverture modal), continuité (changement page)
- **Pas d'animations gratuites** : Chaque mouvement doit avoir un but UX

**Images et médias**

- **Format moderne** : WebP avec fallback JPEG (next/image le fait automatiquement)
- **Lazy loading** : `loading="lazy"` sur images below-the-fold
- **Responsive images** : srcset avec plusieurs résolutions
- **Placeholder** : blur ou couleur dominante pendant chargement

---

### 6. Mobile-First et Responsive

**Breakpoints Tailwind**

- **sm** (640px) : Téléphone paysage, petite tablette
- **md** (768px) : Tablette portrait
- **lg** (1024px) : Tablette paysage, petit desktop
- **xl** (1280px) : Desktop standard
- **2xl** (1536px) : Large desktop

**Patterns responsifs**

- **Navigation** :
  - Mobile : Hamburger menu avec overlay fullscreen
  - Desktop : Sidebar persistante ou top navbar
- **Tableaux** :
  - Mobile : Cards empilées (1 carte = 1 ligne tableau)
  - Desktop : Tableau classique
- **Formulaires** :
  - Mobile : 1 colonne, labels au-dessus
  - Desktop : 2 colonnes si logique
- **Modals** :
  - Mobile : Fullscreen ou bottom sheet
  - Desktop : Centré avec overlay

**Touch targets**

- **Taille minimum** : 44x44px pour boutons/liens (recommandation Apple/Google)
- **Espacement** : 8px minimum entre targets tactiles
- **Zones cliquables** : Étendre au-delà du visuel si nécessaire (padding invisible)

**Gestes**

- **Swipe** : Navigation carousel, fermer modal/drawer
- **Pull-to-refresh** : Actualiser listes (si applicable)
- **Pinch-to-zoom** : Activé sur images produits (désactivé ailleurs)
- **Long press** : Actions contextuelles (si applicable)

---

### 7. Micro-interactions et Délices UX

**Boutons**

- **Hover** : Changement couleur (-100 luminosité) + scale-105 subtil
- **Active** : scale-95 pour effet "enfoncé"
- **Loading** : Spinner + texte change + disabled
- **Success** : Icône checkmark verte temporaire (1s) après action

**Inputs**

- **Focus** : ring-2 avec couleur accent
- **Erreur** : ring-red + icône + message sous le champ
- **Success** : ring-green + icône checkmark (validation formulaire)
- **Auto-complete** : Dropdown avec highlight clavier

**Toasts/Notifications**

- **Slide-in** : Depuis haut (top) ou côté (right)
- **Auto-dismiss** : Fade out après délai
- **Empilables** : Max 3-4 simultanés, FIFO
- **Actions** : Bouton "Annuler" si action réversible

**Chargements**

- **Skeleton screens** : Formes grises animées (pulse)
- **Spinners** : Utilisés avec parcimonie (< 1s seulement)
- **Progress bar** : Pour uploads ou traitements longs
- **Percentage** : Afficher % si calcul disponible

**Empty states**

- **Illustratifs** : Icône ou illustration simple
- **Message clair** : "Aucun produit trouvé" + explication
- **CTA** : Action suggérée "Ajouter un produit" ou "Réinitialiser filtres"

---

### 8. Composants UI Réutilisables

**Créer une bibliothèque de composants** dans `src/components/common/`

**Essentiels**

- `Button` : Variants (primary, secondary, ghost, danger), sizes (sm, md, lg), loading state
- `Input` : Text, email, password, number avec error state
- `Select` : Dropdown avec search si > 10 options
- `Checkbox` / `Radio` : Styled avec états indeterminate
- `Toggle/Switch` : Pour settings binaires
- `Badge` : Status indicators (success, warning, error, info)
- `Avatar` : Image utilisateur avec fallback initiales
- `Card` : Conteneur réutilisable avec header/body/footer
- `Modal` : Overlay + dialog avec gestion focus trap
- `Drawer` : Sidebar slide-in (mobile menu, filtres)
- `Tabs` : Navigation horizontale avec indicateur actif
- `Accordion` : Sections collapsibles
- `Tooltip` : Info au hover (accessible au clavier)
- `Dropdown` : Menu contextuel
- `Pagination` : Composant réutilisable avec props
- `Table` : Avec tri, filtres, selection
- `Breadcrumbs` : Fil d'Ariane avec séparateurs
- `Stepper` : Progression étapes (checkout)
- `Toast` : Notifications système
- `Skeleton` : Loading placeholders
- `EmptyState` : État vide avec illustration

**Props patterns**

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string // Pour overrides Tailwind
}
```

**Composition plutôt que configuration**

- Préférer composants composables (`<Card><Card.Header>...</Card.Header></Card>`)
- Éviter props boolean excessives (max 3-4 par composant)
- Utiliser `children` pour flexibilité

---

### 9. Inspirations et Références 2026

**Backoffice moderne**

- **Linear** (linear.app) : Navigation, tableaux, shortcuts clavier
- **Notion** (notion.so) : Sidebar, breadcrumbs, inline editing
- **Stripe Dashboard** : Métriques, tables, dark mode élégant
- **Vercel Dashboard** : Performance, minimalisme, feedback utilisateur
- **Railway** : Dark mode, gradients subtils, micro-interactions

**E-commerce**

- **Shopify stores haut de gamme** : Navigation, filtres, fiches produits
- **Apple Store** : Simplicité, hiérarchie visuelle, product pages
- **Nike** : Mega-menus, filtres avancés, expérience mobile
- **Figma Store** : Checkout fluide, trust signals

**Design Systems publics**

- **Tailwind UI** (tailwindui.com) : Composants Tailwind prêts à l'emploi
- **Shadcn/ui** (ui.shadcn.com) : Composants React + Tailwind copiables
- **Radix UI** (radix-ui.com) : Primitives accessibles headless
- **Material Design 3** : Principes UX, élévation, états

**Outils UX**

- **Contrast checker** : WebAIM, Stark
- **Icon libraries** : Heroicons, Lucide, Phosphor
- **Illustrations** : Undraw, Storyset (pour empty states)
- **Animations** : Framer Motion (si animations complexes nécessaires)

---

### 10. Checklist UX par Écran

**Avant de valider un écran/page, vérifier**

**Visuel**

- [ ] Hiérarchie visuelle claire (titres, contenus, actions)
- [ ] Espacement cohérent (système 4px)
- [ ] Palette couleurs respectée (mode clair ET sombre)
- [ ] Typographie cohérente (tailles, weights)
- [ ] Contraste WCAG AA minimum (4.5:1 texte)
- [ ] Coins arrondis cohérents
- [ ] Ombres appropriées (légères en mode clair, aucune en mode sombre)

**Interactivité**

- [ ] États hover visibles sur tous les boutons/liens
- [ ] États focus clairs avec ring visible
- [ ] États disabled identifiables (opacité 50%, cursor not-allowed)
- [ ] Loading states sur toutes les actions async
- [ ] Feedback immédiat après actions (toast, message)
- [ ] Animations durée 150-300ms avec easing approprié
- [ ] Respect `prefers-reduced-motion`

**Formulaires**

- [ ] Labels clairs au-dessus des inputs
- [ ] Validation inline avec messages d'erreur descriptifs
- [ ] États visuels (default, focus, error, success)
- [ ] Boutons primaire/secondaire bien différenciés
- [ ] Auto-focus sur premier champ si pertinent
- [ ] Prévention perte données (confirmation si quitter sans save)

**Accessibilité**

- [ ] Navigation clavier complète (Tab, Enter, Esc)
- [ ] Focus visible avec ring
- [ ] Alt text sur toutes les images de contenu
- [ ] ARIA labels sur icônes-boutons
- [ ] Headings hiérarchie correcte (h1 → h2 → h3)
- [ ] Landmarks sémantiques (nav, main, aside, footer)
- [ ] Test lecteur d'écran (VoiceOver, NVDA)

**Responsive**

- [ ] Mobile (320px), tablette (768px), desktop (1024px+) testés
- [ ] Touch targets ≥ 44px sur mobile
- [ ] Navigation adaptée (hamburger mobile, sidebar desktop)
- [ ] Tableaux transformés en cards sur mobile si nécessaire
- [ ] Images lazy loaded avec placeholder

**Performance**

- [ ] Skeleton screens pendant chargements (pas juste spinner)
- [ ] Images optimisées (WebP, lazy loading, responsive)
- [ ] Pas de layout shift (CLS) au chargement
- [ ] Actions < 100ms feedback immédiat
- [ ] Optimistic UI si applicable

**Contenu**

- [ ] Empty states avec message + illustration + CTA
- [ ] Messages d'erreur clairs et actionnables
- [ ] Textes boutons explicites ("Créer un produit" > "Soumettre")
- [ ] Confirmations actions destructives (modal confirmation)
- [ ] Help text / tooltips si champs complexes

---

## Règles pour Claude

1. **Au début de chaque nouvelle session, lire obligatoirement les fichiers `README.md` et `LOGME.md`** pour comprendre le contexte du projet, son architecture et l'historique récent des étapes réalisées
2. Toujours lire le code existant avant de modifier
3. Respecter les patterns déjà en place dans le projet
4. Préférer les modifications minimales et ciblées
5. Ne pas sur-ingénier : simple > complexe
6. Valider avec les tests existants après modification
7. Si une dépendance est nécessaire, vérifier qu'elle n'existe pas déjà
8. **⚠️ CRITIQUE : TOUJOURS alerter l'utilisateur avec AskUserQuestion avant toute modification du schéma de base de données Odoo, des modèles, ou des endpoints API** (voir section "ALERTE : Modifications structurelles Odoo")
9. **🎨 UX/UI : Appliquer systématiquement les principes de la section "Principes UX/UI Modernes (2026)" lors du développement d'interfaces** - L'objectif est de créer une expérience utilisateur exceptionnelle qui surpasse largement l'interface Odoo standard
