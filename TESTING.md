# Guide des Tests - Quelyos ERP

## 📋 Vue d'ensemble

Ce projet utilise une stratégie de tests complète couvrant le backend (Odoo) et le frontend (Next.js).

## 🧪 Types de Tests

### 1. Tests Backend (Odoo - Python)

**Framework**: Odoo Test Framework (basé sur unittest)

**Localisation**: `backend/addons/quelyos_ecommerce/tests/`

**Fichiers de tests**:
- `test_product_api.py` - Tests des endpoints API produits
- `test_cart_api.py` - Tests des endpoints API panier
- `test_auth_api.py` - Tests des endpoints API authentification
- `test_models.py` - Tests des modèles Odoo

**Exécution**:
```bash
cd backend

# Lancer tous les tests du module
docker-compose exec odoo odoo -c /etc/odoo/odoo.conf \
  -d quelyos \
  -u quelyos_ecommerce \
  --test-enable \
  --stop-after-init \
  --log-level=test

# Lancer un fichier de test spécifique
docker-compose exec odoo odoo -c /etc/odoo/odoo.conf \
  -d quelyos \
  --test-tags quelyos_ecommerce \
  --log-level=test
```

**Couverture**:
- ✅ API Produits (GET, filtres, search, pagination)
- ✅ API Panier (add, update, remove, clear)
- ✅ API Auth (login, logout, register, session)
- ✅ Modèles (ProductTemplate, ProductWishlist, EcommerceConfig)

### 2. Tests Frontend Unit (Jest)

**Framework**: Jest + React Testing Library

**Localisation**: `frontend/src/**/__tests__/`

**Configuration**: `jest.config.js`, `jest.setup.js`

**Fichiers de tests**:
- `src/lib/odoo/__tests__/client.test.ts` - Tests du client Odoo
- `src/store/__tests__/cartStore.test.ts` - Tests du store Zustand

**Exécution**:
```bash
cd frontend

# Installer les dépendances (première fois)
npm install

# Lancer tous les tests
npm run test

# Mode watch (développement)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

**Seuils de couverture**:
- Branches: 70%
- Fonctions: 70%
- Lignes: 70%
- Statements: 70%

### 3. Tests E2E Frontend (Playwright)

**Framework**: Playwright

**Localisation**: `frontend/e2e/`

**Configuration**: `playwright.config.ts`

**Fichiers de tests**:
- `homepage.spec.ts` - Tests page d'accueil
- `products.spec.ts` - Tests catalogue et détail produits
- `cart.spec.ts` - Tests panier
- `auth.spec.ts` - Tests login/register
- `checkout.spec.ts` - Tests tunnel d'achat

**Exécution**:
```bash
cd frontend

# Installer Playwright browsers (première fois)
npx playwright install

# Démarrer le serveur de dev (dans un terminal séparé)
npm run dev

# Lancer tous les tests E2E
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Lancer sur un navigateur spécifique
npx playwright test --project=chromium
```

**Navigateurs testés**:
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit (Safari Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 🚀 Lancer Tous les Tests

**Script automatisé**:
```bash
# À la racine du projet
chmod +x test-runner.sh
./test-runner.sh
```

Ce script:
1. Lance les tests backend Odoo
2. Lance les tests unit frontend (Jest)
3. Lance les tests E2E frontend (Playwright)
4. Affiche un résumé coloré des résultats

**Ou manuellement**:
```bash
# Backend
cd backend && docker-compose exec odoo odoo [...test command]

# Frontend unit
cd frontend && npm run test

# Frontend E2E
cd frontend && npm run test:e2e

# Tous les tests frontend
cd frontend && npm run test:all
```

## 📊 Rapports de Tests

### Backend (Odoo)
Les logs de tests sont affichés dans la console avec le niveau `--log-level=test`.

### Frontend Unit (Jest)
```bash
# Rapport HTML de couverture
npm run test:coverage
# Ouvre: frontend/coverage/lcov-report/index.html
```

### Frontend E2E (Playwright)
```bash
# Rapport HTML automatique après échec
npx playwright show-report

# Ou après chaque run
npm run test:e2e
# Ouvre: frontend/playwright-report/index.html
```

## 🐛 Debugging Tests

### Backend (Odoo)

**Ajouter des breakpoints**:
```python
import pdb; pdb.set_trace()
```

**Logs détaillés**:
```bash
--log-level=debug
```

### Frontend Unit (Jest)

**Debug un test spécifique**:
```bash
npm run test -- --testNamePattern="should add item to cart"
```

**Logs dans les tests**:
```typescript
console.log('Debug:', someVariable);
```

### Frontend E2E (Playwright)

**Mode debug**:
```bash
npx playwright test --debug
```

**Ralentir l'exécution**:
```bash
npx playwright test --headed --slow-mo=1000
```

**Screenshots automatiques** (déjà configuré):
- À chaque échec: `screenshot: 'only-on-failure'`
- Traces: `trace: 'on-first-retry'`

**Voir traces**:
```bash
npx playwright show-trace trace.zip
```

## ✅ Bonnes Pratiques

### Backend

1. **Utiliser setUp()** pour créer des données de test
2. **Nettoyer après tests** (TransactionCase le fait automatiquement)
3. **Tester les cas limites** (valeurs nulles, listes vides, etc.)
4. **Nommer les tests clairement**: `test_<action>_<scenario>`

```python
def test_get_product_by_id_not_found(self):
    """Test API returns 404 for non-existent product"""
    response = self.url_open('/api/ecommerce/products/99999')
    self.assertEqual(response.status_code, 404)
```

### Frontend Unit

1. **Isoler les tests** - Chaque test doit être indépendant
2. **Mock les dépendances externes** (API, localStorage, etc.)
3. **Tester le comportement, pas l'implémentation**
4. **Utiliser data-testid** pour les sélecteurs

```typescript
// Component
<button data-testid="add-to-cart">Ajouter</button>

// Test
const button = screen.getByTestId('add-to-cart');
```

### Frontend E2E

1. **Attendre les éléments** - Utiliser `waitFor`, `expect().toBeVisible()`
2. **Tester des scénarios réels** - Parcours utilisateur complets
3. **Éviter les sélecteurs fragiles** - Préférer `getByRole`, `getByLabel`
4. **Gérer les états asynchrones** - Toujours attendre les réponses API

```typescript
// ❌ Mauvais
await page.click('.submit-button');

// ✅ Bon
await page.getByRole('button', { name: /soumettre/i }).click();
await expect(page.locator('text=Succès')).toBeVisible();
```

## 🔄 CI/CD Integration

Les tests peuvent être intégrés dans un pipeline CI/CD:

**GitHub Actions exemple**:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Start Odoo
        run: |
          cd backend
          docker-compose up -d

      - name: Run Backend Tests
        run: |
          cd backend
          docker-compose exec -T odoo odoo [...test command]

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Run Frontend Unit Tests
        run: |
          cd frontend
          npm run test:coverage

      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run E2E Tests
        run: |
          cd frontend
          npm run build
          npm run start &
          npm run test:e2e
```

## 📈 Métriques de Tests

**Objectifs**:
- ✅ Couverture backend: >80%
- ✅ Couverture frontend: >70%
- ✅ Tests E2E: 100% des parcours critiques
- ✅ Temps d'exécution total: <5 minutes

**Parcours critiques E2E**:
1. Homepage → Produits → Détail → Ajouter au panier ✅
2. Panier → Checkout → Paiement → Confirmation ✅
3. Register → Login → Espace client ✅
4. Recherche produits → Filtres → Résultats ✅

## 🆘 Troubleshooting

### "Tests Odoo ne se lancent pas"
```bash
# Vérifier que le container Odoo est running
docker-compose ps

# Vérifier les logs
docker-compose logs odoo

# Redémarrer si nécessaire
docker-compose restart odoo
```

### "Jest tests fail with module not found"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### "Playwright tests timeout"
```bash
# Augmenter le timeout dans playwright.config.ts
timeout: 60000, // 60 seconds

# Ou par test
test('my test', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### "Cannot find module '@testing-library/react'"
```bash
# Installer les dépendances de test
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

## 📚 Ressources

- [Odoo Testing Documentation](https://www.odoo.com/documentation/19.0/developer/reference/backend/testing.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

---

**Note**: Tous les tests sont configurés pour fonctionner en développement et en CI/CD. Assurez-vous que tous les services (Odoo, Next.js) sont démarrés avant de lancer les tests.
