# Quelyos E-commerce API

Module Odoo pour API REST e-commerce headless compatible avec Next.js 14.

## Fonctionnalités

### Authentification
- Login/Logout Portal Odoo natif
- Inscription clients
- Gestion session avec cookies httpOnly
- Réinitialisation mot de passe

### Produits
- Listing avec filtres avancés (catégorie, prix, recherche)
- Pagination et tri
- Détails produits avec variants
- SEO (slugs, meta tags, structured data)
- Compteur de vues
- Produits featured/nouveaux/bestsellers
- Galerie images

### Panier
- CRUD panier complet
- Gestion quantités
- Validation stock temps réel
- Panier invité (session) et authentifié
- Fusion paniers après login

### Checkout
- Validation panier
- Calcul frais de livraison
- Gestion adresses facturation/livraison
- Confirmation commande
- Intégration paiement

### Espace Client
- Profil client
- Historique commandes
- Détails commandes
- Gestion adresses multiples

### Wishlist
- Ajout/suppression produits
- Liste complète wishlist

### Comparateur
- Maximum 4 produits
- Comparaison côte à côte

### Webhooks
- Notification changements stock
- Notification commandes confirmées
- Notification produits mis à jour

## Endpoints API

### Auth
- `POST /api/ecommerce/auth/login` - Login
- `POST /api/ecommerce/auth/logout` - Logout
- `POST /api/ecommerce/auth/register` - Inscription
- `GET /api/ecommerce/auth/session` - Vérifier session
- `POST /api/ecommerce/auth/reset-password` - Reset password

### Produits
- `GET /api/ecommerce/products` - Liste produits
- `GET /api/ecommerce/products/<id>` - Détail produit
- `GET /api/ecommerce/products/slug/<slug>` - Produit par slug
- `GET /api/ecommerce/products/featured` - Produits featured
- `GET /api/ecommerce/categories` - Liste catégories
- `GET /api/ecommerce/categories/<id>/products` - Produits catégorie

### Panier
- `GET /api/ecommerce/cart` - Récupérer panier
- `POST /api/ecommerce/cart/add` - Ajouter produit
- `PUT /api/ecommerce/cart/update/<line_id>` - Modifier quantité
- `DELETE /api/ecommerce/cart/remove/<line_id>` - Supprimer ligne
- `DELETE /api/ecommerce/cart/clear` - Vider panier
- `GET /api/ecommerce/cart/count` - Nombre articles

### Checkout
- `POST /api/ecommerce/checkout/validate` - Valider panier
- `POST /api/ecommerce/checkout/shipping` - Calculer livraison
- `POST /api/ecommerce/checkout/confirm` - Confirmer commande
- `GET /api/ecommerce/payment-methods` - Méthodes paiement
- `GET /api/ecommerce/delivery-methods` - Méthodes livraison

### Espace Client (auth required)
- `GET /api/ecommerce/customer/profile` - Profil
- `PUT /api/ecommerce/customer/profile/update` - Modifier profil
- `GET /api/ecommerce/customer/orders` - Liste commandes
- `GET /api/ecommerce/customer/orders/<id>` - Détail commande
- `GET /api/ecommerce/customer/addresses` - Liste adresses
- `POST /api/ecommerce/customer/addresses/add` - Ajouter adresse
- `PUT /api/ecommerce/customer/addresses/<id>/update` - Modifier adresse
- `DELETE /api/ecommerce/customer/addresses/<id>/delete` - Supprimer adresse

### Wishlist (auth required)
- `GET /api/ecommerce/wishlist` - Liste wishlist
- `POST /api/ecommerce/wishlist/add` - Ajouter produit
- `DELETE /api/ecommerce/wishlist/remove/<product_id>` - Retirer produit
- `GET /api/ecommerce/wishlist/check/<product_id>` - Vérifier présence

### Comparateur (auth required)
- `GET /api/ecommerce/comparison` - Liste comparateur
- `POST /api/ecommerce/comparison/add` - Ajouter produit
- `DELETE /api/ecommerce/comparison/remove/<product_id>` - Retirer produit
- `DELETE /api/ecommerce/comparison/clear` - Vider comparateur

## Installation

1. Copier le module dans `/mnt/extra-addons`
2. Redémarrer Odoo
3. Activer le mode développeur
4. Apps → Update Apps List
5. Rechercher "Quelyos E-commerce API"
6. Cliquer Install

## Configuration

Aller dans **E-commerce → Configuration**

Paramètres disponibles:
- URL Frontend Next.js
- Secret webhook
- Produits par page
- Affichage rupture stock
- Activation wishlist/comparateur
- Durée session panier
- Montant minimum commande
- Configuration SEO
- Activation webhooks

## Dépendances

- `base`, `web`, `sale`, `sale_management`
- `stock`, `portal`, `payment`, `delivery`
- `website`, `product`
- `quelyos_branding`

## Développement

### Structure
```
quelyos_ecommerce/
├── models/              # Modèles Odoo
├── controllers/         # Controllers API REST
├── services/           # Services métier
├── data/               # Données par défaut
├── security/           # Droits d'accès
├── views/              # Vues backend
└── static/description/ # Description module
```

### Services disponibles

#### product.service
- `format_product_for_api()`
- `get_product_availability()`
- `search_products()`
- `get_popular_products()`
- `calculate_product_discount()`

#### cart.service
- `validate_cart_items()`
- `calculate_cart_totals()`
- `apply_coupon()`
- `merge_carts()`
- `get_cart_recommendations()`

#### seo.service
- `generate_meta_description()`
- `generate_meta_keywords()`
- `generate_structured_data()`
- `generate_sitemap_urls()`
- `optimize_product_seo()`
- `get_seo_score()`

## Frontend Next.js

Ce module est conçu pour fonctionner avec un frontend Next.js 14.

Voir plan complet: `/Users/salmenktata/.claude/plans/fancy-shimmying-kettle.md`

## Support

Pour toute question ou problème, créer une issue sur GitHub.

## Licence

LGPL-3

## Auteur

Quelyos
