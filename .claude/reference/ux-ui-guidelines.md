# Principes UX/UI Modernes (2026)

## Design System

### Couleurs
- Mode clair : Tons neutres + accent brand
- Mode sombre : Gris 900-950, éviter blanc pur
- Sémantique : emerald (succès), red (erreur), amber (attention), blue (info)
- Contraste WCAG 2.1 AA : 4.5:1 texte, 3:1 grands textes

### Typographie
- H1: 2.25rem bold, H2: 1.875rem semibold, H3: 1.5rem semibold
- Body: 1rem, Small: 0.875rem
- Font: Inter, SF Pro, Segoe UI

### Espacements (multiples 4px)
- Padding conteneurs : 16px mobile, 24px tablette, 32px desktop
- Gap : 8px (tight), 16px (normal), 24px (loose)

### Coins arrondis
- Boutons: rounded-lg, Cards: rounded-xl, Inputs: rounded-md, Modals: rounded-2xl

### Ombres
- Mode clair : shadow-sm (repos), shadow-md (hover), shadow-lg (modals)
- Mode sombre : pas d'ombre, utiliser border subtile

## Branding SaaS (7 identités)

Chaque SaaS a sa couleur primaire distincte :
| SaaS | Couleur Primaire | Hex |
|------|-----------------|-----|
| Quelyos Finance | Emerald 600 | `#059669` |
| Quelyos Store | Violet 600 | `#7C3AED` |
| Quelyos Copilote | Orange 600 | `#EA580C` |
| Quelyos Sales | Blue 600 | `#2563EB` |
| Quelyos Retail | Red 600 | `#DC2626` |
| Quelyos Team | Cyan 600 | `#0891B2` |
| Quelyos Support | Purple 600 | `#9333EA` |

**Règle** : Chaque app SaaS utilise sa couleur comme `primaryColor` dans Tailwind. Le sous-titre "by Quelyos" apparait partout.

## Patterns Backoffice
- Sidebar 240-280px avec icônes + labels
- Tableaux : dense mais lisible, skeleton loading, filtres, recherche debounce 300ms
- Formulaires : 1 col mobile / 2 col desktop, labels au-dessus, validation inline
- Toasts : top-right, auto-dismiss 3s succès / 5s info / manuel erreur

## Patterns E-commerce
- Mega-menu catégories, recherche autocomplete
- Grid : 2 col mobile, 3 tablette, 4 desktop
- Fiche produit : galerie zoom, variants couleurs/tailles, stock visible
- Checkout : steps clairs, guest checkout, récapitulatif sticky

## Accessibilité (WCAG 2.1 AA)
- Tab navigation, focus visible (ring-2)
- Alt text, ARIA labels sur icônes-boutons
- Landmarks sémantiques (nav, main, aside)
- Labels formulaires explicites

## Performance UX
- Skeleton screens (pas spinner seul)
- Lazy loading images avec blur placeholder
- Optimistic UI
- Animations 150-300ms avec easing

## Mobile-First
- Breakpoints : sm(640), md(768), lg(1024), xl(1280)
- Touch targets : 44x44px minimum
- Navigation : hamburger mobile, sidebar desktop
