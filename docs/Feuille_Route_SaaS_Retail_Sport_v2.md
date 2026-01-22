# 🎯 FEUILLE DE ROUTE — Plateforme SaaS Retail Sport (Tunisie & Maroc)

**Version 2.0 — Optimisée pour la réussite**  
Date: 22/01/2026  
Statut: À valider en atelier de 2 jours avec l'équipe

---

## 📋 EXECUTIVE SUMMARY

| Élément | Valeur |
|---------|--------|
| **Base technique** | Odoo 19 Community |
| **Canaux** | POS + Web (eCommerce) + Mobile (app native) |
| **Paiement** | COD + Carte bancaire (PSP locales TN/MA) |
| **Modèle SaaS** | Multi-tenant, white-label complet |
| **Go-live V1** | 6–8 mois (équipe 6–8 pers) |
| **Effort total V0→V3** | ~48 semaines-hommes (18 mois, 3 pers / 6 mois, 6 pers) |
| **Risque principal** | Intégrations PSP/transporteurs + matériel POS |

---

## 🎪 SECTION 1 : STRATÉGIE & POSITIONNEMENT

### 1.1 Proposition de valeur (Pitch 30 sec)

**Pour le marché TN/MA :**

> *"La première plateforme omnicanal spécialisée retail sport. Stock unifié POS/Web/Mobile, COD fiable (anti-refus), échanges taille/couleur en 24h, livraison instantanée, white-label. Déploiement en 5 jours, support SaaS inclus."*

**Avantages clés vs. concurrence :**
- ✅ **Omnicanal réel** : stock unique POS+Web+Mobile (pas de doubles ventes)
- ✅ **COD maîtrisé** : scoring + acompte + blacklist = refus réduits de 40%+
- ✅ **Retours fluides** : échanges taille/couleur en app, sans retour physique si possible
- ✅ **Time-to-value** : 5–7 jours de go-live vs 4–6 semaines (self-hosted)
- ✅ **Coût support** : -50% grâce aux backups rapides et diagnostics automatisés

### 1.2 Cibles clients (Phase 1)

| Segment | Profil | TAM | Approche |
|---------|--------|-----|----------|
| **Early adopters** | 5–15 magasins, chiffre TN/MA 200–500K€ | ~200 boutiques | Vente directe + référence |
| **PME retail sport** | Chaînes 20–50 magasins, ca 2–10M€ | ~50–80 chaînes | Vente consultative, POC 2 sem |
| **Franchises** | Réseau franchise sport, besoin blanc label fort | ~30–50 réseaux | Focus white-label + ops |

**Stratégie commerciale suggérée :**
- **Q1 2026** : 1–2 clients pilotes (early adopters, contrats nuls ou quasi-nuls)
- **Q2 2026** : 3–5 clients payants (5K€–15K€/mois)
- **Q3 2026** : 10–15 clients payants, premier réseau en blanc label

### 1.3 Modèle économique recommandé

```
Tarification SaaS (par magasin / mois) :
├─ Socle POS+Stock        : 300€/magasin + 1000€ setup
├─ Web eCommerce          : +200€ (up to 20K€/mois chiffre web)
├─ Mobile app             : +150€/app (shared infrastructure, push, analytics)
├─ Add-ons (RMA avancé, analytics, fidélité) : +150€–500€
└─ Support premium (24/7, SLA 4h)           : +200€

Exemple 10 magasins :
  POS+Stock:     10 × 300€ = 3000€
  Web:           200€
  Mobile:        150€
  Support:       200€
  ──────────────────────────
  Revenu MRR:    3550€ → 42.6K€ annuel
  Setup initiale: 10 × 1000€ = 10K€ (1-shot)
```

---

## 🏗️ SECTION 2 : ARCHITECTURE CIBLE & DÉCISIONS TECHNIQUES

### 2.1 Architecture SaaS multi-tenant (DÉCISION CLÉ)

**Approche retenue : Database-per-tenant (isolement maximal)**

```
┌─────────────────────────────────────────────────────────────┐
│ Load Balancer (AWS ELB / nginx) + SSL/TLS                   │
├─────────────────────────────────────────────────────────────┤
│ Reverse Proxy (nginx)                                        │
│ ├─ Routage par sous-domaine : client1.saasretail.tn         │
│ ├─ Cache HTTP (Redis)                                        │
│ └─ Rate limiting (100 req/sec par tenant)                   │
├─────────────────────────────────────────────────────────────┤
│ Odoo Containers (K8s ou Docker Compose)                     │
│ ├─ [Pod 1] client1.saasretail.tn → DB-client1               │
│ ├─ [Pod 2] client2.saasretail.tn → DB-client2               │
│ └─ [Pod 3] client3.saasretail.tn → DB-client3               │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL Cluster                                           │
│ ├─ DB-client1 (500 MB—5 GB)                                  │
│ ├─ DB-client2                                                │
│ └─ DB-client3                                                │
├─────────────────────────────────────────────────────────────┤
│ Filestore (S3/OVH Object Storage par tenant)                 │
│ ├─ s3://client1-files                                        │
│ ├─ s3://client2-files                                        │
│ └─ s3://client3-files                                        │
├─────────────────────────────────────────────────────────────┤
│ Observabilité                                                │
│ ├─ Logs (CloudWatch, Datadog, ou ELK)                       │
│ ├─ Metrics (Prometheus)                                      │
│ └─ Alerting (PagerDuty)                                      │
└─────────────────────────────────────────────────────────────┘
```

**Avantages :**
- 🟢 Restore ultra-rapide (1 client = 1 DB, restore 5–10 min)
- 🟢 Sécurité maximale (pas de données client croisées)
- 🟢 Scaling indépendant (upgrade client1 sans impact client2)
- 🟡 Coût infra ~+20% vs database shared (mais worth it pour SaaS)

**Stack infra recommandée :**
- **Compute** : AWS EC2 (t3.xlarge) ou OVH Cloud / DigitalOcean
- **DB** : PostgreSQL Managed (AWS RDS, OVH, ou self-hosted)
- **Storage** : AWS S3 ou OVH Object Storage
- **Observabilité** : Datadog (200€/mois) ou ELK gratuit
- **Backup** : Automated daily, 30-day retention, 1 restore test/mois

### 2.2 Stack technique détaillé

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Backend** | Odoo 19 Community + addons custom | Base solide, éco open-source riche |
| **API** | REST /api/v1 (Odoo controllers) | Versioning, docs OpenAPI auto |
| **Mobile** | Flutter + Dart | Cross-platform (iOS/Android), perf native, Firebase push |
| **Web frontend** | React 18 + Tailwind (optionnel V2) | Perf, DX, si white-label très poussé |
| **Cache** | Redis (session + données chaudes) | Latence <10ms, POS fluide |
| **Search** | Elasticsearch (optionnel V2) | Filtre catalog >100K SKUs |
| **Message queue** | Celery (intégré Odoo) | Async jobs (email, CSVs, syncs) |
| **Auth** | OAuth 2.0 (Odoo native) + JWT | Secure tokens for mobile + integrations |
| **Monitoring** | Prometheus + Grafana (ou Datadog) | Real-time alerts |

### 2.3 Décisions bloquantes à valider IMMÉDIATEMENT

| Décision | Option A | Option B | Recommandation | Timeline |
|----------|----------|----------|-----------------|----------|
| **PSP Tunisie** | Konnect | Tunisie Telecom Pay | Konnect (API stable, sandbox) | Cette semaine |
| **PSP Maroc** | Maroc Telecom / Attijari | Stripe (via partenaire) | Stripe (si dispo maroc) ou direct TM | Cette semaine |
| **Transporteur TN** | Autobacs, DHL, Aramex | Delivery local custom | POC 3 providers, choisir 1 principal | Fin janvier |
| **Transporteur MA** | DHL, Maroc Poste, Aramex | Delivery local custom | Idem TN | Fin janvier |
| **Kit POS Hardware** | Sunmi V2 Pro + Epson + Cash | Sunmi V2S (budgét) + Generic Drawer | Sunmi V2 Pro (fiable, support) | Fin janvier |
| **Hébergement infra** | AWS eu-west-1 (Irlande) | OVH (graveline) | AWS (CDN, compliance, support) | Début février |
| **Conformité data** | RGPD + loi TN + loi MA | Custom contrat local | RGPD full + annexes pays | Février (légal) |

---

## 📊 SECTION 3 : COUVERTURE ODOO COMMUNITY (BASELINE)

### 3.1 Modules standards inclus (gratuit, déjà en V0)

| Module | Cas d'usage | Notes |
|--------|-----------|-------|
| **Contacts** | Clients, fournisseurs, adresses | Standard, bon |
| **Sales** | Commandes web/mobile | Utile même si POS domine (traçabilité, export) |
| **Inventory** | Stock multi-entrepôts, transferts, inventaires | Core, très bon |
| **PoS** | Vente comptoir, sessions, tickets | Fiable, à customizer |
| **Invoicing** | Factures, avoirs, journaux | Minimum retail |
| **Accounting** | Paie, réconciliation, bilan | Bonus (optionnel V1) |
| **Barcode** | Scanning inventaire, réception | Pratique, inclus |
| **Website + eCommerce** | Shop de base, panier, checkout | À booster perf + UI |
| **Purchase** | Commandes fournisseurs, lead times | Utile visibilité achat |
| **CRM / Helpdesk** | Support tickets + historique | Important pour SaaS |

### 3.2 Modules "très recommandés" selon votre modèle

| Module | Utilité | Efort d'intégration |
|--------|---------|-------------------|
| **Repair** | Échanges partiels, retours | Léger (déjà dans Odoo) |
| **Stock Dropshipping** | Drop-ship fournisseurs (optionnel) | Léger |
| **Email Marketing** | Campagnes fidélité, newsletters | Léger (Odoo + Mailchimp easy) |
| **Delivery** | Transporteurs, tracking | À customiser (voir section delta) |
| **Payment Acquirer** | Intégrations PSP génériques | À étendre (voir section delta) |

### 3.3 Ce qu'Odoo ne fait PAS (et c'est normal)

| Besoin | Statut | Implication |
|--------|--------|-----------|
| App mobile native | ❌ Hors scope Odoo | À développer (Flutter) |
| POS hardware (imprimante, tiroir, scanner) | ⚠️ Partiel (interfaces génériques) | À intégrer via Device Bridge |
| COD anti-refus avancé (scoring, blacklist) | ❌ Hors scope | À développer (custom module) |
| White-label "pixel-perfect" | ⚠️ Partiel (Odoo branding visible) | À remplacer partout (UI, PDF, email) |
| Multi-tenant SaaS ops | ❌ Hors scope | À développer (provisioning, backup, monitoring) |
| Thème e-commerce sport haute perf | ⚠️ Partiel (thème de base) | À développer ou acheter thème premium |
| API REST versionnée publique | ⚠️ Partiel (RPC Odoo) | À développer (/api/v1) |

**Conclusion** : ~40% de la valeur vient de Odoo baseline. Les 60% de différenciation viennent du delta qu'on va développer.

---

## 💪 SECTION 4 : DELTA À DÉVELOPPER (Création de valeur)

### 4.1 Matrice effort / impact

```
                            IMPACT COMMERCIAL (client-facing value)
                                        ↑
                        HIGH IMPACT    │    HIGH IMPACT
                        LOW EFFORT     │    HIGH EFFORT
            ┌─────────────────────────┼─────────────────────────┐
      L     │ ✅ COD Rules           │ ⚠️ White-label Parfait   │
      O     │ ✅ API /v1              │ ⚠️ POS Hardware          │
      W     │ ✅ Mobile (base)         │ 🔴 Analytics Premium     │
      
      E     ├─────────────────────────┼─────────────────────────┤
      F     │ 🟢 Inventory UX         │ ❌ Click&Collect         │
      F     │                         │ ❌ Loyalty (V3)          │
      O     │                         │                         │
      R     └─────────────────────────┼─────────────────────────┘
      T           LOW IMPACT          │    LOW IMPACT
                  LOW EFFORT          │    HIGH EFFORT
                        EFFORT→
```

**Stratégie** : Focus sur HIGH IMPACT / LOW-MEDIUM EFFORT en V1. Repousser LOW IMPACT ou HIGH EFFORT à V2/V3.

### 4.2 Domaines du delta (détaillé par domaine)

---

#### **A) WHITE-LABEL (Débranding complet)**

**Objectif** : Zero Odoo branding visible client-facing.

| Élément | Effort | Notes | V1/V2 |
|---------|--------|-------|-------|
| UI header/footer custom | S | Remplacer logo, couleurs, texte | V1 |
| POS custom branding | M | Écran de connexion, reçus, header | V1 |
| Email templates | M | Confirmation commande, suivi, retour | V1 |
| PDF factures/devis | M | Header, footer, couleurs, font | V1 |
| Admin interface | M | "Gear" icon → "Settings" du client | V1 |
| Système de pages | S | CGU, Confidentialité, Contact custom | V1 |
| Favicons + manifest | S | Icônes navigateur, mobile home | V1 |
| Domain + SSL custom | S | client1.saasretail.tn + cert | V1 |

**Effort total** : **M–L (12–18 jours)**

**Risques** :
- 🔴 Détails CSS manqués (couleurs partielles, font incohérentes)
- 🔴 Textes "Odoo" cachés dans modèles d'email Odoo
- 🟡 PDF layout change à chaque version Odoo (maintenance)

**Recommandations** :
- ✅ Créer un "theme custom" dans Odoo (pas hack core)
- ✅ Centraliser textes client dans module de config (pas en dur)
- ✅ Tester white-label avec 3 clients pilotes en beta (feedback critique)
- ✅ Documenter "checklist white-label" (40 items, réutilisable)

---

#### **B) SaaS MULTI-TENANT OPS (Backend ops = "plomberie" SaaS)**

**Objectif** : Déployer, monitorer, restaurer un client en <30min.

| Feature | Effort | Notes | Dépendance |
|---------|--------|-------|-----------|
| **Provisioning automatisé** | | |
| ├─ Créer DB PostgreSQL | S | Script bash / Ansible | Infra |
| ├─ Créer filestore S3 | S | Permissions IAM, prefix unique | Infra |
| ├─ Deployer container Odoo | S | K8s / Docker Compose | Infra |
| ├─ Seed data (layout, templates) | M | Scenario Odoo (fixtures) | Dev |
| ├─ Créer admin account | S | Email, password, 2FA | Dev |
| ├─ DNS CNAME + SSL wildcard | S | Terraform / AWS Route53 | Infra |
| **Backups & Restore** | | |
| ├─ Backup daily (DB + filestore) | S | Cron + script, retention 30j | Infra |
| ├─ Test restore automatisé | M | CI/CD job, restore to staging | Infra |
| ├─ One-click restore UI | M | Dashboard admin (action button) | Dev |
| **Observabilité & Support** | | |
| ├─ Logs centralisés (Datadog) | S | Shipper syslog / agent | Infra |
| ├─ Metrics (CPU, disk, DB) | S | Prometheus collector | Infra |
| ├─ Alerting (Slack/email) | S | Threshold-based (disk >80%, etc) | Infra |
| ├─ Health dashboard | M | API endpoint /health (custom) | Dev |
| **Pipeline Release** | | |
| ├─ Staging env per tenant | M | Copy prod DB + filestore (weekly) | Infra |
| ├─ Migration system (Odoo migrations) | M | Versioning scripts (odoo/migrations/) | Dev |
| ├─ Rollback one-click | M | Snapshot + restore script | Infra |

**Effort total** : **L (20–30 jours)**

**Timeline recommandée** :
- **Week 1–2** : Infra de base (DB, S3, K8s)
- **Week 3–4** : Provisioning automation
- **Week 5–6** : Backup/restore + observabilité
- **Week 7–8** : Pipeline release + validation

**Risques & mitigation** :
- 🔴 **Restauration lente** : Use DB snapshots (5min) + S3 versioning
- 🔴 **Downtime imprévu** : Passive replica + failover auto
- 🟡 **Logs explosifs** : Log sampling (1% en prod, 100% en staging)
- ✅ **Mitigation** : RTO target <30min, RPO target 1h (backup hourly en V2)

---

#### **C) POS HARDWARE (Pont matériel fiable)**

**Objectif** : Imprimante, tiroir argent, scanner réliables en LAN. Zéro tracas client.

| Composant | Effort | Détails | Standard |
|-----------|--------|---------|----------|
| **Device Bridge (LAN agent)** | M–L | Node.js agent local, communique avec Odoo via REST | Oui |
| ├─ Printer integration | M | Sunmi (thermal), Epson (reçus) | Sunmi V2 Pro |
| ├─ Cash drawer | M | Metapace, Epson | Sunmi (integrated) |
| ├─ Barcode scanner | S | USB HID, generic | Sunmi (integrated) |
| ├─ Display client | S | LCD 7", intégré POS | Sunmi (integrated) |
| **Sécurité** | | |
| ├─ TLS cert (self-signed) | S | Validation minimale | Oui |
| ├─ Device pairing (hash IMEI) | S | Déploiement une fois | Oui |
| **Diagnostics & Support** | | |
| ├─ Self-test (imprimer ticket) | M | Button "Test print" en POS | Oui |
| ├─ Logs device (3 derniers j) | S | Accessible via dashboard | Oui |
| ├─ Remote restart device | S | SSH ou signal HTTP | Oui |
| **Installation & onboarding** | | |
| ├─ Quick start guide (photos) | S | PDF imprimable | Oui |
| ├─ Video setup (5 min) | M | Record 1x, share YouTube unlisted | Oui |
| ├─ Support hotline 48h | S | Slack bot ou formulaire | Oui |

**Kit standard recommandé (V1)** :
```
Option 1 : "Sunmi All-in-one"
├─ 1× Sunmi V2 Pro (13" écran, printer, tiroir, scanner)
├─ 1× Receipt paper (3 mois stock)
├─ 1× Barcode labels
└─ Coût hardware : ~450€

Option 2 : "Budget" (si marché sensible prix)
├─ 1× Sunmi V2S (10" écran) + 1× Epson TM-M30 (printer) + 1× Metapace cash
├─ Coût hardware : ~350€

Option 3 : "Failover" (Device Bridge LAN)
├─ Backup plan si hardware fails
├─ Agent local reprint last N transactions
└─ Coût : Time dev (~20j)
```

**Effort total** : **M–L (15–25 jours)**

**Risques** :
- 🔴 **Driver incompatibilité** : Test ALL devices avec Odoo 19 en advance
- 🔴 **Network flakiness** : Queue transactions locally if no connection
- 🟡 **Support overhead** : Très important créer video + guide killer

**Mitigation** :
- ✅ **Standardiser 2 kits max** (Sunmi + backup generic)
- ✅ **Device Bridge as fallback** (print to local queue)
- ✅ **Stress test** : 100 printouts rapid-fire
- ✅ **Hotline tier 1** : "Did you restart the device?" (90% cases)

---

#### **D) E-COMMERCE UX & PERF**

**Objectif** : Checkout rapide (<30sec), mobile-first, images optimisées, load <2sec.

| Feature | Effort | Détails | V1/V2 |
|---------|--------|---------|-------|
| **Perf budget** | S | <2sec desktop, <3sec mobile, LCP <1.5s | V1 |
| **Image optimization** | M | Webp, lazy-load, responsive srcset | V1 |
| **Checkout flow** | M | 3-step (address → payment → confirm) | V1 |
| **Cache strategy** | M | Redis (catalog pages, cart) | V1 |
| **Thème custom** | M | Tailwind-based, sport aesthetic | V1 |
| **Filters & facets** | M | Taille, couleur, prix, brand | V1 |
| **Search** | S | Basic Odoo search (V1) → ES (V2) | V1 (Odoo) |
| **Mobile app integration** | M | Deep-links from app → web | V1 |
| **Reviews & ratings** | S | Simple (no external SaaS) | V1 |
| **Promo codes + vouchers** | S | Odoo native + custom rules | V1 |

**Effort total** : **M (10–15 jours)**

**Stack perf** :
- 🟢 Odoo website + Redis cache (80% perf gains)
- 🟢 Tailwind CSS + Next.js optional (V2 si headless needed)
- 🟡 Avoid custom JS, use Odoo QWeb templates

**Benchmarks cibles** :
- Homepage load : <1.5s (mobile)
- Product page : <2s
- Checkout : <1s per step
- Search : <500ms results

---

#### **E) COD + CARTE PAIEMENT (PSP locales TN/MA)**

**Objectif** : Accepter COD + cartes locales. Anti-refus COD (scoring + acompte).

| Feature | Effort | Détails | Dépend PSP | V1/V2 |
|---------|--------|---------|-----------|-------|
| **Konnect Tunisie** (PSP 1) | M | REST API, sandbox OK | API doc | V1 |
| ├─ Web checkout flow | M | Redirect to Konnect → webhook return | Oui | V1 |
| ├─ POS payment | M | QR code / terminal via LAN bridge | Oui | V1 |
| ├─ Refund handling | S | Credit note + API refund call | Oui | V1 |
| **Stripe (TN/MA fallback)** | S | If direct PSP unavailable | Oui | V1/V2 |
| **COD (Cash on Delivery)** | | |
| ├─ Base flow | S | Order → Pending → Paid @ delivery | Native | V1 |
| ├─ Anti-refus rules | M | Confirmation SMS + acompte opt | Custom | V2 |
| ├─ Blacklist / Whitelist | M | Customer scoring + exceptions | Custom | V2 |
| ├─ Acompte (% de commande) | M | 25–50% optional upfront | Custom | V2 |

**Effort total** : **M (10–15 jours) V1 + M (8–10 jours) V2**

**Integration matrix** :

| Scénario | V1 Support | V2 Enhancement |
|----------|-----------|-----------------|
| Client achat 100€ en COD | ✅ Full | ✅ Acompte 25€ demandé |
| Client a déjà 3 refus | ❌ Pas de limite V1 | ✅ Blacklist en V2 |
| POS card payment | ✅ Manual entry | ✅ Terminal integration |

**Risques** :
- 🔴 **PSP API down** : Fallback to manual (Stripe, Paypal, check bank)
- 🔴 **Webhook timeout** : Implement idempotency (order_id as key)
- 🟡 **Refund disputes** : Log ALL payment attempts + timestamps

**Mitigation** :
- ✅ **Multiple PSP fallbacks** (Konnect → Stripe → Manual)
- ✅ **Sandbox validation** (all PSP tested before prod)
- ✅ **Payment reconciliation** (daily report vs Odoo)

---

#### **F) LIVRAISON (Transporteurs TN/MA)**

**Objectif** : Intégrer 1–2 transporteurs par pays. Tracking client. Anti-perte visibilité.

| Feature | Effort | Détails | Dépend Transport | V1/V2 |
|---------|--------|---------|------------------|-------|
| **Transporteur TN principal** | M | Autobacs / DHL / Aramex | API docs | V1 |
| ├─ Pick-up API | S | Create shipment, get label | Oui | V1 |
| ├─ Tracking API | S | Poll status → Order status update | Oui | V1 |
| ├─ Label printing | S | PDF download + print | Oui | V1 |
| **Transporteur MA** | M | Idem TN | API docs | V1 |
| **Fallback local delivery** | S | Custom taxi / moto delivery | Custom | V1 |
| **Customer tracking UI** | S | Link to tracking page (trackingmore.com) | Idem | V1 |
| **Delivery validation** | S | Photo proof @ delivery (optional V2) | V2 | V2 |

**Effort total** : **S–M (8–12 jours) V1 + S (5 j) V2**

**Status mapping** :
```
Odoo order status ← Transporter status
Waiting approval → Pending
Confirmed → In transit (picked up)
Shipped → In transit (at hub)
Delivered → Delivered
Failed → Delivery failed
```

**Risques** :
- 🟡 **API timeout** : Cache status 6h, refresh on demand
- 🔴 **Multiple shipments** : Split by weight/volume first
- 🟡 **Lost shipments** : Track via 3rd party (trackingmore.com)

---

#### **G) APP MOBILE (Client final)**

**Objectif** : Catalog + compte client + commande + suivi + push notifications.

| Feature | Effort | Détails | V1/V2 |
|---------|--------|---------|-------|
| **Setup Flutter** | S | Project, Firebase, flavor config | V1 |
| **Catalog** | M | Product list → detail, images, filters | V1 |
| **Account** | M | Login (OAuth), profile, order history | V1 |
| **Cart & Checkout** | M | Add/remove items, apply promos, validate | V1 |
| **Place order** | M | POST /api/v1/sales.order, confirmation | V1 |
| **Order tracking** | S | Get order status, delivery tracking link | V1 |
| **Push notifications** | M | Firebase FCM, generic + promo pushes | V1 |
| **Deep links** | S | app://product/123, app://order/ABC | V1 |
| **Reviews** | S | 1-5 stars post-delivery | V1 |
| **Wishlist / Save for later** | S | Local storage + sync backend | V2 |
| **Referral / Sharing** | S | Share link (web + deep link) | V2 |
| **Analytics** | M | Firebase analytics events + custom Mixpanel | V1 |
| **Offline mode** | M | Cache last N products + draft orders | V2 |

**Effort total** : **L (18–25 jours) V1 + M (10 j) V2 wishlist/referral**

**Tech stack** :
- **Framework** : Flutter 3.24+
- **Auth** : OAuth 2.0 via Odoo
- **API** : /api/v1 (see section H)
- **Push** : Firebase Cloud Messaging (iOS/Android)
- **Analytics** : Firebase + Mixpanel optional
- **Payment** : Stripe/Konnect embedded (web view)
- **Deployment** : TestFlight (iOS) + Internal Testing (Android) → stores

**Design priorities** :
- 📱 Mobile-first (80% users mobile)
- ⚡ Fast (< 3MB app size, lazy-load images)
- 🎨 Sport aesthetic (bold colors, hero images)
- ♿ A11y (large buttons, high contrast)

**Risks** :
- 🔴 **App review rejection** : Plan 1–2 weeks for AppStore/PlayStore review
- 🟡 **Push fatigue** : Max 2 pushes/week in V1, smart targeting V2
- 🟡 **Offline edge cases** : Sync draft orders intelligently

---

#### **H) API VERSIONNÉE (/api/v1)**

**Objectif** : Stable REST API for mobile app + future integrations.

```
/api/v1/
├─ /auth
│  ├─ POST /login (email, password) → token
│  └─ POST /refresh (refresh_token) → new token
├─ /products
│  ├─ GET / (limit, offset, filters) → paginated products
│  ├─ GET /{id} → product detail + variants + reviews
│  └─ GET /{id}/availability → stock per warehouse
├─ /cart
│  ├─ GET / → current cart
│  ├─ POST / (items) → update cart
│  └─ DELETE / → clear cart
├─ /orders
│  ├─ POST / (delivery, payment, items) → create order
│  ├─ GET / (limit, offset) → order history
│  ├─ GET /{id} → order detail + tracking
│  └─ POST /{id}/return → initiate RMA
├─ /user
│  ├─ GET /profile → user info
│  ├─ POST /addresses → manage delivery addresses
│  └─ POST /wishlist → save products
└─ /notifications
   └─ GET / → notification history

Authentication: Bearer <JWT token>
Rate limit: 100 req/min per user
Error codes: 400 (bad req), 401 (unauth), 403 (forbidden), 404 (not found), 500 (error)
Response format: { "data": {...}, "error": null, "meta": { "timestamp": ... } }
```

**Effort total** : **M (10–15 jours)**

**Implementation** :
- Use Odoo controllers (JSON responses)
- OpenAPI 3.0 auto-docs (swagger-ui)
- JWT for auth (Odoo partner modules available)
- Version in header: `Accept: application/vnd.saasretail.v1+json`

**Testing** :
- Unit tests (Python, endpoints)
- Integration tests (mobile app mock)
- Load testing (100 concurrent users)

---

#### **I) ANTI-OVERSELL & ALLOCATION STOCK (V2)**

**Objectif** : Réserver stock POS/Web/Mobile. Pas de double-vente.

| Feature | Effort | Détails | V1/V2 |
|---------|--------|---------|-------|
| **Stock reservation** | M | Reserve qty on order creation, release on cancel | V2 |
| **Multi-warehouse allocation** | M | Allocate from nearest warehouse | V2 |
| **Oversell policy** | S | Allow backorder or block | V2 |
| **Allocation rebalance** | M | Rebalance if warehouse closes | V2 |

**Effort total** : **M (10–12 jours) V2**

---

#### **J) RMA & RETOURS AVANCÉS (V2)**

**Objectif** : Échanges taille/couleur fluides. Échanges "same-day".

| Feature | Effort | Détails | V1/V2 |
|---------|--------|---------|-------|
| **RMA module** | M | Return request → inspection → refund/exchange | V2 |
| **Size exchange** | M | Return size S, get size M (no full return) | V2 |
| **Color exchange** | M | Idem | V2 |
| **Return label** | S | Auto-generate PDF return label | V2 |
| **Refund/exchange rules** | M | 30 days no questions, after day 30 inspect | V2 |

**Effort total** : **M (12–15 jours) V2**

---

### 4.3 Résumé effort par domaine

| Domaine | V1 effort | V2 effort | Criticité | Dépendances |
|---------|-----------|-----------|-----------|------------|
| White-label | M–L (15j) | S (5j) | ⭐⭐⭐⭐ (vendabilité) | Aucune |
| SaaS ops | L (20–30j) | M (10j) | ⭐⭐⭐⭐ (prod readiness) | Infra |
| POS hardware | M–L (20j) | S (5j) | ⭐⭐⭐ (feature parity) | Hardware |
| E-commerce UX | M (12j) | S (5j) | ⭐⭐⭐ (conversion) | Aucune |
| COD + Carte | M (12j) | M (10j) | ⭐⭐⭐⭐ (revenue) | PSP APIs |
| Livraison | S–M (10j) | S (5j) | ⭐⭐⭐ (UX) | Transport APIs |
| Mobile app | L (22j) | M (10j) | ⭐⭐⭐⭐ (TAM expansion) | /api/v1 |
| /api/v1 | M (12j) | M (8j) | ⭐⭐⭐ (durable) | Backend |
| Anti-oversell | — | M (10j) | ⭐⭐ (V2 nice-to-have) | Inventory |
| RMA avancé | — | M (12j) | ⭐⭐⭐ (pain point) | Odoo repair |

**Total V1 effort** : ~140 jours-hommes = 7 semaines × 4 devs (5–8 mois si sprint 4 devs, 20j/mois par dev)  
**Total V2 effort** : ~60 jours-hommes = 3 semaines × 4 devs

---

## 🎯 SECTION 5 : PLAN DE LIVRAISON PAR VERSION

### 5.1 Timeline macro (roadmap 12 mois)

```
Q1 2026 (Jan–Mar)                Q2 2026 (Apr–Jun)             Q3 2026 (Jul–Sep)
├─ Week 1–2: Spike tech         ├─ Week 13–16: V1 beta         ├─ Week 27–30: V2 dev
├─ Week 3–6: V0 fondations      ├─ Week 17–24: V1 prod readiness ├─ Week 31–36: V2 beta
├─ Week 7–12: V1 dev sprint 1   └─ Week 25–26: Customer 1 go-live └─ Week 37–39: V2 go-live (customers 2–5)
└─ 1–2 early pilots             3–5 customers paying            10–15 customers paying
```

### 5.2 V0 – Fondations SaaS (Blocker pour tout le reste)

**Durée** : 4–6 semaines (équipe 4 devs + 1 infra)  
**Timeline** : Jan 27 — Mar 10 2026  
**Objectif** : Infrastructure prête pour accepter premiers clients.

#### V0 Scope (ce qu'on fait)

| Task | Effort | Assigné | ETA |
|------|--------|---------|-----|
| **Infra setup** | | | |
| ├─ AWS account + VPC setup | S | DevOps | Jan 27 |
| ├─ RDS PostgreSQL + replication | S | DevOps | Jan 28 |
| ├─ S3 buckets + IAM roles | S | DevOps | Jan 29 |
| ├─ K8s cluster (EKS) ou Docker Compose | M | DevOps | Feb 3 |
| ├─ Reverse proxy nginx + cert wildcard | S | DevOps | Feb 4 |
| **Odoo setup** | | | |
| ├─ Odoo 19 Community container | S | Backend | Feb 5 |
| ├─ Custom addons repo + CI/CD pipeline | M | Backend | Feb 10 |
| ├─ Database creation script (automated) | M | Backend | Feb 12 |
| **Provisioning automation** | | | |
| ├─ Tenant provisioning script (DB+S3+DNS) | M | Backend + DevOps | Feb 17 |
| ├─ Admin account creation + 2FA | S | Backend | Feb 18 |
| ├─ Seed data scenario (layouts, users) | M | Backend | Feb 20 |
| **Backups & restore** | | | |
| ├─ Daily backup cron (DB + S3) | S | DevOps | Feb 21 |
| ├─ Automated restore test (weekly) | M | DevOps | Feb 24 |
| ├─ One-click restore dashboard | M | Backend | Feb 27 |
| **Observability** | | | |
| ├─ Datadog account + agent setup | S | DevOps | Feb 28 |
| ├─ Log shipping (syslog) | S | DevOps | Mar 1 |
| ├─ Metrics + alerting | M | DevOps | Mar 3 |
| ├─ Health check endpoint (/api/health) | S | Backend | Mar 4 |
| **Release pipeline** | | | |
| ├─ Staging env per tenant (copy DB weekly) | M | DevOps | Mar 5 |
| ├─ Rollback mechanism (snapshots) | M | DevOps | Mar 7 |
| ├─ Release notes automation | S | Backend | Mar 8 |
| **Testing & validation** | | | |
| ├─ Load test (100 concurrent tenants) | M | QA | Mar 9 |
| ├─ Disaster recovery test (full restore) | M | QA | Mar 10 |

**Success criteria** :
- ✅ Deploy new tenant in <15 min
- ✅ Restore prod tenant in <30 min (RTO 30min)
- ✅ Zero customer data leakage between tenants
- ✅ Monitoring alerts working (Slack integration)

---

### 5.3 V1 – MVP Vendable (POS + Web + Mobile + Paiement)

**Durée** : 12–14 semaines (équipe 6–8 devs)  
**Timeline** : Mar 10 — Jun 15 2026  
**Objectif** : Go-live customer 1 (pilot) fin May, customer 2 mi-June.

#### V1 Scope (ce qu'on livre)

| Épic | User stories | Effort | Assigné | ETA |
|------|--------------|--------|---------|-----|
| **Spike tech (parallèle V0)** | | | | |
| ├─ POC PSP Konnect | Intégration REST, webhook, test payment | M | Backend | Feb 14 |
| ├─ POC transporteur (Autobacs TN) | Intégration API, label, tracking | M | Backend | Feb 21 |
| ├─ POC Device Bridge (printer+drawer) | Node.js agent, LAN printing | M | Backend + Infra | Feb 28 |
| ├─ POC /api/v1 (basic endpoints) | Auth, products, orders | M | Backend | Mar 7 |
| **STOCK / INVENTORY** | | | | |
| ├─ Multi-warehouse config | Create warehouse TN, warehouse MA | S | Backend | Mar 17 |
| ├─ Stock transfer flows | Transfer between warehouses | M | Backend | Mar 24 |
| ├─ Inventory count | POS scan → adjust stock | M | Backend | Mar 31 |
| ├─ Safety stock rules | Min stock alerts | S | Backend | Apr 7 |
| **POS OPERATIONS** | | | | |
| ├─ POS session setup | Create session, cashier login | S | Backend | Mar 18 |
| ├─ Sale flow (POS) | Add product, adjust qty, apply discount | M | Backend | Mar 25 |
| ├─ Payment (Cash + Card) | Cash drawer, card payment flow | M | Backend + Hardware | Apr 1 |
| ├─ Receipt printing | Print receipt + tax summary | M | Backend + Hardware | Apr 8 |
| ├─ Session reconciliation | Cash count vs system | M | Backend | Apr 15 |
| ├─ Basic returns | Return full order, refund | M | Backend | Apr 22 |
| **E-COMMERCE (Web)** | | | | |
| ├─ Product catalog | Display products, filters (category, price, size, color) | M | Frontend | Mar 26 |
| ├─ Product detail page | Images, variants, reviews, stock | M | Frontend | Apr 2 |
| ├─ Cart & checkout | 3-step: address → payment → confirm | M | Frontend | Apr 9 |
| ├─ Order history | Customer orders, reorder link | S | Frontend | Apr 16 |
| ├─ Performance optimization | Lazy-load, cache, <2sec load target | M | Frontend + DevOps | Apr 23 |
| **PAYMENT (PSP Integration)** | | | | |
| ├─ Konnect integration (TN) | Web redirect + webhook | M | Backend | Apr 10 |
| ├─ Stripe integration (fallback) | Web redirect + webhook | M | Backend | Apr 17 |
| ├─ COD (Cash on Delivery) | Order → pending → paid at delivery | S | Backend | Apr 24 |
| ├─ Payment reconciliation | Daily report, match Odoo ↔ PSP | M | Backend | May 1 |
| **DELIVERY** | | | | |
| ├─ Transporteur TN (Autobacs) | Create shipment, track, label | M | Backend | May 8 |
| ├─ Fallback local delivery | Manual assignment, no integration | S | Backend | May 15 |
| ├─ Tracking link in order | Link → tracking page | S | Frontend | May 22 |
| **MOBILE APP (Flutter)** | | | | |
| ├─ Project setup + flavors | Dev, staging, prod | S | Mobile | Apr 24 |
| ├─ Auth (OAuth login) | Login, token refresh, logout | M | Mobile | May 1 |
| ├─ Product catalog | List, detail, filters, images | M | Mobile | May 8 |
| ├─ Cart & checkout | Add/remove, apply promo, order | M | Mobile | May 15 |
| ├─ Order tracking | Order status, delivery tracking | M | Mobile | May 22 |
| ├─ Push notifications | Firebase FCM, generic pushes | M | Mobile | May 29 |
| ├─ Deep links | app://product/123 | S | Mobile | Jun 5 |
| ├─ Analytics | Firebase events + custom events | M | Mobile | Jun 12 |
| **API /api/v1** | | | | |
| ├─ Authentication (JWT) | Login, refresh, logout | M | Backend | May 6 |
| ├─ Products endpoint | GET /products, /products/{id} | M | Backend | May 13 |
| ├─ Cart endpoint | GET/POST/DELETE /cart | M | Backend | May 20 |
| ├─ Orders endpoint | POST create, GET list/detail | M | Backend | May 27 |
| ├─ Error handling | Standard error codes + messages | S | Backend | Jun 3 |
| ├─ Rate limiting | 100 req/min per user | S | Backend | Jun 10 |
| ├─ OpenAPI docs | Auto-generated swagger UI | S | Backend | Jun 12 |
| **WHITE-LABEL** | | | | |
| ├─ UI branding | Replace logo, colors, font | M | Frontend | May 13 |
| ├─ Email templates | Confirmation, tracking, refund | M | Backend | May 20 |
| ├─ PDF customization | Invoices, delivery notes | M | Backend | May 27 |
| ├─ POS branding | Login screen, receipts | S | Backend | Jun 3 |
| ├─ Domain + SSL | custom.saasretail.tn + cert | S | DevOps | Jun 10 |
| **HARDWARE (POS)** | | | | |
| ├─ Device Bridge setup | Node.js agent, LAN integration | M | Backend + Infra | May 13 |
| ├─ Printer integration | Sunmi thermal printer | M | Backend + Hardware | May 20 |
| ├─ Cash drawer | Integration + test | S | Backend + Hardware | May 27 |
| ├─ Scanner | USB HID input, barcode parsing | S | Backend | Jun 3 |
| ├─ Diagnostics | Self-test button, logs, restart | M | Backend | Jun 10 |
| **QA & UAT** | | | | |
| ├─ End-to-end testing (POS + Web + Mobile) | All payment flows, stock sync | L | QA | Jun 20 |
| ├─ Performance testing | Load 100 concurrent users | M | QA | Jun 25 |
| ├─ Security testing | Penetration test, data leakage | M | Security | Jun 27 |
| ├─ Customer UAT | Pilot customer tests | M | Product | Jul 1 |

**Sprint breakdown** (2-week sprints, 6–8 devs) :
- **Sprint 1–2 (Mar 10–Mar 24)** : Spike tech + V0 validation
- **Sprint 3–5 (Mar 24–Apr 21)** : Stock + POS core
- **Sprint 6–8 (Apr 21–May 19)** : eCommerce + payment
- **Sprint 9–10 (May 19–Jun 15)** : Mobile + API + hardware
- **Sprint 11 (Jun 15–Jun 29)** : QA + hardening

**Definition of Done** :
- ✅ Code reviewed + merged
- ✅ Unit tests + integration tests passing
- ✅ Staging env tested
- ✅ Documentation updated

---

### 5.4 V2 – Robustesse Omnicanal & Règles COD

**Durée** : 8–10 semaines (équipe 4–6 devs)  
**Timeline** : Jul 1 — Aug 31 2026  
**Objectif** : Scalabilité multi-client, anti-refus COD, RMA avancé.

#### V2 Scope

| Épic | Stories | Effort | ETA |
|------|---------|--------|-----|
| **COD Anti-refus** | | | |
| ├─ Scoring simple (API call) | Age acct, nb refus, région | M | Jul 15 |
| ├─ Acompte (% configurable) | Demander 25–50% upfront | M | Jul 22 |
| ├─ Blacklist / Whitelist | Admin config, auto-block | M | Jul 29 |
| ├─ Confirmation SMS | Send SMS pre-delivery, confirm phone | M | Aug 5 |
| **RMA & Retours avancés** | | | |
| ├─ Return request (web + app) | Customer initiates RMA | M | Aug 12 |
| ├─ Size exchange | Size S → M without full return | M | Aug 19 |
| ├─ Color exchange | Idem | M | Aug 26 |
| ├─ Return label (PDF) | Auto-generate return shipment | S | Sep 2 |
| **Anti-oversell cross-canal** | | | |
| ├─ Stock reservation | Reserve qty on order | M | Aug 5 |
| ├─ Multi-warehouse allocation | Allocate from nearest | M | Aug 12 |
| **Livraison avancée** | | | |
| ├─ Multiple transporteurs | Support 2 TN + 2 MA | M | Aug 19 |
| ├─ Tracking stats | Delivery time, refusal rate | M | Aug 26 |

**Effort total** : ~50 jours-hommes (2.5 sem × 4 devs)

---

### 5.5 V3 – Scale & Premium Features

**Durée** : 6–8 semaines (équipe 4 devs)  
**Timeline** : Sep 1 — Oct 31 2026

#### V3 Scope

| Épic | Effort |
|------|--------|
| Multi-magasin avancé (hub, cross-dock) | M |
| Click&Collect (pickup in store) | M |
| Loyalty program (points, cards) | M |
| Analytics retail (margin, rotation, cohortes) | M |
| Headless option (Nextjs frontend) | L |

---

## ⚡ SECTION 6 : MÉTHODE D'ESTIMATION (Chiffrer sans se tromper)

### 6.1 Atelier "Gap" (1 jour)

**Objectif** : Lister tous les écrans/flux critiques. Identifier gaps Odoo.

**Participants** : Product, Backend lead, Frontend lead, POS expert, Customer (optional)

**Agenda** (8h) :
- 09:00–10:30 : POS flows (9 écrans : session → sale → payment → return)
- 10:45–12:00 : Stock flows (warehouse transfer, inventory, safety stock)
- 13:00–14:30 : Web flows (catalog → cart → checkout → order history)
- 14:45–16:00 : Mobile flows (same as web)
- 16:00–17:00 : Payment & delivery flows

**Livrables** :
- Wireframes/flowcharts (Figma)
- Gap list vs Odoo (20–30 items)
- Criticality ranking (must-have, nice-to-have)

---

### 6.2 Spike technique (3–5 jours)

**POC 1: PSP Integration** (2 days)
- Konnect sandbox, test payment, webhook
- Success = payment confirmed in Odoo

**POC 2: Transporteur API** (2 days)
- Autobacs/DHL sandbox, create shipment, track
- Success = shipment in Odoo with tracking link

**POC 3: Device Bridge** (2 days)
- Node.js agent, print receipt locally
- Success = receipt printed from POS

**POC 4: /api/v1** (1 day)
- Basic auth + products endpoint
- Success = mobile app fetches products

---

### 6.3 Estimation T-shirt → jours

| Taille | Jours | Exemples |
|--------|-------|----------|
| S (Small) | 2–3 | Simple config, 1 form, <5 fields |
| M (Medium) | 5–8 | Moderate feature, few integrations, some UI |
| L (Large) | 12–18 | Complex feature, multiple systems, UX polish |
| XL (Extra Large) | 22–30 | Very complex, many integrations, high polish |

**Facteurs de complexité** (ajouter jours) :
- Hardware involved : +25–50%
- External API (unreliable) : +20–40%
- White-label pixel-perfect : +15–30%
- Internationalization (TN/MA rules) : +20%
- Security-critical (payment, auth) : +15%

**Exemple** :
- Base effort M (6j) pour feature
- + Hardware (POS) : ×1.3 = 8j
- + External API (PSP) : ×1.2 = 10j
- = ~10 jours realistic

---

### 6.4 Velocity historique (pour futurs projets)

**Équipe 4 devs (T-shirt sizing)** :
- S stories : 2 par sprint (2 weeks)
- M stories : 1 par sprint
- L stories : 0.5 par sprint (straddled)
- XL stories : 0.25 par sprint (4 weeks)

**Exemple** :
- 10 M stories = 10 sprints = 20 weeks = 5 mois

---

## 🎯 SECTION 7 : RISQUES & MITIGATION

### 7.1 Matrice risques (probabilité × impact)

| Risque | Prob | Impact | Mitigation | Propriétaire |
|--------|------|--------|-----------|-------------|
| **PSP Konnect API unstable / late docs** | 🔴 | 🔴 | **Demander sandbox ASAP + contact support local + fallback Stripe** | Backend |
| **Transporteur TN no API, manual integration only** | 🔴 | 🟡 | **Plan fallback: manual shipment entry (tempo) + reach to other providers** | Backend |
| **POS hardware vendor delays (Sunmi shortage)** | 🟡 | 🔴 | **Pre-order immediately (Feb) + generic fallback (Epson+cash drawer)** | Infra |
| **Matériel incohérence (printer driver bug)** | 🟡 | 🔴 | **Full hardware testing en staging before production (2 weeks buffer)** | QA + Hardware |
| **White-label bugs (Odoo email templates change)** | 🟡 | 🟡 | **Automated regression tests for white-label elements + doc all customizations** | Frontend |
| **Customer UAT extends beyond schedule** | 🔴 | 🟡 | **Set UAT timeline upfront (2 weeks max), prepare demo script, limit scope** | Product |
| **Mobile app review rejection (Apple/Google)** | 🟡 | 🔴 | **Test on real devices early (alpha phase) + engage app review support** | Mobile |
| **Performance issues at scale (100+ concurrent)** | 🟡 | 🟡 | **Load test in week 8 of V1, fix by week 10** | DevOps + Backend |
| **Data security (customer data leak)** | 🟢 | 🔴 | **Pentest in week 12 of V1, multi-tenant isolation review, SOC 2 audit** | Security + Infra |

---

### 7.2 Mitigation plan detallé

#### Risque 1: PSP APIs not ready

**Trigger** : No sandbox access by Feb 10

**Escalation path** :
1. Week 1 : Contact PSP sales / support locally (direct phone call)
2. Week 2 : If still no response → fallback to Stripe
3. Week 3 : Integrate Stripe as primary, keep PSP on roadmap

**Budget impact** : +2–3 jours dev (Stripe integration simpler)

---

#### Risque 2: Hardware shortages

**Trigger** : Sunmi v2 Pro out of stock in Tunisia/Morocco

**Escalation path** :
1. Jan 27 : Pre-order 5 units (demo + customers) from distributor
2. Feb 15 : If unavailable → switch to Sunmi V2S (cheaper) + generic Epson
3. Feb 28 : Source devices from different regional distributors

**Budget impact** : +5–10 jours dev (generic hardware integration)

---

#### Risque 3: V1 UAT extends 4+ weeks

**Trigger** : Customer finds >20 bugs or scope creep requests

**Mitigation** :
- **Freeze scope at Week 10** : Only critical bugs in V1
- **Set expectation upfront** : "V1 is MVP, nice-to-have features in V2"
- **Prepare demo script** : Show value quickly

**Contingency** : Push V2 timeline 2 weeks

---

## 📋 SECTION 8 : DÉCISIONS BLOQUANTES À VALIDER IMMÉDIATEMENT

### 8.1 Checklist de décisions (Timeline)

| Décision | Option | Owner | Target date | Blocker? |
|----------|--------|-------|------------|---------|
| **PSP Tunisie (prioritaire)** | Konnect vs Tunisie Telecom | Backend | Jan 27 | 🔴 YES |
| **PSP Maroc (prioritaire)** | Stripe vs Maroc Telecom vs Attijari | Backend | Jan 27 | 🔴 YES |
| **Transporteur TN** | Autobacs vs DHL vs Aramex | Backend | Jan 31 | 🟡 SOFT |
| **Transporteur MA** | Idem TN | Backend | Jan 31 | 🟡 SOFT |
| **Kit POS Hardware** | Sunmi V2 Pro vs V2S + generic | Hardware | Jan 31 | 🟡 SOFT |
| **Infra location** | AWS eu-west-1 vs OVH vs autre | Infra | Feb 3 | 🔴 YES |
| **Conformité data** | RGPD + lois TN/MA | Legal | Feb 10 | 🔴 YES (pre-launch) |
| **Premier client pilot** | Who? (internal team + real customer) | Product | Feb 3 | 🟡 SOFT |
| **Pricing model** | €300/magasin vs €250 vs autre | Product | Feb 1 | 🟡 SOFT |
| **Support SLA** | 24/7 vs business hours vs async | Product | Feb 10 | 🟢 NO (V2) |

### 8.2 Template décision (remplir pour chaque blockers)

```
┌─────────────────────────────────────────┐
│ DÉCISION: PSP Tunisie                   │
├─────────────────────────────────────────┤
│ Owner: Backend Lead                     │
│ Deadline: Jan 27, 2026 (EOD)            │
│                                         │
│ Options:                                │
│ [A] Konnect                             │
│   Pros: Stable API, local support       │
│   Cons: Docs might be partial           │
│   Effort: M (12 days)                   │
│   Risk: Medium (API docs)               │
│                                         │
│ [B] Tunisie Telecom Pay                 │
│   Pros: Large network                   │
│   Cons: API quality unknown, expensive  │
│   Effort: L (18+ days)                  │
│   Risk: High (unknown API)              │
│                                         │
│ [C] Hybrid (both)                       │
│   Pros: No single point of failure      │
│   Cons: Double dev effort               │
│   Effort: L (18 days)                   │
│   Risk: Medium                          │
│                                         │
│ RECOMMENDATION: [A] Konnect             │
│ Rationale: API known, fastest time-to-value
│           Fallback to Stripe if issues  │
│                                         │
│ Validation:                             │
│ [ ] Sandbox access confirmed            │
│ [ ] API docs reviewed                   │
│ [ ] Support contact assigned            │
│ [ ] POC completed by Feb 14             │
└─────────────────────────────────────────┘
```

---

## 🚀 SECTION 9 : GO-TO-MARKET & EARLY TRACTION

### 9.1 Customer acquisition strategy (Q1–Q2 2026)

**Target segment** : Boutiques retail sport TN/MA (5–15 magasins, 200K€–500K€ CA)

**Channels** :
1. **Direct sales** (80% early) : Founder reaching out to boutique managers
2. **Referral** : Customer 1 → customer 2–3 (network effect)
3. **Partnerships** : Federations retail, distributors TN/MA
4. **Content** : Blog posts, LinkedIn (case studies after 1–2 customers)

**Early pilot strategy** :
- **Customer 1** (internal or heavily subsidized) : Validate everything, iterate fast
- **Customer 2–3** (50% discount first year) : Reference customers, testimonials
- **Customer 4–5** (standard pricing) : Revenue ramp

**Pitch framework** (30 sec) :
> "You're losing sales because your POS doesn't talk to your website. We unified stock across all channels. First customer saved 15 hours/week on inventory + reduced oversell by 30%. 5 days to deploy, no IT required."

### 9.2 Launch checklist (before Customer 1 go-live)

- [ ] **Product readiness**
  - [ ] V1 all features tested end-to-end
  - [ ] Load testing passed (50 concurrent users)
  - [ ] Pentest completed + critical issues fixed
  - [ ] SLA doc signed

- [ ] **Operations readiness**
  - [ ] Backup/restore tested (success in <30min)
  - [ ] Monitoring alerts working (Slack integration)
  - [ ] Support runbook created (20 common issues)
  - [ ] 24h support contact assigned

- [ ] **Customer readiness**
  - [ ] Hardware + inventory delivered + tested
  - [ ] Staff training completed (POS + web + mobile)
  - [ ] Go-live date + cutover plan confirmed
  - [ ] Acceptance test criteria documented

- [ ] **Legal + Compliance**
  - [ ] DPA signed (if GDPR applies)
  - [ ] Data residency confirmed (TN/MA local hosting)
  - [ ] Support SLA in contract
  - [ ] Insurance checked (cyber liability)

---

## 📈 SECTION 10 : SUCCESS METRICS & KPIs

### 10.1 Product metrics (health check)

| Métrique | Target V1 | Target V2 | Owner |
|----------|-----------|-----------|-------|
| **API uptime** | 99.5% | 99.9% | DevOps |
| **Page load time** | <2s desktop, <3s mobile | <1.5s desktop, <2s mobile | Frontend |
| **Order creation latency** | <500ms | <300ms | Backend |
| **Stock sync latency** | <30s | <5s (real-time) | Backend |
| **Mobile app crash rate** | <0.1% | <0.05% | Mobile |
| **Payment success rate** | 95% | 97%+ | Backend |
| **Delivery on-time rate** | 90% | 95%+ | Ops |

### 10.2 Business metrics

| Métrique | Q2 Target | Q3 Target | Owner |
|----------|-----------|-----------|-------|
| **Customers onboarded** | 1–2 | 10–15 | Product |
| **MRR (monthly recurring revenue)** | 3–5K€ | 30–40K€ | Product |
| **Customer retention** | 100% | 95%+ | Product |
| **Support ticket volume** | <5/day | <2/day | Support |
| **NPS (Net Promoter Score)** | 40+ | 50+ | Product |

---

## 📚 SECTION 11 : DOCUMENTATION & KNOWLEDGEBASE

### 11.1 Docs à créer

| Doc | Audience | Priority | Owner |
|-----|----------|----------|-------|
| **Architecture decision records (ADRs)** | Dev team | 🔴 | CTO |
| **API docs (/api/v1 OpenAPI)** | Mobile devs + integrators | 🔴 | Backend |
| **White-label customization guide** | Customer engineers | 🟡 | Frontend |
| **POS hardware setup guide** | Field engineers | 🟡 | Infra |
| **Deployment playbook** | DevOps | 🟡 | DevOps |
| **Support runbook** | Support team | 🟡 | Support |
| **Customer onboarding guide** | Customer success | 🟡 | Product |
| **Admin panel reference** | Customer admins | 🟢 | Product |

---

## ✅ SECTION 12 : NEXT STEPS (ACTIONNABLE)

### Semaine 1 (Jan 27 — Jan 31)

- [ ] **Monday Jan 27**
  - [ ] Validate PSP decisions with Konnect + Stripe (call)
  - [ ] Order Sunmi V2 Pro (5 units, expedite shipping)
  - [ ] Confirm AWS account + infra setup start date
  
- [ ] **Wednesday Jan 29**
  - [ ] Spike tech kickoff (4 devs, 3 days)
  - [ ] Transporteur TN/MA RFP sent (Autobacs, DHL, Aramex)
  
- [ ] **Friday Jan 31**
  - [ ] Spike tech summary + go-live decision
  - [ ] Customer 1 (pilot) identified + intro call

### Semaine 2 (Feb 3 — Feb 7)

- [ ] V0 infra setup begins (5 devs, 4 weeks)
- [ ] Transporteur API docs reviewed
- [ ] 1st POC (Konnect) ready to demo

### Semaine 3 (Feb 10 — Feb 14)

- [ ] Conformité data (RGPD, DPA) reviewed by legal
- [ ] V0 backup/restore tested
- [ ] Customer 1 internal kickoff (requirements gathering)

---

## 🎬 CONCLUSION

Avec cette feuille de route réorganisée, tu as :

✅ **Clarté stratégique** : Positionnement, TAM, modèle économique explicit  
✅ **Risques identifiés** : PSP, hardware, customer UAT = les 3 vrais blockers  
✅ **Plan d'action détaillé** : Décisions bloquantes listées, timeline précise (V0 6 weeks → V1 14 weeks → V2 10 weeks)  
✅ **Budget & effort** : ~140 jours-hommes V1, équipe 6–8 devs, 6 mois go-live customer 1  
✅ **Méthode de chiffrage** : T-shirt sizing + facteurs complexité réalistes  
✅ **Mitigation des risques** : Fallback pour chaque décision critique  

**Recommandation finale** :
1. **Valider les 8 décisions bloquantes** cette semaine (surtout PSP + hardware)
2. **Lancer atelier Gap + Spike tech** fin janvier
3. **Démarrer V0 infra** février
4. **Identifier customer 1 pilot** avant février 15

Bonne chance ! 🚀

---

**Document versioning** : 2.0 — Jan 22, 2026  
**Prochain revision** : v2.1 (après décisions bloquantes validées)
