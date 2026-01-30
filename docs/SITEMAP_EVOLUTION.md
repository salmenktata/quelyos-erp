# 🗺️ Évolution Feature Sitemap Multi-Apps

Documentation complète des 3 versions de la fonctionnalité Sitemap

---

## 📋 Vue d'ensemble

La page Sitemap permet de visualiser et naviguer dans toutes les routes des 4 applications de l'écosystème Quelyos :
- **Vitrine Quelyos** (Next.js 14, port 3000) - Site marketing
- **Dashboard Client** (React/Vite, port 5175) - Backoffice clients
- **Super Admin Client** (React/Vite, port 5176) - Panel super-admin SaaS
- **Boutique E-commerce** (Next.js 16, port 3001) - Frontend e-commerce

**Total routes documentées** : 249 routes

---

## ✅ V1 - MVP (Déployé)

### Fonctionnalités

✅ **Configuration statique** (`super-admin-client/src/config/sitemap.ts`)
- 249 routes hardcodées manuellement
- Métadonnées : name, path, description, module, type (static/dynamic)
- 4 sections apps avec couleurs thème

✅ **Page Sitemap** (`super-admin-client/src/pages/Sitemap.tsx`)
- Barre de recherche (filtre nom, path, module)
- Filtres avancés :
  - Par application (Vitrine, Dashboard, Super Admin, E-commerce)
  - Par module Dashboard (Finance, Store, CRM, HR, POS, Marketing, Support)
  - Par type (Statiques vs Dynamiques)
- URL state (query params pour partage liens)
- Compteurs actifs (résultats filtrés vs total)
- Groupement par module
- Liens cliquables (nouvel onglet)
- Dark/Light mode complet
- Responsive

✅ **Menu navigation**
- Item "Sitemap" dans sidebar super-admin (avant Paramètres)
- Icône : Map (lucide-react)

### Accès

Menu Super Admin → **Sitemap**
URL : `http://localhost:5176/sitemap`

### Avantages MVP

- ✅ Contrôle total sur contenu documenté
- ✅ Descriptions personnalisées
- ✅ Groupement logique
- ✅ Pas de dépendances backend
- ✅ Performance optimale (pas de fetch)

### Inconvénients MVP

- ⚠️ Maintenance manuelle (ajout/suppression route = update config)
- ⚠️ Risque incohérence (oubli mise à jour)
- ⚠️ Pas de détection routes obsolètes
- ⚠️ Pas de healthcheck (routes 404?)

---

## 🚀 V2 - Script Génération Automatique (Prototype)

### Architecture

**Scripts TypeScript** :
- `scripts/generate-sitemap.ts` - Scan 4 apps + génère sitemap.ts
- `scripts/validate-sitemap.ts` - Valide cohérence (détecte manquantes/orphelines)

**Commandes** (package.json root) :
```bash
pnpm generate-sitemap          # Génère sitemap.ts
pnpm generate-sitemap:dry       # Preview sans écrire
pnpm validate-sitemap           # Vérifie cohérence
pnpm validate-sitemap:fix       # Régénère auto si divergence
```

### Scanners par App

1. **Vitrine Quelyos** (Next.js 14)
   - Scan `vitrine-quelyos/app/**/page.tsx`
   - Convert file path → route
   - Détecte routes dynamiques (`[slug]`, `[...slug]`)

2. **Dashboard Client** (React Router)
   - Parse `dashboard-client/src/config/modules.ts`
   - Extract paths + modules
   - Groupement hiérarchique

3. **Super Admin Client** (React Router)
   - Parse `super-admin-client/src/components/Layout.tsx`
   - Extract navigation array
   - Routes statiques simples

4. **Vitrine Client** (Next.js 16)
   - Scan `vitrine-client/src/app/**/page.tsx`
   - Ignore route groups `(shop)`
   - Détecte dynamiques

### Workflow

```
1. Developer modifie code (ajoute/supprime route)
2. CI/CD détecte changement (GitHub Action)
3. Run `pnpm validate-sitemap`
4. Si divergence détectée → Fail + commentaire PR
5. Developer run `pnpm generate-sitemap` localement
6. Commit sitemap.ts mis à jour
7. CI/CD passe ✅
```

### Intégration CI/CD (Optionnel)

`.github/workflows/validate-sitemap.yml` :
```yaml
name: Validate Sitemap

on:
  pull_request:
    paths:
      - 'vitrine-quelyos/app/**'
      - 'dashboard-client/src/pages/**'
      - 'super-admin-client/src/pages/**'
      - 'vitrine-client/src/app/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm validate-sitemap
      - name: Comment PR
        if: failure()
        run: |
          echo "⚠️ Sitemap désynchronisé. Exécutez \`pnpm generate-sitemap\`"
```

### Avantages V2

- ✅ Maintenance nulle (génération auto)
- ✅ Toujours à jour (validation CI)
- ✅ Détecte routes manquantes/orphelines
- ✅ Documentation générée (Markdown export possible)
- ✅ Intégration autres tools (JSON export)

### Inconvénients V2

- ⚠️ Complexité accrue (scripts à maintenir)
- ⚠️ Dépend structure fichiers (conventions strict)
- ⚠️ Pas de healthcheck routes

### État Actuel V2

🟡 **Prototype fonctionnel** avec problème dépendances (`globby@14` incompatible Node 20)

**TODO pour finaliser V2** :
- [ ] Downgrade `globby` vers v13 ou utiliser `fs` natif
- [ ] Tester script sur vraies apps
- [ ] Ajuster parsers selon structures réelles
- [ ] Implémenter export Markdown/JSON
- [ ] Setup GitHub Action validation
- [ ] Ajouter pre-commit hook (optionnel)

---

## 🌐 V3 - Parser Dynamique + Healthcheck (Prototype)

### Architecture

**Backend API** (TODO - à implémenter) :
```
GET /api/v1/sitemap
Response: {
  success: true,
  data: {
    apps: [
      {
        id: "vitrine-quelyos",
        routes: [...],
        health: {
          total: 73,
          ok: 72,
          errors: 1,
          lastChecked: "2026-01-30T17:00:00Z"
        }
      }
    ],
    totalRoutes: 249,
    lastGenerated: "...",
    version: "3.0.0"
  }
}
```

**Frontend API Client** :
- `super-admin-client/src/api/sitemap.ts`
- `fetchSitemapDynamic()` - Charge depuis API
- `healthcheckRoute()` - Ping route (HEAD request)
- `healthcheckApp()` - Batch healthcheck app entière

**Page Dynamique** :
- `super-admin-client/src/pages/SitemapDynamic.tsx`
- Charge routes en runtime
- Bouton "Healthcheck All"
- Affiche status par route (✅ OK, ❌ Error, ⏱️ Unknown)
- Temps de réponse affiché
- Rafraîchissement périodique

### Fonctionnalités V3

✅ **Healthcheck routes**
- Ping toutes les routes (HEAD request)
- Détecte routes cassées (404, 500)
- Mesure temps réponse
- Limite parallélisme (évite rate limiting)

✅ **Dashboard santé**
- Stats par app (OK/Errors)
- Dernière vérification
- Indicateurs visuels (CheckCircle, AlertTriangle)
- Badge routes cassées

✅ **Rafraîchissement intelligent**
- Bouton "Rafraîchir" (recharge API)
- Bouton "Healthcheck" par app
- Cache avec TTL (évite spam API)

✅ **Monitoring continu**
- Historique checks (DB backend)
- Alertes si routes cassées
- Métriques performance

### Workflow V3

```
1. Super-admin ouvre /sitemap
2. Frontend fetch /api/v1/sitemap
3. Backend scanne 4 apps en live
4. Retourne routes + metadata
5. Frontend affiche (loading state)
6. User clique "Healthcheck All"
7. Frontend ping toutes routes (parallèle)
8. Affiche résultats temps réel
9. Routes cassées en rouge avec AlertTriangle
```

### Avantages V3

- ✅ Toujours à jour (runtime)
- ✅ Détecte routes cassées (healthcheck)
- ✅ Pas de rebuild frontend pour MAJ
- ✅ Monitoring continu possible
- ✅ Historique évolution routes
- ✅ Métriques performance (temps réponse)

### Inconvénients V3

- ⚠️ Complexité élevée (backend + DB)
- ⚠️ Latence chargement page (fetch API)
- ⚠️ Healthcheck lent (249 routes × 100ms = 25s)
- ⚠️ CORS issues possibles (cross-origin)
- ⚠️ Rate limiting (trop de requêtes)
- ⚠️ Maintenance backend nécessaire

### État Actuel V3

🟡 **Prototype frontend fonctionnel** (mock API)

**TODO pour finaliser V3** :
- [ ] Implémenter endpoint backend `/api/v1/sitemap`
- [ ] Scanner routes en live (réutiliser logique V2)
- [ ] Base de données (historique healthchecks)
- [ ] Optimiser healthcheck (batch, cache)
- [ ] Gérer CORS (proxy ou credentials)
- [ ] Limiter rate (queue, throttle)
- [ ] Monitoring alertes (webhook si routes cassées)
- [ ] UI polish (graphs évolution, filtres avancés)

### Activer V3 (Test)

Remplacer dans `super-admin-client/src/components/AuthenticatedApp.tsx` :
```tsx
import { Sitemap } from '@/pages/Sitemap'                    // V1
import { SitemapDynamic } from '@/pages/SitemapDynamic'      // V3

// ...
<Route path="sitemap" element={<SitemapDynamic />} />  // Activer V3
```

---

## 📊 Comparatif Versions

| Critère | V1 MVP | V2 Script Auto | V3 Dynamique |
|---------|--------|----------------|--------------|
| **Maintenance** | ❌ Manuelle | ✅ Automatique | ✅ Automatique |
| **Performance** | ✅ Instant | ✅ Build-time | ⚠️ Runtime (fetch) |
| **Healthcheck** | ❌ Aucun | ❌ Aucun | ✅ Complet |
| **Détection obsolètes** | ❌ Non | ✅ Validation | ✅ Runtime |
| **Complexité** | ✅ Simple | ⚠️ Moyenne | ❌ Élevée |
| **Dépendances** | ✅ Aucune | ⚠️ Scripts | ❌ Backend + DB |
| **Latence** | ✅ 0ms | ✅ 0ms (build) | ⚠️ 500ms+ |
| **Historique** | ❌ Non | ❌ Non | ✅ Oui (DB) |
| **Monitoring** | ❌ Non | ❌ Non | ✅ Oui |
| **État** | ✅ Prod | 🟡 Prototype | 🟡 Prototype |

---

## 🎯 Recommandations

### Court terme (0-3 mois)

**Utiliser V1 MVP** (actuel) :
- Configuration manuelle acceptable pour 249 routes
- Routes changent peu fréquemment
- Performance optimale
- Pas de complexité

**Améliorer V1** :
- Export Markdown/JSON (documentation)
- Bookmarks/Favoris (localStorage)
- Copy URL direct (clipboard)

### Moyen terme (3-6 mois)

**Implémenter V2 Script Auto** :
- Fixer problème `globby` (downgrade ou fs natif)
- Tester sur vraies apps
- Intégrer CI/CD (validation PR)
- Gain : maintenance nulle

### Long terme (6-12 mois)

**Évaluer besoin V3** :
- Si problème récurrent routes cassées → V3 utile
- Si équipe > 5 dev → healthcheck précieux
- Si architecture évolue vite → runtime parsing nécessaire
- Sinon V2 suffit largement

---

## 🚧 Migration Path

### V1 → V2

1. Finaliser scripts `generate-sitemap.ts`
2. Run `pnpm generate-sitemap` → vérifier output
3. Comparer avec sitemap.ts actuel (diff)
4. Ajuster parsers si besoin
5. Setup CI/CD validation
6. Workflow dev : git hook pre-commit (optionnel)

### V2 → V3

1. Implémenter endpoint `/api/v1/sitemap`
2. Réutiliser scanners V2 (backend)
3. DB schema healthcheck history
4. Activer `SitemapDynamic.tsx`
5. A/B test (V1 vs V3)
6. Monitoring alertes
7. Progressivement migrer si ROI positif

---

## 📝 Fichiers Clés

### V1 MVP
- `super-admin-client/src/config/sitemap.ts` - Config routes (249)
- `super-admin-client/src/pages/Sitemap.tsx` - Page avec filtres
- `super-admin-client/src/components/Layout.tsx` - Menu item
- `super-admin-client/src/components/AuthenticatedApp.tsx` - Route

### V2 Scripts
- `scripts/generate-sitemap.ts` - Générateur
- `scripts/validate-sitemap.ts` - Validateur
- `package.json` - Scripts pnpm
- `.github/workflows/validate-sitemap.yml` - CI/CD (TODO)

### V3 Dynamique
- `super-admin-client/src/api/sitemap.ts` - API client + healthcheck
- `super-admin-client/src/pages/SitemapDynamic.tsx` - Page V3
- Backend `/api/v1/sitemap` (TODO)
- DB `sitemap_healthcheck` table (TODO)

---

## ✨ Conclusion

**V1 MVP est production-ready et suffit pour l'instant.**

**V2 apporte un gain majeur** (maintenance nulle) pour un effort modéré.

**V3 est overkill sauf si** :
- Équipe large (> 5 dev)
- Architecture volatile
- Besoin monitoring continu
- Problèmes récurrents routes cassées

**Recommandation** : V1 → V2 dans 3-6 mois, V3 seulement si besoin prouvé.

---

**Généré le** : 2026-01-30
**Version** : 1.0.0
**Auteur** : Claude Sonnet 4.5
