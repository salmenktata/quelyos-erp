# 📊 DASHBOARD DE SUIVI — SaaS Retail Sport TN/MA

**Mise à jour** : 22/01/2026  
**Status général** : 🟢 READY TO LAUNCH (après validation décisions bloquantes)

---

## 🎯 ACTIONS PRIORITAIRES (À FAIRE CETTE SEMAINE)

### 1️⃣ PSP TUNISIE (Blocker critique)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| **Contacter Konnect** (appel direct, pas email) | Backend Lead | Jan 27 EOD | ⬜ TODO |
| Demander sandbox + API docs | Backend Lead | Jan 28 | ⬜ TODO |
| Créer compte sandbox Konnect | Backend Lead | Jan 29 | ⬜ TODO |
| POC: intégration Konnect (2 days) | Backend Dev 1 | Feb 1 | ⬜ TODO |
| **Fallback: setup Stripe** (si Konnect fails) | Backend Lead | Feb 5 | ⬜ STANDBY |

**Notes** :
- Konnect contact : [À chercher : sales@konnect.tn]
- Stripe test keys : déjà en place (global account)
- Expected outcome : Sandbox ready + first test payment by Feb 1

---

### 2️⃣ PSP MAROC (Blocker critique)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Research PSP Maroc options (Stripe, TMoney, Attijari) | Product | Jan 27 | ⬜ TODO |
| Contact 2 PSP providers | Backend Lead | Jan 28 | ⬜ TODO |
| Evaluate API quality + sandbox access | Backend Lead | Jan 29 | ⬜ TODO |
| POC chosen PSP (2 days) | Backend Dev 2 | Feb 1 | ⬜ TODO |

**Notes** :
- Stripe covers Morocco (if available)
- Alternative: Maroc Telecom Pay, Attijari Wafa Bank
- Expected outcome : PSP chosen + test payment by Feb 1

---

### 3️⃣ HARDWARE POS (Sunmi)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| **Pre-order 5× Sunmi V2 Pro** (expedite to TN/MA) | Infra Lead | Jan 27 EOD | ⬜ TODO |
| Confirm distributor + ETA | Infra Lead | Jan 28 | ⬜ TODO |
| Backup option: source Sunmi V2S (if pro unavailable) | Infra Lead | Jan 30 | ⬜ TODO |
| Test Sunmi drivers + Odoo integration | Infra Lead | Feb 15 | ⬜ STANDBY |

**Notes** :
- Distributors TN : [À chercher]
- Distributors MA : [À chercher]
- Budget : ~450€/unit × 5 = 2,250€

---

### 4️⃣ INFRA CLOUD (Decision)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Compare AWS vs OVH vs DigitalOcean (TCO 12 mois) | DevOps Lead | Jan 27 | ⬜ TODO |
| **Decide: AWS eu-west-1 or OVH graveline** | CTO | Jan 29 | ⬜ TODO |
| Setup AWS account + VPC | DevOps Lead | Jan 31 | ⬜ TODO |
| RDS, S3, IAM roles configured | DevOps Lead | Feb 3 | ⬜ TODO |

**Notes** :
- AWS preferred for scale + CDN
- OVH for cost savings (TN/MA proximity)
- Decision by Wednesday EOD

---

### 5️⃣ TRANSPORTEUR TN (Soft blocker)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Send RFP to 3 providers (Autobacs, DHL, Aramex) | Product Lead | Jan 29 | ⬜ TODO |
| Evaluate API quality + docs | Backend Lead | Feb 3 | ⬜ TODO |
| **Choose primary + backup** | Product Lead | Feb 7 | ⬜ TODO |
| POC integration (2 days) | Backend Dev 1 | Feb 10 | ⬜ STANDBY |

**RFP template** :
```
Subject: API Integration RFP for e-commerce platform (TN)

We're building an omnichannel retail platform for Tunisia.
Need:
- REST API (create shipment, track, generate label)
- Sandbox environment
- Response time <500ms
- 99.5% uptime SLA
- Support contact (email + phone)

Timeline: Decision by Feb 7, POC by Feb 15

Interested?
```

---

### 6️⃣ TRANSPORTEUR MA (Soft blocker)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Send RFP to 3 providers (DHL, Aramex, Maroc Poste) | Product Lead | Jan 29 | ⬜ TODO |
| Evaluate API quality + docs | Backend Lead | Feb 3 | ⬜ TODO |
| **Choose primary + backup** | Product Lead | Feb 7 | ⬜ TODO |

---

### 7️⃣ CONFORMITÉ DATA & LEGAL

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Engage local lawyer (TN + MA) | CEO | Jan 27 | ⬜ TODO |
| Review GDPR requirements | Legal | Jan 31 | ⬜ TODO |
| Draft DPA template | Legal | Feb 5 | ⬜ TODO |
| Review TN data residency laws | Legal | Feb 5 | ⬜ TODO |
| Review MA data residency laws | Legal | Feb 5 | ⬜ TODO |

**Notes** :
- Data must be hosted in TN or MA (not EU)
- GDPR may apply to EU customers' data
- DPA critical before customer 1 go-live

---

### 8️⃣ CUSTOMER 1 PILOT (Soft blocker)

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Identify 3 candidate customers | Product Lead | Jan 27 | ⬜ TODO |
| Initial conversation (pitch) | CEO | Jan 29 | ⬜ TODO |
| **Confirm pilot customer** | CEO | Feb 3 | ⬜ TODO |
| Requirements gathering meeting | Product Lead | Feb 10 | ⬜ TODO |
| Sign pilot agreement (NDA + SLA) | CEO | Feb 14 | ⬜ TODO |

**Pilot terms** :
- 0€ first month (free)
- 50% discount months 2–3
- Dedicated support + daily check-ins
- 2-week UAT window before go-live
- Testimonial rights in exchange

---

## 📅 TIMELINE MACRO

```
┌─────────────────────────────────────────────────────────────┐
│                        2026 ROADMAP                          │
├─────────────────────────────────────────────────────────────┤
│ Q1 (Jan–Mar)                                                │
│ ├─ Week 1 : Decision week (PSP, hardware, infra)            │
│ ├─ Week 2–3 : Spike tech (POC all critical paths)           │
│ ├─ Week 4–8 : V0 infra setup (backup, monitoring, ops)      │
│ └─ Status: Foundation ready                                  │
├─────────────────────────────────────────────────────────────┤
│ Q2 (Apr–Jun)                                                │
│ ├─ Week 9–20 : V1 dev sprints (POS + Web + Mobile + API)    │
│ ├─ Week 21 : UAT + hardening                                │
│ ├─ Week 22–24 : Customer 1 go-live + ramp                   │
│ └─ Status: MVP shipped, 1–2 paying customers                 │
├─────────────────────────────────────────────────────────────┤
│ Q3 (Jul–Sep)                                                │
│ ├─ Week 27–35 : V2 dev (RMA, anti-oversell, COD rules)      │
│ ├─ Week 36–39 : V2 go-live (customers 3–5)                  │
│ └─ Status: Robust, 10–15 paying customers                    │
├─────────────────────────────────────────────────────────────┤
│ Q4 (Oct–Dec)                                                │
│ ├─ Week 40–45 : V3 optional features (loyalty, analytics)   │
│ ├─ Week 45–52 : Sales push, customer acquisition            │
│ └─ Status: 30+ customers, 50K€+ MRR                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 MILESTONES CLÉS

| Milestone | Target | Status | Owner |
|-----------|--------|--------|-------|
| **Decision week** (PSP, infra, hardware) | Jan 31 | ⬜ TODO | CTO |
| **Spike tech done** (4 POCs validated) | Feb 10 | ⬜ STANDBY | Backend Lead |
| **V0 infra ready** (backup/restore tested) | Mar 10 | ⬜ STANDBY | DevOps Lead |
| **V1 sprint 1 complete** (stock+POS) | Mar 24 | ⬜ STANDBY | Backend Lead |
| **Customer 1 UAT starts** | May 15 | ⬜ STANDBY | Product Lead |
| **Customer 1 go-live** | May 29 | ⬜ STANDBY | CTO |
| **3 customers onboarded** | Jun 30 | ⬜ STANDBY | Product Lead |
| **V2 features shipped** | Aug 31 | ⬜ STANDBY | Backend Lead |
| **10+ customers** | Sep 30 | ⬜ STANDBY | Sales |

---

## 👥 TEAM ALLOCATION (Required)

### Core team (must-have)

| Role | FTE | Seniority | Availability | Notes |
|------|-----|-----------|--------------|-------|
| **CTO / Tech Lead** | 1.0 | Senior | 100% | Architecture + decisions |
| **Backend Dev (Odoo)** | 2.0 | Senior | 100% | Core + API |
| **Frontend Dev** | 1.0 | Mid/Senior | 100% | eCommerce + white-label |
| **Mobile Dev (Flutter)** | 1.0 | Mid | 100% | App development |
| **DevOps / Infra** | 1.0 | Mid | 100% | Cloud ops + monitoring |
| **QA / Test** | 1.0 | Mid | 100% | Testing + validation |
| **Product Manager** | 1.0 | Senior | 100% | Customer + roadmap |
| **CEO / Biz Dev** | 1.0 | Senior | 50% | Fundraising + customer 1 |

**Total** : 8.5 FTE (7–8 headcount if some are part-time)

### Extended team (nice-to-have for V2+)

| Role | Timeline | FTE |
|------|----------|-----|
| **POS Hardware specialist** | After Feb 15 | 0.5 |
| **Support engineer** | After Apr 1 | 1.0 |
| **Marketing** | After May 1 | 0.5 |

---

## 💰 BUDGET ESTIMATE

### Dev costs (8.5 FTE × 6 months)

```
Salary avg TN/MA senior dev : ~1500€/month
Benefits + taxes (50%)     : ~750€/month
Cost per dev               : ~2250€/month

8.5 FTE × 2250€ × 6 months = 114,750€
```

### Infra costs (6 months)

```
AWS (compute, DB, storage) : ~500€/month × 6 = 3,000€
Datadog monitoring         : ~200€/month × 6 = 1,200€
SSL certs + domains        : ~50/month × 6 = 300€
Sunmi devices (5 units)    : ~2,250€ (1-shot)
────────────────────────────────────────
Infra total                : ~6,750€
```

### Misc (legal, marketing, ops)

```
Legal (DPA, contracts)     : ~2,000€
Deployment/launch          : ~1,500€
Marketing (website, assets): ~1,000€
────────────────────────────────────────
Misc total                 : ~4,500€
```

### **TOTAL V0→V1 BUDGET** : ~126K€

**Funding needs** :
- Seed: 50K€ (salaries, infra, legal)
- Pre-revenue: 76K€ (more salaries, hardware, support)
- Break-even: Customer 2–3 at month 5–6 (~5K€ MRR)

---

## ⚠️ RISK REGISTER

### RED RISKS (kill the project)

| Risk | Probability | Impact | Mitigation | Status |
|------|------------|--------|-----------|--------|
| **PSP APIs don't exist / API quality poor** | 🟡 Medium | 🔴 Critical | Fallback: Stripe + manual | ⬜ WATCHING |
| **Hardware shortage (Sunmi unavailable)** | 🟡 Medium | 🟡 High | Generic fallback (Epson) | ⬜ WATCHING |
| **Customer 1 no-show / scope creep** | 🔴 High | 🟡 High | Freeze scope by week 10 | ⬜ WATCHING |

### YELLOW RISKS (delay 4+ weeks)

| Risk | Probability | Impact | Mitigation | Status |
|------|------------|--------|-----------|--------|
| **Odoo white-label complexity underestimated** | 🟡 Medium | 🟡 High | Extra 2-week buffer | ⬜ WATCHING |
| **API design misalignment (mobile vs backend)** | 🟢 Low | 🟡 High | Early spike + design review | ⬜ WATCHING |
| **Shipping latency (Sunmi order delays)** | 🟡 Medium | 🟡 Medium | Pre-order immediately | ⬜ ACTION |

---

## 📊 SUCCESS METRICS (V1 Launch)

| Metric | Target | Status |
|--------|--------|--------|
| **API uptime** | 99.5% | ⬜ TBD |
| **Page load time** | <2s desktop | ⬜ TBD |
| **Order creation latency** | <500ms | ⬜ TBD |
| **Customer 1 satisfaction (NPS)** | 40+ | ⬜ TBD |
| **Support response time** | <4h | ⬜ TBD |

---

## 📝 DECISIONS LOG

### Decision 1: PSP Tunisie

**Date** : [Pending]  
**Decision** : [Pending]  
**Rationale** : [To fill]  
**Impact** : Backend effort + integration timeline  
**Owner** : CTO  

---

### Decision 2: Infra cloud provider

**Date** : [Pending]  
**Decision** : [Pending]  
**Rationale** : [To fill]  
**Impact** : Monthly cost + latency + compliance  
**Owner** : CTO  

---

## 🔄 WEEKLY STATUS TEMPLATE

**Week of ______** (date)

### Completions
- [ ] ...

### In progress
- [ ] ...

### Blockers
- [ ] ...

### Next week priorities
- [ ] ...

### Metrics
- Velocity (story points): ...
- Bugs found: ...
- Support tickets: ...

---

## 📞 CONTACTS CLÉS

| Rôle | Nom | Email | Phone | Notes |
|------|-----|-------|-------|-------|
| **CTO** | ? | ? | ? | Architecture decisions |
| **PSP Konnect contact** | ? | ? | ? | Tunisia payment |
| **PSP Maroc contact** | ? | ? | ? | Morocco payment |
| **Sunmi distributor TN** | ? | ? | ? | Hardware pre-order |
| **Sunmi distributor MA** | ? | ? | ? | Hardware pre-order |
| **Autobacs contact** | ? | ? | ? | Transporteur TN |
| **Infra provider** | ? | ? | ? | AWS / OVH support |

---

## ✅ VALIDATION CHECKLIST (Before V1 Launch)

### Product readiness

- [ ] All V1 features implemented + tested
- [ ] Load test passed (100 concurrent users)
- [ ] Security pentest completed (all critical issues fixed)
- [ ] Mobile app review submitted to AppStore + Google Play
- [ ] API docs finalized (OpenAPI)

### Operations readiness

- [ ] Backup/restore tested (< 30 min total)
- [ ] Monitoring alerts working (Slack + email)
- [ ] Support runbook created (>20 scenarios)
- [ ] Disaster recovery tested (database failover)
- [ ] Customer data isolation verified (multi-tenant)

### Customer readiness

- [ ] Hardware delivered + tested
- [ ] Staff training completed (POS + web + mobile)
- [ ] Go-live cutover plan documented
- [ ] Acceptance criteria signed off
- [ ] SLA agreed

### Legal + Compliance

- [ ] DPA signed (GDPR)
- [ ] Data residency confirmed (TN/MA)
- [ ] Insurance checked (cyber liability)
- [ ] Contract signed (SLA + support terms)

---

## 📞 ESCALATION MATRIX

| Issue | Owner | Escalate to | Timeline |
|-------|-------|-------------|----------|
| Technical blocker (PE > 5 days) | Tech Lead | CTO | 24h |
| Customer issue (NPS impact) | Support | Product | 4h |
| Business blocker (revenue impact) | Product | CEO | ASAP |
| Infra issue (downtime) | DevOps | CTO | 1h |
| PSP API fail | Backend | CTO + Product | 2h |

---

**Mis à jour par** : [To fill]  
**Dernière révision** : 22/01/2026  
**Prochaine révision** : 29/01/2026 (après decision week)
