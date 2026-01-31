# Conventions de Nomenclature des Routes

## Règle Générale

**TOUJOURS utiliser l'anglais pour :**
- Routes/URLs
- Module IDs
- Noms de fichiers/dossiers
- Variables et fonctions TypeScript/Python

**TOUJOURS utiliser le français pour :**
- Affichage UI (labels, titres, descriptions)
- Messages utilisateur
- Documentation utilisateur

## Structure des Modules

### Format Standard
```typescript
{
  id: 'module-name',           // ✅ ANGLAIS - identifiant technique
  name: 'Nom Français',        // ✅ FRANÇAIS - affichage UI
  basePath: '/module-name',    // ✅ ANGLAIS - route
  sections: [
    {
      title: 'Section FR',     // ✅ FRANÇAIS - affichage UI
      items: [
        {
          name: 'Item FR',     // ✅ FRANÇAIS - affichage UI
          path: '/module/page' // ✅ ANGLAIS - route
        }
      ]
    }
  ]
}
```

## Architecture Routing Suite

### ERP Complet (dashboard-client, port 5175)
Routes : `/home/*`, `/finance/*`, `/store/*`, `/stock/*`, `/crm/*`, `/marketing/*`, `/hr/*`, `/pos/*`, `/support/*`

### Super Admin (super-admin-client, port 9000)
Routes : `/tenants`, `/subscriptions`, `/billing`, `/analytics`

## Modules ERP Complet

### Liste des 9 Modules

| Module ID | Route Base | Nom Affiché | Description |
|-----------|------------|-------------|-------------|
| `home` | `/dashboard` | Accueil | Vue d'ensemble |
| `finance` | `/finance` | Finance | Trésorerie & Budgets |
| `store` | `/store` | Boutique | E-commerce |
| `stock` | `/stock` | Stock | Inventaire |
| `crm` | `/crm` | CRM | Clients & Ventes |
| `marketing` | `/marketing` | Marketing | Campagnes & Analytics |
| `hr` | `/hr` | RH | Employés & Paie |
| `support` | `/support` | Support | Helpdesk |
| `pos` | `/pos` | Point de Vente | Caisse |

### Exemples de Routes par Module

#### Store (Boutique)
```
/store                     → redirect vers /store/my-shop
/store/my-shop            → Ma Boutique
/store/orders             → Commandes
/store/products           → Produits
/store/categories         → Catégories
/store/coupons            → Codes Promo
/store/site-config        → Configuration Site
```

#### CRM
```
/crm                      → redirect vers /crm/customers
/crm/customers            → Clients
/crm/customers/:id        → Détail Client
/crm/customer-categories  → Catégories Clients
```

#### Finance
```
/finance                  → Dashboard Finance
/finance/accounts         → Comptes
/finance/transactions     → Transactions
/finance/budgets          → Budgets
/finance/reporting        → Rapports
```

#### HR (RH)
```
/hr                       → Dashboard RH
/hr/employees             → Employés
/hr/departments           → Départements
/hr/leaves                → Congés
```

## Règles de Nommage des Routes

### ✅ FAIRE
- Utiliser l'anglais : `/store/products`, `/hr/employees`
- Utiliser le kebab-case : `/customer-categories`, `/my-shop`
- Rester cohérent avec le Module ID
- Préfixer par le module : `/store/...`, `/crm/...`

### ❌ NE PAS FAIRE
- Mélanger français/anglais : `/boutique/products` ❌
- Utiliser camelCase : `/customerCategories` ❌
- Utiliser snake_case : `/customer_categories` ❌
- Routes sans préfixe module : `/products` (ambigu) ❌

## Nomenclature des Fichiers

### Structure des Dossiers Pages
```
dashboard-client/src/pages/
├── store/              ✅ anglais
│   ├── Products.tsx    ✅ PascalCase pour composants
│   ├── Orders.tsx
│   └── MyShop.tsx
├── crm/               ✅ anglais
│   ├── Customers.tsx
│   └── CustomerDetail.tsx
├── finance/           ✅ anglais
└── hr/                ✅ anglais (pas rh/)
```

### Composants
```typescript
// ✅ CORRECT
import Products from './pages/store/Products'
<Route path="/store/products" element={<Products />} />

// ❌ INCORRECT
import Products from './pages/boutique/Products'  // dossier français
<Route path="/boutique/products" />              // route française
```

## Types TypeScript

### Module IDs
```typescript
// ✅ CORRECT - tout en anglais
type ModuleId = 'home' | 'finance' | 'store' | 'stock' | 'crm' | 'marketing' | 'hr'

// ❌ INCORRECT - mélange
type ModuleId = 'home' | 'finance' | 'boutique' | 'stock' | 'crm' | 'marketing' | 'rh'
```

### Détection de Module
```typescript
// ✅ CORRECT
if (path.startsWith('/store')) return MODULES.find(m => m.id === 'store')!
if (path.startsWith('/hr')) return MODULES.find(m => m.id === 'hr')!

// ❌ INCORRECT
if (path.startsWith('/ecms')) return MODULES.find(m => m.id === 'boutique')!
if (path.startsWith('/hr')) return MODULES.find(m => m.id === 'rh')!
```

## Cohérence Globale

### Code Backend (Odoo/Python)
```python
# ✅ Routes API en anglais
@http.route('/api/store/products', type='json', auth='user')
@http.route('/api/crm/customers', type='json', auth='user')
```

### URLs Frontend
```typescript
// ✅ Routes frontend en anglais
'/store/products'
'/crm/customers'
'/hr/employees'
```

### Affichage UI
```typescript
// ✅ Labels en français
{ name: 'Produits', path: '/store/products' }
{ name: 'Clients', path: '/crm/customers' }
{ name: 'Employés', path: '/hr/employees' }
```

## Checklist de Validation

Avant de créer une nouvelle route/module :

- [ ] Le Module ID est en anglais ?
- [ ] La route est en anglais ?
- [ ] Le dossier pages est en anglais ?
- [ ] Les labels UI sont en français ?
- [ ] La convention kebab-case est respectée ?
- [ ] Le préfixe module est présent ?
- [ ] Cohérent avec les modules existants ?

## Historique des Corrections

### 2025-01-26
- ✅ `'boutique'` → `'store'` (ModuleId + routes `/ecms/` → `/store/`)
- ✅ `'rh'` → `'hr'` (ModuleId)
- ✅ Renommé dossier `pages/ecms/` → `pages/store/`
- ✅ Mis à jour toutes les références dans le code

## Références

- **ModularLayout.tsx** : Définition des modules et routes
- **App.tsx** : Configuration des routes React Router
- **ARCHITECTURE.md** : Vue d'ensemble de l'architecture
