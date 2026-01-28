# Guide d'Intégration des Paiements Tunisiens

## Vue d'ensemble

Ce guide explique comment utiliser les nouveaux moyens de paiement tunisiens (Flouci et Konnect) dans le checkout du site vitrine.

## Composants Créés

### 1. `usePaymentProviders` (Hook)
**Fichier:** `src/hooks/usePaymentProviders.ts`

Hook React Query pour récupérer les providers actifs et initialiser les paiements.

```tsx
import { useActivePaymentProviders, useInitPayment } from '@/hooks/usePaymentProviders';

const { data: providers, isLoading } = useActivePaymentProviders();
const initPayment = useInitPayment();
```

### 2. `TunisianPaymentGateway` (Composant)
**Fichier:** `src/components/checkout/TunisianPaymentGateway.tsx`

Composant qui gère le flow de paiement pour Flouci et Konnect (redirection vers gateway externe).

### 3. `PaymentFormWithProviders` (Wrapper)
**Fichier:** `src/components/checkout/PaymentFormWithProviders.tsx`

Wrapper intelligent qui récupère automatiquement les providers depuis le backend et les affiche dans le formulaire de paiement.

### 4. Page de Retour Paiement
**Fichier:** `src/app/checkout/payment/return/page.tsx`

Page de redirection après paiement (success, error, cancel).

## Utilisation dans le Checkout

### Option 1 : Utiliser PaymentFormWithProviders (Recommandé)

Remplacer l'ancien code hardcodé par le wrapper dynamique :

**Avant :**
```tsx
// checkout/payment/page.tsx
const paymentMethods: PaymentMethod[] = [
  { id: 'card', name: 'Carte bancaire', description: '...', icon: 'card' },
  { id: 'paypal', name: 'PayPal', description: '...', icon: 'paypal' },
  // ...
];

<PaymentForm
  methods={paymentMethods}
  onSubmit={handleSubmit}
  onBack={handleBack}
  orderId={cart?.id}
  orderAmount={cart?.amount_total}
/>
```

**Après :**
```tsx
import { PaymentFormWithProviders } from '@/components/checkout';

// Récupérer les données client depuis le formulaire shipping
const shippingData = JSON.parse(localStorage.getItem('checkout_shipping') || '{}');

<PaymentFormWithProviders
  onSubmit={handleSubmit}
  onBack={handleBack}
  isLoading={isSubmitting}
  orderId={cart?.id}
  orderAmount={cart?.amount_total}
  customerData={{
    firstName: shippingData.first_name || '',
    lastName: shippingData.last_name || '',
    email: shippingData.email || '',
    phoneNumber: shippingData.phone || '',
  }}
  includeLocalMethods={true} // Inclure paiement à la livraison, virement
/>
```

### Option 2 : Utilisation Manuelle (Avancé)

Si vous avez besoin de plus de contrôle :

```tsx
import { useActivePaymentProviders } from '@/hooks/usePaymentProviders';
import { PaymentForm } from '@/components/checkout';

const { data: providers } = useActivePaymentProviders();

// Mapper les providers backend vers PaymentMethod
const backendMethods = providers?.map(p => ({
  id: `provider_${p.id}`,
  name: p.name,
  description: getDescriptionForProvider(p.code),
  icon: p.code,
  code: p.code,
  providerId: p.id,
})) || [];

// Ajouter méthodes locales
const allMethods = [
  ...backendMethods,
  { id: 'cash_on_delivery', name: 'Paiement à la livraison', ... },
];

<PaymentForm
  methods={allMethods}
  onSubmit={handleSubmit}
  onBack={handleBack}
  orderId={cart?.id}
  orderAmount={cart?.amount_total}
  customerData={customerData}
/>
```

## Flow de Paiement

### Paiement Stripe (Carte Bancaire)
1. Client sélectionne "Carte bancaire"
2. Formulaire Stripe inline s'affiche
3. Paiement traité directement
4. Redirection vers `/checkout/success`

### Paiement Flouci/Konnect
1. Client sélectionne "Flouci" ou "Konnect"
2. Composant `TunisianPaymentGateway` s'affiche
3. Clic sur "Procéder au paiement"
4. Appel API `/api/ecommerce/payment/init`
5. Redirection vers gateway externe (Flouci/Konnect)
6. Client complète le paiement
7. Redirection automatique vers `/checkout/payment/return?status=success`
8. Vérification webhook côté backend
9. Redirection finale vers `/checkout/success`

### Paiement Local (COD, Virement)
1. Client sélectionne méthode locale
2. Confirmation commande immédiate
3. Redirection vers `/checkout/success`

## Configuration Backend Requise

### 1. Activer les Providers dans le Dashboard

Votre client doit configurer les providers dans :
`/store/settings/payment-methods`

- **Flouci** : App Token, App Secret, Timeout, Accept Cards
- **Konnect** : API Key, Wallet ID, Lifespan, Theme

### 2. État des Providers

- **Disabled** : N'apparaît pas dans le checkout
- **Test** : Mode sandbox (URLs de test)
- **Enabled** : Mode production

## Anonymisation Odoo (IMPORTANT)

Ce module respecte les règles d'anonymisation Odoo du projet :

✅ **Utilise** `backendClient` (pas `odooClient` dans les nouveaux fichiers)
✅ **Masque** les références Odoo dans les URLs et messages d'erreur
✅ **Endpoint** : `/api/ecommerce/payment/*` (pas `/odoo/*`)

## Dark Mode

Tous les composants créés supportent le dark mode :
- `TunisianPaymentGateway` : Gradients adaptatifs
- `PaymentReturnPage` : Fond et textes responsive
- `PaymentFormWithProviders` : Loaders et messages compatibles

## Sécurité

### Validation Webhook
Les webhooks Flouci/Konnect sont validés avec signatures HMAC :
- `payment_provider.py::_flouci_validate_webhook_signature()`
- `payment_provider.py::_konnect_validate_webhook_signature()`

### Idempotence
Les webhooks peuvent être appelés plusieurs fois (rejeu) :
- `payment_transaction.py::_log_webhook_call()` track le nombre d'appels
- Le traitement est idempotent (même résultat peu importe le nombre d'appels)

### Rate Limiting
Les endpoints publics sont rate-limited via Redis (backend).

## Données Personnelles (RGPD)

Les données client envoyées aux gateways :
- `firstName`, `lastName` : Nom complet
- `email` : Email de contact
- `phoneNumber` : Numéro pour SMS notifications

**Note** : Ces données sont transmises directement aux gateways Flouci/Konnect sans être stockées côté vitrine-client.

## Tests

### Test en Sandbox
1. Configurer provider en mode "Test" dans dashboard
2. Utiliser credentials de test (fournis par Flouci/Konnect)
3. Effectuer un paiement test dans le checkout
4. Vérifier logs backend : `docker logs quelyos-odoo`

### Test Webhook Local
```bash
# Utiliser ngrok pour exposer localhost
ngrok http 8069

# Configurer webhook URL dans dashboard Flouci/Konnect
https://xxx.ngrok.io/api/payment/flouci/webhook
```

## Troubleshooting

### Providers n'apparaissent pas dans le checkout

**Cause** : Providers non activés ou API backend inaccessible

**Solution** :
1. Vérifier état provider dans dashboard : `/store/settings/payment-methods`
2. Vérifier logs backend : `docker logs quelyos-odoo | grep payment`
3. Tester endpoint manuellement :
```bash
curl -X POST http://localhost:8069/api/ecommerce/payment/providers \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Erreur "Failed to initialize payment"

**Cause** : Credentials invalides ou API gateway indisponible

**Solution** :
1. Tester connexion API dans dashboard (bouton "Tester connexion")
2. Vérifier credentials (App Token, API Key)
3. Vérifier mode Test vs Production

### Webhook non reçu

**Cause** : URL webhook incorrecte ou signature invalide

**Solution** :
1. Vérifier URL configurée dans dashboard Flouci/Konnect
2. Format attendu : `https://votredomaine.com/api/payment/flouci/webhook`
3. Vérifier logs backend pour erreurs signature

## Migration depuis l'Ancien Système

Si vous avez déjà un système de paiement :

1. **Backup** : Sauvegarder votre code actuel
2. **Installer** : Ajouter les nouveaux hooks et composants
3. **Tester** : Utiliser `PaymentFormWithProviders` sur une page de test
4. **Déployer** : Remplacer progressivement l'ancien système
5. **Monitoring** : Surveiller les logs pendant 48h

## Support

Questions ou problèmes ? Consulter :
- Documentation backend : `.claude/PAYMENT_INTEGRATION.md`
- Logs Odoo : `docker logs -f quelyos-odoo`
- Tests API : Scripts dans `scripts/test-payment-api.sh`
