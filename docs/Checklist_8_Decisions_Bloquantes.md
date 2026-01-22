# ✅ CHECKLIST — 8 Décisions Bloquantes à Valider

**Date** : 22/01/2026  
**Deadline** : 31/01/2026 (FIN SEMAINE 1)  
**Owner** : CTO + Product Lead  

---

## DÉCISION 1️⃣ : PSP TUNISIE (Priorité ABSOLUE)

### Options

**Option A: Konnect** ✅ RECOMMANDÉ
```
✓ API stable (utilisée en production ailleurs)
✓ Sandbox disponible
✓ Documentation basique OK
✓ Support local (Tunisie)
✗ Peut-être docs partielles
```

**Option B: Tunisie Telecom Pay**
```
✗ API quality unknown (unproven)
✗ No public documentation
✗ Slow onboarding expected
✓ Large network coverage
```

**Option C: Hybrid (Konnect + Stripe)**
```
✓ No single point of failure
✓ Can fallback if one fails
✗ Double dev effort (20+ days)
```

### Validation Steps

- [ ] **Week 1 Monday (Jan 27)** : Contact Konnect
  ```
  Who: Product Lead / Backend Lead
  How: Direct phone call (not email first)
  Message: "We're building omnichannel retail platform for TN.
           Need sandbox + documentation for POC.
           Timeline: POC by Feb 10."
  Contact channels:
    - Phone: [rechercher]
    - Email: sales@konnect.tn, support@konnect.tn
    - Linkedin: [rechercher founder/sales]
  ```

- [ ] **Week 1 Tuesday (Jan 28)** : Sandbox credentials received?
  - Sandbox API key : ___________________
  - Sandbox merchant ID : ___________________
  - Test cards : ___________________
  - Webhook secret : ___________________

- [ ] **Week 1 Wednesday (Jan 29)** : Review API docs
  - Download/review Konnect API v2 docs
  - Identify endpoints needed:
    - POST /api/v2/payments (create payment) : ✅ / ❌
    - POST /api/v2/payments/{id}/refunds : ✅ / ❌
    - GET /api/v2/payments/{id} (check status) : ✅ / ❌
    - Webhook format documented : ✅ / ❌
  
- [ ] **Week 2 Thursday (Feb 6)** : POC Konnect (2-day sprint)
  - Test card payment flow (redirect → webhook)
  - Check: order status updates to "Paid"
  - Success rate : ___ %
  - Latency : ___ ms

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Konnect sandbox working, docs OK | **GO** → use Konnect |
| ⚠️ Konnect slow docs, but solvable | **GO** → use Konnect + fallback plan |
| 🔴 Konnect unavailable / API broken | **GO** → fallback to Stripe immediately |

**Decision date** : ________  
**Chosen** : ☐ Konnect / ☐ Stripe / ☐ Hybrid  
**Owner sign-off** : CTO _____________

---

## DÉCISION 2️⃣ : PSP MAROC (Priorité ABSOLUE)

### Options

**Option A: Stripe** ✅ RECOMMANDÉ (IF AVAILABLE IN MOROCCO)
```
✓ Global SaaS standard
✓ Excellent documentation
✓ Sandbox + test mode
✓ Multi-currency support
✗ May not cover all Morocco scenarios
✗ Needs Stripe account setup
```

**Option B: Maroc Telecom Pay**
```
? Unknown API quality
? Documentation sparse
? Local coverage strong
```

**Option C: Attijari Wafa Bank**
```
? Large bank integration
? May have B2B API
? Unknown implementation effort
```

### Validation Steps

- [ ] **Week 1 Tuesday (Jan 28)** : Research Maroc PSP options
  - Stripe coverage in Morocco : ✅ / ❌
  - Stripe available via partner : ✅ / ❌ [Partner name: ___]
  - Maroc Telecom Pay API public : ✅ / ❌
  - Attijari Wafa Bank B2B API : ✅ / ❌

- [ ] **Week 1 Wednesday (Jan 29)** : Contact 2 PSP providers
  ```
  If Stripe available:
    - Create Stripe account (Maroc)
    - Request sandbox mode
    
  Else:
    - Contact Maroc Telecom sales
    - Contact Attijari Wafa Bank FinTech team
    - Request API documentation + sandbox
  ```

- [ ] **Week 1 Thursday (Jan 30)** : Evaluate 2 best options
  - Option 1 (Stripe / TM / Attijari) :
    - API latency : ___ ms
    - Doc quality : 1–5 stars : ___
    - Support responsiveness : 1–5 stars : ___
    - Integration effort : M / L / XL : ___
  
  - Option 2 :
    - [Same evaluation]

- [ ] **Week 2 Friday (Feb 6)** : POC top PSP choice
  - Test payment flow
  - Success rate : ___ %

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Stripe available in Maroc | **GO** → use Stripe |
| ⚠️ Stripe not available, TM API OK | **GO** → use Maroc Telecom Pay |
| 🔴 No PSP with good API | **ESCALATE** → need business decision |

**Decision date** : ________  
**Chosen** : ☐ Stripe / ☐ Maroc Telecom / ☐ Attijari / ☐ Hybrid  
**Owner sign-off** : CTO _____________

---

## DÉCISION 3️⃣ : KIT MATÉRIEL POS (Priorité HAUTE)

### Options

**Option A: Sunmi V2 Pro** ✅ RECOMMANDÉ
```
✓ All-in-one (printer, drawer, scanner, display integrated)
✓ Proven hardware (used by many retail POS platforms)
✓ LAN connectivity (IP-based, LAN bridge friendly)
✓ Thermal printer integrated
✗ ~450€/unit (not cheapest)
```

**Option B: Sunmi V2S + Generic Epson**
```
✓ Cheaper (~350€ total)
✓ V2S is proven (10" display OK)
✗ Generic printer integration (more effort)
✗ Separate cash drawer needed
```

**Option C: Generic POS Hardware**
```
✓ Cheapest
✗ No standardization
✗ High support burden
✗ Integration hell
```

### Validation Steps

- [ ] **Week 1 Monday (Jan 27)** : Find Sunmi distributors TN/MA
  ```
  Tunisia:
    - Distributor 1: _____________ | Contact: _____________ | Phone: _____________
    - Distributor 2: _____________ | Contact: _____________ | Phone: _____________
  
  Morocco:
    - Distributor 1: _____________ | Contact: _____________ | Phone: _____________
    - Distributor 2: _____________ | Contact: _____________ | Phone: _____________
  ```

- [ ] **Week 1 Monday EOD (Jan 27)** : PRE-ORDER 5x Sunmi V2 Pro
  ```
  Specs:
    - Model: Sunmi V2 Pro
    - Quantity: 5 units
    - Delivery: Express to Tunisia (by Feb 10)
  
  Distributor chosen: _____________
  Order reference: _____________
  ETA: _____________
  Budget: 5 × 450€ = 2,250€
  ```

- [ ] **Week 1 Thursday (Jan 30)** : Backup: Order Sunmi V2S (if Pro unavailable)
  ```
  Model: Sunmi V2S
  Quantity: 3 units (backup option)
  Distributor: _____________
  ETA: _____________
  ```

- [ ] **Week 2 Tuesday (Feb 4)** : Sunmi devices shipped?
  - Tracking number TN : _____________
  - Tracking number MA : _____________
  - ETA TN : _____________
  - ETA MA : _____________

- [ ] **Week 3 Thursday (Feb 13)** : Devices arrived + unboxed
  - Serial numbers documented : ✅ / ❌
  - All accessories present : ✅ / ❌
  - Thermal printer working : ✅ / ❌
  - Drawer mechanism tested : ✅ / ❌

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Sunmi V2 Pro arrived + working | **GO** → use V2 Pro as standard |
| ⚠️ V2 Pro delayed, V2S arrived OK | **GO** → use V2S + develop backup |
| 🔴 No Sunmi available | **ESCALATE** + source alternative |

**Decision date** : ________  
**Chosen** : ☐ Sunmi V2 Pro / ☐ Sunmi V2S+Generic / ☐ Other: _____________  
**Order placed** : ✅ / ❌  
**Owner sign-off** : Infra Lead _____________

---

## DÉCISION 4️⃣ : INFRA CLOUD PROVIDER (Priorité HAUTE)

### Options

**Option A: AWS eu-west-1 (Ireland)** ✅ RECOMMANDÉ
```
✓ Global standard (uptime, compliance, support)
✓ Near Europe + good latency to TN/MA
✓ Mature multi-tenant infrastructure
✓ RDS, S3, K8s all excellent
✗ ~15% more expensive than OVH
✗ US company (data residency concern for some)
```

**Option B: OVH (Graveline, France)**
```
✓ Lower cost (~15% cheaper)
✓ Europe-based (GDPR friendly)
✓ Fast setup
✗ Less global coverage
✗ Support slower than AWS
```

**Option C: DigitalOcean**
```
✓ Simple pricing
✓ Fast to deploy
✗ Less enterprise-grade
✗ Limited monitoring/ops tools
```

### Validation Steps

- [ ] **Week 1 Monday (Jan 27)** : Compare TCO (12 months)
  ```
  Assumptions:
  - 10 tenants by month 12
  - Avg DB size: 500MB per tenant
  - Avg traffic: 100 req/sec peak
  
  AWS:
    Compute (t3.xlarge) : $ ___ / month
    RDS (db.m5.large) : $ ___ / month
    S3 storage : $ ___ / month
    Datadog monitoring : $ ___ / month
    ──────────────────────────────
    Total / month: $ ___
    Total / 12 months: $ ___
  
  OVH:
    Compute equivalent : $ ___ / month
    DB managed : $ ___ / month
    Object storage : $ ___ / month
    ──────────────────────────────
    Total / month: $ ___
    Total / 12 months: $ ___
  
  Difference: $ ___ (AWS ~15% more expensive)
  ```

- [ ] **Week 1 Wednesday (Jan 29)** : Decision criteria (weight by importance)
  ```
  Criteria                    Weight  AWS  OVH  Score
  ─────────────────────────────────────────────────
  Reliability (99.9% uptime)   30%   10   7    A: 9.1, O: 7
  Support quality (24/7)       20%   10   6    A: 9.0, O: 6.2
  Ease of scaling             20%   10   7    A: 9.0, O: 7
  Cost                        15%   5    10   A: 5.75, O: 7.5
  Data residency (TN/MA)      15%   7    8    A: 7.1, O: 7.6
  ─────────────────────────────────────────────────
  TOTAL SCORE:                100%   --   --   A: 8.27, O: 7.26
  ```

- [ ] **Week 1 Thursday EOD (Jan 30)** : **DECISION MADE**
  ```
  Criteria winner: _________ (if score >7.5, choose AWS)
  Timeline: AWS setup takes ~1 week vs OVH ~2-3 days
  Choice: ☐ AWS / ☐ OVH / ☐ Hybrid
  
  Recommendation: AWS (slightly higher cost, but:
    - 24/7 support reduces risk
    - Easier scaling for future growth
    - RDS multi-AZ failover automatic
    - Datadog integration seamless)
  ```

- [ ] **Week 2 Monday (Feb 3)** : Cloud account setup
  ```
  AWS:
    ☐ Create AWS account (primary account)
    ☐ Setup billing alerts
    ☐ Create VPC (eu-west-1a, eu-west-1b, eu-west-1c)
    ☐ Setup NAT gateway
    ☐ Create security groups
    ☐ Create RDS subnet group
  
  Timeline: 2–3 days
  Owner: DevOps Lead
  ```

- [ ] **Week 2 Wednesday (Feb 5)** : RDS + S3 provisioned
  ```
  RDS:
    ☐ Multi-AZ RDS PostgreSQL (db.m5.large)
    ☐ Backup configuration (daily, 30-day retention)
    ☐ Read replica (optional, for scaling)
    ☐ Parameter group configured
  
  S3:
    ☐ Bucket created (saasretail-prod-eu-west)
    ☐ Versioning enabled
    ☐ Server-side encryption enabled
    ☐ Lifecycle policy (delete old versions after 90 days)
    ☐ CORS configured for web uploads
  
  Timeline: 1–2 days
  ```

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ AWS account + RDS ready | **GO** → proceed to V0 |
| ⚠️ AWS setup delayed, use OVH as interim | **GO** → migrate later if needed |
| 🔴 Cloud provider unavailable | **ESCALATE** |

**Decision date** : ________  
**Chosen** : ☐ AWS / ☐ OVH / ☐ DigitalOcean  
**Account created** : ✅ / ❌  
**Owner sign-off** : DevOps Lead _____________

---

## DÉCISION 5️⃣ : TRANSPORTEUR TUNISIE (Priorité MOYENNE)

### Options

**Option A: Autobacs** ✅ RECOMMANDÉ
```
✓ Largest shipping network in TN
✓ Likely has API
✓ Good reliability
```

**Option B: DHL**
```
✓ International standard
✓ Excellent API documentation
✗ Higher cost
```

**Option C: Aramex**
```
✓ Good coverage
? API quality unknown
```

### Validation Steps

- [ ] **Week 1 Wednesday (Jan 29)** : Send RFP to 3 providers
  ```
  Template email:
  ─────────────────────────────────────
  Subject: API Integration RFP - eCommerce Platform (Tunisia)
  
  Dear [Carrier name],
  
  We're building an omnichannel retail platform for Tunisia.
  We need your shipping API integrated for real-time tracking.
  
  Requirements:
  - REST API (create shipment, get tracking, generate label)
  - Sandbox environment available
  - Response time < 500ms
  - 99.5% uptime SLA
  - Webhook support (delivery status updates)
  - Support contact (email + phone)
  
  Timeline:
  - RFP deadline: Jan 31
  - POC by Feb 15
  - Production ready by May 1
  
  Interested?
  ─────────────────────────────────────
  
  Send to:
    ☐ Autobacs (sales@autobacs.tn, +216 ...)
    ☐ DHL (solutions@dhl.tn, +216 ...)
    ☐ Aramex (biz@aramex.tn, +216 ...)
  ```

- [ ] **Week 2 Monday (Feb 3)** : Evaluate responses
  ```
  Provider | Response? | API available? | Sandbox? | ETA POC | Score
  ─────────────────────────────────────────────────────────────
  Autobacs |  ✅ / ❌  |    ✅ / ❌    |  ✅/❌ |  _____  |  /10
  DHL      |  ✅ / ❌  |    ✅ / ❌    |  ✅/❌ |  _____  |  /10
  Aramex   |  ✅ / ❌  |    ✅ / ❌    |  ✅/❌ |  _____  |  /10
  ```

- [ ] **Week 2 Thursday (Feb 6)** : **DECISION MADE**
  ```
  Primary choice: _____________ (highest score)
  Backup: _____________ (2nd highest)
  
  Contacts:
    Primary: _____________ | Phone: _____________ | Email: _____________
    Backup: _____________ | Phone: _____________ | Email: _____________
  ```

- [ ] **Week 3 Monday (Feb 10)** : POC integration (2 days)
  - Sandbox credentials received : ✅ / ❌
  - Create shipment API working : ✅ / ❌
  - Track shipment working : ✅ / ❌
  - Label PDF generated : ✅ / ❌

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Autobacs API working | **GO** → use Autobacs |
| ⚠️ Autobacs slow, DHL fast | **GO** → switch to DHL |
| 🔴 No provider with good API | **ESCALATE** |

**Decision date** : ________  
**Chosen** : ☐ Autobacs / ☐ DHL / ☐ Aramex  
**Owner sign-off** : Backend Lead _____________

---

## DÉCISION 6️⃣ : TRANSPORTEUR MAROC (Priorité MOYENNE)

### Options

**Option A: DHL** ✅ RECOMMANDÉ
```
✓ International standard
✓ Strong coverage in Morocco
✓ Good API documentation
```

**Option B: Aramex**
```
✓ Good coverage
? API quality unknown
```

**Option C: Maroc Poste**
```
✓ Government entity (reliability)
? API accessibility unknown
```

### Validation Steps

- [ ] **Week 1 Wednesday (Jan 29)** : Send same RFP to Maroc providers
  ```
  Send to:
    ☐ DHL Maroc (solutions@dhl.ma, +212 ...)
    ☐ Aramex Maroc (biz@aramex.ma, +212 ...)
    ☐ Maroc Poste (contact@maroc-poste.ma, +212 ...)
  ```

- [ ] **Week 2 Monday (Feb 3)** : Evaluate responses (same as TN)

- [ ] **Week 2 Thursday (Feb 6)** : **DECISION MADE**
  ```
  Primary choice: _____________ 
  Backup: _____________
  ```

- [ ] **Week 3 Monday (Feb 10)** : POC integration

### GO/NO-GO Decision

**Decision date** : ________  
**Chosen** : ☐ DHL / ☐ Aramex / ☐ Maroc Poste  
**Owner sign-off** : Backend Lead _____________

---

## DÉCISION 7️⃣ : CONFORMITÉ DATA & LEGAL (Priorité HAUTE)

### Options

**Option A: RGPD + Loi TN + Loi MA** ✅ RECOMMANDÉ
```
✓ Full compliance approach
✓ Safe for all customers
✓ Required if serving EU customers
```

**Option B: Minimal compliance**
```
✗ Risk of legal issues
✗ Not recommended
```

### Validation Steps

- [ ] **Week 1 Monday (Jan 27)** : Engage local lawyers
  ```
  Tunisia:
    Lawyer: _________________ | Phone: _________________ | Email: _____________
    Specialty: Data privacy, SaaS contracts
  
  Morocco:
    Lawyer: _________________ | Phone: _________________ | Email: _____________
    Specialty: Data privacy, SaaS contracts
  
  Task:
    ☐ Review GDPR requirements (if serving EU)
    ☐ Review Tunisia data residency laws
    ☐ Review Morocco data residency laws
    ☐ Draft DPA (Data Processing Agreement)
    ☐ Draft SaaS ToS (Terms of Service)
    ☐ Draft Privacy Policy
    ☐ Review insurance (cyber liability)
  ```

- [ ] **Week 1 Friday (Jan 31)** : Initial legal review completed
  ```
  Lawyer feedback:
    ☐ GDPR required? YES / NO
    ☐ Data must be in TN? YES / NO
    ☐ Data must be in MA? YES / NO
    ☐ DPA required? YES / NO
    ☐ Timeline for compliance: _____________
  ```

- [ ] **Week 2 Wednesday (Feb 5)** : Legal documents drafted
  ```
  ☐ DPA template completed
  ☐ ToS template completed
  ☐ Privacy Policy template completed
  ☐ Insurance checked (cyber liability needed?)
  ```

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Legal docs complete, no blockers | **GO** → ready for customers |
| ⚠️ Legal docs in progress | **GO** → launch, finalize by customer 1 |
| 🔴 Legal blockers (residency laws) | **ESCALATE** |

**Decision date** : ________  
**Lawyer assigned** : ☐ TN: _____________ / ☐ MA: _____________  
**Owner sign-off** : CEO _____________

---

## DÉCISION 8️⃣ : CUSTOMER 1 PILOT (Priorité MÉDIA)

### Candidates

**Criteria** :
- 5–15 magasins (small enough for beta, big enough for real use)
- ~200K€–500K€ chiffre TN/MA (willing to try new solution)
- Decision-maker accessible
- Flexible avec feedback / changes

### Validation Steps

- [ ] **Week 1 Monday (Jan 27)** : Identify 3 candidates
  ```
  Candidate 1: _________________ | Contact: _________________ | Phone: _____________
    Location: ☐ TN / ☐ MA
    Magasins: _____
    Chiffre: _____K€
    Pain points: _____________________________________________________________
    Likelihood of saying YES: HIGH / MEDIUM / LOW
  
  Candidate 2: _________________ | Contact: _________________ | Phone: _____________
    [Same format]
  
  Candidate 3: _________________ | Contact: _________________ | Phone: _____________
    [Same format]
  ```

- [ ] **Week 1 Wednesday (Jan 29)** : Pitch to 3 candidates
  ```
  Pitch (30 sec):
  "You're losing sales because POS doesn't talk to website inventory.
   We unified stock across POS + Web + Mobile.
   First customer saved 15h/week on inventory + reduced oversell 30%.
   We'll deploy in 5 days, no IT required.
   Interested in a pilot (discounted first month)?"
  
  Track responses:
    Candidate 1: Interest level 1–10: _____ | Response date: _____
    Candidate 2: Interest level 1–10: _____ | Response date: _____
    Candidate 3: Interest level 1–10: _____ | Response date: _____
  ```

- [ ] **Week 2 Monday (Feb 3)** : **DECISION MADE** (pick highest interest)
  ```
  Chosen: _____________ (Interest: __/10)
  Backup: _____________ (Interest: __/10)
  
  Next step: Schedule 1-hour requirements gathering call
  ```

- [ ] **Week 2 Friday (Feb 7)** : Requirements gathering
  ```
  Call agenda (1 hour):
    ☐ Current systems (POS, if any inventory tracking)
    ☐ Pain points (oversell? stock sync? returns?)
    ☐ Staff size (how many cashiers, magasins)
    ☐ Go-live readiness (when? hardware ready?)
    ☐ Success criteria (KPIs)
  
  Notes:
  _______________________________________________________________________
  _______________________________________________________________________
  ```

- [ ] **Week 2 Friday (Feb 7)** : Pilot agreement
  ```
  Terms:
    ☐ Duration: 3 months (month 1 free, months 2–3 50% discount)
    ☐ Support: Daily check-ins, dedicated Slack channel
    ☐ Feedback: Weekly sync, scope freeze at week 10
    ☐ Testimonial: Permission to use as reference (in exchange for discount)
    ☐ Hardware: We provide Sunmi device + training
    ☐ UAT window: 2 weeks before go-live
  
  Sign date: _____________
  ```

### GO/NO-GO Decision

| Scenario | Action |
|----------|--------|
| ✅ Customer 1 confirmed, agreement signed | **GO** → start customer 1 setup (week 3) |
| ⚠️ Customer 1 delayed, use backup | **GO** → engage backup candidate |
| 🔴 No customer interest | **ESCALATE** → review positioning |

**Decision date** : ________  
**Customer chosen** : _____________  
**Pilot agreement signed** : ✅ / ❌  
**Owner sign-off** : CEO _____________

---

## 📋 SUMMARY CHECKLIST

### All 8 decisions validated?

| # | Decision | Owner | Status | Sign-off |
|---|----------|-------|--------|----------|
| 1️⃣  | PSP Tunisie | CTO | ⬜ TODO | ___ |
| 2️⃣  | PSP Maroc | CTO | ⬜ TODO | ___ |
| 3️⃣  | Kit matériel POS | Infra | ⬜ TODO | ___ |
| 4️⃣  | Infra cloud | DevOps | ⬜ TODO | ___ |
| 5️⃣  | Transporteur TN | Backend | ⬜ TODO | ___ |
| 6️⃣  | Transporteur MA | Backend | ⬜ TODO | ___ |
| 7️⃣  | Conformité legal | CEO | ⬜ TODO | ___ |
| 8️⃣  | Customer 1 | Product | ⬜ TODO | ___ |

### GREEN LIGHT CRITERIA

✅ **All 8 decisions made** with documented rationale  
✅ **No RED risks** without mitigation plan  
✅ **All owners signed off** on their decision  
✅ **Go-to-V0 approved** by CTO + CEO  

**Overall GO/NO-GO** : ☐ GO / ☐ NO-GO  

**If GO** : Start V0 immediately (timeline Feb 10 — Mar 10)  
**If NO-GO** : Document blockers + escalation plan

---

**Completed date** : _________________  
**CTO sign-off** : _________________ (name + date)  
**CEO approval** : _________________ (name + date)
