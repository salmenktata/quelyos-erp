# 🗺️ ROADMAP PRODUIT QUELYOS ERP V2.0

**Plateforme SaaS Omnicanal: POS + E-commerce + Mobile**  
**10 mois (Feb 2026 - Nov 2026), 3 phases majeures**

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Principes](#vision--principes)
2. [PHASE 0: SPIKE TECH (Semaine 1)](#phase-0-spike-tech-semaine-1)
3. [PHASE 1: V0 MVP (6 semaines)](#phase-1-v0-mvp-6-semaines)
4. [PHASE 2: V1 COMPLET (18 semaines)](#phase-2-v1-complet-18-semaines)
5. [PHASE 3: V2 SCALE (16 semaines)](#phase-3-v2-scale-16-semaines)
6. [Matrice de Priorités](#matrice-de-priorités)
7. [Dépendances & Risques](#dépendances--risques)
8. [KPIs de Succès](#kpis-de-succès)

---

## 🎯 VISION & PRINCIPES

### Objectif Produit

**Problème:** Boutiques retail TN/MA perdent 30% des ventes car POS ne parle pas à website.

**Solution:** Plateforme unifiée (POS + Web + Mobile + Inventory) en temps réel.

**Résultat:** 
- `-15h/semaine` inventaire manuel
- `-95%` oversell
- `+20%` ventes additionnelles
- `+15%` rétention clients

### Principes de Conception

```
1. FIRST-CLASS MOBILE
   └─ Offline-first (works sans internet)

2. REAL-TIME EVERYTHING
   └─ Sync inventaire <1s, tout channel

3. WHITE-LABEL
   └─ Chaque client a sa marque, ses couleurs

4. MULTI-TENANT ISOLÉ
   └─ Données par tenant, zéro fuite

5. DEVOPS-READY
   └─ Deploy 1-click, auto-scale
```

---

## 🚀 PHASE 0: SPIKE TECH (SEMAINE 1)

**Deadline:** 31 Jan 2026  
**Objectif:** Valider 4 dépendances critiques  
**Team:** 8.5 FTE (full allocation)  
**Success:** Tous POCs GREEN ou YELLOW (pas RED)

### 🔧 POC 1: Konnect PSP Integration

| Aspect | Détail |
|--------|--------|
| **Owner** | Backend Dev 1 |
| **Duration** | 1.5 jours |
| **Story** | "En tant que commerçant TN, je peux accepter paiements via Konnect en POS et web" |
| **Acceptance Criteria** | - Payment flow works end-to-end <br/> - Webhook reçu et validé <br/> - Order status updated in Odoo <br/> - Latency <1s |

**User Flows:**
```
Web Checkout:
1. Client clique "Payer"
2. Redirect vers Konnect payment page
3. Client entre carte
4. Callback: Order marked "Paid" en Odoo
5. Invoice créé automatiquement

POS:
1. Caissier click "Paiement Konnect"
2. QR code à scanner par client
3. Callback: Receipt imprimé
4. Tiroir caisse s'ouvre
```

**Deliverables:**
- [ ] Odoo model: `payment_konnect`
- [ ] API endpoints: POST /payment/initiate, webhook /payment/callback
- [ ] Test cards working (sandbox)
- [ ] Logs sans PII (compliance)

---

### 🖨️ POC 2: Device Bridge (POS Hardware)

| Aspect | Détail |
|--------|--------|
| **Owner** | Infra Dev |
| **Duration** | 2 jours |
| **Story** | "En tant qu'opérateur POS, je peux imprimer receipts et ouvrir le tiroir caisse depuis Odoo" |
| **Acceptance Criteria** | - Receipt prints to Sunmi <br/> - Drawer opens on payment <br/> - Barcode scanner input working <br/> - Offline queueing (retry when back online) |

**User Flows:**
```
Device Bridge Architecture:
Odoo (8069) --HTTP--> Device Bridge Agent (3000) --Serial--> Sunmi Printer

Workflow:
1. POS transaction completes
2. Odoo calls: POST http://device:3000/print {receipt_data}
3. Device Bridge writes to thermal printer via Serial
4. Response: { status: "ok" }
5. If error: Queue locally, retry when online
```

**Deliverables:**
- [ ] Node.js agent (escpos-printer library)
- [ ] Odoo controller: device_bridge_api.py
- [ ] Test on Sunmi V2 Pro hardware
- [ ] Offline retry mechanism

---

### 🔗 POC 3: API /api/v1 Foundation

| Aspect | Détail |
|--------|--------|
| **Owner** | Backend Dev 2 |
| **Duration** | 1 jour |
| **Story** | "En tant que frontend/mobile dev, j'ai une API REST cohérente pour products, cart, orders, customers" |
| **Acceptance Criteria** | - Auth endpoints (login, refresh, logout) <br/> - Product listing + search <br/> - Cart operations <br/> - Order creation + history <br/> - Error handling (400, 401, 404, 500) <br/> - OpenAPI docs live |

**User Flows:**
```
Auth Flow:
1. POST /api/v1/auth/login {email, password}
2. Response: { access_token: "jwt...", expires_in: 86400 }
3. Subsequent requests: Header: Authorization: Bearer jwt...
4. Auto-refresh when expiring

Shopping Flow:
1. GET /api/v1/products?limit=20&offset=0
2. POST /api/v1/cart/items {product_id, qty}
3. GET /api/v1/cart → {items: [...], total: 1500.00}
4. POST /api/v1/checkout {payment_method, shipping_address}
5. Response: { order_id, payment_url }
```

**Deliverables:**
- [ ] Core endpoints (6-8 endpoints minimum)
- [ ] JWT implementation (HS256, 24h expiry)
- [ ] Tenant filtering on all queries
- [ ] OpenAPI/Swagger docs
- [ ] Postman collection for testing
- [ ] Rate limiting (100 req/min per user)

---

### ☁️ POC 4: AWS Infrastructure Setup

| Aspect | Détail |
|--------|--------|
| **Owner** | DevOps |
| **Duration** | 1.5 jours |
| **Story** | "En tant que devops, j'ai infrastructure AWS automatisée, scalable et monitorée" |
| **Acceptance Criteria** | - RDS Multi-AZ ready <br/> - S3 bucket versioning on <br/> - CloudFront CDN working <br/> - Monitoring alerts configured <br/> - Backup+restore test <30min |

**User Flows:**
```
Infrastructure:
VPC (10.0.0.0/16)
├─ Public: ALB (80, 443)
├─ Private: ECS (Odoo)
└─ Private: RDS (PostgreSQL)

Deployment:
1. Push code to GitHub
2. CI pipeline: test, build Docker image
3. Push image to AWS ECR
4. CD: Deploy to ECS Fargate
5. Health check: /health endpoint
6. Monitoring: CloudWatch + Datadog
7. Auto-scale: CPU >70% → +1 task
```

**Deliverables:**
- [ ] VPC + subnets + security groups (Terraform)
- [ ] RDS instance (db.m5.large, Multi-AZ)
- [ ] ECS cluster + task definition
- [ ] S3 bucket (versioning, encryption)
- [ ] CloudFront distribution
- [ ] IAM roles + policies
- [ ] Monitoring dashboard live
- [ ] Backup automation + restore test

---

### ✅ GO/NO-GO DECISION (FRI 31 JAN)

```
GREEN LIGHT: Proceed V0
├─ All 4 POCs working (GREEN or YELLOW)
├─ No RED blockers
├─ All 8 strategic decisions signed
├─ Customer 1 contract ready
└─ Team 100% committed

YELLOW LIGHT: Proceed with caution
├─ 3/4 POCs GREEN, 1 YELLOW (mitigated)
├─ 7/8 decisions signed, 1 near-term solution
├─ Minor blockers (known fallback)
└─ Start V0, resolve in parallel

RED LIGHT: PAUSE
├─ >1 POC RED (unsolvable)
├─ <7 decisions signed
├─ Legal blockers
└─ Escalate & replan
```

---

## 🏗️ PHASE 1: V0 MVP (6 SEMAINES)

**Timeline:** 3 Feb - 17 Mar 2026  
**Customers:** 1 (pilot)  
**Revenue:** 0€ (free + 50% discount)  
**Team:** 8.5 FTE  
**Success Criteria:** Customer 1 live, POS + Web operational, NPS >40

---

### SPRINT 1-2: Odoo Setup + POS Basique (2 semaines)

#### Feature 1.1: Odoo Multi-Tenant Provisioning

**User Story:**
```
"En tant qu'admin Quelyos, je peux créer un nouveau tenant
pour un nouveau client (DB + S3 + DNS) en 30 minutes"
```

**Acceptance Criteria:**
- [ ] Click "Create Tenant" wizard
- [ ] Enter: shop name, country, email
- [ ] Auto-create: PostgreSQL DB, S3 bucket, DNS CNAME
- [ ] Admin credentials emailed
- [ ] Shop accessible at shop-name.saasretail.tn
- [ ] Odoo company + warehouse pre-configured

**Dependencies:**
- AWS credentials configured
- Terraform for IaC
- Email service ready (SES)

**Effort:** 5 jours (Backend)

**Story Breakdown:**
```
Task 1.1.1: Database provisioning script (Terraform)
  └─ Create RDS instance per tenant
  └─ Pre-load initial schema
  └─ Owner: DevOps | Effort: 1.5 days

Task 1.1.2: S3 bucket provisioning
  └─ Create bucket per tenant
  └─ Set up IAM policies
  └─ Enable versioning + encryption
  └─ Owner: DevOps | Effort: 0.5 days

Task 1.1.3: DNS CNAME automation
  └─ Route53 API call
  └─ Wildcard cert for *.saasretail.tn
  └─ Owner: DevOps | Effort: 0.5 days

Task 1.1.4: Odoo model + wizard (saas_tenant_provisioning)
  └─ res_company setup (fiscal info)
  └─ stock_warehouse initialization
  └─ account_move setup (empty)
  └─ Owner: Backend | Effort: 1.5 days

Task 1.1.5: Email notifications
  └─ Welcome email with credentials
  └─ Setup link for admin
  └─ Owner: Backend | Effort: 1 day
```

---

#### Feature 1.2: POS Basic (Ring-up, Payments, Drawer)

**User Story:**
```
"En tant que caissier, je peux:
1. Ajouter produits au ticket via barcode
2. Appliquer remises/taxes
3. Accepter cash ou paiement Konnect
4. Imprimer receipt + ouvrir tiroir caisse"
```

**Acceptance Criteria:**
- [ ] Barcode scan adds product to ticket
- [ ] Product image + price visible
- [ ] Qty adjustment (+-) working
- [ ] Discount input (€ or %)
- [ ] Tax calculated automatically
- [ ] Total updated real-time
- [ ] 2 payment buttons: Cash, Konnect
- [ ] Receipt printed (Sunmi)
- [ ] Cash drawer opens
- [ ] Offline mode (queue transactions)

**Dependencies:**
- POC 1 (Konnect payment)
- POC 2 (Device Bridge)
- Product database populated

**Effort:** 4 jours (Frontend + Backend)

**Story Breakdown:**
```
Task 1.2.1: POS UI (React)
  └─ Product search bar
  └─ Ticket line editor (edit qty, remove)
  └─ Total calculator
  └─ Payment selection buttons
  └─ Owner: Frontend | Effort: 2 days

Task 1.2.2: POS state management
  └─ Cart context (add, remove, clear)
  └─ Offline queue (localStorage)
  └─ Owner: Frontend | Effort: 1 day

Task 1.2.3: Backend: Point of sale order creation
  └─ POST /pos/create-order endpoint
  └─ Inventory deduction
  └─ Invoice generation
  └─ Owner: Backend | Effort: 1.5 days

Task 1.2.4: Receipt generation + device bridge
  └─ Receipt template (customer name, items, total)
  └─ Call Device Bridge /print
  └─ Offline retry logic
  └─ Owner: Backend | Effort: 0.5 days

Task 1.2.5: Testing + refinement
  └─ UAT with Customer 1
  └─ Performance: ring-up in <2s
  └─ Owner: QA | Effort: 1 day
```

---

#### Feature 1.3: Product Catalog (Core)

**User Story:**
```
"En tant qu'admin, je peux:
1. Importer produits (CSV ou manuellement)
2. Ajouter images
3. Configurer prix/taxes
4. Gérer stock par warehouse"
```

**Acceptance Criteria:**
- [ ] Bulk import (CSV format)
- [ ] Individual product creation
- [ ] Image upload → S3
- [ ] Barcode assignment (manual or auto)
- [ ] Price per product
- [ ] Tax per category
- [ ] Stock per warehouse
- [ ] Product visibility (web, POS, both)

**Dependencies:**
- S3 file upload (POC 4)
- Product model (Odoo standard)

**Effort:** 2 jours (Backend)

---

### SPRINT 3-4: E-Commerce Basic (2 semaines)

#### Feature 1.4: Website Shop (Listing + Detail)

**User Story:**
```
"En tant que client, je peux:
1. Voir liste des produits avec images
2. Filtrer par catégorie
3. Voir détails: prix, stock, description
4. Lire avis clients"
```

**Acceptance Criteria:**
- [ ] Products listed (20 per page, paginated)
- [ ] Product images loaded from S3
- [ ] Category filter sidebar
- [ ] Search functionality
- [ ] Product detail page (description, photos, reviews)
- [ ] Stock status (In stock, Low, Out of stock)
- [ ] Price display with taxes
- [ ] Add to cart button (visible when in stock)

**Dependencies:**
- Product catalog (Feature 1.3)
- React frontend setup
- Theme system ready

**Effort:** 3 jours (Frontend)

---

#### Feature 1.5: Shopping Cart + Checkout

**User Story:**
```
"En tant que client, je peux:
1. Ajouter produits au panier
2. Modifier quantités
3. Voir sous-total, taxes, total
4. Checkout en 3 étapes
5. Payer par carte (Konnect)"
```

**Acceptance Criteria:**
- [ ] Add to cart (quantity picker)
- [ ] Cart persists (cookie/localStorage)
- [ ] Remove item from cart
- [ ] Coupon code input
- [ ] Summary: items, subtotal, taxes, shipping, total
- [ ] Checkout Step 1: Shipping address
- [ ] Checkout Step 2: Billing address (optional)
- [ ] Checkout Step 3: Payment method
- [ ] Konnect payment modal
- [ ] Order confirmation page
- [ ] Confirmation email sent

**Dependencies:**
- POC 1 (Konnect)
- Feature 1.4 (Shop)
- API endpoints (POC 3)

**Effort:** 4 jours (Frontend + Backend)

**Story Breakdown:**
```
Task 1.5.1: Cart component (React)
  └─ Add/remove items
  └─ Quantity picker
  └─ Coupon input
  └─ Cart summary
  └─ Owner: Frontend | Effort: 1.5 days

Task 1.5.2: Checkout flow (React)
  └─ Address form (step 1)
  └─ Payment selection (step 2)
  └─ Order summary (step 3)
  └─ Confirmation page
  └─ Owner: Frontend | Effort: 1.5 days

Task 1.5.3: Backend checkout API
  └─ POST /checkout endpoint
  └─ Address validation
  └─ Inventory check (prevent oversell)
  └─ Order creation
  └─ Invoice generation
  └─ Owner: Backend | Effort: 1 day

Task 1.5.4: Order confirmation
  └─ Email template
  └─ Send via SES
  └─ Owner: Backend | Effort: 0.5 days

Task 1.5.5: Integration testing
  └─ End-to-end payment flow
  └─ Inventory deduction verification
  └─ Owner: QA | Effort: 1 day
```

---

### SPRINT 5-6: QA + Customer 1 Go-Live (2 semaines)

#### Feature 1.6: Order Management (Admin)

**User Story:**
```
"En tant qu'admin, je peux:
1. Voir tous les commandes (POS + Web)
2. Filtrer par date, client, statut
3. Approuver, expédier, annuler
4. Imprimer picking list
5. Exporter rapports"
```

**Acceptance Criteria:**
- [ ] Orders table (paginated, sortable)
- [ ] Status filter: draft, paid, shipped, delivered, cancelled
- [ ] Date range filter
- [ ] Customer name search
- [ ] Order detail view
- [ ] Mark as shipped button
- [ ] Cancel order (if not shipped)
- [ ] Print picking list
- [ ] Export to CSV

**Effort:** 2 jours (Frontend + Backend)

---

#### Feature 1.7: Reports + Analytics (Basic)

**User Story:**
```
"En tant qu'admin, je peux voir:
1. Total sales today/week/month
2. Top selling products
3. Customer count
4. Repeat customer %"
```

**Acceptance Criteria:**
- [ ] Dashboard card: Today sales
- [ ] Dashboard card: This month sales
- [ ] Chart: Sales trend (daily)
- [ ] Table: Top 10 products
- [ ] Table: Recent orders
- [ ] KPI: Repeat customer rate

**Effort:** 2 jours (Frontend + Backend)

---

#### Feature 1.8: Customer 1 Onboarding + Training

**User Story:**
```
"En tant que Customer 1 staff, je suis formé et prêt
à utiliser Quelyos POS + Web pour vendre"
```

**Acceptance Criteria:**
- [ ] 2-day on-site training
- [ ] Staff can ring up sales
- [ ] Staff can navigate admin
- [ ] Data looks correct (orders, stock)
- [ ] Support Slack channel active
- [ ] Daily check-in meetings scheduled (Week 1-2)
- [ ] Issue logging process clear
- [ ] Go-live checklist signed

**Effort:** 3 jours (Product + Support)

---

### ✅ V0 SUCCESS CRITERIA

```
Launch: 17 Mar 2026

OPERATIONAL:
✓ POS: Ring-up in <2s, payment <3s
✓ Web: Page load <2s
✓ Uptime: 99% minimum
✓ Error rate: <2%

FUNCTIONAL:
✓ Customer 1 live with 2 locations
✓ 50+ products in catalog
✓ 10+ transactions/day (average)
✓ All payments (Konnect) successful
✓ Stock sync real-time

CUSTOMER:
✓ Customer 1 NPS >40
✓ No critical bugs in production
✓ Training complete
✓ Support tickets <5 open

BUSINESS:
✓ Case study collected (before/after metrics)
✓ Willing to be reference customer
✓ Testimonial video recorded
```

---

## 📦 PHASE 2: V1 COMPLET (18 SEMAINES)

**Timeline:** 24 Mar - 10 May 2026  
**Customers:** 1 → 50  
**Revenue:** 57K€ (partial year)  
**Team:** 8.5 FTE → 10 FTE (add 1-2 support)  
**Success Criteria:** 50 active customers, white-label, mobile app, NPS >50

---

### SPRINT 7-11: Core Modules (5 semaines)

#### Feature 2.1: Real-Time Inventory Sync

**User Story:**
```
"En tant que manager multi-locations, je vois:
1. Stock en temps réel across all channels (POS/Web/Mobile)
2. Si Stock B en POS, il disparaît de Web immédiatement
3. Transfers between warehouses tracked
4. Stock history + audit trail"
```

**Acceptance Criteria:**
- [ ] Inventory real-time sync (WebSocket)
- [ ] Web product page updates <1s
- [ ] Mobile app updates <1s
- [ ] Oversell prevention (max available = inventory)
- [ ] Stock transfer UI (warehouse A → warehouse B)
- [ ] Stock history log
- [ ] Low stock alerts (admin)
- [ ] Reorder point configuration
- [ ] Barcode scanning for stock count

**Dependencies:**
- WebSocket infrastructure (Odoo + React + Flutter)
- Inventory module (Odoo standard)

**Effort:** 5 jours (Backend + Frontend)

---

#### Feature 2.2: Shipping Integration (Autobacs TN + DHL MA)

**User Story:**
```
"En tant qu'admin, je peux:
1. Générer shipping label automatiquement
2. Track shipment status
3. Customer reçoit tracking link par email
4. Auto-update order status quand livré"
```

**Acceptance Criteria:**
- [ ] Autobacs API integration (TN)
- [ ] DHL API integration (MA)
- [ ] Create shipment button (order detail)
- [ ] Auto-generate label PDF
- [ ] Tracking number assigned
- [ ] Customer notified by email + SMS (optional)
- [ ] Real-time tracking status in admin
- [ ] Order status auto-updates (Shipped → Delivered)
- [ ] Pickup scheduled automatically

**Dependencies:**
- Feature 1.6 (Order management)
- POC 5-6 (Transporteur decisions)

**Effort:** 4 jours (Backend)

---

#### Feature 2.3: Customer Loyalty Program

**User Story:**
```
"En tant que client, je peux:
1. Accumuler points per purchase (1€ = 1 point)
2. Voir mon solde de points
3. Appliquer points au checkout (100 points = 10€ discount)
4. Voir mon historique transactions"
```

**User Story (Admin):**
```
"En tant qu'admin, je configure:
1. Points per € (default 1:1)
2. Redemption rate (100 points = X€)
3. Bonus campaigns (double points on Fridays)
4. Tier membership (Silver/Gold/Platinum)"
```

**Acceptance Criteria:**
- [ ] Points awarded per transaction
- [ ] Points visible in customer account
- [ ] Redeem at checkout (100 pt = 10€)
- [ ] Tier-based multiplier (1.5x for Gold)
- [ ] Campaign setup (double points date ranges)
- [ ] Email notifications (points earned/expiring)
- [ ] Admin: Points report + redemption tracking
- [ ] POS: Show customer points + loyalty tier

**Dependencies:**
- Customer account system
- Transaction history

**Effort:** 4 jours (Backend + Frontend)

---

#### Feature 2.4: Customer Profiles & CRM

**User Story:**
```
"En tant qu'admin, je peux:
1. Voir customer list avec derniers achats
2. Customer detail: lifetime value, frequency, favorite items
3. Manuelle notes per customer
4. Send marketing emails to segments"
```

**Acceptance Criteria:**
- [ ] Customer directory (search, filter)
- [ ] Customer detail page (LTV, purchase history, preferences)
- [ ] Manual notes field
- [ ] Purchase history table
- [ ] Favorite products section
- [ ] Birthday/anniversary tracking (optional)
- [ ] Segment builder (LTV >500€, Frequency >10x, etc.)
- [ ] Mass email to segment
- [ ] Email templates (promotional, abandoned cart, thank you)

**Dependencies:**
- Customer account system
- Email service (SES)

**Effort:** 3 jours (Backend + Frontend)

---

### SPRINT 12-18: White-Label + Mobile (7 semaines)

#### Feature 2.5: Theme System (White-Label)

**User Story:**
```
"En tant que Customer 1, je peux:
1. Changer couleurs primaires/secondaires
2. Upload mon logo
3. Personnaliser emails templates
4. Select font style"
```

**User Story (Quelyos Admin):**
```
"Je peux créer preset themes (Modern, Elegant, Fun)
Et customers choisissent un preset ou customisent"
```

**Acceptance Criteria:**
- [ ] Color picker: primary, secondary, accent
- [ ] Logo upload (web + POS receipt)
- [ ] Email template editor
- [ ] Font selection (sans-serif, serif, display)
- [ ] Live preview
- [ ] Apply to all channels (POS, Web, Mobile)
- [ ] Reset to default option
- [ ] Pre-built themes (3-5 templates)
- [ ] CSS variables (for custom CSS)

**Dependencies:**
- CSS variable system (already in React)
- Admin panel

**Effort:** 4 jours (Frontend)

---

#### Feature 2.6: Mobile App (Flutter Auto-Gen)

**User Story:**
```
"En tant que customer, je peux:
1. Download app (APK for Android, iOS for Apple)
2. Login with same account (web + mobile)
3. Browse products + checkout
4. Track orders
5. Accumulate loyalty points
6. Works offline (view products, queue purchases)"
```

**User Story (Admin):**
```
"Je peux click 'Generate App' et:
1. APK generated with customer branding
2. Download link sent
3. Customer can install on phone
4. App automatically connects to API"
```

**Acceptance Criteria:**
- [ ] Flutter app scaffold (navigation, auth, products, cart, orders)
- [ ] Login/signup (same backend auth)
- [ ] Product browsing (with images from S3)
- [ ] Cart functionality (add/remove/qty)
- [ ] Checkout (Konnect payment)
- [ ] Order history + tracking
- [ ] Loyalty points view
- [ ] Push notifications (order status, special offers)
- [ ] Offline mode: local cache + queue
- [ ] Auto-generation script (Dart templates)
- [ ] APK hosted on S3 for download

**Dependencies:**
- API endpoints stable (POC 3)
- Konnect payment integration
- Push notification service (Firebase Cloud Messaging)

**Effort:** 6 jours (Mobile)

---

#### Feature 2.7: Admin Dashboard + Analytics

**User Story:**
```
"En tant qu'admin, je vois mon enterprise dashboard:
1. KPI cards (sales, orders, customers)
2. Sales trend chart (daily/weekly/monthly)
3. Top products + customers
4. Inventory status (low stock warnings)
5. Real-time order feed"
```

**Acceptance Criteria:**
- [ ] KPI cards: total sales, order count, customer count, repeat rate
- [ ] Date range picker (last 7 days, month, quarter, year)
- [ ] Sales trend chart (line graph, optional forecast)
- [ ] Top 10 products table (by revenue or qty)
- [ ] Top 10 customers (by LTV)
- [ ] Low stock alerts (configurable threshold)
- [ ] Recent orders live feed (last 10)
- [ ] Export reports to CSV/PDF
- [ ] Mobile-responsive (works on tablet in POS area)

**Dependencies:**
- Business data aggregated efficiently (avoid N+1)
- Performance: dashboard loads <3s

**Effort:** 3 jours (Frontend + Backend)

---

### SPRINT 19-25: Advanced Features (7 semaines)

#### Feature 2.8: Multiple Payment Methods

**User Story:**
```
"En tant que commerçant, je peux accepter:
1. Konnect (TN)
2. Stripe (MA)
3. Cash
4. Bank transfer (pour commandes)
5. Wallet/credit account"
```

**Acceptance Criteria:**
- [ ] Konnect payment (POS + Web)
- [ ] Stripe payment (Web, optional for Morocco)
- [ ] Cash payment (POS)
- [ ] Cash drawer integration
- [ ] Manual bank transfer (admin confirms)
- [ ] Customer wallet (prepaid balance)
- [ ] Payment status tracking
- [ ] Reconciliation reports

**Effort:** 2 jours (Backend)

---

#### Feature 2.9: Email Automation

**User Story:**
```
"Clients reçoivent emails automatiques:
1. Order confirmation
2. Payment received
3. Shipment notification
4. Delivery confirmation
5. Review request (5 days après livraison)
6. Abandoned cart (24h après)"
```

**Acceptance Criteria:**
- [ ] Trigger-based email sequences
- [ ] Email templates (editable by admin)
- [ ] Dynamic variables (customer name, order #, tracking link)
- [ ] Scheduling (send at X time)
- [ ] Unsubscribe link (GDPR compliant)
- [ ] Sent email log
- [ ] Click/open tracking (optional)
- [ ] Abandoned cart email (configurable timeout)
- [ ] Reply-to address customizable

**Dependencies:**
- Email service (AWS SES)
- Event system (order.created, order.shipped, etc.)

**Effort:** 3 jours (Backend)

---

#### Feature 2.10: Advanced Customer Search & Filters

**User Story:**
```
"En tant qu'admin, je peux filtrer customers par:
1. Lifetime value (>500€, <100€, etc.)
2. Purchase frequency (weekly, monthly, etc.)
3. Last purchase date
4. Loyalty tier
5. Location (if multi-locations)
6. Tags (custom labels)"
```

**Acceptance Criteria:**
- [ ] Advanced filters UI (sidebar or dropdown)
- [ ] LTV range slider
- [ ] Frequency filter (daily/weekly/monthly/yearly)
- [ ] Date range (last purchase)
- [ ] Tier dropdown
- [ ] Location select
- [ ] Tag multi-select
- [ ] Save filter as "Segment"
- [ ] Apply filter: show matching customers
- [ ] Export segment list

**Effort:** 2 jours (Frontend + Backend)

---

### ✅ V1 SUCCESS CRITERIA

```
Launch: 10 May 2026

CUSTOMERS:
✓ 50 active customers on-boarded
✓ Customer 1 upgraded from V0 → V1
✓ Customers 2-50 completing first transactions
✓ NPS >50 (target)

FEATURES:
✓ Real-time inventory sync <1s
✓ Shipping integration live (TN + MA)
✓ Loyalty program running (points accrued)
✓ Mobile app downloaded by 10+ customers
✓ White-label working (each customer brand visible)
✓ Email automation sending (confirmation, shipment, review requests)

OPERATIONAL:
✓ Uptime: 99.5%
✓ Page load: <2s
✓ API latency: <200ms p99
✓ Payment success rate: >98%

BUSINESS:
✓ MRR: 5K€ (50 customers × 100€ avg)
✓ Churn rate: <5% monthly
✓ CAC payback: <6 months (trending toward 5)
✓ Team morale: High (shipped real product!)

TEAM:
✓ Support team hired (1-2 FTE)
✓ Processes documented
✓ On-call rotation established
```

---

## 📈 PHASE 3: V2 SCALE (16 SEMAINES)

**Timeline:** 13 May - 30 Aug 2026  
**Customers:** 50 → 100+  
**Revenue:** 114K€ (full year)  
**Team:** 10 FTE → 12 FTE  
**Success Criteria:** 100+ customers, infrastructure scalable, advanced features, market-ready

---

### SPRINT 26-29: Performance & Reliability (4 semaines)

#### Feature 3.1: Database Optimization & Caching

**User Story:**
```
"En tant que customer, je veux:
1. Product pages load instantly (<500ms)
2. No slowdown avec 10,000 products
3. Inventory sync stays <1s même avec 100 concurrent users"
```

**Acceptance Criteria:**
- [ ] Database query optimization (EXPLAIN ANALYZE)
- [ ] Indexes on hot paths (product, customer, order)
- [ ] Redis caching (products, inventory, pricing)
- [ ] Query result caching (24h TTL)
- [ ] N+1 query elimination
- [ ] Load testing: 100 concurrent users without degradation
- [ ] Monitoring: slow query log
- [ ] Cache invalidation strategy

**Effort:** 4 jours (Backend + DevOps)

---

#### Feature 3.2: CDN Optimization & Static Asset Caching

**User Story:**
```
"En tant que customer en Tunisie, images se chargent
super vite même si AWS data center est en Irlande"
```

**Acceptance Criteria:**
- [ ] CloudFront CDN configured
- [ ] Image optimization (WebP, responsive sizes)
- [ ] Cache headers optimized (1 day for images, etc.)
- [ ] Gzip compression enabled
- [ ] Lazy loading on product images
- [ ] Performance metrics: Lighthouse >90

**Effort:** 2 jours (DevOps)

---

#### Feature 3.3: Disaster Recovery & High Availability

**User Story:**
```
"Si AWS region fails, system recovers <4h
Data loss is <1h (RPO)"
```

**Acceptance Criteria:**
- [ ] Multi-AZ RDS with automatic failover
- [ ] Read replicas for scaling reads
- [ ] Cross-region backup (tested monthly)
- [ ] Restore procedure <30 min
- [ ] Disaster recovery drill completed
- [ ] Runbook documented
- [ ] RTO <4h, RPO <1h
- [ ] Team trained on incident response

**Effort:** 3 jours (DevOps)

---

### SPRINT 30-37: V2 Features (8 semaines)

#### Feature 3.4: Inventory Forecasting (AI-Powered)

**User Story:**
```
"En tant qu'admin, je vois prédictions:
1. Stock needed pour mois prochain
2. Risk of stockout si no reorder
3. Excess inventory warning"
```

**Acceptance Criteria:**
- [ ] Historical sales data analysis (last 6 months)
- [ ] Seasonal patterns detected (if data exists)
- [ ] Forecast chart: predicted demand next month
- [ ] Reorder suggestion: quantity + date
- [ ] Confidence level indicator
- [ ] Manual override (if forecast wrong)
- [ ] Export forecast report

**Dependencies:**
- 6+ months historical data (Phase 1-2)
- ML/statistical library (Python: scikit-learn, statsmodels)

**Effort:** 4 jours (Backend)

---

#### Feature 3.5: Supplier Management & Purchase Orders

**User Story:**
```
"En tant qu'admin, je peux:
1. Create purchase order to supplier
2. Track delivery status
3. Compare supplier prices
4. Auto-suggest cheapest supplier"
```

**Acceptance Criteria:**
- [ ] Supplier directory (name, contact, terms)
- [ ] Create PO (select products, quantities, supplier)
- [ ] PO status (draft, sent, received, invoiced)
- [ ] Expected delivery date
- [ ] Actual delivery tracking
- [ ] Price comparison (supplier A vs B)
- [ ] Supplier performance metrics
- [ ] PO history + archive

**Effort:** 4 jours (Backend + Frontend)

---

#### Feature 3.6: Multi-Location Management

**User Story:**
```
"En tant que chain avec 5 boutiques, je peux:
1. See consolidated inventory across locations
2. Transfer stock between locations
3. Central reporting per location
4. Sync pricing across all stores"
```

**Acceptance Criteria:**
- [ ] Multiple warehouse/location support
- [ ] Inventory view by location
- [ ] Transfer wizard (from location A → location B)
- [ ] Transport tracking (for transfers)
- [ ] Sales dashboard per location
- [ ] Consolidated KPIs (all locations)
- [ ] Location-specific pricing (optional)
- [ ] Stock level per location visible in POS

**Dependencies:**
- Odoo stock.warehouse (already supported)
- Inventory sync system (Feature 2.1)

**Effort:** 3 jours (Backend + Frontend)

---

#### Feature 3.7: Advanced Loyalty (Tiered, Referral)

**User Story:**
```
"En tant que customer, je peux:
1. Reach Silver tier (unlock 1.5x points multiplier)
2. Refer friend → both get 50 points
3. Birthday bonus: 100 extra points
4. Exclusive offers for tier members"
```

**Acceptance Criteria:**
- [ ] Tier system (Bronze, Silver, Gold, Platinum)
- [ ] Auto-tier based on LTV (0-200€: Bronze, etc.)
- [ ] Tier benefits (point multiplier, birthday bonus, exclusive discounts)
- [ ] Referral program (unique code per customer)
- [ ] Track referral attribution
- [ ] Birthday celebration (email + points)
- [ ] VIP perks (early access to sales, free shipping)
- [ ] Admin: Tier configuration + rules

**Effort:** 3 jours (Backend + Frontend)

---

#### Feature 3.8: Returns & RMA (Returns Management)

**User Story:**
```
"En tant que customer, je peux:
1. Request return within 30 days
2. Track RMA status
3. Send item back
4. Receive refund or replacement"

"En tant qu'admin, je peux:
1. Approve/deny return
2. Generate RMA label
3. Receive returned item
4. Process refund/replacement"
```

**Acceptance Criteria:**
- [ ] Return request form (reason, photos)
- [ ] RMA number generated
- [ ] Return label (Autobacs/DHL)
- [ ] Admin: RMA queue (pending, received, processed)
- [ ] Inspection (damage assessment)
- [ ] Refund or replacement decision
- [ ] Inventory update (on return receipt)
- [ ] Customer notification
- [ ] RMA history

**Effort:** 3 jours (Backend + Frontend)

---

#### Feature 3.9: Customer Segmentation & Marketing Automation

**User Story:**
```
"En tant qu'admin, je setup marketing campaigns:
1. Segment: 'VIP customers (LTV > 1000€)'
2. Campaign: 'Send email: new product launch'
3. Schedule: 'Every Monday 9am'
4. Track: 'Click rate, conversion rate'"
```

**Acceptance Criteria:**
- [ ] Segment builder (LTV, frequency, last purchase, tier)
- [ ] Email campaign creator
- [ ] Schedule campaign (date/time)
- [ ] A/B testing (subject line, content)
- [ ] Automated sequences (welcome, upsell, retention)
- [ ] Analytics: open rate, click rate, conversion
- [ ] Unsubscribe tracking (GDPR)
- [ ] Revenue attribution (ROI of campaign)

**Effort:** 4 jours (Backend + Frontend)

---

#### Feature 3.10: API & Integrations

**User Story:**
```
"En tant que 3rd party developer, j'ai:
1. Stable REST API with API key auth
2. Webhook support (order.created, inventory.updated)
3. SDK for Python/JavaScript
4. Rate limiting & quotas"
```

**Acceptance Criteria:**
- [ ] Public API docs (OpenAPI/Swagger)
- [ ] API key generation (per customer/developer)
- [ ] Webhook management (subscribe to events)
- [ ] Rate limiting (100 req/min per key)
- [ ] Retry logic (exponential backoff)
- [ ] SDK (Python + JavaScript)
- [ ] Code examples (GitHub)
- [ ] Support channel (dedicated Slack)

**Effort:** 4 jours (Backend)

---

### SPRINT 38-40: Scaling & Polish (3 semaines)

#### Feature 3.11: Infrastructure Scaling (Kubernetes)

**User Story:**
```
"System auto-scales from 10 customers to 1,000 customers
without manual intervention"
```

**Acceptance Criteria:**
- [ ] Kubernetes cluster setup
- [ ] Auto-scaling policies (CPU/memory thresholds)
- [ ] Load balancer (Ingress)
- [ ] Persistent volume for databases
- [ ] Monitoring + alerting (Prometheus)
- [ ] Logging aggregation (ELK or CloudWatch)
- [ ] Cost optimization (spot instances, right-sizing)

**Effort:** 4 jours (DevOps)

---

#### Feature 3.12: Final Polish & Security Audit

**User Story:**
```
"Platform is production-ready, secure, and user-friendly
ready for 100+ customers at launch"
```

**Acceptance Criteria:**
- [ ] Security audit (OWASP Top 10)
- [ ] Penetration test (third-party)
- [ ] Performance audit (Lighthouse, GTmetrix)
- [ ] UX polish (all flows smooth)
- [ ] Accessibility (WCAG AA)
- [ ] Internationalization (FR, AR templates)
- [ ] Documentation (user guides, admin guides)
- [ ] Training videos (product features)
- [ ] Support playbooks (FAQ, troubleshooting)

**Effort:** 3 jours (Product + QA + Support)

---

### ✅ V2 SUCCESS CRITERIA

```
Launch: 30 Aug 2026

CUSTOMERS:
✓ 100+ active customers
✓ 200-250 customers by year-end (growth phase)
✓ NPS >50 sustained
✓ Churn rate: <4% monthly

FEATURES:
✓ All Phase 2 features stable
✓ Forecasting providing accurate recommendations
✓ Multi-location support proven (5+ customers using)
✓ Returns/RMA fully operational
✓ Referral program active (10%+ referral rate)
✓ Marketing automation campaigns running
✓ API used by 2-3 integration partners

OPERATIONAL:
✓ Uptime: 99.5% sustained
✓ Page load: <1.5s (optimized)
✓ API latency: <100ms p99
✓ Payment success: >99%
✓ Auto-scaling proven (handled 200 concurrent users)

BUSINESS:
✓ ARR: 228K€ (200 customers × 95€ × 12)
✓ Revenue per customer growing (upsell working)
✓ Unit economics strong (LTV:CAC 4.4:1)
✓ Year 2 profit: 88K€ (50% net margin)
✓ Expansion into secondary markets (Sfax, Sousse, Fez, etc.)

TEAM:
✓ Sales team: 2 FTE (closing deals consistently)
✓ Support team: 3 FTE (NPS driven, high CSAT)
✓ Engineering: Stable, predictable delivery
✓ Company: Sustainable, profitable path

STRATEGIC:
✓ Market fit validated (strong traction)
✓ Competitive advantage established
✓ Technology defensible (white-label, multi-tenant)
✓ Ready for Series A or bootstrap profitability
```

---

## 🎯 MATRICE DE PRIORITÉS

### MUST-HAVE (Phase 1-2)

```
V0 (MVP):
├─ POS basic (ring-up, cash, Konnect)
├─ E-commerce (product listing, cart, checkout)
├─ Inventory (basic sync)
└─ Order management (admin view)

V1 (Core Product):
├─ Real-time inventory sync
├─ Shipping integration
├─ Loyalty program
├─ Mobile app
├─ White-label themes
└─ Email automation
```

### SHOULD-HAVE (Phase 2-3)

```
V1-V2:
├─ Advanced analytics
├─ Customer segmentation
├─ Tiered loyalty
├─ Supplier management
├─ RMA/Returns
├─ API & integrations
└─ Multi-location management
```

### NICE-TO-HAVE (Phase 3+)

```
V2+:
├─ Inventory forecasting (AI)
├─ Advanced marketing automation
├─ Warehouse management (advanced)
├─ B2B portal (wholesale)
├─ Subscription orders
└─ Marketplace (3rd party sellers)
```

---

## 🔗 DÉPENDANCES & RISQUES

### Dépendances Critiques

```
1. Payment PSP (Konnect/Stripe) → blocks checkout
   └─ Mitigation: Both integrated, one fallback

2. Hardware (Sunmi POS) → blocks POS launch
   └─ Mitigation: Pre-ordered, backup model (V2S)

3. AWS Infrastructure → blocks scale
   └─ Mitigation: Multi-AZ, cross-region backup

4. Customer 1 data → blocks case study
   └─ Mitigation: Multiple candidates, strong SLA

5. Team availability → blocks timeline
   └─ Mitigation: Competitive salaries, clear roadmap
```

### Risques Produit

```
HIGH:
├─ Oversell still happening (real-time sync fails)
│  └─ Mitigation: Queue-based inventory system, frequent syncs
├─ Competitors enter market faster
│  └─ Mitigation: First-mover advantage, build defensible tech (white-label)
└─ Customer churn (if support poor)
   └─ Mitigation: Dedicated support team, NPS-driven

MEDIUM:
├─ Mobile app adoption slow
│  └─ Mitigation: Free, easy install, push notifications
├─ White-label complexity (brand customization fails)
│  └─ Mitigation: Theme templates, CSS variables
└─ Forecasting inaccuracy (AI fails)
   └─ Mitigation: Manual overrides, always show confidence level
```

---

## 📊 KPIs DE SUCCÈS

### Product Metrics

```
ENGAGEMENT:
├─ Daily Active Users (DAU): 100% of users log in daily
├─ Feature adoption: 80% use loyalty, 90% use inventory
├─ Retention: Week-over-week growth >95%
└─ Churn: <5% monthly

QUALITY:
├─ Bug escape rate: <0.5% (pre-production)
├─ Test coverage: >80%
├─ Performance: page load <2s, API <200ms p99
└─ Uptime: 99.5% monthly

ADOPTION:
├─ Customers per month: 1 (V0) → 50 (V1) → 100+ (V2)
├─ Feature adoption rate: New features adopted by 50% users in 2 weeks
├─ NPS trend: 40 (V0) → 50 (V1) → 60 (V2)
└─ Customer feedback loops: 2+ feedback sessions per month
```

### Business Metrics

```
REVENUE:
├─ MRR growth: 0 → 5K (V1) → 19K (V2)
├─ ARR growth: 0 → 57K (V0) → 228K (V2)
├─ Average revenue per customer: 85-100€/month
└─ Expansion revenue: Upsells to 15%+ customers

GROWTH:
├─ CAC: <2,500€ (phase 2-3)
├─ LTV: >2,500€
├─ LTV:CAC ratio: 3:1 target, 4.4:1 actual
├─ Payback period: <6 months
└─ Viral coefficient: 10% referral rate

RETENTION:
├─ Churn: <5% monthly (phase 1) → <3% (phase 3)
├─ Repeat customer rate: 80%+
├─ Net revenue retention: >100% (expansion revenue)
└─ Customer lifetime: >2 years target
```

### Customer Satisfaction

```
NPS:
├─ V0: >40 (acceptable for beta)
├─ V1: >50 (strong)
└─ V2: >60 (excellent)

CSAT:
├─ Support ticket resolution: 95% within 24h
├─ First-response time: <1h (P0), <4h (P1)
└─ Customer sentiment: 80% positive feedback

PRODUCT-MARKET FIT:
├─ "Would you recommend?" 80%+ (yes)
├─ Top use case clarity: Inventory sync + loyalty
└─ Willingness to pay: 70%+ paying at list price
```

---

## 📅 GANTT OVERVIEW

```
PHASE 0: Spike Tech           |  27-31 Jan  | 1 week
PHASE 1: V0 MVP              |  3 Feb - 17 Mar | 6 weeks
PHASE 2: V1 Complete         |  24 Mar - 10 May | 18 weeks
PHASE 3: V2 Scale            |  13 May - 30 Aug | 16 weeks

BY FEATURE TRACK:
POS:                 S0---S1----S2-----S3--->  (mature by May)
E-commerce:          S0---S1----S2-----S3--->  (mature by May)
Inventory:           S1--S2-----S2-----S3--->  (core by Mar)
Loyalty:                -S2-----S2-----S3--->  (tiered by Aug)
Mobile:                 -S2-----S2-----S3--->  (mature by May)
Analytics:              -S2-----S2-----S3--->  (advanced by Aug)
Returns/RMA:               -S3-----S3------->  (live by Aug)
```

---

## ✅ TEMPLATE: NOUVELLE FEATURE

```markdown
### Feature X.Y: [Feature Name]

**User Story:**
"En tant que [role], je peux [action] pour [benefit]"

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ... (5-10 criteria)

**Dependencies:**
- Feature X (required)
- API endpoint Y (required)
- Component Z (optional)

**Effort:** X days
**Owner:** Backend / Frontend / Full-stack
**Timeline:** Sprint N (Phase M)

**Story Breakdown:**
[Task 1]: [Description] (Owner, X days)
[Task 2]: [Description] (Owner, X days)
...
```

---

**ROADMAP COMPLÈTE. PRÊTE À ÊTRE EXÉCUTÉE. 🚀**
