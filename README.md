# Quelyos ERP

Plateforme SaaS omnicanal pour le retail: POS + E-commerce + Mobile unifies en temps reel.

## Description

Quelyos ERP est une solution de gestion integree pour les commercants en Tunisie et au Maroc. La plateforme unifie:
- **POS** (Point de Vente) avec materiel Sunmi
- **E-commerce** avec site web white-label
- **Application Mobile** generee automatiquement (Flutter)
- **Inventaire temps reel** synchronise sur tous les canaux

## Architecture

```
quelyos-erp/
├── backend/           # Odoo 16 + addons custom
│   └── addons/
│       └── quelyos_core/
├── frontend/          # React + Vite + TailwindCSS
├── mobile/            # Flutter (Phase 2)
├── device-bridge/     # Node.js - Bridge POS hardware
├── infra/
│   ├── docker/        # Docker Compose
│   ├── terraform/     # Infrastructure AWS
│   └── scripts/       # Scripts de deploiement
├── config/            # Fichiers de configuration
└── docs/              # Documentation projet
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.10+
- PostgreSQL 15+

## Installation

```bash
# Cloner le depot
git clone https://github.com/salmenktata/quelyos-erp.git
cd quelyos-erp

# Copier la configuration
cp .env.example .env
# Editer .env avec vos valeurs

# Lancer avec Docker
cd infra/docker
docker-compose up -d

# OU lancer en dev
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Odoo | 8069 | Backend ERP |
| Frontend | 3000 | Application React |
| Device Bridge | 3001 | Bridge materiel POS |
| PostgreSQL | 5432 | Base de donnees |
| Redis | 6379 | Cache |

## Developpement

### Backend (Odoo)

```bash
# Les addons custom sont dans backend/addons/
# Ils sont montes automatiquement dans le conteneur Odoo
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Device Bridge

```bash
cd device-bridge
npm install
npm run dev
```

## API

L'API REST est disponible sur `/api/v1/`:

- `GET /api/v1/health` - Health check
- `GET /api/v1/products` - Liste des produits
- `GET /api/v1/products/:id` - Detail produit
- `GET /api/v1/categories` - Categories

## Documentation

Voir le dossier `docs/` pour la documentation complete:

- [Index Roadmap](docs/ROADMAP_INDEX.md)
- [Resume 1 page](docs/ROADMAP_RESUME_1PAGE.md)
- [Produit Quelyos](docs/ROADMAP_PRODUIT_QUELYOS.md)
- [Guide d'execution](docs/ROADMAP_EXECUTION_GUIDE.md)
- [Spike Technique](docs/Spike_Technique_POC_Detail.md)

## Timeline

| Phase | Periode | Objectif |
|-------|---------|----------|
| Phase 0 | 27-31 Jan | Spike tech - POCs |
| Phase 1 | Feb-Mar | V0 MVP - 1 client |
| Phase 2 | Mar-Mai | V1 - 50 clients |
| Phase 3 | Mai-Aout | V2 Scale - 100+ clients |

## Licence

Tous droits reserves - Quelyos 2026
