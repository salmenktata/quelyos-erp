# Quelyos

Frontend e-commerce + Backoffice admin modernes pour Odoo 19 Community.

## Vision

Remplacer les interfaces Odoo (site e-commerce, gestion produits) par des vues modernes tout en gardant le cœur Odoo (modèles, ORM, base de données).

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                          │
│              Boutique e-commerce                         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│              BACKOFFICE (React)                          │
│              Gestion produits, commandes                 │
└─────────────────────┬───────────────────────────────────┘
                      │ API REST
┌─────────────────────┴───────────────────────────────────┐
│              ODOO 19 Community                           │
│              Modèles, ORM, Base de données               │
└─────────────────────────────────────────────────────────┘
```

## Structure

```
frontend/          → Next.js (boutique e-commerce)
backoffice/        → React + Vite (administration)
backend/
  ├── addons/
  │   └── quelyos_api/  → Module Odoo (API REST)
  ├── docker-compose.yml
  └── reset.sh          → Script reset installation
config/            → Configuration Odoo
nginx/             → Config production
```

## Stack

| Composant | Technologies |
|-----------|-------------|
| Frontend | Next.js 14, Tailwind CSS, TypeScript |
| Backoffice | React 18, Vite, Tailwind CSS, React Query |
| Backend | Odoo 19 Community, Python 3.12, PostgreSQL 15 |

---

## Commandes

```bash
# Reset Odoo (installation vierge)
cd backend && ./reset.sh

# Démarrer Odoo
cd backend && docker-compose up -d

# Démarrer Frontend
cd frontend && npm install && npm run dev

# Démarrer Backoffice
cd backoffice && npm install && npm run dev
```

---

## Déploiement Production

### Prérequis

- Serveur Linux (Ubuntu 22.04 recommandé)
- Docker et Docker Compose installés
- Nom de domaine pointant vers le serveur
- Ports 80 et 443 ouverts

### Étapes de déploiement

```bash
# 1. Cloner le projet
git clone https://github.com/votre-compte/QuelyosERP.git
cd QuelyosERP

# 2. Configurer les variables d'environnement
cp .env.production.example .env.production
nano .env.production  # Remplir les valeurs

# 3. Déployer l'application
./deploy.sh

# 4. Configurer SSL (Let's Encrypt)
./ssl-init.sh

# 5. Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### Scripts de gestion

| Script | Description |
|--------|-------------|
| `./deploy.sh` | Déploie l'application (build + start) |
| `./ssl-init.sh` | Configure les certificats SSL |
| `./backup.sh` | Sauvegarde la base de données |

### Commandes utiles

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart frontend

# Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# Mise à jour (après un git pull)
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Backup manuel
./backup.sh

# Restaurer un backup
gunzip < backups/quelyos_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i quelyos-db-prod psql -U odoo quelyos_prod
```

### Monitoring

Vérifier la santé des services :

```bash
# Status global
docker-compose -f docker-compose.prod.yml ps

# Healthcheck manuel
curl https://votre-domaine.com/health
```

### Backup automatique

Ajouter au crontab pour backup quotidien à 2h du matin :

```bash
crontab -e
# Ajouter :
0 2 * * * cd /path/to/QuelyosERP && ./backup.sh >> /var/log/quelyos-backup.log 2>&1
```

---

## CI/CD et Monitoring

### GitHub Actions

Le projet utilise GitHub Actions pour l'intégration et le déploiement continu :

#### Workflow CI (tests automatiques)

Déclenché sur chaque push et pull request :

- **Frontend Tests** : Linting, tests unitaires, build Next.js
- **Backoffice Tests** : Build Vite
- **Python Validation** : Linting flake8 des modules Odoo
- **Docker Build** : Validation des Dockerfiles

#### Workflow CD (déploiement)

Déclenché sur push vers `main` ou tags `v*` :

- Build et push des images Docker vers GitHub Container Registry
- Déploiement SSH vers le serveur de production
- Healthcheck automatique post-déploiement
- Notification Slack (optionnel)

#### Configuration requise

Secrets GitHub à configurer :

```
PRODUCTION_HOST       → IP ou domaine du serveur
PRODUCTION_USER       → Utilisateur SSH
PRODUCTION_SSH_KEY    → Clé privée SSH
PRODUCTION_DOMAIN     → Domaine pour healthcheck
SLACK_WEBHOOK         → Webhook Slack (optionnel)
```

### Monitoring Stack

Stack complète de monitoring avec Prometheus, Grafana et Loki :

```bash
# Déployer le monitoring
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d

# Accès aux interfaces
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# Alertmanager: http://localhost:9093
```

#### Services de monitoring

| Service | Port | Description |
|---------|------|-------------|
| Prometheus | 9090 | Collecte de métriques |
| Grafana | 3001 | Visualisation et dashboards |
| Loki | 3100 | Agrégation de logs |
| Promtail | - | Collecteur de logs |
| Alertmanager | 9093 | Gestion des alertes |
| cAdvisor | 8080 | Métriques conteneurs Docker |
| Node Exporter | 9100 | Métriques système |
| Postgres Exporter | 9187 | Métriques PostgreSQL |

#### Métriques collectées

- **Système** : CPU, RAM, Disque, Réseau
- **Docker** : Utilisation par conteneur
- **PostgreSQL** : Connexions, requêtes, performance
- **Nginx** : Requêtes, status codes, latence
- **Application** : Temps de réponse, erreurs HTTP

#### Alertes configurées

- **Système** : CPU élevé (>80%), RAM élevée (>85%), disque faible (<15%)
- **Conteneurs** : Conteneur arrêté, mémoire conteneur élevée (>90%)
- **PostgreSQL** : Service down, connexions élevées (>80%), requêtes lentes
- **Application** : Taux d'erreurs élevé, service indisponible, latence élevée

#### Logs centralisés

Tous les logs sont collectés par Loki via Promtail :

- Logs Nginx (access + error)
- Logs Odoo
- Logs système (syslog)
- Logs conteneurs Docker

Accès via Grafana : **Explore** → **Loki**

### Healthcheck

Script de vérification complet de l'infrastructure :

```bash
./healthcheck.sh

# Vérifie :
# - État des conteneurs Docker
# - Ports réseau
# - Connexion PostgreSQL
# - Endpoints HTTP (frontend, backoffice, API)
# - Services de monitoring (si déployés)
```

### Dashboards Grafana recommandés

Importer ces dashboards via Grafana UI :

- **Docker Monitoring** : ID `193`
- **Node Exporter Full** : ID `1860`
- **PostgreSQL Database** : ID `9628`
- **Nginx** : ID `12708`

---

## Plan de développement

### Phase 1 : E-commerce + Produits

**Objectif** : MVP fonctionnel avec gestion produits

#### Étape 1.1 : Module API Odoo (`quelyos_api`)

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET produits | `/api/v1/products` | Liste paginée avec filtres |
| [ ] GET produit | `/api/v1/products/<id>` | Détail d'un produit |
| [ ] POST produit | `/api/v1/products` | Créer un produit |
| [ ] PUT produit | `/api/v1/products/<id>` | Modifier un produit |
| [ ] DELETE produit | `/api/v1/products/<id>` | Supprimer un produit |
| [ ] GET catégories | `/api/v1/categories` | Liste des catégories |
| [ ] POST catégorie | `/api/v1/categories` | Créer une catégorie |
| [ ] Auth login | `/api/v1/auth/login` | Authentification JWT |
| [ ] Auth logout | `/api/v1/auth/logout` | Déconnexion |
| [ ] Auth me | `/api/v1/auth/me` | Info utilisateur courant |
| [ ] Config CORS | - | Headers cross-origin |

#### Étape 1.2 : Backoffice React

| Tâche | Fichier | Description |
|-------|---------|-------------|
| [ ] Setup Vite | `vite.config.ts` | Configuration projet |
| [ ] Tailwind | `tailwind.config.ts` | Styles |
| [ ] Layout | `components/Layout.tsx` | Sidebar + Header |
| [ ] Auth | `pages/Login.tsx` | Page connexion |
| [ ] Dashboard | `pages/Dashboard.tsx` | Accueil admin |
| [ ] Liste produits | `pages/Products.tsx` | Tableau paginé |
| [ ] Form produit | `pages/ProductForm.tsx` | Création/édition |
| [ ] Upload images | `components/ImageUpload.tsx` | Gestion images |
| [ ] Liste catégories | `pages/Categories.tsx` | Gestion catégories |
| [ ] API client | `lib/api.ts` | Client HTTP |

#### Étape 1.3 : Frontend Next.js

| Tâche | Route | Description |
|-------|-------|-------------|
| [ ] API client Odoo | `lib/odoo.ts` | Connexion API |
| [ ] Page accueil | `/` | Hero + produits featured |
| [ ] Catalogue | `/products` | Liste + filtres |
| [ ] Fiche produit | `/products/[slug]` | Détail + variantes |
| [ ] Panier | `/cart` | Liste articles |
| [ ] Checkout | `/checkout` | Tunnel commande |
| [ ] Confirmation | `/order/[id]` | Confirmation commande |

#### Étape 1.4 : Tests Phase 1

| Tâche | Type | Description |
|-------|------|-------------|
| [ ] Tests API | Postman | Collection endpoints |
| [ ] Tests unitaires | Jest | Composants React |
| [ ] Tests E2E | Playwright | Parcours utilisateur |

---

### Phase 2 : Commandes + Clients

**Objectif** : Gestion complète des commandes et espace client

#### Étape 2.1 : API Commandes

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET commandes | `/api/v1/orders` | Liste commandes (admin) |
| [ ] GET commande | `/api/v1/orders/<id>` | Détail commande |
| [ ] PUT statut | `/api/v1/orders/<id>/status` | Changer statut |
| [ ] GET mes commandes | `/api/v1/customer/orders` | Commandes du client |
| [ ] POST commande | `/api/v1/orders` | Créer commande |

#### Étape 2.2 : API Panier

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET panier | `/api/v1/cart` | Panier courant |
| [ ] POST ajouter | `/api/v1/cart/add` | Ajouter produit |
| [ ] PUT quantité | `/api/v1/cart/update` | Modifier quantité |
| [ ] DELETE ligne | `/api/v1/cart/remove/<id>` | Supprimer ligne |
| [ ] DELETE vider | `/api/v1/cart/clear` | Vider panier |

#### Étape 2.3 : API Clients

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] POST inscription | `/api/v1/auth/register` | Créer compte |
| [ ] GET profil | `/api/v1/customer/profile` | Info client |
| [ ] PUT profil | `/api/v1/customer/profile` | Modifier profil |
| [ ] GET adresses | `/api/v1/customer/addresses` | Liste adresses |
| [ ] POST adresse | `/api/v1/customer/addresses` | Ajouter adresse |
| [ ] PUT adresse | `/api/v1/customer/addresses/<id>` | Modifier adresse |
| [ ] DELETE adresse | `/api/v1/customer/addresses/<id>` | Supprimer adresse |

#### Étape 2.4 : Backoffice Commandes

| Tâche | Fichier | Description |
|-------|---------|-------------|
| [ ] Liste commandes | `pages/Orders.tsx` | Tableau + filtres statut |
| [ ] Détail commande | `pages/OrderDetail.tsx` | Infos + lignes + client |
| [ ] Changer statut | `components/OrderStatus.tsx` | Dropdown statut |
| [ ] Liste clients | `pages/Customers.tsx` | Tableau clients |
| [ ] Détail client | `pages/CustomerDetail.tsx` | Infos + historique |

#### Étape 2.5 : Frontend Espace Client

| Tâche | Route | Description |
|-------|-------|-------------|
| [ ] Inscription | `/register` | Formulaire inscription |
| [ ] Connexion | `/login` | Formulaire connexion |
| [ ] Mon compte | `/account` | Dashboard client |
| [ ] Mes commandes | `/account/orders` | Historique |
| [ ] Détail commande | `/account/orders/[id]` | Suivi commande |
| [ ] Mes adresses | `/account/addresses` | Gestion adresses |
| [ ] Mon profil | `/account/profile` | Modifier infos |

#### Étape 2.6 : Tests Phase 2

| Tâche | Type | Description |
|-------|------|-------------|
| [ ] Tests API commandes | Postman | Endpoints commandes |
| [ ] Tests E2E inscription | Playwright | Parcours inscription |
| [ ] Tests E2E commande | Playwright | Parcours achat complet |

---

### Phase 3 : Stock + Livraison

**Objectif** : Gestion stock temps réel et modes de livraison

#### Étape 3.1 : API Stock

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET stock produit | `/api/v1/products/<id>/stock` | Quantité disponible |
| [ ] PUT stock | `/api/v1/products/<id>/stock` | Modifier stock (admin) |
| [ ] GET mouvements | `/api/v1/stock/moves` | Historique mouvements |
| [ ] Validation stock | - | Vérifier dispo avant commande |

#### Étape 3.2 : API Livraison

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET méthodes | `/api/v1/delivery/methods` | Modes de livraison |
| [ ] POST calcul | `/api/v1/delivery/calculate` | Calcul frais |
| [ ] GET zones | `/api/v1/delivery/zones` | Zones de livraison |

#### Étape 3.3 : Backoffice Stock

| Tâche | Fichier | Description |
|-------|---------|-------------|
| [ ] Stock produits | `pages/Stock.tsx` | Vue stock global |
| [ ] Ajustement | `components/StockAdjust.tsx` | Modifier quantités |
| [ ] Alertes rupture | `components/StockAlerts.tsx` | Produits en rupture |
| [ ] Méthodes livraison | `pages/DeliveryMethods.tsx` | Config livraison |

#### Étape 3.4 : Frontend Stock

| Tâche | Description |
|-------|-------------|
| [ ] Affichage stock | Badge disponibilité sur fiche produit |
| [ ] Alerte rupture | Message si stock faible |
| [ ] Blocage panier | Empêcher ajout si rupture |
| [ ] Choix livraison | Sélection mode au checkout |
| [ ] Calcul frais | Affichage frais temps réel |

---

### Phase 4 : Paiement

**Objectif** : Intégration paiement en ligne

#### Étape 4.1 : API Paiement

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET méthodes | `/api/v1/payment/methods` | Modes de paiement |
| [ ] POST initier | `/api/v1/payment/init` | Créer transaction |
| [ ] POST confirmer | `/api/v1/payment/confirm` | Confirmer paiement |
| [ ] Webhook | `/api/v1/payment/webhook` | Callback provider |

#### Étape 4.2 : Intégration Stripe

| Tâche | Description |
|-------|-------------|
| [ ] Config Stripe | Clés API dans Odoo |
| [ ] Créer PaymentIntent | Initier paiement |
| [ ] Stripe Elements | Formulaire carte |
| [ ] Webhook | Traitement événements |
| [ ] Gestion erreurs | Paiement refusé, etc. |

#### Étape 4.3 : Backoffice Paiement

| Tâche | Fichier | Description |
|-------|---------|-------------|
| [ ] Transactions | `pages/Payments.tsx` | Liste paiements |
| [ ] Détail | `pages/PaymentDetail.tsx` | Infos transaction |
| [ ] Remboursement | `components/Refund.tsx` | Initier remboursement |
| [ ] Config | `pages/PaymentConfig.tsx` | Paramètres Stripe |

#### Étape 4.4 : Frontend Paiement

| Tâche | Description |
|-------|-------------|
| [ ] Formulaire Stripe | Composant Stripe Elements |
| [ ] Page paiement | `/checkout/payment` |
| [ ] Confirmation | Affichage succès/échec |
| [ ] Facture | Téléchargement PDF |

---

### Phase 5 : Marketing + SEO

**Objectif** : Outils marketing et optimisation SEO

#### Étape 5.1 : API Marketing

| Tâche | Endpoint | Description |
|-------|----------|-------------|
| [ ] GET coupons | `/api/v1/coupons` | Liste coupons (admin) |
| [ ] POST coupon | `/api/v1/coupons` | Créer coupon |
| [ ] POST appliquer | `/api/v1/cart/coupon` | Appliquer au panier |
| [ ] DELETE coupon | `/api/v1/cart/coupon` | Retirer coupon |

#### Étape 5.2 : Backoffice Marketing

| Tâche | Fichier | Description |
|-------|---------|-------------|
| [ ] Coupons | `pages/Coupons.tsx` | Gestion codes promo |
| [ ] Form coupon | `pages/CouponForm.tsx` | Création coupon |
| [ ] Produits featured | `pages/Featured.tsx` | Mise en avant |
| [ ] Analytics | `pages/Analytics.tsx` | Stats ventes |

#### Étape 5.3 : SEO Frontend

| Tâche | Description |
|-------|-------------|
| [ ] Meta tags | Title, description dynamiques |
| [ ] Open Graph | Partage réseaux sociaux |
| [ ] Sitemap | `/sitemap.xml` automatique |
| [ ] Schema.org | Données structurées produits |
| [ ] URLs SEO | Slugs produits/catégories |

---

### Phase 6 : Production

**Objectif** : Mise en production

#### Étape 6.1 : Infrastructure

| Tâche | Description |
|-------|-------------|
| [ ] Serveur VPS | Provision serveur |
| [ ] Docker prod | docker-compose.prod.yml |
| [ ] Nginx | Reverse proxy + SSL |
| [ ] Domaine | Configuration DNS |
| [ ] SSL | Certificat Let's Encrypt |

#### Étape 6.2 : Déploiement

| Tâche | Description |
|-------|-------------|
| [ ] CI/CD | GitHub Actions |
| [ ] Build frontend | Compilation Next.js |
| [ ] Build backoffice | Compilation Vite |
| [ ] Migration DB | Scripts migration |
| [ ] Backup | Stratégie sauvegarde |

#### Étape 6.3 : Monitoring

| Tâche | Description |
|-------|-------------|
| [ ] Logs | Centralisation logs |
| [ ] Alertes | Notifications erreurs |
| [ ] Uptime | Monitoring disponibilité |
| [ ] Performance | Métriques temps réponse |

---

## API Reference

### Authentification

```
POST   /api/v1/auth/login          { email, password } → { token }
POST   /api/v1/auth/logout         → { success }
POST   /api/v1/auth/register       { name, email, password } → { user }
GET    /api/v1/auth/me             → { user }
```

### Produits

```
GET    /api/v1/products            ?limit=20&offset=0&category_id=1
GET    /api/v1/products/<id>       → { product }
POST   /api/v1/products            { name, price, ... } → { product }
PUT    /api/v1/products/<id>       { name, price, ... } → { product }
DELETE /api/v1/products/<id>       → { success }
```

### Catégories

```
GET    /api/v1/categories          → { categories }
POST   /api/v1/categories          { name, parent_id } → { category }
PUT    /api/v1/categories/<id>     { name } → { category }
DELETE /api/v1/categories/<id>     → { success }
```

### Panier

```
GET    /api/v1/cart                → { cart, lines, total }
POST   /api/v1/cart/add            { product_id, qty } → { cart }
PUT    /api/v1/cart/update         { line_id, qty } → { cart }
DELETE /api/v1/cart/remove/<id>    → { cart }
DELETE /api/v1/cart/clear          → { success }
```

### Commandes

```
GET    /api/v1/orders              → { orders } (admin)
GET    /api/v1/orders/<id>         → { order, lines }
POST   /api/v1/orders              { address_id, delivery_id } → { order }
PUT    /api/v1/orders/<id>/status  { status } → { order }
GET    /api/v1/customer/orders     → { orders } (client)
```

### Client

```
GET    /api/v1/customer/profile    → { customer }
PUT    /api/v1/customer/profile    { name, phone } → { customer }
GET    /api/v1/customer/addresses  → { addresses }
POST   /api/v1/customer/addresses  { street, city, ... } → { address }
PUT    /api/v1/customer/addresses/<id>  → { address }
DELETE /api/v1/customer/addresses/<id>  → { success }
```

---

## Modèles Odoo utilisés

| Modèle | Usage |
|--------|-------|
| `product.template` | Produits |
| `product.product` | Variantes |
| `product.category` | Catégories |
| `sale.order` | Commandes |
| `sale.order.line` | Lignes commande |
| `res.partner` | Clients |
| `stock.quant` | Stock |
| `delivery.carrier` | Modes livraison |
| `payment.provider` | Paiement |
