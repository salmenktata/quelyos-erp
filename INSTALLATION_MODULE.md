# 🚀 Guide d'Installation du Module Quelyos E-commerce

## 📋 Prérequis

✅ Odoo est démarré et accessible sur http://localhost:8069
✅ Frontend Next.js est démarré sur http://localhost:3000
✅ Vous avez des produits existants dans Odoo

## 🔧 Étape 1: Installer le Module dans Odoo

### 1.1 Accéder à Odoo
- Ouvrez votre navigateur
- Allez sur: **http://localhost:8069**
- Connectez-vous avec:
  - **Email**: `admin`
  - **Password**: `admin`

### 1.2 Accéder au gestionnaire d'applications
- Une fois connecté, cliquez sur l'**icône Apps** (grille de 9 points) en haut à droite de l'écran
- Cliquez sur **"Apps"** dans le menu déroulant

### 1.3 Mettre à jour la liste des applications
- Dans Apps, cliquez sur le bouton **"Update Apps List"** (en haut)
- Confirmez en cliquant sur **"Update"**
- Attendez quelques secondes que la mise à jour se termine

### 1.4 Rechercher et installer
- Dans la barre de recherche en haut, tapez: **`quelyos`**
- Vous devriez voir apparaître:
  - **Quelyos E-commerce** (avec l'icône du module)
  - **Quelyos Branding** (déjà installé normalement)
- Cliquez sur le bouton **"Install"** ou **"Activer"** du module **Quelyos E-commerce**
- Attendez la fin de l'installation (30 secondes à 1 minute)

### 1.5 Vérification
Une fois l'installation terminée, vous devriez voir:
- Un nouveau menu **"E-commerce"** dans la barre latérale gauche
- Les sous-menus:
  - Configuration
  - Wishlists
  - Produits

## ✅ Étape 2: Vérifier l'API

### 2.1 Tester l'endpoint produits
Ouvrez un terminal et exécutez:

```bash
curl -X POST http://localhost:8069/api/ecommerce/products \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{},"id":1}'
```

**Réponse attendue:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "success": true,
    "products": [
      {
        "id": 1,
        "name": "Votre Produit",
        "list_price": 99.99,
        ...
      }
    ],
    "total": 10
  }
}
```

Si vous obtenez cette réponse, **l'API fonctionne** ! ✅

### 2.2 Autres endpoints à tester

```bash
# Test catégories
curl -X POST http://localhost:8069/api/ecommerce/categories \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{},"id":1}'

# Test panier
curl -X POST http://localhost:8069/api/ecommerce/cart \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{},"id":1}'
```

## 🎨 Étape 3: Rafraîchir le Frontend

### 3.1 Le frontend devrait automatiquement se connecter
- Allez sur http://localhost:3000
- La page devrait maintenant afficher vos **produits réels** d'Odoo

### 3.2 Si les produits n'apparaissent pas
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur Next.js
3. Rafraîchissez la page (F5)
4. Vérifiez que le module est bien installé

## 📊 Étape 4: Configurer le Module E-commerce

### 4.1 Accéder à la configuration
- Dans Odoo, allez dans **E-commerce > Configuration**
- Vous devriez voir une configuration par défaut

### 4.2 Paramètres importants
Vérifiez/Modifiez:
- **Frontend URL**: `http://localhost:3000`
- **Webhook Secret**: `change_me_in_production`
- **Products per page**: `20`
- **Enable Wishlist**: ✅ Coché
- **Enable Comparison**: ✅ Coché
- **Show out of stock**: ✅ Coché

### 4.3 Sauvegarder
Cliquez sur **"Save"** en haut à gauche

## 🧪 Étape 5: Tester le Parcours Complet

### 5.1 Homepage
- Allez sur http://localhost:3000
- Vérifiez que les produits "Featured" apparaissent

### 5.2 Catalogue
- Cliquez sur "Voir nos produits" ou allez sur http://localhost:3000/products
- Vérifiez que tous vos produits Odoo apparaissent
- Testez les filtres (catégories, prix, etc.)

### 5.3 Détail produit
- Cliquez sur un produit
- Vérifiez que toutes les informations apparaissent:
  - Images
  - Prix
  - Description
  - Bouton "Ajouter au panier"

### 5.4 Panier
- Ajoutez un produit au panier
- Vérifiez que le panier se met à jour
- Allez sur http://localhost:3000/cart
- Vérifiez que le produit apparaît

### 5.5 Authentification
- Allez sur http://localhost:3000/login
- Connectez-vous avec vos identifiants Odoo
- Vérifiez que vous êtes redirigé vers votre compte

### 5.6 Checkout
- Avec un panier non vide, allez sur http://localhost:3000/checkout
- Vérifiez le parcours checkout en 3 étapes

## 🐛 Troubleshooting

### Problème: "Module not found"
**Solution**:
- Vérifiez que le dossier `backend/addons/quelyos_ecommerce` existe
- Redémarrez Odoo: `docker restart quelyos-odoo`
- Retentez l'installation

### Problème: "Network Error" dans le frontend
**Solution**:
- Vérifiez qu'Odoo tourne: http://localhost:8069
- Vérifiez que le module est installé
- Vérifiez les logs: `docker logs quelyos-odoo -f`

### Problème: "404 Not Found" sur les API
**Solution**:
- Le module n'est pas installé → Retour à l'Étape 1
- Vérifiez l'installation: Menu E-commerce existe ?

### Problème: Produits n'apparaissent pas
**Solution**:
1. Vérifiez que vous avez des produits dans Odoo
2. Testez l'API avec curl (voir Étape 2)
3. Vérifiez la console du navigateur
4. Vérifiez que les produits sont "publiés" dans Odoo

### Problème: CORS Error
**Solution**:
- Le module `quelyos_ecommerce` gère CORS automatiquement
- Si le problème persiste, vérifiez que NEXT_PUBLIC_ODOO_URL est correct dans `.env.local`

## 📝 Notes Importantes

1. **Données de démonstration**: Si vous voulez des données de test, le module peut créer des produits demo automatiquement

2. **Images**: Les images des produits doivent être uploadées dans Odoo. Le frontend les affichera automatiquement.

3. **SEO**: Le module génère automatiquement:
   - Les slugs pour les URLs (ex: `/products/laptop-dell-xps-15`)
   - Les meta descriptions
   - Les données structurées JSON-LD

4. **Performance**: Le frontend utilise ISR (Incremental Static Regeneration):
   - Pages dynamiques: revalidation toutes les 60s
   - Pages statiques: revalidation toutes les 1h

## ✅ Checklist Finale

Avant de continuer, vérifiez que:

- [ ] Odoo est accessible (http://localhost:8069)
- [ ] Module `quelyos_ecommerce` est installé
- [ ] Menu "E-commerce" existe dans Odoo
- [ ] API répond correctement (test curl)
- [ ] Frontend est accessible (http://localhost:3000)
- [ ] Produits apparaissent sur le frontend
- [ ] Vous pouvez ajouter au panier
- [ ] Vous pouvez vous connecter
- [ ] La configuration E-commerce est sauvegardée

## 🎉 Prochaines Étapes

Une fois que tout fonctionne:

1. **Ajouter vos vrais produits** dans Odoo avec images et descriptions
2. **Configurer les catégories** pour une meilleure organisation
3. **Tester le checkout complet** avec les méthodes de paiement
4. **Personnaliser le thème** si nécessaire (couleurs déjà configurées)
5. **Configurer les webhooks** pour la synchronisation temps réel
6. **Déployer en production** (voir DEPLOYMENT.md)

---

**Besoin d'aide ?** Consultez:
- [INTEGRATION_API.md](./INTEGRATION_API.md) - Documentation API complète
- [TESTING.md](./TESTING.md) - Guide des tests
- [README.md](./README.md) - Vue d'ensemble du projet
