# Quelyos Theme Engine - POC Phase 1

## 🎯 Vue d'Ensemble

Moteur de thème propriétaire permettant de créer des thèmes e-commerce via **configurations JSON déclaratives** + composants React réutilisables.

**Avantages** :
- ✅ Scalabilité extrême (nouveau thème = 2-4h vs 2-5 jours)
- ✅ Maintenance centralisée (1 bug fix = tous les thèmes corrigés)
- ✅ Aucune licence externe
- ✅ Performance optimale (React + Next.js SSR)
- ✅ Customisation facile par tenants (modification JSON)

## 📁 Structure

```
src/theme-engine/
├── components/          # Composants sections réutilisables
│   └── sections/
│       ├── HeroSlider/       # Hero avec slider
│       │   ├── index.tsx
│       │   └── variants/     # 3 variants (fullscreen, split, minimal)
│       ├── FeaturedProducts/ # Produits mis en avant
│       │   └── variants/     # 2 variants (grid-4cols, carousel)
│       ├── Newsletter/       # Inscription newsletter
│       │   └── variants/     # 2 variants (centered, with-background)
│       ├── Testimonials/     # Témoignages clients
│       │   └── variants/     # 2 variants (grid, carousel)
│       └── [TODO: FAQ, TrustBadges, CallToAction, Blog, Contact]
├── engine/              # Moteur de rendu
│   ├── types.ts              # Types TypeScript
│   ├── ThemeContext.tsx      # Context React
│   ├── ThemeRenderer.tsx     # Renderer principal
│   └── SectionRenderer.tsx   # Renderer sections dynamiques
├── schemas/             # JSON Schema validation
│   ├── theme.schema.json     # Schéma de validation
│   └── examples/             # Thèmes exemples
│       ├── tech-minimal.json
│       └── food-organic.json
├── themes/              # Thèmes production
│   └── fashion-luxury.json   # Thème Fashion Luxury complet
└── index.ts             # Point d'entrée principal
```

## 🚀 Utilisation

### 1. Charger un Thème

```tsx
import { ThemeRenderer, fashionLuxuryTheme } from '@/theme-engine';

export default function RootLayout({ children }) {
  return (
    <ThemeRenderer config={fashionLuxuryTheme}>
      {children}
    </ThemeRenderer>
  );
}
```

### 2. Rendre des Sections Dynamiques

```tsx
import { SectionRenderer } from '@/theme-engine';

export default function HomePage() {
  const theme = await getThemeFromBackend(); // Odoo API

  return (
    <SectionRenderer sections={theme.layouts.homepage.sections} />
  );
}
```

### 3. Accéder au Thème dans un Composant

```tsx
'use client';

import { useTheme } from '@/theme-engine';

export function CustomButton() {
  const { colors, typography } = useTheme();

  return (
    <button
      style={{
        backgroundColor: colors.primary,
        fontFamily: typography.body,
      }}
    >
      Cliquez-moi
    </button>
  );
}
```

## 🎨 Créer un Nouveau Thème

### Exemple : Thème "Beauty Spa"

```json
{
  "id": "beauty-spa",
  "name": "Beauty Spa",
  "category": "beauty",
  "colors": {
    "primary": "#d4a5a5",
    "secondary": "#f7e7ce"
  },
  "typography": {
    "headings": "Cormorant",
    "body": "Lato"
  },
  "layouts": {
    "homepage": {
      "sections": [
        {
          "type": "hero-slider",
          "variant": "fullscreen-autoplay",
          "config": {
            "slides": [...]
          }
        },
        {
          "type": "featured-products",
          "variant": "grid-4cols",
          "config": {
            "limit": 8
          }
        },
        {
          "type": "newsletter",
          "variant": "centered-minimal"
        }
      ]
    },
    "productPage": {...},
    "categoryPage": {...}
  },
  "components": {
    "productCard": "style-overlay",
    "header": "transparent-sticky",
    "footer": "columns-3",
    "buttons": "rounded-shadow"
  },
  "spacing": {
    "sectionPadding": "large",
    "containerWidth": "1400px"
  }
}
```

**Temps de création** : 2-4 heures (vs 2-5 jours pour conversion thème externe)

## 🔌 Intégration Backend Odoo

### 1. Modèle Odoo (à créer)

```python
# odoo-backend/addons/quelyos_api/models/theme.py
class QuelyosTheme(models.Model):
    _name = 'quelyos.theme'

    code = fields.Char(required=True, index=True)
    name = fields.Char(required=True)
    category = fields.Selection([
        ('fashion', 'Mode'),
        ('tech', 'High-Tech'),
        ('food', 'Alimentaire'),
        ('beauty', 'Beauté'),
        ('sports', 'Sports'),
        ('home', 'Maison'),
    ])
    config_json = fields.Text(required=True)  # Configuration JSON complète
    thumbnail = fields.Binary(attachment=True)
    preview_url = fields.Char()
    is_public = fields.Boolean(default=True)
    price = fields.Float(default=0.0)  # 0 = gratuit
```

### 2. Endpoint API

```python
@http.route('/api/themes/<string:theme_id>', auth='public', type='jsonrpc')
def get_theme(self, theme_id):
    theme = request.env['quelyos.theme'].sudo().search([
        ('code', '=', theme_id),
        ('is_public', '=', True)
    ], limit=1)

    if not theme:
        return {'error': 'Theme not found'}

    return {
        'id': theme.code,
        'name': theme.name,
        'category': theme.category,
        'config': json.loads(theme.config_json),
    }
```

### 3. Utilisation Frontend

```tsx
// vitrine-client/src/app/layout.tsx
import { ThemeRenderer } from '@/theme-engine';

export default async function RootLayout({ children }) {
  const tenant = getTenant(); // Depuis cookie/subdomain
  const themeConfig = await fetch(`${process.env.BACKEND_URL}/api/themes/${tenant.activeThemeId}`);

  return (
    <ThemeRenderer config={themeConfig}>
      {children}
    </ThemeRenderer>
  );
}
```

## 📊 Sections Disponibles (Phase 1)

| Section | Variants | Status |
|---------|----------|--------|
| **HeroSlider** | fullscreen-autoplay, split-screen, minimal | ✅ Implémenté |
| **FeaturedProducts** | grid-4cols, carousel | ✅ Implémenté |
| **Newsletter** | centered-minimal, with-background | ✅ Implémenté |
| **Testimonials** | grid, carousel | ✅ Implémenté |
| **Hero** | - | ⏳ TODO |
| **FAQ** | - | ⏳ TODO |
| **TrustBadges** | - | ⏳ TODO |
| **CallToAction** | - | ⏳ TODO |
| **Blog** | - | ⏳ TODO |
| **Contact** | - | ⏳ TODO |

## 🎯 Phase 1 Complète

**Livrables** :
- ✅ Moteur de rendu (`ThemeRenderer`, `SectionRenderer`)
- ✅ 4 sections complètes (HeroSlider, FeaturedProducts, Newsletter, Testimonials)
- ✅ 9 variants au total
- ✅ 3 thèmes exemples (Fashion Luxury, Tech Minimal, Food Organic)
- ✅ Types TypeScript complets
- ✅ JSON Schema validation
- ⏳ Intégration backend Odoo (à faire)

**Temps développement** : ~80-100h (2 dev × 2 semaines)

## 🚧 Prochaines Étapes (Phase 2)

1. Compléter les 6 sections restantes (Hero, FAQ, TrustBadges, etc.)
2. Créer modèle `quelyos.theme` dans Odoo
3. Créer endpoints API (`/api/themes`, `/api/themes/<id>`)
4. Intégrer sélection thème dans dashboard-client
5. Créer 7 thèmes supplémentaires (10 thèmes total)
6. Tests automatisés (Jest + Playwright)

## 📝 Notes Importantes

### Variables CSS Générées

Le `ThemeRenderer` génère automatiquement des variables CSS :

```css
--theme-primary: #2c2c2c
--theme-secondary: #d4af37
--theme-accent: #ff6b6b
--theme-font-headings: "Playfair Display"
--theme-font-body: "Lato"
--theme-container-width: 1400px
--theme-section-padding: 6rem
```

Utilisables partout :

```tsx
<h1 style={{ fontFamily: 'var(--theme-font-headings)' }}>Titre</h1>
```

### Données Produits

Les sections `FeaturedProducts` utilisent des données **mock** pour le POC.

**À faire** : Remplacer par appels API Odoo :

```tsx
const products = await fetch(`${process.env.BACKEND_URL}/api/products?limit=${limit}&sort=${sortBy}`);
```

### Dark Mode

Tous les composants supportent le dark mode via Tailwind (`dark:bg-gray-900`, etc.).

## 🎨 Customisation Tenant

Les tenants peuvent **override** des sections spécifiques :

```json
{
  "id": "fashion-luxury",
  "name": "Fashion Luxury (Customisé par Tenant XYZ)",
  "layouts": {
    "homepage": {
      "sections": [
        {
          "type": "hero-slider",
          "variant": "fullscreen-autoplay",
          "config": {
            "slides": [
              {
                "image": "/tenant-xyz/custom-hero.jpg",
                "title": "Ma Boutique Personnalisée"
              }
            ]
          }
        }
      ]
    }
  }
}
```

## 📈 Métriques Scalabilité

| Métrique | Conversion Thèmes Existants | Moteur Propriétaire |
|----------|----------------------------|---------------------|
| Temps création thème | 2-5 jours | 2-4 heures |
| Coût 50 thèmes | $107k + $50k/an | $65k + $35k/an |
| Maintenance | Complexe (code hétérogène) | Simple (centralisée) |
| Licences | Problématique | Aucune |
| Customisation tenant | Difficile | Facile (JSON) |
| Tests auto | Impossible | Facile |

## 🔒 Conformité ESLint

Code généré conforme aux règles ESLint strict :
- ✅ `'use client'` pour composants React
- ✅ Types TypeScript explicites
- ✅ Pas de `any`
- ✅ Variables non utilisées préfixées `_`
- ✅ Imports ES6
- ✅ Dark mode sur tous composants

## 📚 Documentation Complète

Voir plan stratégique complet dans `/docs/THEME_ENGINE_STRATEGY.md`
