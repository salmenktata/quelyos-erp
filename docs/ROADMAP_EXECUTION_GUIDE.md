# ⚙️ ROADMAP PRODUIT — GUIDE D'EXÉCUTION

**Templates, checklists et outils pratiques pour suivre le roadmap**  
**22 Janvier 2026**

---

## 📅 WEEKLY STANDUP TEMPLATE

**When:** Every Monday 10:00 AM  
**Duration:** 30 minutes  
**Attendees:** CTO, all leads (Backend, Frontend, Mobile, DevOps, Product, QA)  
**Owner:** CTO

### Agenda

```
1. PREVIOUS SPRINT REVIEW (10 min)
   ├─ What did we complete?
   ├─ What blocked us?
   └─ Quality: bugs, test coverage, tech debt

2. CURRENT SPRINT STATUS (10 min)
   ├─ What's in flight?
   ├─ What's at risk?
   └─ Do we need to adjust priorities?

3. DECISIONS NEEDED (5 min)
   ├─ Blockers requiring executive decision?
   ├─ Architecture questions?
   └─ Resource reallocation?

4. NEXT STEPS (5 min)
   ├─ Confirm priorities for this week
   └─ Confirm demo date (if applicable)
```

### OUTPUT TEMPLATE

```markdown
## Weekly Standup — [Date] (Sprint [X])

### Sprint Progress: [X%] Complete
✓ Features completed: 1.1 (Odoo provisioning), 1.3 (Product catalog)
🟡 In progress: 1.2 (POS basic), 1.5 (Checkout)
🔴 Blocked: 1.6 (Order mgmt) — Waiting on API endpoint freeze

### Metrics
- Velocity: 13 points (target 12)
- Quality: 2 minor bugs found, 1 critical blocker resolved
- Team health: 1 person sick (BackendDev1), coverage planned

### Decisions Made
- ☐ Postpone 1.7 (Analytics) to Sprint 5-6 to focus on checkout
- ☐ Allocate DevOps 2 extra days to performance optimization

### Risks
🔴 Customer 1 training delay if checkout not stable by Sprint 6
✅ Mitigation: Daily testing + extra QA this week

### Next Sprint Forecast
- Expected: 1.4-1.5 (shop + checkout), 1.6 (order mgmt)
- Buffer: 2 days for bug fixes + technical debt

### Questions for CTO
- Should we hire freelance QA for Phase 2 onboarding of 50 customers?
```

---

## 🎯 SPRINT PLANNING TEMPLATE

**When:** First Monday of sprint  
**Duration:** 2 hours  
**Attendees:** All hands (8.5 FTE)  
**Output:** Assignments, story estimates, sprint goal

### SPRINT PLANNING CHECKLIST

```markdown
## Sprint [X] Planning — [Date]

### SPRINT GOAL
"By [end date], we will [specific, measurable achievement]"

Example: "By Feb 14, we will have POS basic and product catalog 
working, enabling Customer 1 to test ring-up workflows"

### CAPACITY CALCULATION

CTO (1.0 FTE):
  └─ 4 days available (1 day CTO, 1 day meetings, 1 day slack/email)
  └─ Capacity: 4 points
Backend Dev 1 (1.0 FTE):
  └─ 5 days available
  └─ Capacity: 8 points
Backend Dev 2 (1.0 FTE):
  └─ 5 days available
  └─ Capacity: 8 points
Frontend Dev (1.0 FTE):
  └─ 5 days available (if not full POS)
  └─ Capacity: 8 points
DevOps (1.0 FTE):
  └─ 5 days available
  └─ Capacity: 8 points
Mobile Dev (1.0 FTE):
  └─ Not assigned Phase 1
  └─ Capacity: 0 points
QA (1.0 FTE):
  └─ 5 days available (testing 4 days, review 1)
  └─ Capacity: 4 points
Product (1.0 FTE):
  └─ 2 days available (1 day customer, 1 day definition)
  └─ Capacity: 2 points
CEO (0.5 FTE):
  └─ 0 days available (phase 0 decisions only)
  └─ Capacity: 0 points

TOTAL CAPACITY: 42 points

### FEATURE ESTIMATES (Story Points)

Feature 1.1 (Odoo provisioning):
  ├─ Effort: 5 days = 13 points
  ├─ Owner: Backend Dev 1
  └─ Dependencies: AWS account ready

Feature 1.2 (POS basic):
  ├─ Effort: 4 days = 10 points
  ├─ Owner: Backend Dev 1 + Frontend Dev (split)
  └─ Dependencies: POC 1-2 validated

Feature 1.3 (Product catalog):
  ├─ Effort: 2 days = 5 points
  ├─ Owner: Backend Dev 2
  └─ Dependencies: S3 configured

Total Sprint 1-2 Scope: 28 points (66% capacity utilization)
Buffer: 14 points (33% for unknowns, bugs, meetings)

### FEATURE ASSIGNMENT

| Feature | Owner(s) | Points | Priority | Start Date |
|---------|----------|--------|----------|------------|
| 1.1 | Backend 1 | 13 | MUST | 3 Feb |
| 1.2 | Backend 1 + FE | 10 | MUST | 3 Feb |
| 1.3 | Backend 2 | 5 | MUST | 5 Feb |
| Setup | DevOps | 14 | MUST | 3 Feb |
| Testing | QA | 4 | MUST | 7 Feb |

### RISKS & MITIGATIONS

🔴 Risk: Backend Dev 1 sick (single point of failure for Odoo)
✅ Mitigation: Pair programming with Backend Dev 2 on critical paths

🔴 Risk: S3 permissions misconfigured
✅ Mitigation: DevOps dry-run before uploading product images

🟡 Risk: Product catalog import format undefined
✅ Mitigation: Define CSV schema by Feb 5 (Product + Backend 2 sync)

### DEFINITION OF DONE (DOD)

For each feature to be "complete":
- [ ] Code written + committed to main
- [ ] Automated tests pass (>80% coverage)
- [ ] Code review approved (2 reviewers, CTO final)
- [ ] Manual QA passed (test plan defined)
- [ ] Documentation updated (code comments + README)
- [ ] No technical debt introduced (or logged for later)
- [ ] Demo ready (if applicable)

### SPRINT GOAL CONFIRMATION
☐ All team members understand sprint goal?
☐ Are estimates realistic?
☐ Do we have dependencies met?
☐ ✅ Sprint 1-2 planned. Ready to kick off 3 Feb!
```

---

## 📊 FEATURE ESTIMATION TEMPLATE

**Use this for story pointing and effort estimation:**

```markdown
## Feature Estimate: [Feature Name]

### User Story
"En tant que [role], je peux [action] pour [benefit]"

### Acceptance Criteria
- [ ] Criterion 1 (testable)
- [ ] Criterion 2 (testable)
- [ ] Criterion 3 (testable)

### Effort Breakdown

#### Task 1: [Description]
- **Owner:** [Name]
- **Effort:** [X] days
- **Complexity:** Low / Medium / High
- **Dependencies:** [Other tasks/features]
- **Risks:** [What could go wrong?]

#### Task 2: [Description]
- **Owner:** [Name]
- **Effort:** [Y] days
- **Complexity:** Low / Medium / High
- **Dependencies:** [Other tasks/features]
- **Risks:** [What could go wrong?]

#### Task 3: [Description]
...

### TOTAL EFFORT: [Sum of all tasks] days

### STORY POINTS
- 1 point = 1 hour
- 5 points = half-day
- 13 points = 2-3 days
- 21 points = 4-5 days

**Estimate: [X] story points**

### COMPLEXITY ASSESSMENT
```
Complexity Matrix:
- Low (5-8 pts): Uses existing patterns, no unknowns
- Medium (13-21 pts): Some new tech, known risks, 1-2 unknowns
- High (34+ pts): Major unknowns, complex architecture, should break down

This feature: [Medium] complexity
```

### DEPENDENCIES & BLOCKERS
```
MUST HAVE BEFORE START:
- Feature X (required)
- Component Y (required)
- AWS resource Z (required)

NICE TO HAVE:
- Feature A (optional, but would accelerate)

BLOCKERS:
- None identified
```

### ACCEPTANCE TEST CASES

```
TEST CASE 1: Product import CSV
├─ Precondition: Admin user logged in
├─ Steps:
│  1. Click "Import products"
│  2. Upload sample.csv (50 products)
│  3. Confirm imports
├─ Expected: 50 products in database, visible in shop
└─ Actual: [To be tested]

TEST CASE 2: Product image upload
├─ Precondition: Product created
├─ Steps:
│  1. Click "Upload image"
│  2. Select image.jpg (2MB)
│  3. Confirm
├─ Expected: Image in S3, visible in shop <2s
└─ Actual: [To be tested]

[Continue for each acceptance criterion...]
```

### SIGN-OFF
- [ ] Owner estimates: ✓ [Name]
- [ ] Peer review: ✓ [Name]
- [ ] CTO approval: ✓ [CTO]
- [ ] Ready to start: [Date]
```

---

## 🐛 BUG TRIAGE TEMPLATE

**Daily/Weekly triage to prioritize bugs:**

```markdown
## Bug Triage — [Week of Date]

### CRITICAL (Fix immediately)
| ID | Title | Status | Owner | ETA |
|----|-------|--------|-------|-----|
| BUG-001 | POS crashes on payment | 🔴 In Progress | BackendDev1 | Today |
| BUG-002 | Checkout oversells inventory | 🔴 In Progress | BackendDev2 | Today |

**Action:** Pull from sprint capacity, assign now.

### HIGH (Fix this sprint)
| ID | Title | Status | Owner | ETA |
|----|-------|--------|-------|-----|
| BUG-003 | Product image doesn't load from S3 | 🟡 Assigned | DevOps | Wed |
| BUG-004 | Cart persists across sessions | 🟡 Assigned | FrontendDev | Thu |

**Action:** Adjust sprint plan if needed.

### MEDIUM (Fix next sprint)
| ID | Title | Status | Owner | ETA |
|----|-------|--------|-------|-----|
| BUG-005 | Admin analytics slow (>5s) | 📋 Backlog | BackendDev1 | Next sprint |
| BUG-006 | Mobile responsive on tablet broken | 📋 Backlog | FrontendDev | Next sprint |

**Action:** Schedule for next sprint.

### LOW (Won't fix now)
| ID | Title | Reason | Owner |
|----|-------|--------|-------|
| BUG-007 | POS receipt font too small | Low priority, cosmetic | Backlog |

**Action:** Add to "nice-to-have" backlog.

### PROCESS
1. List all open bugs
2. Assign severity (Critical/High/Medium/Low)
3. Assign owner
4. Estimate fix effort
5. Decide: fix now vs. backlog
6. Communicate to team
```

---

## 📈 WEEKLY PROGRESS REPORT

**Report to stakeholders every Friday:**

```markdown
## Weekly Progress Report — Week [X] ([Date])

### SPRINT PROGRESS
- **Sprint:** [X] / [Total sprints in phase]
- **Status:** On track / At risk / Delayed
- **Completion:** [X%]

### COMPLETED THIS WEEK
✓ Feature 1.1 — 90% done (code review pending)
✓ POC 4 — AWS infrastructure live
✓ Decision 1 — PSP Konnect selected & integrated
✓ Hired QA lead (starts Monday)

### IN PROGRESS
🟡 Feature 1.2 — POS basic (on track)
🟡 Feature 1.3 — Product catalog (on track)
🟡 Infrastructure — ECS setup 70% done

### BLOCKED
🔴 Feature 1.5 — Checkout blocked on API finalization
   └─ Mitigation: API deadline moved to Wed, checkout starts Thu
   └─ Impact: Checkout demo pushed from 14 Feb to 17 Feb

### METRICS
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Velocity | 12 pts | 13 pts | ✅ |
| Bug escape | <2% | 0.5% | ✅ |
| Test coverage | >80% | 75% | 🟡 |
| Team capacity | 90% | 85% | ✅ |

### RISKS & MITIGATIONS
🔴 Customer 1 expectations unclear on feature scope
   └─ Mitigation: Requirements workshop scheduled for Feb 12
   └─ Impact: Might delay launch 2-3 days
   └─ Owner: Product + CEO

🟡 DevOps stretched thin (AWS + CI/CD + monitoring)
   └─ Mitigation: Contract freelance DevOps consultant
   └─ Cost: ~2K€
   └─ Owner: CTO to approve by Monday

### DECISIONS MADE
- ☑️ Postpone advanced analytics (1.7) to Phase 2
- ☑️ Use Stripe as fallback for Konnect (approved Monday)
- ☑️ Allocate extra QA resources (2 days/week) for Phase 1

### BUDGET STATUS
- **Allocated:** 126K€
- **Spent YTD:** 18K€ (salaries, AWS, hardware)
- **Remaining:** 108K€
- **Burn rate:** 18K€ / 4 weeks = 4.5K€/week
- **Runway:** 24 weeks (Feb-Aug) ✅

### DEPENDENCIES RESOLVED
✅ Konnect sandbox credentials received
✅ Sunmi hardware pre-ordered (ETA Feb 15)
✅ Customer 1 SLA draft approved
❌ Maroc PSP still pending (Stripe application in progress)

### UPCOMING PRIORITIES
1. 🎯 Finalize API endpoints (next 3 days)
2. 🎯 Customer 1 requirements workshop (Feb 12)
3. 🎯 POS testing on Sunmi hardware (Feb 15+)
4. 🎯 Feature 1.5 checkout demo (Feb 17)

### TEAM NOTES
- Morale: High (shipping real features!)
- Capacity: 1 person sick this week, coverage arranged
- Hiring: QA lead secured, starts Monday
- Learning: Team picking up Odoo quickly

### SIGN-OFF
- **CTO:** ✓ [Name]
- **Product:** ✓ [Name]
- **Date:** [Friday date]
```

---

## 📋 PRE-LAUNCH CHECKLIST (V0)

**30 days before 17 Mar go-live:**

### FUNCTIONAL READINESS (15 Mar)
- [ ] Feature 1.1: Odoo provisioning (tested with multiple tenants)
- [ ] Feature 1.2: POS basic (all flows tested, edge cases handled)
- [ ] Feature 1.3: Product catalog (bulk import + individual creation working)
- [ ] Feature 1.4: Shop listing (all products visible, images loading)
- [ ] Feature 1.5: Checkout (payment successful, order created, receipt printed)
- [ ] Feature 1.6: Order management (admin can view/manage orders)
- [ ] Feature 1.7: Basic analytics (KPI cards showing data)
- [ ] Feature 1.8: Support (training docs complete, team ready)

### OPERATIONAL READINESS
- [ ] Infrastructure: AWS prod environment ready, backup tested
- [ ] Monitoring: CloudWatch + Datadog dashboards live, alerts configured
- [ ] Security: SSL/TLS configured, security audit passed
- [ ] Backup: Automated backup working, restore test <30 min
- [ ] CI/CD: GitHub Actions pipeline working (test → build → deploy)
- [ ] Performance: Load test passed (50 concurrent users)

### QUALITY GATE
- [ ] Test coverage: >80%
- [ ] Bug count: 0 critical, <5 high
- [ ] Code review: All features reviewed + approved
- [ ] Security scan: 0 critical vulnerabilities
- [ ] Performance audit: Page load <2s, API <200ms

### CUSTOMER READINESS
- [ ] Customer 1 site visits: 2 on-site sessions completed
- [ ] Hardware ready: Sunmi terminal tested + configured
- [ ] Training materials: POS + admin guides written + tested
- [ ] Support channel: Slack channel live + team monitoring 24/7
- [ ] SLA signed: Response time <1h for P0, <4h for P1

### LAUNCH CHECKLIST (16 Mar)
- [ ] Database backup completed
- [ ] Infrastructure health check: all services green
- [ ] Team on-call: 2 engineers + 1 product on rotation
- [ ] Customer 1 ready: staff trained + systems tested
- [ ] Communication: status page + customer notification template ready
- [ ] Runbook: incident response procedures documented

### GO/NO-GO DECISION (16 Mar, 4 PM)
```
ALL items above must be ✅ for GO decision.
If ANY item ❌, escalate to CTO immediately.

GO: Proceed to launch 17 Mar
NO-GO: Push launch + schedule recovery meeting
```

---

## 🔄 BACKLOG MANAGEMENT

### Backlog Priorities

```
ICEBOX (Future, >6 months):
├─ B2B portal (wholesale)
├─ Subscription orders
├─ Marketplace (3rd party sellers)
└─ Analytics (advanced, AI-driven)

FEATURES (To be prioritized):
├─ Advanced loyalty (tiered, referral) — Phase 3
├─ Supplier management — Phase 3
├─ Returns/RMA — Phase 3
└─ ...

BUGS (Triaged):
├─ CRITICAL: Fix immediately
├─ HIGH: Fix this sprint
├─ MEDIUM: Fix next sprint
└─ LOW: Backlog

TECH DEBT (Logged for later):
├─ Database optimization needed
├─ Refactor API error handling
├─ Unit test coverage in module X
└─ ...
```

### Adding to Backlog

```markdown
## Backlog Item Template

**Title:** [Feature name or bug description]

**Type:** Feature / Bug / Tech Debt

**Description:**
[What is this? Why does it matter?]

**Impact:**
[How many customers affected? Revenue impact?]

**Effort:**
[Estimate: X days / X story points]

**Priority Score:**
[Calculate: Impact (1-10) × Urgency (1-10) = Score (1-100)]

**Owner (if assigned):** [Name or "Unassigned"]

**Status:** Backlog / Approved / In Progress / Done

Example: Title: "Database slow when 10k+ products"
Type: Bug
Description: Admin dashboard analytics slow (>5s) with large catalogs
Impact: 10%+ of Phase 2 customers (5 companies) affected
Effort: 3 days
Priority: 7 × 8 = 56
Owner: Unassigned
Status: Backlog (scheduled Phase 3)
```

---

## 📞 STAKEHOLDER COMMUNICATION

### Monthly Investor/Board Update

```markdown
## Monthly Update — [Month Year]

### HIGHLIGHTS
✓ Feature 1.1-1.3 shipped on time
✓ Customer 1 onboarding proceeding smoothly
✓ Infrastructure scalable to 100+ customers
✓ Hiring on track (QA lead, support team)

### METRICS
- Customers: 1 (live), 2-50 (in pipeline)
- MRR: $4K (projected)
- NPS: 42 (exceeds target >40)
- Churn: N/A (too early)
- Burn rate: $4.5K/week (on budget)

### ROADMAP STATUS
✅ Phase 0: 100% complete (spike tech validated)
🟡 Phase 1: 60% complete (on track for 17 Mar)
📅 Phase 2: Scheduled 24 Mar - 10 May
📅 Phase 3: Scheduled 13 May - 30 Aug

### CHALLENGES & MITIGATIONS
🔴 Maroc PSP (Stripe) slower than expected
   └─ Mitigation: Fallback to manual payment + wire transfer
   └─ Impact: Maroc customers online May (Phase 2)

🟡 DevOps bandwidth tight
   └─ Mitigation: Hiring freelance consultant
   └─ Cost: 2K€ (within contingency)

### NEXT MONTH PRIORITIES
1. Customer 1 go-live (17 Mar) ✅
2. Onboard customers 2-5 (by 31 Mar)
3. Feature 1.5 (checkout) demo ready
4. Series A fundraising conversations (if pursuing)

### ASK FROM INVESTORS/BOARD
- [ ] Approve budget allocation for freelance DevOps
- [ ] Approve Series A timeline (if applicable)
- [ ] Intro to potential customers (Maroc market)

### SIGN-OFF
- CEO: ✓ [Name]
- Date: [Month]
```

---

## ✅ FINAL CHECKLIST: ROADMAP READY

```
PHASE 0 READY?
☐ All 8 strategic decisions documented
☐ 4 POCs scoped + estimated
☐ Team capacity allocated
☐ Customer 1 identified
☐ Go/No-Go decision framework clear

PHASE 1 READY?
☐ 8 features estimated + assigned
☐ Sprint 1-6 planned
☐ Customer 1 SLA drafted
☐ Support training materials planned
☐ Infrastructure ready (AWS account active)

PHASE 2 READY?
☐ 10 features scoped (high-level)
☐ GTM strategy documented (50 customers by May 10)
☐ Pricing tiers defined
☐ Hiring plan for support team

PHASE 3 READY?
☐ 12 features documented (roadmap level)
☐ Scaling strategy (Kubernetes, multi-region)
☐ Market expansion plan (secondary cities)

TEAM READY?
☐ Roles + responsibilities clear
☐ Communication plan (daily standup, weekly report)
☐ Escalation procedures defined
☐ On-call rotation established

TOOLS READY?
☐ Jira project set up (or alternative)
☐ GitHub repository configured + CI/CD
☐ Datadog monitoring configured
☐ Slack channels created (#engineering, #product, #incidents, etc.)
☐ Google Drive / Confluence for documentation

✅ ROADMAP IS READY FOR EXECUTION!
```

---

**ROADMAP EXÉCUTION COMPLÈTE. TEAM PEUT COMMENCER IMMÉDIATEMENT. 🚀**
