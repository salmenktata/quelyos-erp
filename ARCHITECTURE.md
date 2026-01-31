# Architecture Quelyos Suite

## Vision

Quelyos Suite = **7 SaaS sp&eacute;cialis&eacute;s** partageant un **backend unique Odoo 19**. Chaque SaaS est un package transparent de 1 a 3 modules avec frontend dédié, branding propre et pricing indépendant.

## Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│       SITE VITRINE (vitrine-quelyos) - Next.js 14 - :3000   │
│       Marketing, Landing Pages SaaS, Finance Login           │
├──────────────────────────────────────────────────────────────┤
│       BOUTIQUE E-COMMERCE (vitrine-client) - Next.js 16 - :3001
│       Catalogue, Panier, Commandes client final              │
└──────────────────────────┬───────────────────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────────┐
    │                                                 │
┌───┴──────────────────┐   ┌──────────────────────────┴──────┐
│ ERP COMPLET          │   │  SUPER ADMIN GLOBAL              │
│ (dashboard-client)   │   │  (super-admin-client)            │
│ Port 5175            │   │  Port 9000                       │
│ Full Suite (8 modules│   │  Admin SaaS, Tenants, Billing    │
└───┬──────────────────┘   └──────────────────────────┬──────┘
    │                                                 │
    │   ┌─────────────────────────────────────────┐   │
    │   │        7 SaaS SPÉCIALISÉS               │   │
    │   │                                         │   │
    │   │  Quelyos Finance (:3010)  · Quelyos Store (:3011) │   │
    │   │  Quelyos Copilote (:3012)· Quelyos Sales (:3013) │   │
    │   │  Quelyos Retail (:3014)   · Quelyos Team (:3015)  │   │
    │   │  Quelyos Support (:3016)                     │   │
    │   │                                         │   │
    │   │  Chaque SaaS = subset de modules ERP    │   │
    │   │  Frontend dédié + branding propre        │   │
    │   └────────────────────┬────────────────────┘   │
    │                        │                        │
    └────────────┬───────────┴────────────┬───────────┘
                 │        API REST        │
┌────────────────┴────────────────────────┴────────────────────┐
│         BACKEND UNIQUE (odoo-backend)                         │
│         Odoo 19 Community - Port 8069                         │
│         101 modèles · 764 endpoints · Multi-tenant            │
│         PostgreSQL (5432) + Redis (6379)                       │
└──────────────────────────────────────────────────────────────┘
```

## Services et Ports

### Services existants (production)

| Service | Répertoire | Port | URL | Description |
|---------|-----------|------|-----|-------------|
| **Site Vitrine** | `vitrine-quelyos/` | 3000 | http://localhost:3000 | Site marketing principal (Next.js 14) |
| **E-commerce** | `vitrine-client/` | 3001 | http://localhost:3001 | Boutique en ligne (Next.js 16) |
| **ERP Complet** | `dashboard-client/` | 5175 | http://localhost:5175 | Backoffice Full Suite (React + Vite) |
| **Super Admin** | `super-admin-client/` | 9000 | http://localhost:9000 | Admin SaaS (React + Vite) |
| **Backend API** | `odoo-backend/` | 8069 | http://localhost:8069/api/* | API REST Odoo |
| **Interface Odoo** | `odoo-backend/` | 8069 | http://localhost:8069 | Interface native Odoo (admin/admin) |
| **PostgreSQL** | Docker | 5432 | localhost:5432 | Base de données principale |
| **Redis** | Docker | 6379 | localhost:6379 | Cache et sessions |

### 7 SaaS spécialisés (à déployer)

| SaaS | Répertoire | Port | Modules ERP | Cible |
|------|-----------|------|-------------|-------|
| **Quelyos Finance** | `apps/finance-os/` | 3010 | finance | TPE/PME, DAF, comptables |
| **Quelyos Store** | `apps/store-os/` | 3011 | store + marketing | E-commerçants, D2C |
| **Quelyos Copilote** | `apps/copilote-ops/` | 3012 | stock + GMAO + hr | PME industrielles |
| **Quelyos Sales** | `apps/sales-os/` | 3013 | crm + marketing | Equipes commerciales |
| **Quelyos Retail** | `apps/retail-os/` | 3014 | pos + store + stock | Retailers, franchises |
| **Quelyos Team** | `apps/team-os/` | 3015 | hr | PME, startups, RH |
| **Quelyos Support** | `apps/support-os/` | 3016 | support + crm | SaaS, helpdesk |

### Relation ERP Complet vs SaaS

- **dashboard-client (port 5175)** = ERP complet = **Full Suite** (tous les 8 modules intégrés)
- **7 SaaS** = frontends allégés qui consomment le **même backend Odoo**
- Un client Full Suite utilise dashboard-client
- Un client Quelyos Finance utilise uniquement apps/finance-os/ (même API backend)

## Démarrage des Services

### Méthode 1 : Script global (recommandé)

```bash
# Démarrer tous les services (ERP + existants)
./scripts/dev-start.sh all

# Démarrer individuellement
./scripts/dev-start.sh backend      # Odoo (8069)
./scripts/dev-start.sh backoffice   # ERP complet (5175)
./scripts/dev-start.sh vitrine      # Site marketing (3000)
./scripts/dev-start.sh ecommerce    # Boutique (3001)
./scripts/dev-start.sh superadmin   # Super Admin (9000)

# Démarrer un SaaS spécifique
./scripts/dev-start.sh finance      # Quelyos Finance (3010)
./scripts/dev-start.sh store        # Quelyos Store (3011)
./scripts/dev-start.sh copilote     # Quelyos Copilote (3012)
./scripts/dev-start.sh sales        # Quelyos Sales (3013)
./scripts/dev-start.sh retail       # Quelyos Retail (3014)
./scripts/dev-start.sh team         # Quelyos Team (3015)
./scripts/dev-start.sh support      # Quelyos Support (3016)

# Arrêter tous les services
./scripts/dev-stop.sh all
```

### Méthode 2 : Commande Claude Code

```bash
# Services existants
/restart-all          # Relancer tous les services
/restart-odoo         # Backend Odoo
/restart-backoffice   # ERP complet (dashboard-client)
/restart-vitrine      # Site marketing
/restart-ecommerce    # Boutique e-commerce

# SaaS spécialisés
/restart-finance      # Quelyos Finance (3010)
/restart-store        # Quelyos Store (3011)
/restart-copilote     # Quelyos Copilote (3012)
/restart-sales        # Quelyos Sales (3013)
/restart-retail       # Quelyos Retail (3014)
/restart-team         # Quelyos Team (3015)
/restart-support      # Quelyos Support (3016)
```

### Méthode 3 : Manuel

```bash
# Backend
cd odoo-backend && docker-compose up -d

# ERP complet (Full Suite)
cd dashboard-client && pnpm dev

# Site Vitrine
cd vitrine-quelyos && pnpm dev

# E-commerce
cd vitrine-client && pnpm dev

# Super Admin
cd super-admin-client && pnpm dev

# SaaS (quand disponibles)
cd apps/finance-os && pnpm dev     # Quelyos Finance
cd apps/store-os && pnpm dev       # Quelyos Store
cd apps/copilote-ops && pnpm dev   # Quelyos Copilote
```

## Dépendances entre Services

```
Backend Odoo (8069) ─┐
                     ├─→ ERP Complet / Full Suite (5175)
                     ├─→ Site Vitrine (3000)
                     ├─→ E-commerce (3001)
                     ├─→ Super Admin (9000)
                     │
                     ├─→ Quelyos Finance (3010)
                     ├─→ Quelyos Store (3011)
                     ├─→ Quelyos Copilote (3012)
                     ├─→ Quelyos Sales (3013)
                     ├─→ Quelyos Retail (3014)
                     ├─→ Quelyos Team (3015)
                     └─→ Quelyos Support (3016)
```

- **Le backend doit démarrer en premier** (tous les frontends en dépendent)
- Les frontends (existants + SaaS) peuvent démarrer en parallèle une fois le backend prêt
- Les 7 SaaS et le dashboard-client utilisent les **mêmes endpoints API** du backend
- Temps de démarrage : Backend (~30s), Frontends (~5-10s chacun)

## IMPORTANT : Dashboard-Client vs SaaS Apps vs Super-Admin

**Il existe TROIS niveaux d'applications frontend** :

### 1. **Dashboard-Client / ERP Complet** (Port 5175)
- **Rôle** : Backoffice multi-tenant = **Full Suite** (tous les modules)
- **Utilisateurs** : Clients abonnés Full Suite
- **Modules** : Finance + Boutique + Stock + CRM + Marketing + HR + POS + Support
- **Correspond au** : Bundle "Full Suite" (tous les 7 SaaS combinés)

### 2. **7 SaaS Apps** (Ports 3010-3016)
- **Rôle** : Frontends spécialisés = **subset de modules** du ERP complet
- **Utilisateurs** : Clients abonnés à un SaaS individuel
- **Backend** : Le MÊME backend Odoo que le dashboard-client
- **Exemples** :
  - **Quelyos Finance** (3010) = uniquement les pages Finance du dashboard-client
  - **Quelyos Store** (3011) = pages Store + Marketing
  - **Quelyos Team** (3015) = pages HR uniquement

| SaaS | Port | Modules ERP inclus | Prix |
|------|------|--------------------|------|
| Quelyos Finance | 3010 | `finance` | 49-99/mois |
| Quelyos Store | 3011 | `store` + `marketing` | 79-149/mois |
| Quelyos Copilote | 3012 | `stock` + `GMAO` + `hr` | 99-199/mois |
| Quelyos Sales | 3013 | `crm` + `marketing` | 59-129/mois |
| Quelyos Retail | 3014 | `pos` + `store` + `stock` | 129-249/mois |
| Quelyos Team | 3015 | `hr` | 39-79/mois |
| Quelyos Support | 3016 | `support` + `crm` | 29-69/mois |

### 3. **Super-Admin-Client** (Port 9000)
- **Rôle** : Panel d'administration SaaS global
- **Utilisateurs** : Equipe Quelyos uniquement (administrateurs)
- **Scope** : Vue transversale sur TOUS les tenants + gestion abonnements/SaaS

### Regle de Developpement

**Quand ajouter une page** :
- **dashboard-client** : Fonctionnalité métier pour le ERP complet (Full Suite)
- **apps/[saas-name]/** : Fonctionnalité pour un SaaS spécifique (reprend des pages du dashboard)
- **super-admin-client** : Admin système Quelyos (monitoring, tenants, billing)

**Partage de code** :
- Composants UI communs : `packages/ui-kit/` (@quelyos/ui-kit)
- Client API partagé : `packages/api-client/` (@quelyos/api-client)
- Helpers partagés : `packages/utils/` (@quelyos/utils)
- Chaque SaaS app importe depuis ces packages communs

## Architecture Backend Odoo

### 🔒 Isolation Complète (v3.0.0)

**Quelyos Suite = Core Odoo 19 Community UNIQUEMENT + Modules Quelyos Natifs**

```
┌─────────────────────────────────────────────────────────┐
│                  Quelyos Suite v3.0.0                    │
│                  (100% Autonome)                         │
├─────────────────────────────────────────────────────────┤
│  Modules Quelyos (6 modules natifs)                     │
│  ├── quelyos_core          (orchestrateur)              │
│  ├── quelyos_api           (API REST + multi-tenant)    │
│  ├── quelyos_stock_advanced (remplace 3 modules OCA)    │
│  ├── quelyos_finance       (trésorerie, budgets)        │
│  ├── quelyos_sms_tn        (SMS Tunisie)                │
│  └── quelyos_debrand       (suppression marque Odoo)    │
├─────────────────────────────────────────────────────────┤
│  Core Odoo 19 Community (14 modules standard)          │
│  ├── Infrastructure : base, web, mail                   │
│  ├── Site web : website, website_sale                   │
│  ├── Commerce : sale_management, crm, delivery,         │
│  │               payment, loyalty                        │
│  ├── Catalogue : product, stock                         │
│  ├── Finance : account                                   │
│  ├── Marketing : mass_mailing                           │
│  └── Contacts : contacts                                │
└─────────────────────────────────────────────────────────┘
         ⚠️ AUCUNE dépendance OCA/tierce
```

### Modules Supprimés (v3.0.0)

**4 modules OCA Stock historiquement utilisés (désormais remplacés)** :
- ❌ `stock_change_qty_reason` → ✅ `quelyos_stock_advanced`
- ❌ `stock_demand_estimate` → ✅ Non utilisé
- ❌ `stock_inventory` → ✅ `quelyos_stock_advanced`
- ❌ `stock_location_lockdown` → ✅ `quelyos_stock_advanced`

**3 modules OCA Marketing (jamais utilisés)** :
- ❌ `mass_mailing_partner` (désactivé dès le début)
- ❌ `mass_mailing_list_dynamic` (désactivé dès le début)
- ❌ `mass_mailing_resend` (désactivé dès le début)

### Garanties d'Isolation

✅ **Whitelisting automatique** (`quelyos_core/__init__.py`)
- Vérification post-installation : aucun module non-core installé
- Logs d'avertissement si modules OCA/tiers détectés

✅ **Validation version Odoo** (`quelyos_api/__init__.py`)
- Blocage installation si Odoo != 19.x
- Garantit compatibilité stricte

✅ **Gouvernance stricte**
- Documentation : `.claude/DEPENDENCIES_POLICY.md`
- Processus ajout dépendance : 4 étapes validation
- Stratégie : internalisation (fork dans `quelyos_*`) si nécessaire

### Avantages

🎯 **Pérennité**
- Aucune régression lors de mises à jour OCA
- Contrôle total sur le code
- Debug et hotfix facilités

🎯 **Maintenance Simplifiée**
- Devs Odoo vanilla suffisent (pas d'expertise OCA requise)
- Documentation centralisée (pas de docs OCA externes)
- Onboarding développeurs accéléré

🎯 **Upgrade Path Clair**
- Migration Odoo 19→20→21 sans blocage externe
- Pas de dépendances à gérer lors de migrations majeures
- Fork Odoo possible si nécessaire (pas de lock-in)

## Structure des Répertoires

```
quelyosSuite/
├── odoo-backend/              # Backend Odoo 19 (backend unique)
│   ├── addons/
│   │   ├── quelyos_api/       # API REST + multi-tenant (101 modèles)
│   │   ├── quelyos_core/      # Orchestrateur modules
│   │   ├── quelyos_finance/   # Module trésorerie/budgets
│   │   ├── quelyos_stock_advanced/  # Stock avancé
│   │   ├── quelyos_sms_tn/    # SMS Tunisie
│   │   └── quelyos_debrand/   # Anonymisation Odoo
│   └── docker-compose.yml
│
├── dashboard-client/          # ERP Complet / Full Suite (React + Vite, :5175)
│   └── src/
│       ├── pages/             # 209 pages (8 modules)
│       ├── components/common/ # 30+ composants (source @quelyos/ui-kit)
│       └── config/modules.ts  # Configuration modules
│
├── vitrine-quelyos/           # Site marketing (Next.js 14, :3000)
├── vitrine-client/            # E-commerce client (Next.js 16, :3001)
├── super-admin-client/        # Admin SaaS (React + Vite, :9000)
│
├── apps/                      # 7 SaaS spécialisés (à créer)
│   ├── finance-os/            # Quelyos Finance (:3010)
│   ├── store-os/              # Quelyos Store (:3011)
│   ├── copilote-ops/          # Quelyos Copilote (:3012)
│   ├── sales-os/              # Quelyos Sales (:3013)
│   ├── retail-os/             # Quelyos Retail (:3014)
│   ├── team-os/               # Quelyos Team (:3015)
│   └── support-os/            # Quelyos Support (:3016)
│
├── packages/                  # Packages partagés (monorepo)
│   ├── ui-kit/                # @quelyos/ui-kit (composants React)
│   ├── api-client/            # @quelyos/api-client (client API)
│   ├── utils/                 # @quelyos/utils (helpers)
│   └── logger/                # @quelyos/logger (existant)
│
├── scripts/                   # Scripts de gestion
│   ├── dev-start.sh
│   └── dev-stop.sh
├── turbo.json                 # Turborepo config (à créer)
├── pnpm-workspace.yaml        # Workspace config
└── .env.ports                 # Configuration des ports
```

## Logs et Debugging

### Vérifier les services actifs

```bash
# Vérifier ports existants + SaaS
lsof -i:3000,3001,5175,8069,9000,3010,3011,3012,3013,3014,3015,3016

# Vérifier les conteneurs Docker
docker ps --filter "name=quelyos"

# Vérifier les processus Node.js
ps aux | grep -E "next|vite" | grep -v grep
```

### Consulter les logs

```bash
# Logs Backend
docker-compose logs -f

# Logs Backoffice
tail -f /tmp/quelyos-backoffice.log

# Logs Site Vitrine
tail -f /tmp/quelyos-vitrine.log

# Logs E-commerce
tail -f /tmp/quelyos-ecommerce.log
```

## Résolution de Problèmes

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port
lsof -ti:3000

# Arrêter le processus
lsof -ti:3000 | xargs kill -9

# Ou utiliser le script
./scripts/dev-stop.sh all
```

### Service ne démarre pas

1. Vérifier que les dépendances sont installées : `pnpm install`
2. Vérifier que Docker est démarré (pour le backend)
3. Consulter les logs d'erreur
4. Vérifier la configuration des ports dans `.env.ports`

### Conflit de ports après git pull

```bash
# Arrêter tous les services
./scripts/dev-stop.sh all

# Vérifier les changements dans package.json
git diff HEAD~1 */package.json

# Redémarrer
./scripts/dev-start.sh all
```

## Configuration Production

Voir `nginx/` et `docs/deployment/` pour la configuration de production avec reverse proxy.

---

## Plan Stratégique 7 SaaS

Voir `docs/QUELYOS_SUITE_7_SAAS_PLAN.md` et `docs/QUELYOS_SUITE_7_SAAS_PLAN.html` pour le plan détaillé :
- Architecture monorepo Turborepo
- Détail fonctionnel des 7 SaaS
- Roadmap 18 mois
- Stratégie pricing et bundles
- Branding et design system
- Nouveaux modèles Odoo (GMAO, Quelyos Finance)

---

**Dernière mise à jour** : 2026-01-30
