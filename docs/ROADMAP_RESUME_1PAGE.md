# 🎯 QUELYOS ROADMAP — RÉSUMÉ EXÉCUTIF 1-PAGE

**10 mois | 3 phases | 30 features | 8.5 FTE | 126K€ budget**

---

## 📊 TIMELINE MACRO

```
PHASE 0 (1w)     │ PHASE 1 (6w)     │ PHASE 2 (18w)    │ PHASE 3 (16w)
SPIKE TECH      │ V0 MVP           │ V1 COMPLET       │ V2 SCALE
──────────────  │ ──────────────   │ ──────────────   │ ──────────────
27-31 Jan       │ 3 Feb - 17 Mar   │ 24 Mar - 10 May  │ 13 May - 30 Aug
GO/NO-GO        │ 1 customer       │ 50 customers     │ 100+ customers
4 POCs          │ POS + Web live   │ Mobile + loyalty │ Advanced features
                │ NPS >40          │ NPS >50          │ ARR 228K€
```

---

## 🎁 DELIVERABLES PAR PHASE

### PHASE 0: SPIKE TECH (1 week)
**Objectif:** Valider 4 dépendances critiques

| POC | Déliverable | Success Metric |
|-----|-------------|-----------------|
| 1 | Konnect payment flow | Transaction complète <1s |
| 2 | Device Bridge + POS | Receipt impression ✓ + drawer ✓ |
| 3 | API /api/v1 foundation | 6-8 endpoints working |
| 4 | AWS infrastructure | RDS + S3 + monitoring ✓ |

**Decision:** All 4 GREEN/YELLOW = GO V0 (31 Jan)

---

### PHASE 1: V0 MVP (6 weeks) — Customer 1 Live

| # | Feature | Users Impacted | Launch |
|---|---------|----------------|---------| 
| 1.1 | Odoo multi-tenant | All | Week 1 |
| 1.2 | POS basic (ring-up, payment) | Cashiers | Week 1 |
| 1.3 | Product catalog | Admin | Week 1 |
| 1.4 | Shop listing + details | Customers | Week 3 |
| 1.5 | Cart + checkout | Customers | Week 3 |
| 1.6 | Order management | Admin | Week 5 |
| 1.7 | Basic analytics | Owner | Week 5 |
| 1.8 | Customer 1 onboarding | Staff | Week 6 |

**Launch Date:** 17 Mar 2026  
**Success:** 1 customer live, 10+ daily transactions, NPS >40

---

### PHASE 2: V1 COMPLET (18 weeks) — Scale to 50 Customers

**Top 5 Features:**

1. **Real-Time Inventory Sync** (Week 7-11)
   - All channels sync <1s
   - Eliminates 95% oversell

2. **Mobile App** (Week 12-18)
   - Flutter auto-generated per tenant
   - Offline mode + push notifications

3. **White-Label Themes** (Week 12-18)
   - Each customer custom brand
   - CSS variables + preset templates

4. **Shipping Integration** (Week 7-11)
   - TN: Autobacs | MA: DHL
   - Auto-label + tracking

5. **Loyalty Program** (Week 7-11)
   - Points per purchase
   - Redemption at checkout

**Plus:** Customer profiles, email automation, analytics, multiple payments

**Launch Date:** 10 May 2026  
**Success:** 50 customers, NPS >50, Churn <5%

---

### PHASE 3: V2 SCALE (16 weeks) — Advanced + Infrastructure

**Top 5 Features:**

1. **Database Optimization** (Week 26-29)
   - Query optimization
   - Redis caching
   - CDN optimization

2. **Inventory Forecasting** (Week 30-37)
   - AI-powered demand prediction
   - Auto-reorder suggestions

3. **Multi-Location Management** (Week 30-37)
   - Central stock tracking
   - Inter-location transfers

4. **Advanced Loyalty** (Week 30-37)
   - Tiered membership
   - Referral rewards

5. **Kubernetes Scaling** (Week 38-40)
   - Auto-scaling infrastructure
   - Multi-region support

**Plus:** Returns/RMA, supplier management, marketing automation, API ecosystem

**Launch Date:** 30 Aug 2026  
**Success:** 100+ customers, ARR 228K€, 99.5% uptime

---

## 📈 GROWTH TRAJECTORY

```
Customers:     1 → 50 → 100+
               │────┼────┼────│
               Mar  May  Aug

Revenue:       0 → 5K€ → 19K€ (monthly)
               │────┼────┼────│
               
NPS:           40 → 50 → 60+
               │────┼────┼────│

Feature Count: 8 → 18 → 30
               │────┼────┼────│
```

---

## 🎯 PRIORITÉS PAR RÔLE

| Role | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|---------|
| **CTO** | Architecture | Team lead | Scaling | Strategy |
| **Backend** | POC 1,3 | Odoo + API | Integrations | Forecasting |
| **Frontend** | N/A | Shop + POS UI | White-label | Marketing |
| **Mobile** | N/A | N/A | App building | Enhancement |
| **DevOps** | POC 4 | Prod setup | Performance | K8s |
| **QA** | Testing | Phase 1 QA | Automation | Security |
| **Product** | Customer 1 | Onboarding | GTM | Market expansion |

---

## 🚨 TOP 5 RISQUES + MITIGATIONS

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| **Konnect API fails** | 🔴 Critical | Stripe fallback ready, 1-day pivot |
| **Customer 1 no-show** | 🔴 Critical | Backup candidate + binding SLA |
| **Hardware shortage** | 🟡 High | Sunmi pre-ordered, V2S fallback |
| **Market adoption slow** | 🟡 High | Discounts + partnerships + sales team |
| **Team key person leaves** | 🟡 High | Documentation + cross-training |

---

## 📊 SUCCESS METRICS

### V0 Launch (17 Mar)
- ✅ 1 customer live
- ✅ NPS >40 (acceptable)
- ✅ 10+ daily transactions
- ✅ Uptime 99%+

### V1 Launch (10 May)
- ✅ 50 customers active
- ✅ NPS >50 (strong)
- ✅ Churn <5% monthly
- ✅ MRR 5K€

### V2 Launch (30 Aug)
- ✅ 100+ customers
- ✅ NPS >50 sustained
- ✅ ARR 228K€ (full year)
- ✅ 99.5% uptime
- ✅ Infrastructure scalable

---

## 💰 BUDGET ALLOCATION

```
Total Budget: 126K€ (10 months)

Breakdown:
├─ Team salaries (6 months): 95K€
│  └─ CTO (12K€), Backend×2 (24K€), Frontend (12K€), 
│     Mobile (12K€), DevOps (12K€), QA (8K€), 
│     Product (10K€), CEO (5K€)
├─ Infrastructure: 2.1K€
│  └─ AWS RDS, ECS, S3, CloudFront, Datadog
├─ Hardware: 2.25K€
│  └─ 5× Sunmi V2 Pro terminals
├─ Legal/Compliance: 2.5K€
│  └─ DPA, Privacy Policy, CNPD/CNCPD registration
├─ Marketing: 1K€
│  └─ Website, materials
└─ Contingency (10%): 5K€
   └─ Overruns, unknowns, opportunities
```

**Burn rate:** 4.5K€/week (Feb-Aug)  
**Runway:** 24 weeks (covers full timeline) ✅

---

## 🎓 KEY DEPENDENCIES

```
POC 1 (Konnect) 
  └─→ Feature 1.2 (POS payment), 1.5 (Web checkout)

POC 4 (AWS)
  └─→ ALL infrastructure + deployments

Feature 1.1 (Odoo provisioning)
  └─→ All other features (need tenant setup)

Feature 1.4-1.5 (Shop + Checkout)
  └─→ Feature 2.1 (inventory sync depends on orders)

Feature 2.1 (Real-time inventory)
  └─→ Feature 3.4 (forecasting depends on data)
```

**If blocked:** Escalate within 4h, activate mitigation plan

---

## ✅ NEXT STEPS

### THIS WEEK (27-31 Jan)
1. Execute 4 POCs (all team)
2. Finalize 8 strategic decisions (CTO + CEO)
3. Secure Customer 1 contract (CEO)
4. **GO/NO-GO DECISION: Friday 31 Jan**

### NEXT WEEK (3 Feb)
5. Sprint 1-2 planning (all team)
6. Development starts 🚀
7. Daily standup (10 AM)
8. Weekly progress report (Friday)

### MARCH 17
9. **V0 LAUNCH: Customer 1 live**

---

## 📞 QUESTIONS?

| Question | Answer Source |
|----------|----------------|
| What's the full strategy? | 02_STRATEGIE_COMPLETE.md |
| How do we build this tech? | 03_SPECIFICATIONS_TECHNIQUES.md |
| What's the detailed feature spec? | ROADMAP_PRODUIT_QUELYOS.md |
| How do we execute week-by-week? | ROADMAP_EXECUTION_GUIDE.md |
| Who does what? | ROADMAP_PLANIFICATION_QUELYOS.md |

---

## 🎯 BOTTOM LINE

**10 months. 3 releases. 1 vision.**

✓ Feb: Validate product-market fit (1 customer)  
✓ May: Prove scalability (50 customers)  
✓ Aug: Establish market position (100+ customers)  

**By November:** Platform sustainable, profitable, ready for next chapter (Series A or bootstrap scale).

---

**ROADMAP PRÊT. TEAM PRÊT. LANÇONS! 🚀**

