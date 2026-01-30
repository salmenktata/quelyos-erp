# Commande /evolve - Évolution Holistique de Fonctionnalité

## Description

Commande d'analyse et développement holistique pour créer, compléter ou faire évoluer une fonctionnalité en combinant 5 dimensions essentielles :

1. **🧠 Réflexion** - Analyse approfondie avant action
2. **⚙️ Technique & Fonctionnelle** - Aspects tech + métier
3. **🌍 Contexte** - Écosystème et dépendances existantes
4. **🔭 Perspective** - Vision court/moyen/long terme
5. **✨ Amélioration** - Optimisation continue et qualité

---

## Usage

```bash
/evolve <feature>                    # Analyse complète
/evolve <feature> --implement        # Analyse + implémentation
/evolve <feature> --context-only     # Focus sur contexte existant
/evolve <feature> --roadmap          # Vision évolution future
```

**Exemples** :
- `/evolve système de notifications`
- `/evolve export PDF factures --implement`
- `/evolve dashboard analytics --context-only`
- `/evolve multi-devises --roadmap`

---

## Workflow Holistique

### Phase 1 : 🧠 RÉFLEXION (Analyse Avant Action)

**Objectif** : Comprendre le "pourquoi" avant le "comment"

#### 1.1. Clarification du Besoin

**Questions fondamentales** :
1. **Quel est le problème métier** à résoudre ?
2. **Qui sont les utilisateurs** concernés ? (client, admin, super-admin)
3. **Quelle est la valeur ajoutée** réelle ?
4. **Quels sont les critères de succès** mesurables ?

**Méthode** :
```
Si la demande est floue → AskUserQuestion pour clarifier :
- Cas d'usage principal
- Utilisateurs cibles
- Priorité (critique, important, nice-to-have)
- Contraintes techniques/métier
```

#### 1.2. Analyse de l'Existant (Leverage First)

**Vérifie systématiquement** :

1. **Odoo natif offre-t-il déjà cette fonctionnalité ?**
   ```
   WebSearch: "Odoo 19 <feature> documentation"
   ```
   - Modules natifs (`sale`, `account`, `crm`, `stock`, `hr`, etc.)
   - Modules OCA (Odoo Community Association)
   - Possibilité d'héritage/extension

2. **Existe-t-il dans Quelyos Suite ?**
   - Modules similaires dans `odoo-backend/addons/quelyos_api/`
   - Composants React réutilisables dans `dashboard-client/src/components/`
   - Patterns déjà implémentés (voir `.claude/reference/`)

3. **Y a-t-il des bibliothèques tierces pertinentes ?**
   - npm packages pour frontend
   - Python packages pour backend
   - Services externes (APIs, SaaS)

**Output** : Matrice Décision
| Option | Effort | Maintenance | Flexibilité | Recommandation |
|--------|--------|-------------|-------------|----------------|
| Odoo natif | Aucun | Odoo SA | Limitée | ⭐⭐⭐ |
| Extension Odoo | Faible | Partagée | Moyenne | ⭐⭐ |
| Custom Quelyos | Élevé | 100% nous | Totale | ⭐ |
| Lib tierce | Moyen | Dépend lib | Variable | ⭐⭐ |

---

### Phase 2 : 🌍 CONTEXTE (Écosystème Existant)

**Objectif** : Mapper l'environnement technique et fonctionnel

#### 2.1. Cartographie Technique

**Backend (Odoo 19)** :
- [ ] Modèles Odoo impactés (`ir.model`, `res.partner`, etc.)
- [ ] Endpoints API existants (`odoo-backend/addons/quelyos_api/controllers/`)
- [ ] Modules de lib réutilisables (`lib/cache.py`, `lib/audit_log.py`, etc.)
- [ ] Dépendances Python (`__manifest__.py`)

**Frontend (React/Next.js)** :
- [ ] Composants existants à réutiliser
- [ ] Pages similaires (patterns UI/UX)
- [ ] Services API (`src/services/`)
- [ ] State management (Context, hooks)

**Infrastructure** :
- [ ] Base de données (PostgreSQL, migrations nécessaires ?)
- [ ] Cache (Redis, nouvelles clés ?)
- [ ] Queue (tâches asynchrones via `job_queue.py` ?)
- [ ] Webhooks (événements à déclencher ?)

#### 2.2. Cartographie Fonctionnelle

**Dépendances métier** :
- [ ] Quelles autres features dépendent de celle-ci ?
- [ ] Quelles features sont pré-requises ?
- [ ] Impact sur workflows existants ?
- [ ] Impact sur permissions/sécurité multi-tenant ?

**Modules Quelyos** :
- [ ] `home` - Dashboard général
- [ ] `finance` - Comptabilité, factures, paiements
- [ ] `store` - Boutique e-commerce
- [ ] `stock` - Inventaire, stocks
- [ ] `crm` - Clients, opportunités, pipeline
- [ ] `marketing` - Campagnes, analytics
- [ ] `hr` - RH, employés, congés

**Output** : Diagramme Impact
```
[Feature X]
  ↑ Dépend de : Feature A, Feature B
  ↓ Impact sur : Feature C, Feature D
  🔒 Sécurité : Vérif multi-tenant obligatoire
  📊 Analytics : Événements à tracker
```

---

### Phase 3 : ⚙️ TECHNIQUE & FONCTIONNELLE (Design)

**Objectif** : Concevoir la solution optimale

#### 3.1. Spécifications Fonctionnelles

**User Stories** :
```markdown
En tant que [rôle]
Je veux [action]
Afin de [bénéfice]

Critères d'acceptation :
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

**Règles métier** :
- Validations (contraintes, formats)
- Workflows (étapes, transitions)
- Permissions (qui peut faire quoi)
- Notifications (événements à notifier)

#### 3.2. Spécifications Techniques

**Architecture** :

**Backend (Odoo)** :
```python
# Modèle
class FeatureModel(models.Model):
    _name = 'quelyos.feature'
    _inherit = ['mail.thread', 'mail.activity.mixin']  # Héritage si pertinent

    # Champs critiques
    # Méthodes métier
    # Contraintes SQL
    # Sécurité (record rules)

# Endpoint API
@route('/api/v1/feature', auth='public', methods=['GET', 'POST'], csrf=False)
def feature_endpoint(self, **kwargs):
    # Validation
    # Business logic
    # Response
```

**Frontend (React)** :
```tsx
// Page principale
// src/pages/{module}/Feature.tsx

/**
 * Page Feature - [Description]
 *
 * Fonctionnalités :
 * 1. Fonctionnalité 1
 * 2. Fonctionnalité 2
 * 3. Fonctionnalité 3
 * 4. Fonctionnalité 4
 * 5. Fonctionnalité 5
 */

// Structure obligatoire (voir UI_PATTERNS.md)
<Layout>
  <Breadcrumbs items={breadcrumbItems} />
  <Header avec actions />
  <PageNotice notices={notices} />
  {error && <ErrorState />}
  {isLoading ? <SkeletonTable /> : <Content />}
</Layout>
```

**Base de données** :
- Tables/colonnes à créer/modifier
- Index pour performance
- Migrations nécessaires (`models/` → upgrade module)

**Sécurité** :
- [ ] Validation inputs (Zod frontend, Pydantic/Odoo backend)
- [ ] Sanitization (XSS, SQL injection)
- [ ] Authentication (JWT, sessions)
- [ ] Authorization (permissions multi-tenant)
- [ ] Rate limiting (voir `lib/rate_limiter.py`)
- [ ] Audit logs (voir `lib/audit_log.py`)

**Performance** :
- [ ] Cache stratégie (Redis keys, TTL)
- [ ] Pagination (listes > 100 items)
- [ ] Lazy loading (images, composants)
- [ ] Optimistic updates (UX réactive)
- [ ] Background jobs (tâches longues via `job_queue.py`)

#### 3.3. Conformité Standards Projet

**Vérifier respect** :

**CLAUDE.md** :
- [ ] Mode économie tokens (pas d'agents Task inutiles)
- [ ] Pas de modif ports (3000, 3001, 5175, 5176, 8069)
- [ ] Code ESLint-compliant (pas `any`, prefix `_` vars non utilisées)
- [ ] Dark/Light mode (classes `dark:`)
- [ ] Anonymisation Odoo (pas "Odoo" dans UI)
- [ ] Routing anglais, labels français

**UI_PATTERNS.md** :
- [ ] Structure page (Layout, Breadcrumbs, Header, PageNotice)
- [ ] Composants communs (`Button`, `SkeletonTable`, etc.)
- [ ] Gestion états (loading, error, empty)
- [ ] Accessibilité (ARIA, roles)

**API_CONVENTIONS.md** :
- [ ] Format réponses (`{"success": bool, "data": ..., "error": ...}`)
- [ ] Codes HTTP appropriés
- [ ] Versioning API (`/api/v1/`)
- [ ] Documentation endpoints (JSDoc/docstring si complexe)

---

### Phase 4 : 🔭 PERSPECTIVE (Vision Évolutive)

**Objectif** : Anticiper l'évolution future

#### 4.1. Roadmap Court Terme (0-3 mois)

**MVP (Minimum Viable Product)** :
- Fonctionnalités essentielles uniquement
- UI/UX basique mais fonctionnelle
- Tests unitaires critiques

**Critères MVP** :
```markdown
✅ Résout le problème principal
✅ Utilisable en production
✅ Secure (validation, permissions)
✅ Performant (temps réponse < 2s)
⚠️ Peut avoir limitations (features secondaires)
```

#### 4.2. Roadmap Moyen Terme (3-6 mois)

**Améliorations planifiées** :
- Features secondaires (nice-to-have)
- Optimisations performance avancées
- Intégrations tierces
- Analytics/Metrics

**Dettes techniques anticipées** :
- Refactoring prévisible (quand ?)
- Scalabilité (limites actuelles connues)
- Maintenance (dépendances à updater)

#### 4.3. Roadmap Long Terme (6-12 mois)

**Vision stratégique** :
- Évolution architecture (microservices ?)
- Nouvelles plateformes (mobile ?)
- IA/Automation (opportunités ?)
- Internationalisation (i18n ?)

**Anticipation obstacles** :
- Limitations technologiques
- Compatibilité futures versions Odoo
- Évolution réglementaire (RGPD, etc.)

**Output** : Timeline Visuelle
```
📅 Roadmap Feature X

[0-3 mois] MVP
  ├─ Semaine 1-2 : Backend (modèles, API)
  ├─ Semaine 3-4 : Frontend (pages, composants)
  └─ Semaine 5-6 : Tests, déploiement

[3-6 mois] V2
  ├─ Export PDF/Excel
  ├─ Notifications temps réel
  └─ Analytics dashboard

[6-12 mois] V3
  ├─ API publique tierce
  ├─ Mobile app
  └─ IA suggestions
```

---

### Phase 5 : ✨ AMÉLIORATION (Qualité & Optimisation)

**Objectif** : Excellence continue

#### 5.1. Checklist Qualité

**Code Quality** :
- [ ] ESLint/Prettier pass (frontend)
- [ ] Pylint/Black pass (backend)
- [ ] Types stricts (TypeScript, Python type hints)
- [ ] Pas de duplication code (DRY)
- [ ] Commentaires uniquement si logique complexe

**Tests** :
- [ ] Tests unitaires (critiques > 80% coverage)
- [ ] Tests intégration (endpoints API)
- [ ] Tests E2E (user flows critiques)
- [ ] Tests manuels (UX, dark mode, responsive)

**Documentation** :
- [ ] JSDoc/docstrings (fonctions complexes uniquement)
- [ ] README update (si nouveau module)
- [ ] API docs (endpoints publics)
- [ ] Migration guide (si breaking changes)

**Sécurité** :
- [ ] Audit `/security` (scan vulnérabilités)
- [ ] Validation inputs exhaustive
- [ ] Pas de secrets hardcodés (utiliser env vars)
- [ ] Multi-tenant isolation stricte

**Performance** :
- [ ] Bundle size (frontend < 500kb)
- [ ] Temps réponse API (< 200ms p95)
- [ ] Queries DB optimisées (EXPLAIN ANALYZE)
- [ ] Cache hit rate (> 70% si applicable)

**UX/UI** :
- [ ] `/uiux` audit (cohérence design)
- [ ] Dark/Light mode (les deux testés)
- [ ] Responsive (mobile, tablette, desktop)
- [ ] Accessibilité (WCAG 2.1 AA minimum)
- [ ] Loading states (skeleton, spinners)
- [ ] Error messages (clairs, actionnables)

#### 5.2. Patterns d'Amélioration Continue

**Monitoring** :
```python
# Backend - Ajouter métriques
from lib.metrics import track_metric

@track_metric('feature_usage')
def feature_method(self):
    # ...
```

```tsx
// Frontend - Track événements
import { trackEvent } from '@/lib/analytics'

const handleAction = () => {
  trackEvent('feature_action', { metadata })
}
```

**Feedback Loop** :
- [ ] Logs structurés (`@quelyos/logger`)
- [ ] Error tracking (Sentry si configuré)
- [ ] User feedback (surveys, support tickets)
- [ ] Analytics (usage patterns, drop-off)

**Itération** :
1. **Mesurer** : Métriques baseline (avant)
2. **Améliorer** : Implémenter optimisation
3. **Mesurer** : Métriques après
4. **Comparer** : Gain réel vs attendu
5. **Décider** : Garder, ajuster ou rollback

---

## Plan d'Implémentation

### Si `--implement` flag activé

**Étape 1 : Validation Plan**
```markdown
AskUserQuestion:
- Approuver spécifications fonctionnelles ?
- Approuver architecture technique ?
- Approuver roadmap ?
```

**Étape 2 : Implémentation Séquentielle**

**2.1. Backend First**
1. Créer/modifier modèles Odoo (`models/`)
2. Ajouter endpoints API (`controllers/`)
3. Implémenter business logic (`lib/` si réutilisable)
4. Ajouter permissions (`security/ir.model.access.csv`)
5. Tests unitaires (`tests/`)
6. ⚠️ Incrémenter version `__manifest__.py`
7. ⚠️ Alerter upgrade nécessaire (AskUserQuestion)

**2.2. Frontend After**
1. Créer/modifier pages (`src/pages/{module}/`)
2. Créer composants (`src/components/`)
3. Ajouter services API (`src/services/`)
4. Ajouter route menu (`src/config/modules.ts`)
5. Ajouter notices (`src/lib/notices/`)
6. Tests composants (si critiques)

**2.3. Validation Qualité**
```bash
# Frontend
pnpm type-check
pnpm lint
pnpm test

# Backend (après upgrade module)
# Tester endpoints manuellement
# Vérifier logs Odoo
```

**2.4. Commit**
```bash
git add .
git commit -m "feat(module): [description concise]

[Détails si nécessaire]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Étape 3 : Documentation**

**Uniquement si complexe ou demandé explicitement** :
- README module (nouveau module uniquement)
- CHANGELOG (breaking changes)
- Migration guide (modifs DB/API)

---

## Options Avancées

### `--context-only`
**Focus Phase 2 uniquement** : Cartographie exhaustive de l'existant
- Pas de design
- Pas d'implémentation
- Output : Rapport dépendances + impact map

### `--roadmap`
**Focus Phase 4 uniquement** : Vision évolutive
- Analyse tendances tech
- Anticipation besoins futurs
- Output : Timeline + recommandations stratégiques

### `--quick`
**Mode rapide** :
- Skip Phase 1.2 (leverage check si feature évidemment custom)
- Phase 2 allégée (mapping critique uniquement)
- Phase 4 minimal (MVP focus)
- ⚠️ Utiliser seulement si feature simple et bien définie

---

## Anti-Patterns à Éviter

**❌ Coder avant réfléchir**
- Ne JAMAIS commencer par `Write` sans analyse

**❌ Réinventer la roue**
- Toujours checker Odoo natif + modules existants

**❌ Ignorer le contexte**
- Feature isolée = risque incohérence architecture

**❌ Pas de vision long terme**
- Code jetable = dette technique garantie

**❌ Skipper la qualité**
- "On optimisera plus tard" = jamais optimisé

**❌ Over-engineering**
- YAGNI (You Aren't Gonna Need It) : pas features hypothétiques

**❌ Under-engineering**
- Pas de sécurité, pas de tests = bombe à retardement

---

## Output Final

**Rapport structuré Markdown** :

```markdown
# 📋 Rapport Évolution - [Feature]

## 🧠 Réflexion
- **Problème métier** : [description]
- **Utilisateurs** : [cibles]
- **Valeur ajoutée** : [ROI]
- **Décision existant** : [Odoo natif / Extension / Custom]

## 🌍 Contexte
- **Dépendances** : [modules/features]
- **Impact** : [scope changements]
- **Modules impactés** : [liste]

## ⚙️ Spécifications
### Fonctionnelles
- User stories : [liste]
- Règles métier : [liste]

### Techniques
- Backend : [modèles, endpoints]
- Frontend : [pages, composants]
- DB : [migrations]
- Sécurité : [validations, permissions]

## 🔭 Roadmap
- **MVP (0-3 mois)** : [features essentielles]
- **V2 (3-6 mois)** : [améliorations]
- **V3 (6-12 mois)** : [vision long terme]

## ✨ Qualité
- Tests : [coverage]
- Performance : [métriques]
- Sécurité : [audit]
- UX/UI : [conformité]

## 🚀 Plan Action
1. [ ] Backend (X jours)
2. [ ] Frontend (Y jours)
3. [ ] Tests (Z jours)
4. [ ] Déploiement

## ⚠️ Risques & Mitigations
- Risque 1 : [mitigation]
- Risque 2 : [mitigation]
```

---

## Exemples Complets

### Exemple 1 : `/evolve système de notifications`

**Phase 1 - Réflexion** :
- Problème : Utilisateurs ne voient pas événements importants
- Leverage : Odoo a `mail.message` natif → hériter !
- Décision : Étendre module `mail` + custom UI

**Phase 2 - Contexte** :
- Impacte tous modules (finance, crm, hr, etc.)
- Utilise `lib/webhooks.py` existant
- Nécessite WebSocket (`lib/websocket.py`)

**Phase 3 - Technique** :
- Backend : Modèle `quelyos.notification` hérite `mail.message`
- Frontend : Composant `<NotificationCenter>` + Context API
- Temps réel : WebSocket événements

**Phase 4 - Roadmap** :
- MVP : Notifications in-app
- V2 : Email digest (quotidien/hebdo)
- V3 : Push notifications (mobile app)

**Phase 5 - Qualité** :
- Tests : E2E flow notification complète
- Perf : Pagination (max 50 notifs chargées)
- UX : Badge counter temps réel

### Exemple 2 : `/evolve export PDF factures --implement`

**Phase 1 - Réflexion** :
- Problème : Clients veulent factures PDF branded
- Leverage : Odoo `account` a déjà PDF → customiser template !

**Phase 2 - Contexte** :
- Module `finance` existant
- Utilise `report_pdf` Odoo natif
- Template Qweb à override

**Phase 3 - Technique** :
```python
# models/account_move.py (héritage)
class AccountMove(models.Model):
    _inherit = 'account.move'

    def _get_report_base_filename(self):
        return f'Facture_{self.name}'
```

```xml
<!-- views/invoice_template.xml -->
<template id="invoice_pdf_template" inherit_id="account.report_invoice_document">
  <!-- Custom branding -->
</template>
```

**Phase 4 - Roadmap** :
- MVP : PDF basique branded
- V2 : Templates multiples (client, interne, comptable)
- V3 : Génération asynchrone (queue) si > 100 factures

**Phase 5 - Qualité** :
- Test : Générer 1000 PDFs → temps < 30s
- Sécurité : Pas de path traversal dans filename
- UX : Download immédiat, preview modal

**Implémentation** :
```bash
✅ Backend implémenté
✅ Template XML créé
✅ Endpoint /api/v1/invoices/{id}/pdf
✅ Frontend : Button download + preview
✅ Tests : E2E download + vérif contenu PDF
⚠️ Module upgrade nécessaire !

Exécutez : /upgrade-odoo
```

---

## Notes Importantes

### Toujours Respecter

1. **Mode économie tokens** : Pas agents Task inutiles, lectures limitées
2. **Anonymisation Odoo** : Jamais "Odoo" dans UI
3. **Dark/Light mode** : Tester les deux automatiquement
4. **Multi-tenant** : Isolation stricte obligatoire
5. **Upgrade Odoo** : Alerter si modif modèles/DB

### Workflow Odoo Critique

Si modification modèle Odoo :
1. ⚠️ **Alerter AVANT** commit (AskUserQuestion)
2. Incrémenter version `__manifest__.py`
3. Commit code
4. **Utilisateur exécute** : `/upgrade-odoo`
5. Vérifier logs upgrade

### Ne PAS Créer Documentation

Sauf si :
- Explicitement demandé
- Nouveau module (README minimal)
- Breaking changes (migration guide)
- API publique (endpoints docs)

---

## Checklist Finale

Avant de marquer feature "terminée" :

**Fonctionnel** :
- [ ] Résout problème métier identifié
- [ ] Respecte spécifications
- [ ] User stories validées

**Technique** :
- [ ] Code ESLint/Pylint compliant
- [ ] Types stricts
- [ ] Pas de duplication

**Qualité** :
- [ ] Tests pass (unitaires + intégration)
- [ ] Dark/Light mode OK
- [ ] Responsive OK
- [ ] Sécurité audit pass

**Production** :
- [ ] Performance acceptable (< 2s)
- [ ] Logs structurés
- [ ] Error handling complet
- [ ] Multi-tenant isolation

**Documentation** :
- [ ] JSDoc/docstrings (si complexe)
- [ ] README update (si nouveau module)
- [ ] Commit message clair

**Déploiement** :
- [ ] Migrations DB testées
- [ ] Rollback plan défini
- [ ] Monitoring configuré
- [ ] Feature flag (si risqué)

---

## Conclusion

Cette commande `/evolve` force une approche **disciplinée et holistique** pour toute évolution fonctionnelle, garantissant :

✅ **Réflexion** avant action (pas de code inutile)
✅ **Cohérence** avec existant (leverage Odoo + patterns)
✅ **Qualité** dès le début (tests, sécurité, perfs)
✅ **Vision** long terme (pas dette technique)
✅ **Excellence** continue (amélioration itérative)

**Utilisez cette commande systématiquement** pour toute feature non-triviale.
