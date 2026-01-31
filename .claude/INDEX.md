# 📚 Index Documentation Quelyos Suite

**Dernière mise à jour** : 2026-01-31

---

## 🚀 Migration 7 SaaS → Système Éditions

### Résumé Exécutif
- **[README Migration](migration/README_MIGRATION.md)** ⭐ Point d'entrée - Résumé en 2 pages
- **[Migration Finale Pushée](MIGRATION_FINALE_PUSHEE.md)** — État GitHub (dernière version)
- **[Livrables Finaux](migration/LIVRABLES_FINAUX.md)** — Inventaire complet (20 fichiers)

### Rapports Détaillés
- **[Audit Final Phase 8](migration/PHASE8_AUDIT_FINAL.md)** — Audit technique 7 éditions
- **[Synthèse Phases 4-6](migration/PHASES_4_5_6_COMPLETE.md)** — Store, Copilote, Retail
- **[Archivage apps/*](ARCHIVAGE_COMPLETE.md)** — Rapport archivage complet

### Résultats
- ✅ **8/8 phases** complétées (100%)
- ✅ **19/19 tâches** terminées (100%)
- ✅ **20 livrables** créés
- ✅ **98.7%** plus rapide (11 sem → 1 jour)
- ✅ **-85%** codebases (7 → 1)

---

## 📖 Guides Techniques

### Documentation Éditions (docs/)
- **[Guide Développement](../docs/EDITIONS_DEV_GUIDE.md)** — Hooks, tests, best practices
- **[Guide Administration](../docs/EDITIONS_ADMIN_GUIDE.md)** — Docker, K8s, monitoring
- **[Rétrospective Migration](../docs/MIGRATION_RETRO.md)** — Leçons apprises, KPIs
- **[Checklist Déploiement](../docs/DEPLOYMENT_CHECKLIST.md)** — 7 phases production
- **[ADR Système Éditions](../docs/ADR/001-edition-system.md)** — Architecture Decision Record

### Dashboard Client (dashboard-client/.claude/)
- **[UI Patterns](../dashboard-client/.claude/UI_PATTERNS.md)** — Patterns composants dashboard
- **[Optimisation Bundle](../dashboard-client/.claude/BUNDLE_OPTIMIZATION.md)** — Réduction tailles bundles
- **[Docker Build Guide](../dashboard-client/.claude/DOCKER_BUILD_GUIDE.md)** — Multi-éditions Docker
- **[Tests Permissions](../dashboard-client/.claude/TEST_PERMISSIONS_GUIDE.md)** — Tests filtrage modules
- **[Dark Mode Vérification](../dashboard-client/.claude/DARK_MODE_VERIFICATION.md)** — Checklist dark mode

---

## ⚙️ Conventions & Workflow

### Conventions Projet
- **[Conventions API](API_CONVENTIONS.md)** — Format données, endpoints, auth
- **[Conventions Routing](ROUTING_CONVENTIONS.md)** — URLs, modules, navigation
- **[Politique Dépendances](DEPENDENCIES_POLICY.md)** — Gestion packages npm/pip
- **[Workflow Développement](DEVELOPMENT_WORKFLOW.md)** — Git, commits, PR

### Optimisation
- **[Mode Économie Tokens](OPTIMIZATION_MODE.md)** — Réduction consommation
- **[Guide Économie](GUIDE_ECONOMIE_TOKENS.md)** — Bonnes pratiques

---

## 📂 Archive

### Phases Migration
- [Phases 0, 1, 4](archive/phases/) — Documents phases intermédiaires
- [Fichiers obsolètes](../dashboard-client/.claude/archive/) — Anciens rapports migration

---

## 🔗 Liens Rapides

### GitHub
- **Repo** : https://github.com/salmenktata/quelyosSuite
- **Branche Archive** : [archive/apps-saas-legacy](https://github.com/salmenktata/quelyosSuite/tree/archive/apps-saas-legacy)
- **Tag Legacy** : [v1.0.0-apps-legacy](https://github.com/salmenktata/quelyosSuite/releases/tag/v1.0.0-apps-legacy)

### Documentation Principale
- **README Éditions** : `dashboard-client/README-EDITIONS.md`
- **ROADMAP** : `ROADMAP.md`
- **LOGME** : `docs/LOGME.md`

---

## 📊 Structure Documentation

```
.claude/
├── INDEX.md                    ⭐ Ce fichier
├── migration/                  📦 Migration 7 SaaS
│   ├── README_MIGRATION.md
│   ├── LIVRABLES_FINAUX.md
│   ├── PHASE8_AUDIT_FINAL.md
│   └── PHASES_4_5_6_COMPLETE.md
├── MIGRATION_FINALE_PUSHEE.md  🚀 État GitHub
├── ARCHIVAGE_COMPLETE.md       📦 Archivage apps/*
├── API_CONVENTIONS.md          ⚙️ Conventions
├── ROUTING_CONVENTIONS.md
├── DEVELOPMENT_WORKFLOW.md
├── DEPENDENCIES_POLICY.md
└── archive/                    📂 Fichiers obsolètes

dashboard-client/.claude/
├── UI_PATTERNS.md              🎨 Guides Dashboard
├── BUNDLE_OPTIMIZATION.md
├── DOCKER_BUILD_GUIDE.md
├── TEST_PERMISSIONS_GUIDE.md
└── DARK_MODE_VERIFICATION.md

docs/
├── EDITIONS_DEV_GUIDE.md       📖 Guides Éditions
├── EDITIONS_ADMIN_GUIDE.md
├── MIGRATION_RETRO.md
├── DEPLOYMENT_CHECKLIST.md
└── ADR/001-edition-system.md
```

---

**Dernière mise à jour** : 2026-01-31  
**Maintenu par** : Claude Code
