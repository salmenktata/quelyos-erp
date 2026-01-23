# Guide d'Activation CSRF pour quelyos_ecommerce

## 📋 Vue d'ensemble

Ce document explique comment activer la protection CSRF sur les 50 endpoints API quelyos_ecommerce, et comment adapter le frontend Next.js pour fonctionner avec CSRF.

---

## 🔒 Pourquoi CSRF est Important

**CSRF (Cross-Site Request Forgery)** est une attaque où un site malveillant force le navigateur d'un utilisateur authentifié à faire des requêtes non désirées vers votre API.

### Exemple d'attaque sans CSRF:
```html
<!-- Site malveillant evil.com -->
<form action="https://quelyos.com/api/ecommerce/cart/add" method="POST">
  <input name="product_id" value="999">
  <input name="quantity" value="1000">
</form>
<script>document.forms[0].submit();</script>
```

Si l'utilisateur est connecté sur quelyos.com, cette requête réussira car le navigateur enverra automatiquement les cookies de session.

### Solution: CSRF Token
Un token CSRF unique par session empêche les requêtes cross-origin:
- Le frontend doit inclure le token dans chaque requête POST/PUT/DELETE
- Le backend vérifie que le token est valide
- Les sites malveillants ne peuvent pas obtenir ce token (Same-Origin Policy)

---

## 🎯 Stratégie d'Activation

### Phase 1: Préparation Frontend (Semaine 1)
1. Obtenir le token CSRF
2. Inclure le token dans toutes les requêtes API
3. Tester en environnement de développement

### Phase 2: Activation Graduelle (Semaine 2-3)
1. Activer CSRF sur endpoints non-critiques (produits, wishlist)
2. Monitorer les erreurs
3. Activer sur endpoints critiques (auth, cart, checkout)
4. Activer sur paiements

### Phase 3: Production (Semaine 4)
1. Déployer frontend avec support CSRF
2. Activer CSRF sur tous les endpoints en production
3. Monitorer 48h
4. Rollback possible si problèmes

---

## 🔧 Frontend Next.js: Implémentation

### 1. Récupérer le Token CSRF

```typescript
// lib/csrf.ts
let csrfToken: string | null = null;

export async function getCSRFToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('http://localhost:8069/web/session/get_session_info', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (data.result && data.result.csrf_token) {
      csrfToken = data.result.csrf_token;
      return csrfToken;
    }

    throw new Error('CSRF token not found in session');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
}

export function resetCSRFToken() {
  csrfToken = null;
}
```

### 2. Wrapper API avec CSRF

```typescript
// lib/api.ts
import { getCSRFToken, resetCSRFToken } from './csrf';

interface APIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

export async function apiCall(endpoint: string, options: APIOptions = {}) {
  const { method = 'POST', body, requireAuth = false } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Pour les méthodes autres que GET, ajouter le token CSRF
  if (method !== 'GET') {
    try {
      const csrfToken = await getCSRFToken();
      headers['X-CSRF-Token'] = csrfToken;
    } catch (error) {
      console.error('Failed to add CSRF token:', error);
      // Continue sans CSRF pour compatibilité avec anciens endpoints
    }
  }

  const response = await fetch(`http://localhost:8069${endpoint}`, {
    method,
    headers,
    credentials: 'include', // Important: envoyer les cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  // Si erreur CSRF, réessayer après refresh du token
  if (data.error && data.error.includes('CSRF')) {
    console.log('CSRF token expired, retrying...');
    resetCSRFToken();
    return apiCall(endpoint, options); // Retry récursif
  }

  return data;
}
```

### 3. Utilisation dans les Composants

```typescript
// pages/cart.tsx
import { apiCall } from '@/lib/api';

export default function CartPage() {
  async function addToCart(productId: number, quantity: number) {
    try {
      const result = await apiCall('/api/ecommerce/cart/add', {
        method: 'POST',
        body: { product_id: productId, quantity },
      });

      if (result.success) {
        console.log('Product added to cart');
      } else {
        console.error('Failed to add to cart:', result.error);
      }
    } catch (error) {
      console.error('API error:', error);
    }
  }

  return (
    // ... UI
  );
}
```

### 4. Hook React pour CSRF

```typescript
// hooks/useCSRF.ts
import { useEffect, useState } from 'react';
import { getCSRFToken } from '@/lib/csrf';

export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getCSRFToken()
      .then(setToken)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { token, loading, error };
}

// Usage:
export default function MyComponent() {
  const { token, loading } = useCSRF();

  if (loading) return <div>Loading...</div>;

  return <div>CSRF Token ready: {token ? '✓' : '✗'}</div>;
}
```

---

## 🔧 Backend Odoo: Activation CSRF

### Option 1: Activer Progressivement (Recommandé)

Créer un fichier de configuration:

```python
# controllers/csrf_config.py
"""
Configuration CSRF par endpoint.
Permet d'activer progressivement le CSRF endpoint par endpoint.
"""

CSRF_ENABLED_ENDPOINTS = {
    # Products (faible risque)
    '/api/ecommerce/products': True,
    '/api/ecommerce/products/<int:product_id>': True,
    '/api/ecommerce/categories': True,

    # Wishlist (faible risque)
    '/api/ecommerce/wishlist': True,
    '/api/ecommerce/wishlist/add': True,
    '/api/ecommerce/wishlist/remove/<int:product_id>': True,

    # Cart (risque moyen) - Phase 2
    '/api/ecommerce/cart/add': False,  # À activer après tests
    '/api/ecommerce/cart/update': False,
    '/api/ecommerce/cart/remove': False,

    # Auth (risque élevé) - Phase 3
    '/api/ecommerce/auth/login': False,
    '/api/ecommerce/auth/register': False,
    '/api/ecommerce/auth/logout': False,

    # Checkout (critique) - Phase 4
    '/api/ecommerce/checkout/confirm': False,
    '/api/ecommerce/payment/stripe/intent': False,
    '/api/ecommerce/payment/stripe/confirm': False,
}

def is_csrf_enabled(route):
    """Vérifie si CSRF est activé pour cette route."""
    return CSRF_ENABLED_ENDPOINTS.get(route, False)
```

Modifier les routes:

```python
# controllers/products.py
from .csrf_config import is_csrf_enabled

@http.route('/api/ecommerce/products', type='json', auth='public', methods=['GET', 'POST'],
            csrf=is_csrf_enabled('/api/ecommerce/products'), cors='*')
def get_products(self, **kwargs):
    # ...
```

### Option 2: Activer Tout d'un Coup

```bash
# Script pour activer CSRF sur tous les endpoints
cd backend/addons/quelyos_ecommerce/controllers
find . -name "*.py" -exec sed -i '' 's/csrf=False/csrf=True/g' {} +
```

**⚠️ Attention:** Cette approche nécessite que le frontend soit 100% prêt avant.

---

## 🧪 Tests

### Test 1: Token CSRF est Récupéré

```typescript
// tests/csrf.test.ts
describe('CSRF Token', () => {
  it('should fetch CSRF token from session', async () => {
    const token = await getCSRFToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should cache CSRF token', async () => {
    const token1 = await getCSRFToken();
    const token2 = await getCSRFToken();
    expect(token1).toBe(token2);
  });
});
```

### Test 2: Requête API avec CSRF

```typescript
// tests/api.test.ts
describe('API with CSRF', () => {
  it('should include CSRF token in POST requests', async () => {
    const mockFetch = jest.spyOn(global, 'fetch');

    await apiCall('/api/ecommerce/cart/add', {
      method: 'POST',
      body: { product_id: 1, quantity: 1 },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-CSRF-Token': expect.any(String),
        }),
      })
    );
  });

  it('should retry on CSRF error', async () => {
    // Mock first call returns CSRF error
    // Second call succeeds
    // Test should pass with 2 calls
  });
});
```

### Test 3: Backend Odoo

```python
# tests/test_csrf.py
from odoo.tests import tagged, HttpCase
import json

@tagged('post_install', '-at_install', 'csrf')
class TestCSRFProtection(HttpCase):

    def test_post_without_csrf_rejected(self):
        """Test que POST sans CSRF est rejeté quand csrf=True."""
        # Activer CSRF sur un endpoint test
        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({'product_id': 1, 'quantity': 1}),
            headers={'Content-Type': 'application/json'},
        )

        # Doit retourner erreur CSRF
        self.assertIn('CSRF', response.content.decode())

    def test_post_with_valid_csrf_accepted(self):
        """Test que POST avec CSRF valide est accepté."""
        # Récupérer token CSRF
        session_response = self.url_open('/web/session/get_session_info')
        session_data = json.loads(session_response.content)
        csrf_token = session_data['result']['csrf_token']

        # Faire requête avec token
        response = self.url_open(
            '/api/ecommerce/cart/add',
            data=json.dumps({'product_id': 1, 'quantity': 1}),
            headers={
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrf_token,
            },
        )

        data = json.loads(response.content)
        self.assertTrue(data.get('success'))
```

---

## 📊 Monitoring

### Logs à Surveiller

```python
# controllers/base_controller.py
def _handle_csrf_error(self, request):
    """Log les erreurs CSRF pour monitoring."""
    _logger.warning(
        f"CSRF Validation Failed | "
        f"Endpoint: {request.httprequest.path} | "
        f"User: {request.session.uid or 'anonymous'} | "
        f"IP: {request.httprequest.remote_addr} | "
        f"Referer: {request.httprequest.headers.get('Referer')}"
    )
```

### Métriques à Tracker

1. **Taux d'erreur CSRF** - Doit rester < 1%
2. **Endpoints les plus touchés** - Identifier problèmes frontend
3. **IPs sources** - Détecter tentatives d'attaque
4. **User-Agents** - Identifier vieux clients

---

## 🚨 Troubleshooting

### Problème 1: Token CSRF Non Reçu

**Symptôme:** `csrf_token` est `null` dans la réponse session

**Solutions:**
- Vérifier que `csrf_token` est bien dans la session Odoo
- Vérifier CORS: `credentials: 'include'` dans fetch
- Vérifier cookies: domaine doit matcher

### Problème 2: Token Expire Rapidement

**Symptôme:** Erreurs CSRF après quelques minutes

**Solutions:**
- Augmenter durée de session Odoo
- Implémenter refresh automatique du token
- Stocker token dans sessionStorage (pas localStorage)

### Problème 3: CORS Bloque les Requêtes

**Symptôme:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solutions:**
```python
# config/odoo.conf
[options]
cors_allowed_origins = http://localhost:3000,https://yourdomain.com
```

### Problème 4: Webhook Stripe Échoue

**Symptôme:** Webhook retourne erreur CSRF 403

**Solution:**
```python
# Webhooks doivent rester csrf=False car Stripe ne peut pas fournir token
@http.route('/api/ecommerce/payment/stripe/webhook',
            type='http', auth='public', methods=['POST'],
            csrf=False,  # Exception pour webhooks externes
            cors='*')
def stripe_webhook(self, **kwargs):
    # Utiliser signature HMAC à la place
```

---

## ✅ Checklist Déploiement

### Avant Activation:
- [ ] Frontend implémente getCSRFToken()
- [ ] Frontend inclut X-CSRF-Token dans headers
- [ ] Tests frontend passent avec CSRF activé
- [ ] Tests backend passent avec csrf=True
- [ ] Monitoring configuré (logs, métriques)
- [ ] Plan de rollback préparé

### Pendant Activation (par phase):
- [ ] Activer CSRF sur endpoints non-critiques
- [ ] Surveiller logs 24h
- [ ] Taux d'erreur < 1%
- [ ] Activer phase suivante

### Après Activation Complète:
- [ ] Tous les endpoints ont csrf=True (sauf webhooks)
- [ ] Taux d'erreur CSRF < 0.5%
- [ ] Documentation mise à jour
- [ ] Équipe formée sur troubleshooting CSRF

---

## 📚 Ressources

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Odoo CSRF Documentation](https://www.odoo.com/documentation/19.0/developer/reference/backend/http.html#csrf-protection)
- [MDN: CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)

---

## 🎯 Timeline Recommandé

| Semaine | Phase | Actions |
|---------|-------|---------|
| 1 | Frontend | Implémenter CSRF dans Next.js |
| 2 | Tests | Tests frontend + backend |
| 3 | Staging | Activer progressivement en staging |
| 4 | Production | Déploiement production |
| 5 | Monitoring | Surveillance + ajustements |

---

**Préparé par:** Claude Code
**Date:** 2026-01-23
**Version:** 1.0
