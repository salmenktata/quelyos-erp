# 📊 ROADMAP PRODUIT QUELYOS — GUIDE DE PLANIFICATION

**Document de synthèse: phases, features clés, timeline visuelle et assignation par rôle**  
**22 Janvier 2026**

---

## 📈 TIMELINE VISUELLE (10 MOIS)

### Macro Timeline

```
┌────────────┬─────────────────┬──────────────────────────┬──────────────────────────┐
│  PHASE 0   │   PHASE 1       │     PHASE 2              │      PHASE 3             │
│  SPIKE     │   V0 MVP        │     V1 COMPLET           │      V2 SCALE            │
│            │                 │                          │                          │
│  27-31 Jan │ 3 Feb - 17 Mar  │ 24 Mar - 10 May          │ 13 May - 30 Aug          │
│  (1 week)  │  (6 weeks)      │ (18 weeks)               │ (16 weeks)               │
│            │                 │                          │                          │
│  Validation│ 1 customer live │ 50 customers, white-label│ 100+ customers, advanced │
└────────────┴─────────────────┴──────────────────────────┴──────────────────────────┘
     ▼             ▼                    ▼                            ▼
   GO/NO-GO    LAUNCH 17 MAR       LAUNCH 10 MAY                LAUNCH 30 AUG
   31 JAN      "Ready to grow"     "Market-ready"               "Fully scaled"
```

### Par Feature

```
POS System:           ███████████████████████████████████░░░░░░░░░░░  (optimizing)
E-commerce:           ███████████████████████████████████░░░░░░░░░░░  (optimizing)
Inventory Sync:       ░░░░░███████████████████████████████████░░░░░░  (core feature)
Shipping:             ░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░  (added late V1)
Loyalty Program:      ░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░  (beta → mature)
Mobile App:           ░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░  (launch V1)
White-Label:          ░░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░  (post-V1)
Analytics (Basic):    ░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░░░░░░░  (V1)
RMA/Returns:          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░  (V2)
Forecasting (AI):     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████░░  (V2)

Legend: ███ = Development | ░░░ = Paused/Not started
        
Timeline Jan ─ Feb ─ Mar ─ Apr ─ May ─ Jun ─ Jul ─ Aug ─ Sep ─ Oct ─ Nov ─ Dec
         ▲              ▲              ▲              ▲
       Phase 0        Phase 1        Phase 2        Phase 3
```

---

## 🎯 FEATURES PAR PHASE

### PHASE 0: Validation (27-31 Jan)

| Feature | Effort | Status | Owner |
|---------|--------|--------|-------|
| POC 1: Konnect Integration | 1.5j | 🟡 In Progress | Backend 1 |
| POC 2: Device Bridge (POS Hardware) | 2j | 🟡 In Progress | DevOps |
| POC 3: API /api/v1 Foundation | 1j | 🟡 In Progress | Backend 2 |
| POC 4: AWS Infrastructure | 1.5j | 🟡 In Progress | DevOps |
| **TOTAL** | **6j** | **🟡 On Track** | **All hands** |

**Success Metric:** All 4 POCs GREEN or YELLOW (no RED)  
**Decision:** Go/No-Go 31 Jan (all 8 strategic decisions signed)

---

### PHASE 1: V0 MVP (3 Feb - 17 Mar, 6 weeks)

| Feature | Story | Effort | Sprint | Owner | Status |
|---------|-------|--------|--------|-------|--------|
| **1.1** | Odoo Multi-Tenant Provisioning | 5j | S1-2 | Backend | 🔴 Not started |
| **1.2** | POS Basic (ring-up, payments) | 4j | S1-2 | FE+BE | 🔴 Not started |
| **1.3** | Product Catalog (import, images) | 2j | S1-2 | Backend | 🔴 Not started |
| **1.4** | Website Shop (listing, detail) | 3j | S3-4 | Frontend | 🔴 Not started |
| **1.5** | Shopping Cart + Checkout | 4j | S3-4 | FE+BE | 🔴 Not started |
| **1.6** | Order Management (admin) | 2j | S5-6 | FE+BE | 🔴 Not started |
| **1.7** | Reports + Analytics (basic) | 2j | S5-6 | FE+BE | 🔴 Not started |
| **1.8** | Customer 1 Onboarding | 3j | S5-6 | Product | 🔴 Not started |
| **TOTAL V0** | **8 features, 25j** | **25j** | **S1-6** | **Team** | **🟡 Planned** |

**Launch:** 17 Mar 2026  
**Success Criteria:**
- ✓ 1 customer live
- ✓ POS + Web operational
- ✓ 10+ daily transactions
- ✓ NPS >40
- ✓ No critical bugs

---

### PHASE 2: V1 COMPLET (24 Mar - 10 May, 18 weeks)

| Feature | Story | Effort | Sprint | Owner | Status |
|---------|-------|--------|--------|-------|--------|
| **2.1** | Real-Time Inventory Sync | 5j | S7-11 | BE+FE | 🔴 Not started |
| **2.2** | Shipping Integration | 4j | S7-11 | Backend | 🔴 Not started |
| **2.3** | Customer Loyalty Program | 4j | S7-11 | BE+FE | 🔴 Not started |
| **2.4** | Customer Profiles & CRM | 3j | S7-11 | BE+FE | 🔴 Not started |
| **2.5** | Theme System (white-label) | 4j | S12-18 | Frontend | 🔴 Not started |
| **2.6** | Mobile App (Flutter auto-gen) | 6j | S12-18 | Mobile | 🔴 Not started |
| **2.7** | Admin Dashboard + Analytics | 3j | S12-18 | BE+FE | 🔴 Not started |
| **2.8** | Multiple Payment Methods | 2j | S19-25 | Backend | 🔴 Not started |
| **2.9** | Email Automation | 3j | S19-25 | Backend | 🔴 Not started |
| **2.10** | Advanced Customer Search | 2j | S19-25 | BE+FE | 🔴 Not started |
| **TOTAL V1** | **10 features, 36j** | **36j** | **S7-25** | **Team** | **🟡 Planned** |

**Launch:** 10 May 2026  
**Success Criteria:**
- ✓ 50 active customers
- ✓ Real-time inventory sync
- ✓ White-label working
- ✓ Mobile app live
- ✓ Email automation active
- ✓ NPS >50
- ✓ Churn <5% monthly

---

### PHASE 3: V2 SCALE (13 May - 30 Aug, 16 weeks)

| Feature | Story | Effort | Sprint | Owner | Status |
|---------|-------|--------|--------|-------|--------|
| **3.1** | Database Optimization & Caching | 4j | S26-29 | BE+DevOps | 🔴 Not started |
| **3.2** | CDN Optimization | 2j | S26-29 | DevOps | 🔴 Not started |
| **3.3** | Disaster Recovery & HA | 3j | S26-29 | DevOps | 🔴 Not started |
| **3.4** | Inventory Forecasting (AI) | 4j | S30-37 | Backend | 🔴 Not started |
| **3.5** | Supplier Management & PO | 4j | S30-37 | BE+FE | 🔴 Not started |
| **3.6** | Multi-Location Management | 3j | S30-37 | BE+FE | 🔴 Not started |
| **3.7** | Advanced Loyalty (tiered) | 3j | S30-37 | BE+FE | 🔴 Not started |
| **3.8** | Returns/RMA System | 3j | S30-37 | BE+FE | 🔴 Not started |
| **3.9** | Customer Segmentation & Marketing | 4j | S30-37 | BE+FE | 🔴 Not started |
| **3.10** | API & Integrations | 4j | S30-37 | Backend | 🔴 Not started |
| **3.11** | Infrastructure Scaling (K8s) | 4j | S38-40 | DevOps | 🔴 Not started |
| **3.12** | Final Polish & Security | 3j | S38-40 | Product+QA | 🔴 Not started |
| **TOTAL V2** | **12 features, 41j** | **41j** | **S26-40** | **Team** | **🟡 Planned** |

**Launch:** 30 Aug 2026  
**Success Criteria:**
- ✓ 100+ active customers
- ✓ ARR 228K€ (full year)
- ✓ Infrastructure scalable to 1,000+ customers
- ✓ Advanced features (forecasting, RMA, multi-location)
- ✓ NPS >50 sustained
- ✓ Churn <4% monthly
- ✓ Team profitable path (88K€ net profit Year 2)

---

## 👥 ASSIGNATION PAR RÔLE

### CTO (1.0 FTE) — Ownership: Architecture, API, Decision-making

**Phase 0:**
- [ ] Validate POC 1 (Konnect) design + decisions
- [ ] Validate POC 3 (API) design
- [ ] Tech decisions sign-off (8 strategic decisions)
- [ ] Team lead daily standups
- [ ] Code review (critical paths)

**Phase 1:**
- [ ] 1.1: Odoo multi-tenant architecture design (mentor Backend 1)
- [ ] 1.4-1.5: API endpoint design (with Backend 2)
- [ ] Code review + quality gates
- [ ] Architecture decisions (caching, database schema)
- [ ] **Time allocation:** 30% hands-on code, 70% leadership

**Phase 2:**
- [ ] 2.1: Inventory sync architecture (real-time WebSocket)
- [ ] 2.6: Mobile app API design (with Mobile dev)
- [ ] Scaling strategy for 50 customers
- [ ] **Time allocation:** 20% hands-on code, 80% leadership

**Phase 3:**
- [ ] 3.11: Kubernetes architecture (with DevOps)
- [ ] Performance optimization strategy
- [ ] Infrastructure scaling decisions
- [ ] **Time allocation:** 10% hands-on code, 90% leadership

---

### Backend Devs (2.0 FTE) — Ownership: Odoo modules, API, integrations

**Phase 0:**
- [ ] Backend Dev 1: POC 1 (Konnect payment) ✓
- [ ] Backend Dev 2: POC 3 (API /api/v1) ✓

**Phase 1:**
- [ ] **Backend Dev 1 (Odoo specialist):**
  - [ ] 1.1: Odoo multi-tenant provisioning (5j)
  - [ ] 1.3: Product catalog (2j)
  - [ ] 1.8: Customer 1 technical onboarding (2j)
  - [ ] **Effort:** 9j (full sprint)

- [ ] **Backend Dev 2 (API specialist):**
  - [ ] 1.4-1.5: Shop API + checkout (7j)
  - [ ] 1.6: Order management API (2j)
  - [ ] **Effort:** 9j (full sprint)

**Phase 2:**
- [ ] Dev 1:
  - [ ] 2.1: Real-time inventory sync backend (5j)
  - [ ] 2.4: Customer CRM module (3j)
  - [ ] 2.9: Email automation (3j)
  - [ ] **Effort:** 11j

- [ ] Dev 2:
  - [ ] 2.2: Shipping integration (4j)
  - [ ] 2.8: Multiple payment methods (2j)
  - [ ] 2.10: Advanced search API (2j)
  - [ ] **Effort:** 8j

**Phase 3:**
- [ ] Dev 1:
  - [ ] 3.4: Inventory forecasting (4j)
  - [ ] 3.5: Supplier management (4j)
  - [ ] 3.9: Marketing automation (4j)
  - [ ] **Effort:** 12j

- [ ] Dev 2:
  - [ ] 3.6: Multi-location (3j)
  - [ ] 3.10: API & integrations (4j)
  - [ ] **Effort:** 7j

---

### Frontend Dev (1.0 FTE) — Ownership: React UI, UX

**Phase 0:** N/A (Backend heavy)

**Phase 1:**
- [ ] 1.4: Product listing page + filters (2j)
- [ ] 1.5: Cart + checkout UI (2j)
- [ ] 1.7: Basic analytics dashboard (1.5j)
- [ ] **Effort:** 5.5j (adjust POS if needed)

**Phase 2:**
- [ ] 2.5: Theme system + white-label (4j)
- [ ] 2.7: Admin dashboard enhancement (2j)
- [ ] 2.3-2.4: Loyalty + CRM UI (3j)
- [ ] 2.10: Advanced customer search (1j)
- [ ] **Effort:** 10j

**Phase 3:**
- [ ] 3.5: Supplier management UI (2j)
- [ ] 3.6: Multi-location dashboard (1.5j)
- [ ] 3.9: Marketing campaign builder (3j)
- [ ] **Effort:** 6.5j

---

### Mobile Dev (1.0 FTE) — Ownership: Flutter app

**Phase 0-1:** N/A (focus on POS web)

**Phase 2:**
- [ ] 2.6: Flutter mobile app development (6j)
  - [ ] Product listing
  - [ ] Cart + checkout
  - [ ] Order tracking
  - [ ] Loyalty points view
  - [ ] Offline mode
  - [ ] Auto-generation script

**Phase 3:**
- [ ] Mobile enhancements (push notifications, performance)
- [ ] **Effort:** 2-3j (maintenance mode)

---

### DevOps (1.0 FTE) — Ownership: AWS, CI/CD, monitoring

**Phase 0:**
- [ ] POC 4: AWS infrastructure setup ✓

**Phase 1:**
- [ ] Prod AWS setup (VPC, RDS, ECS, S3)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring dashboards (CloudWatch, Datadog)
- [ ] Database backup automation
- [ ] **Effort:** Full sprint (6 weeks of setup + maintenance)

**Phase 2:**
- [ ] Scaling: auto-scaling groups for 50 customers
- [ ] Performance: caching layer (Redis)
- [ ] CDN: CloudFront optimization
- [ ] Monitoring: cost optimization
- [ ] **Effort:** 2-3j per sprint

**Phase 3:**
- [ ] 3.1-3.3: Performance, disaster recovery, HA
- [ ] 3.11: Kubernetes migration
- [ ] Multi-region setup
- [ ] **Effort:** 11j (infrastructure heavy)

---

### QA (1.0 FTE) — Ownership: Testing, quality gates

**Phase 0:**
- [ ] Test plans for 4 POCs
- [ ] Acceptance testing

**Phase 1:**
- [ ] Create test suites for 8 features
- [ ] Manual QA (UAT with Customer 1)
- [ ] Regression testing (before launch)
- [ ] **Effort:** Full sprint (6 weeks)

**Phase 2:**
- [ ] Automated test coverage (>80%)
- [ ] Performance testing
- [ ] Security testing (OWASP)
- [ ] **Effort:** 1-2j per sprint

**Phase 3:**
- [ ] Load testing (100 concurrent users)
- [ ] Penetration testing
- [ ] Security audit
- [ ] **Effort:** 2-3j per sprint

---

### Product Manager (1.0 FTE) — Ownership: Roadmap, customer feedback, prioritization

**Phase 0:**
- [ ] Secure Customer 1 (pitch, SLA negotiation)
- [ ] Define "ready" criteria for V0

**Phase 1:**
- [ ] Daily sync with Customer 1 (support)
- [ ] Feedback collection
- [ ] Requirements clarification (features)
- [ ] Go-live checklist
- [ ] **Effort:** 3-4j per sprint

**Phase 2:**
- [ ] Onboard customers 2-50
- [ ] Feature prioritization (based on feedback)
- [ ] Roadmap updates
- [ ] Customer interviews (5+ per month)
- [ ] **Effort:** 2-3j per sprint

**Phase 3:**
- [ ] Market expansion strategy
- [ ] Customer success program
- [ ] Feature adoption metrics
- [ ] **Effort:** 2-3j per sprint

---

### CEO (0.5 FTE) — Ownership: Fundraising, Customer 1, decisions

**Phase 0:**
- [ ] All 8 strategic decisions (sign-off)
- [ ] Secure Customer 1 contract
- [ ] Team building (hiring if needed)

**Phase 1:**
- [ ] Weekly Customer 1 sync
- [ ] Weekly investor sync (if fundraising)
- [ ] Team morale + culture
- [ ] **Effort:** 2-3 days per week

**Phase 2:**
- [ ] Investor updates (monthly)
- [ ] Hiring: support team
- [ ] Sales strategy prep
- [ ] **Effort:** 1-2 days per week

**Phase 3:**
- [ ] Series A or bootstrap profitability path
- [ ] Market expansion (partnerships, channels)
- [ ] Team scaling (sales, support)

---

## 🔄 KANBAN VIEW: SPRINT ROADMAP

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SPRINT 1-2 (3-14 Feb)                           │
├─────────────────────────────────────────────────────────────────────────┤
│ TODO                  │ IN PROGRESS              │ DONE                 │
├───────────────────────┼──────────────────────────┼──────────────────────┤
│ 1.3: Product catalog  │ 1.1: Odoo provisioning   │ POC 1-4 (Phase 0)   │
│ 1.5: Cart/checkout    │ 1.2: POS basic           │                      │
│ 1.6: Order mgmt       │ Environment setup        │                      │
└───────────────────────┴──────────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        SPRINT 3-4 (17 Feb - 2 Mar)                      │
├─────────────────────────────────────────────────────────────────────────┤
│ TODO                  │ IN PROGRESS              │ DONE                 │
├───────────────────────┼──────────────────────────┼──────────────────────┤
│ 1.7: Analytics        │ 1.4: Shop listing        │ 1.1: Provisioning   │
│ 1.8: Customer 1 train │ 1.5: Cart + checkout     │ 1.2: POS basic      │
│ QA automation plan    │ Integration testing      │ 1.3: Product catalog│
└───────────────────────┴──────────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        SPRINT 5-6 (3-17 Mar)                            │
├─────────────────────────────────────────────────────────────────────────┤
│ TODO                  │ IN PROGRESS              │ DONE                 │
├───────────────────────┼──────────────────────────┼──────────────────────┤
│ 2.1: Inv. sync        │ 1.6: Order management    │ 1.4: Shop listing   │
│ 2.2: Shipping (TN/MA) │ 1.7: Analytics           │ 1.5: Checkout       │
│                       │ 1.8: Customer 1 training │ 1.7: Analytics      │
│                       │ UAT + go-live prep       │                      │
└───────────────────────┴──────────────────────────┴──────────────────────┘

[Continue S7-40...]
```

---

## 🎯 SUCCESS METRICS CHECKLIST

### Phase 0 (27-31 Jan)

```
DECISION CRITERIA:
☐ All 8 strategic decisions signed (PSP TN/MA, hardware, infra, legal, customer)
☐ All 4 POCs GREEN or YELLOW (no RED blockers)
☐ Customer 1 contract signed
☐ Team 100% committed (no key person departures)
☐ Budget approved (126K€)

SPIKES VALIDATED:
☐ POC 1: Konnect payment flow working end-to-end
☐ POC 2: Device Bridge printing + drawer opening
☐ POC 3: API endpoints responding correctly
☐ POC 4: AWS infrastructure provisioned + backup tested

GO/NO-GO DECISION: All 8 signed + all 4 POCs GREEN/YELLOW = PROCEED V0
```

### Phase 1 (17 Mar launch)

```
OPERATIONAL:
☐ Uptime: 99%+ (4h / month downtime acceptable)
☐ Page load: <2s average
☐ API latency: <200ms p99
☐ Error rate: <2%

FUNCTIONAL:
☐ Customer 1 live on POS + Web
☐ 50+ products in catalog
☐ 10+ daily transactions average
☐ All payments successful
☐ Inventory sync working

QUALITY:
☐ No critical bugs blocking operations
☐ All user stories completed
☐ Test coverage >70%
☐ Security review passed

CUSTOMER:
☐ NPS >40
☐ Training complete
☐ Support team available 24/7
☐ Testimonial collected for case study
```

### Phase 2 (10 May launch)

```
BUSINESS:
☐ 50 active customers (25+ ongoing transactions)
☐ MRR: 5K€ (50 customers × 100€ avg)
☐ Churn: <5% monthly
☐ NPS >50
☐ CAC payback: <6 months

PRODUCT:
☐ Real-time inventory sync <1s
☐ Shipping integrated (TN + MA)
☐ Loyalty program accumulating points
☐ Mobile app downloaded by 10+ customers
☐ White-label themes working
☐ Email automation active

TEAM:
☐ Support team hired (1-2 FTE)
☐ Processes documented
☐ On-call rotation established
☐ Morale high (real product shipped!)
```

### Phase 3 (30 Aug launch)

```
SCALE:
☐ 100+ active customers
☐ Infrastructure handles 1,000+ customers
☐ ARR 228K€ (full year projection)
☐ Net margin: 50%+
☐ Payback period: 1.3 years

PRODUCT MATURITY:
☐ All Phase 2 features stable
☐ Advanced features live (forecasting, RMA, multi-location)
☐ NPS >50 sustained
☐ Churn <4% monthly
☐ Expansion revenue: 15%+ customers upselling

MARKET READINESS:
☐ Competitive feature set
☐ White-label proven (10+ brands)
☐ Mobile app adoption >30%
☐ API used by 2-3 partners
☐ Ready for Series A or profitability path
```

---

## 📋 TEMPLATE: NOUVELLE FEATURE

**Pour ajouter une nouvelle feature au roadmap:**

```markdown
### Feature X.Y: [Feature Name]

**Phase:** [Phase number] | **Sprint:** [Sprint range] | **Effort:** [days]

**User Story:**
"En tant que [role], je peux [action] pour [benefit]"

**Acceptance Criteria:**
- [ ] Criterion 1 (testable, measurable)
- [ ] Criterion 2
- ...

**Why Now?**
[Justification relative à customer needs, strategic priority]

**Dependencies:**
- Feature X (must be completed first)
- Component Y (nice to have)

**Owner:** [Backend / Frontend / Mobile / DevOps]

**Priority:** [MUST / SHOULD / NICE]

**Story Breakdown:**
- Task 1: [Description] (Owner, X days)
- Task 2: [Description] (Owner, Y days)

**Success Metrics:**
- Metric 1: [Target value]
- Metric 2: [Target value]
```

---

## 🚨 CRITICAL PATH

**Features qui bloquent d'autres features:**

```
POC 1 (Konnect) 
  └─ Required by: Feature 1.2 (POS payment), 1.5 (Web checkout)

POC 4 (AWS)
  └─ Required by: ALL deployment + infrastructure

Feature 1.1 (Odoo provisioning)
  └─ Required by: All features (need tenant setup)

Feature 1.4-1.5 (Shop + checkout)
  └─ Required by: Feature 2.1 (inventory sync depends on shop)

Feature 2.1 (Real-time inventory sync)
  └─ Required by: Feature 3.4 (forecasting depends on data)

API Stability (POC 3 + Feature 1.4-1.5)
  └─ Required by: Feature 2.6 (mobile app)
```

**If blocked:**
1. Escalate immediately (CTO)
2. Identify mitigation (workaround or different approach)
3. Adjust timeline (push dependent features)

---

## 🎓 LEARNING RESOURCES

### Odoo Development
- [ ] Odoo Official Docs: https://www.odoo.com/documentation/16.0/
- [ ] OCA Community: https://github.com/OCA
- [ ] Python best practices: https://peps.python.org/pep-0008/

### React + Frontend
- [ ] React Docs: https://react.dev
- [ ] Tailwind CSS: https://tailwindcss.com/docs
- [ ] Component library (shadcn): https://ui.shadcn.com

### Flutter
- [ ] Flutter Docs: https://flutter.dev/docs
- [ ] Dart Language: https://dart.dev

### AWS
- [ ] AWS Free Tier: https://aws.amazon.com/free
- [ ] AWS Certified Solutions Architect: https://aws.amazon.com/certification

### Testing
- [ ] Jest (JavaScript): https://jestjs.io
- [ ] Pytest (Python): https://docs.pytest.org

---

**ROADMAP PLANIFICATION COMPLÈTE. PRÊTE À L'EXÉCUTION. 🚀**
