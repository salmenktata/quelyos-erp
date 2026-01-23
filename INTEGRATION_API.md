# Guide d'Intégration API - Frontend Next.js ↔ Backend Odoo

## 📋 Vue d'ensemble

Ce guide explique comment le frontend Next.js communique avec le backend Odoo via l'API REST du module `quelyos_ecommerce`.

## 🔌 Architecture de Communication

```
┌─────────────────────────────┐
│   Frontend (Next.js 14)     │
│   Port: 3000                │
│                             │
│  ┌──────────────────────┐  │
│  │  Pages & Components  │  │
│  └──────────┬───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │  odooClient.ts       │  │
│  │  (Axios Instance)    │  │
│  └──────────┬───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │  Zustand Stores      │  │
│  │  (State Management)  │  │
│  └──────────────────────┘  │
└─────────────┬───────────────┘
              │ HTTP/JSON + Cookies
              │
┌─────────────▼───────────────┐
│   Backend (Odoo 19)         │
│   Port: 8069                │
│                             │
│  ┌──────────────────────┐  │
│  │  quelyos_ecommerce   │  │
│  │  Controllers (API)   │  │
│  └──────────┬───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │  Services            │  │
│  │  (Business Logic)    │  │
│  └──────────┬───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │  Models (ORM)        │  │
│  │  PostgreSQL          │  │
│  └──────────────────────┘  │
└─────────────────────────────┘
```

## 🛠️ Configuration Initiale

### 1. Variables d'Environnement

**Frontend** (`.env.local`):
```bash
# API Odoo
NEXT_PUBLIC_ODOO_URL=http://localhost:8069
ODOO_DATABASE=quelyos
ODOO_WEBHOOK_SECRET=your_webhook_secret_here

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Branding
NEXT_PUBLIC_PRIMARY_COLOR=#01613a
NEXT_PUBLIC_SECONDARY_COLOR=#c9c18f
```

**Backend Odoo**:
Dans Odoo → E-commerce → Configuration:
- Frontend URL: `http://localhost:3000`
- Webhook Secret: `your_webhook_secret_here`

### 2. CORS Configuration

Le module `quelyos_ecommerce` configure automatiquement CORS:

```python
# backend/addons/quelyos_ecommerce/controllers/*.py
@http.route('/api/ecommerce/...', type='json', auth='public', csrf=False, cors='*')
```

## 📡 Endpoints API Disponibles

### Authentification

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/ecommerce/auth/login` | public | Connexion utilisateur |
| POST | `/api/ecommerce/auth/logout` | user | Déconnexion |
| GET | `/api/ecommerce/auth/session` | public | Vérifier session |
| POST | `/api/ecommerce/auth/register` | public | Inscription |

**Exemple Login**:
```typescript
const response = await odooClient.login('email@example.com', 'password');
// Response: { success: true, user: {...}, session_id: '...' }
```

### Produits

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/ecommerce/products` | public | Liste produits avec filtres |
| GET | `/api/ecommerce/products/:id` | public | Détail produit par ID |
| GET | `/api/ecommerce/products/slug/:slug` | public | Détail produit par slug |
| GET | `/api/ecommerce/categories` | public | Liste catégories |

**Exemple Produits avec Filtres**:
```typescript
const response = await odooClient.getProducts({
  category_id: 5,
  search: 'laptop',
  price_min: 100,
  price_max: 1000,
  is_featured: true,
  limit: 20,
  offset: 0,
  sort: 'price_asc',
});
// Response: { success: true, products: [...], total: 50, facets: {...} }
```

### Panier

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/ecommerce/cart` | public | Récupérer panier |
| POST | `/api/ecommerce/cart/add` | public | Ajouter produit |
| PUT | `/api/ecommerce/cart/update/:line_id` | public | Modifier quantité |
| DELETE | `/api/ecommerce/cart/remove/:line_id` | public | Supprimer ligne |
| DELETE | `/api/ecommerce/cart/clear` | public | Vider panier |

**Note**: Le panier fonctionne en mode invité (session) ou authentifié (partner_id).

**Exemple Ajout au Panier**:
```typescript
const response = await odooClient.addToCart(productId, quantity);
// Response: { success: true, cart: {...} }
```

### Checkout

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/ecommerce/checkout/validate` | user | Valider panier |
| POST | `/api/ecommerce/checkout/shipping` | user | Définir adresse |
| POST | `/api/ecommerce/checkout/confirm` | user | Confirmer commande |
| GET | `/api/ecommerce/payment-methods` | public | Méthodes paiement |

**Exemple Confirmation Commande**:
```typescript
const response = await odooClient.confirmOrder({
  shipping_address: {...},
  payment_method: 'card',
});
// Response: { success: true, order: {...} }
```

### Espace Client

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/ecommerce/customer/profile` | user | Profil client |
| PUT | `/api/ecommerce/customer/profile` | user | Modifier profil |
| GET | `/api/ecommerce/customer/orders` | user | Liste commandes |
| GET | `/api/ecommerce/customer/orders/:id` | user | Détail commande |
| GET | `/api/ecommerce/customer/addresses` | user | Liste adresses |
| POST | `/api/ecommerce/customer/addresses` | user | Ajouter adresse |

### Wishlist

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/ecommerce/wishlist` | user | Liste wishlist |
| POST | `/api/ecommerce/wishlist/add` | user | Ajouter produit |
| DELETE | `/api/ecommerce/wishlist/remove/:product_id` | user | Retirer produit |

## 🔐 Authentification & Session

### Session Odoo Portal Native

Le frontend utilise l'authentification Portal native d'Odoo via cookies:

```typescript
// 1. Login
const { user, session_id } = await odooClient.login(email, password);

// 2. Le session_id est stocké dans localStorage
localStorage.setItem('odoo_session_id', session_id);

// 3. Toutes les requêtes incluent le session_id
axios.defaults.headers.common['Cookie'] = `session_id=${session_id}`;

// 4. Logout
await odooClient.logout();
localStorage.removeItem('odoo_session_id');
```

### Gestion des Erreurs

```typescript
try {
  const response = await odooClient.getProducts();
  if (!response.success) {
    console.error('API Error:', response.error);
  }
} catch (error) {
  if (error.response?.status === 401) {
    // Session expirée → rediriger vers login
    router.push('/login');
  }
}
```

## 🔄 State Management (Zustand)

### Cart Store

```typescript
// Utilisation
const { cart, addToCart, fetchCart, updateQuantity } = useCartStore();

// Actions disponibles
await fetchCart();                    // Récupérer panier depuis API
await addToCart(productId, quantity); // Ajouter au panier
await updateQuantity(lineId, qty);    // Modifier quantité
await removeItem(lineId);             // Supprimer ligne
await clearCart();                    // Vider panier
```

### Auth Store

```typescript
// Utilisation
const { user, isAuthenticated, login, logout } = useAuthStore();

// Actions disponibles
await login(email, password);         // Se connecter
await logout();                       // Se déconnecter
await register(userData);             // S'inscrire
await checkSession();                 // Vérifier session
```

## 📊 Format des Données

### Product

```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  technical_description?: string;
  list_price: number;
  currency: {
    id: number;
    name: string;
    symbol: string;
  };
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  images: Array<{
    id: string | number;
    url: string;
    alt: string;
  }>;
  category?: {
    id: number;
    name: string;
  };
  in_stock: boolean;
  stock_qty: number;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
    in_stock: boolean;
    attributes: Array<{
      name: string;
      value: string;
    }>;
  }>;
  seo: {
    slug: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
  };
  view_count: number;
  wishlist_count: number;
  related_products?: number[];
}
```

### Cart

```typescript
interface Cart {
  id: number | null;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_slug: string;
    image_url: string;
    quantity: number;
    price_unit: number;
    price_total: number;
    discount: number;
  }>;
  amount_untaxed: number;
  amount_tax: number;
  amount_total: number;
  delivery_amount?: number;
  line_count: number;
  item_count: number;
  currency: {
    id: number;
    name: string;
    symbol: string;
  };
}
```

### User

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  partner_id: number;
}
```

## 🚀 Activation de l'API Réelle

### Étape 1: Installer le Module Odoo

```bash
# Dans Odoo
Apps → Update Apps List → Search "Quelyos E-commerce" → Install
```

### Étape 2: Créer des Produits de Test

```python
# Dans Odoo Shell ou via interface
products = env['product.template'].create([
    {
        'name': 'Laptop Dell XPS 15',
        'list_price': 1299.99,
        'is_featured': True,
        'is_new': True,
        'categ_id': env.ref('product.product_category_5').id,
    },
    # ... plus de produits
])
```

### Étape 3: Tester les Endpoints

```bash
# Test produits
curl http://localhost:8069/api/ecommerce/products

# Test login
curl -X POST http://localhost:8069/api/ecommerce/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin@example.com", "password": "admin"}'
```

### Étape 4: Activer dans le Frontend

Les composants utilisent déjà `odooClient` qui est configuré pour appeler l'API réelle. Aucun changement de code n'est nécessaire si:

✅ Odoo tourne sur `localhost:8069`
✅ Module `quelyos_ecommerce` est installé
✅ `.env.local` est configuré correctement

## 🐛 Débogage

### Activer les Logs

**Frontend** (DevTools Console):
```typescript
// Dans odooClient.ts, décommenter:
console.log('API Request:', config);
console.log('API Response:', response.data);
```

**Backend** (Logs Odoo):
```python
# Dans les controllers
import logging
_logger = logging.getLogger(__name__)

_logger.info('API Request: %s', request.httprequest.url)
_logger.info('Response: %s', result)
```

### Erreurs Communes

**1. CORS Error**:
- Vérifier que `cors='*'` est dans les routes
- Vérifier la configuration Next.js

**2. 401 Unauthorized**:
- Session expirée → Re-login
- Vérifier que le cookie session est envoyé

**3. Network Error**:
- Vérifier que Odoo tourne sur port 8069
- Vérifier `NEXT_PUBLIC_ODOO_URL`

**4. Empty Response**:
- Vérifier que des produits existent dans Odoo
- Vérifier les filtres appliqués

## 📚 Prochaines Étapes

1. ✅ Créer des produits de test dans Odoo
2. ✅ Tester login/register
3. ✅ Tester parcours d'achat complet
4. ✅ Vérifier les données dans PostgreSQL
5. ✅ Monitorer les performances API
6. → Implémenter le cache Redis (optionnel)
7. → Ajouter rate limiting (production)
8. → Configurer webhooks temps réel
