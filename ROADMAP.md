# Roadmap Quelyos ERP - Produit Commercial Autonome

> **Vision** : Transformer Quelyos en une solution ERP e-commerce complète et autonome, commercialisable sous sa propre marque, avec Odoo Community comme moteur backend invisible.

---

## 📊 État Actuel (Janvier 2026)

| Métrique | Valeur |
|----------|--------|
| Parité fonctionnelle Odoo | ~70% |
| Endpoints API | 47+ |
| Pages Backoffice | 15 |
| Pages Frontend | 14+ |
| Infrastructure | CI/CD + Monitoring opérationnels |

---

## 🎯 Phase 1 : Finalisation Produit (Parité 100%)

**Objectif** : Atteindre la parité fonctionnelle totale avec Odoo pour les modules e-commerce.

**Durée estimée** : 6-8 semaines

### 1.1 Module Paiement (Priorité CRITIQUE - 21% → 100%)

| Tâche | Priorité | Effort |
|-------|----------|--------|
| Liste transactions backoffice | P0 | 2j |
| Détail transaction | P0 | 1j |
| Remboursements (initier, suivre) | P0 | 3j |
| Stripe Elements frontend (formulaire carte) | P1 | 2j |
| Historique paiements espace client | P1 | 1j |
| Export transactions (comptabilité) | P1 | 1j |
| Configuration providers (clés API) | P2 | 2j |

**Livrable** : Module paiement 100% opérationnel

### 1.2 Module Commandes (56% → 100%)

| Tâche | Priorité | Effort |
|-------|----------|--------|
| Génération factures PDF | P0 | 3j |
| Bon de livraison PDF | P1 | 2j |
| Filtres avancés (date, client, recherche) | P1 | 1j |
| Historique changements (audit trail) | P2 | 2j |
| Notes internes | P2 | 1j |
| Duplication commande | P2 | 1j |

**Livrable** : Gestion commandes complète avec documents légaux

### 1.3 Module Clients (48% → 100%)

| Tâche | Priorité | Effort |
|-------|----------|--------|
| Page détail client backoffice | P1 | ✅ Fait |
| Édition client admin | P1 | 1j |
| Historique commandes dans fiche client | P1 | ✅ Fait |
| Export CSV clients | P1 | 1j |
| Tags/Catégories clients | P2 | 2j |
| Import CSV clients | P2 | 2j |
| Blocage client | P2 | 1j |

**Livrable** : CRM client complet

### 1.4 Gaps Restants Mineurs

| Module | Tâches restantes | Effort total |
|--------|------------------|--------------|
| Stock | Historique mouvements UI, alertes email | 3j |
| Livraison | CRUD méthodes complet | 2j |
| Coupons | Stats utilisation | 1j |
| Analytics | Graphiques, filtres période | 3j |
| Produits | Filtres attributs, dimensions L/l/H | 2j |

### 1.5 Checklist Fin Phase 1

- [ ] Score parité global ≥ 95%
- [ ] 0 gap P0 restant
- [ ] ≤ 5 gaps P1 restants (documentés comme "v2")
- [ ] Tous les tests passent (pytest + Playwright)
- [ ] Documentation API complète

---

## 🏗️ Phase 2 : Packaging Produit

**Objectif** : Créer un produit installable et déployable facilement.

**Durée estimée** : 3-4 semaines

### 2.1 Installation One-Click

```bash
# Objectif : L'utilisateur tape une commande et tout s'installe
curl -fsSL https://get.quelyos.com | bash

# Ou via Docker
docker run -d quelyos/erp:latest
```

| Tâche | Effort |
|-------|--------|
| Script d'installation automatisé (Linux/macOS) | 3j |
| Image Docker all-in-one | 2j |
| Docker Compose production optimisé | 1j |
| Wizard de configuration premier lancement | 3j |
| Documentation installation | 2j |

### 2.2 Branding & White-Label

| Élément | Action |
|---------|--------|
| Logo Quelyos | Créer identité visuelle |
| Favicon | Remplacer favicon Odoo |
| Page de connexion | Design Quelyos (aucune mention Odoo) |
| Emails transactionnels | Templates Quelyos |
| Rapports PDF | En-tête/pied de page Quelyos |
| Page "À propos" | Présentation Quelyos |

### 2.3 Configuration Initiale

Wizard premier lancement :

```
Étape 1 : Informations entreprise
  - Nom, adresse, logo
  - Numéro SIRET/TVA

Étape 2 : Configuration e-commerce
  - Devise
  - Pays de livraison
  - Modes de paiement

Étape 3 : Compte administrateur
  - Email, mot de passe

Étape 4 : Import données (optionnel)
  - Import catalogue CSV
  - Import clients CSV
```

### 2.4 Mise à Jour Automatique

| Composant | Stratégie |
|-----------|-----------|
| Frontend/Backoffice | Auto-update via CDN ou pull Docker |
| Module API Odoo | Versionné, migration scripts |
| Base de données | Migrations Odoo automatiques |

---

## 📜 Phase 3 : Conformité Légale

**Objectif** : Être 100% conforme avec la licence LGPL et les obligations légales.

**Durée estimée** : 1-2 semaines

### 3.1 Licence & Mentions

| Document | Contenu |
|----------|---------|
| `LICENSE` | Licence Quelyos (propriétaire) pour frontend/backoffice |
| `THIRD_PARTY_LICENSES` | Liste composants open source (Odoo LGPL, React MIT, etc.) |
| Page `/legal` | Mentions légales avec attribution open source |
| Page `/licenses` | Liste détaillée des licences |

### 3.2 Code Source LGPL

Obligation : Rendre disponible le code source des composants LGPL.

```
Option A : Inclure dans le package
  /src/odoo-community/  → Code Odoo
  /src/quelyos-api/     → Module API (LGPL)

Option B : Lien vers téléchargement
  "Code source disponible sur https://github.com/quelyos/odoo-module"
```

### 3.3 Structure Licence Finale

```
QUELYOS ERP
├── Frontend Next.js      → Propriétaire (Quelyos SAS)
├── Backoffice React      → Propriétaire (Quelyos SAS)
├── Module quelyos_api    → LGPL v3 (open source)
├── Odoo Community        → LGPL v3 (non modifié)
└── Documentation         → CC BY-SA 4.0
```

### 3.4 Protection Marque

| Action | Priorité |
|--------|----------|
| Déposer marque "Quelyos" (INPI) | Haute |
| Réserver domaines (quelyos.com, .fr, .io) | Haute |
| Créer entité juridique (SAS) | Haute |
| CGU / CGV | Haute |
| Politique de confidentialité RGPD | Haute |

---

## 💰 Phase 4 : Modèle Commercial

**Objectif** : Définir et implémenter la stratégie de monétisation.

**Durée estimée** : 2-3 semaines (technique) + ongoing (commercial)

### 4.1 Options de Monétisation

#### Option A : SaaS (Recommandé)

```
┌─────────────────────────────────────────────────────────┐
│  QUELYOS CLOUD                                          │
├─────────────────────────────────────────────────────────┤
│  Starter      │  Pro           │  Enterprise            │
│  29€/mois     │  79€/mois      │  Sur devis             │
├───────────────┼────────────────┼────────────────────────┤
│  1 utilisateur│  5 utilisateurs│  Illimité              │
│  1000 produits│  10000 produits│  Illimité              │
│  Support email│  Support chat  │  Support dédié         │
│  -            │  Multi-boutique│  Multi-boutique        │
│  -            │  API accès     │  API + Webhooks        │
│  -            │  -             │  Installation on-prem  │
└───────────────┴────────────────┴────────────────────────┘
```

**Avantages** :
- Revenus récurrents (MRR)
- Contrôle total de l'infrastructure
- Mises à jour transparentes
- Support centralisé

#### Option B : Licence + Support

```
Licence perpétuelle : 990€ (1 instance)
Support annuel : 290€/an (mises à jour + support email)
```

#### Option C : Open Core

```
Quelyos Community : Gratuit (open source)
Quelyos Pro : 49€/mois (features avancées)
  - Multi-boutiques
  - Analytics avancés
  - Intégrations marketplace
  - Support prioritaire
```

### 4.2 Infrastructure SaaS

| Composant | Solution | Coût estimé |
|-----------|----------|-------------|
| Hébergement | Scaleway / OVH / Hetzner | 50-200€/mois |
| Base de données | PostgreSQL managé | 30-100€/mois |
| CDN | Cloudflare | Gratuit-20€/mois |
| Emails | Mailgun / Postmark | 10-50€/mois |
| Monitoring | Grafana Cloud free tier | Gratuit |
| Backups | S3-compatible | 10-30€/mois |

**Coût infrastructure démarrage** : ~150-400€/mois

### 4.3 Système de Facturation

| Tâche | Solution |
|-------|----------|
| Gestion abonnements | Stripe Billing |
| Facturation | Stripe Invoicing ou module interne |
| Portail client | Page `/account/subscription` |
| Upgrade/Downgrade | Self-service |
| Dunning (relances) | Automatisé Stripe |

### 4.4 Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────┐
│  QUELYOS CLOUD PLATFORM                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │Client A │  │Client B │  │Client C │   ...           │
│  │  DB A   │  │  DB B   │  │  DB C   │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│       │            │            │                       │
│  ┌────┴────────────┴────────────┴────┐                 │
│  │      Odoo Multi-Database          │                 │
│  │      (1 instance, N databases)    │                 │
│  └───────────────────────────────────┘                 │
│                                                         │
│  ┌───────────────────────────────────┐                 │
│  │      Frontend/Backoffice          │                 │
│  │      (tenant-aware routing)       │                 │
│  └───────────────────────────────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Phase 5 : Go-to-Market

**Objectif** : Lancer commercialement Quelyos.

**Durée estimée** : 4-6 semaines + ongoing

### 5.1 Pré-Lancement

| Tâche | Durée |
|-------|-------|
| Landing page marketing | 1 semaine |
| Documentation utilisateur (docs.quelyos.com) | 2 semaines |
| Vidéos démo / tutoriels | 1 semaine |
| Blog (SEO) | Ongoing |
| Liste d'attente / early adopters | 1 semaine |

### 5.2 Site Marketing

```
quelyos.com
├── / (landing page)
├── /features (fonctionnalités)
├── /pricing (tarifs)
├── /demo (démo interactive ou vidéo)
├── /docs (documentation)
├── /blog (SEO + actualités)
├── /contact
├── /legal (mentions légales + licences)
└── /signup (inscription SaaS)
```

### 5.3 Canaux d'Acquisition

| Canal | Action | Priorité |
|-------|--------|----------|
| SEO | Blog "ERP e-commerce", "alternative Odoo" | Haute |
| Product Hunt | Lancement officiel | Moyenne |
| LinkedIn | Posts, articles, networking | Haute |
| Marketplaces | Intégrations (Shopify, WooCommerce migration) | Moyenne |
| Partenariats | Agences web, intégrateurs | Haute |
| Ads | Google Ads "ERP PME", "gestion e-commerce" | Après validation |

### 5.4 Métriques Clés (KPIs)

| Métrique | Objectif M+3 | Objectif M+12 |
|----------|--------------|---------------|
| MRR | 1 000€ | 10 000€ |
| Clients payants | 20 | 150 |
| Churn mensuel | < 5% | < 3% |
| NPS | > 40 | > 50 |
| Coût acquisition (CAC) | < 200€ | < 150€ |
| Lifetime Value (LTV) | > 600€ | > 1000€ |

---

## 🛠️ Phase 6 : Support & Maintenance

**Objectif** : Assurer la pérennité et la qualité du produit.

**Ongoing**

### 6.1 Support Client

| Niveau | Canal | SLA |
|--------|-------|-----|
| Starter | Email | 48h |
| Pro | Email + Chat | 24h |
| Enterprise | Email + Chat + Téléphone | 4h |

**Outils** :
- Ticketing : Crisp, Intercom, ou Freshdesk
- Knowledge base : Notion public ou GitBook
- Status page : status.quelyos.com (Upptime)

### 6.2 Maintenance Technique

| Tâche | Fréquence |
|-------|-----------|
| Mises à jour sécurité Odoo | Dès publication |
| Mises à jour dépendances (npm, pip) | Mensuelle |
| Backups vérification | Quotidienne (auto) |
| Tests de restauration | Mensuelle |
| Audit sécurité | Trimestrielle |
| Performance review | Mensuelle |

### 6.3 Roadmap Produit Continue

| Trimestre | Focus |
|-----------|-------|
| T1 | Stabilisation, retours early adopters |
| T2 | Intégrations (Stripe avancé, marketplaces) |
| T3 | Mobile app (React Native) |
| T4 | Multi-boutiques, B2B features |

---

## 📅 Planning Global

```
2026
────────────────────────────────────────────────────────────────────

Jan    Fév    Mar    Avr    Mai    Jun    Jul    Aoû    Sep    Oct
 │      │      │      │      │      │      │      │      │      │
 ├──────┴──────┤      │      │      │      │      │      │      │
 │  PHASE 1    │      │      │      │      │      │      │      │
 │  Parité 100%│      │      │      │      │      │      │      │
 │             ├──────┴──────┤      │      │      │      │      │
 │             │  PHASE 2    │      │      │      │      │      │
 │             │  Packaging  │      │      │      │      │      │
 │             │             ├──────┤      │      │      │      │
 │             │             │PH.3  │      │      │      │      │
 │             │             │Legal │      │      │      │      │
 │             │             │      ├──────┴──────┤      │      │
 │             │             │      │  PHASE 4    │      │      │
 │             │             │      │  Commercial │      │      │
 │             │             │      │             ├──────┴──────┤
 │             │             │      │             │  PHASE 5    │
 │             │             │      │             │  Go-Market  │
 │             │             │      │             │             │
 ▼             ▼             ▼      ▼             ▼             ▼

                                    🚀 LANCEMENT BETA (Mai 2026)

                                                   🎉 LANCEMENT
                                                      OFFICIEL
                                                      (Sep 2026)
```

---

## ✅ Checklist Finale Avant Lancement

### Produit
- [ ] Parité fonctionnelle ≥ 95%
- [ ] Tests automatisés couvrant 80%+ du code
- [ ] Documentation utilisateur complète
- [ ] Vidéos tutoriels (5 minimum)
- [ ] Démo interactive fonctionnelle

### Technique
- [ ] Installation one-click fonctionnelle
- [ ] Multi-tenant opérationnel (si SaaS)
- [ ] Backups automatisés et testés
- [ ] Monitoring et alertes configurés
- [ ] Plan de disaster recovery documenté

### Légal
- [ ] Entité juridique créée
- [ ] Marque déposée
- [ ] CGU/CGV rédigées
- [ ] Politique RGPD
- [ ] Mentions licences open source

### Commercial
- [ ] Pricing validé
- [ ] Système de paiement intégré (Stripe)
- [ ] Landing page live
- [ ] 10+ beta testeurs actifs
- [ ] Processus onboarding documenté

### Support
- [ ] Système de tickets opérationnel
- [ ] Knowledge base avec 20+ articles
- [ ] Processus d'escalade défini
- [ ] Status page configurée

---

## 💡 Recommandations Stratégiques

### Court Terme (0-3 mois)
1. **Focus** : Finir Phase 1 (parité 100%)
2. **Valider** : Tester avec 5-10 beta utilisateurs réels
3. **Itérer** : Corriger les frictions UX identifiées

### Moyen Terme (3-6 mois)
1. **Packager** : Créer le produit installable
2. **Documenter** : Documentation exhaustive
3. **Lancer** : Beta publique

### Long Terme (6-12 mois)
1. **Scaler** : Infrastructure multi-tenant
2. **Croître** : Marketing, acquisitions
3. **Étendre** : Nouvelles fonctionnalités (mobile, intégrations)

---

## 🎯 Indicateurs de Succès par Phase

| Phase | Critère de succès |
|-------|-------------------|
| Phase 1 | 0 gap P0, tests passent, 3 beta testeurs satisfaits |
| Phase 2 | Installation < 10 min, 0 intervention manuelle |
| Phase 3 | Validation juridique (avocat si possible) |
| Phase 4 | Premier client payant |
| Phase 5 | 10 clients payants, MRR > 500€ |
| Phase 6 | Churn < 5%, NPS > 40 |

---

*Document créé le 24 janvier 2026 - À mettre à jour régulièrement*
