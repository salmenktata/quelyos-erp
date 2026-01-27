# Commande /no-odoo - Détection Références Odoo UI

## Description
Audit et correction des mentions "Odoo" visibles par utilisateurs finaux dans les interfaces frontend et backoffice.

**Exception** : `frontend/src/app/legal/page.tsx` préservée pour conformité licence LGPL-3.0.

## Usage
```bash
/no-odoo              # Audit complet (détection uniquement)
/no-odoo --fix        # Corrections automatiques des violations P0
```

## Workflow

### Étape 1 : Détection
**Cibles** : `frontend/src/` et `backoffice/src/`

**Exclusions** :
- `lib/odoo/` - Code API interne
- `api/` - Endpoints backend
- `frontend/src/app/legal/` - Conformité LGPL
- `*.test.ts`, `*.test.tsx` - Tests unitaires

**Commande Grep** :
```bash
grep -r "Odoo" frontend/src backoffice/src \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=lib/odoo \
  --exclude=*test.ts* \
  | grep -v "frontend/src/app/legal"
```

### Étape 2 : Classification des Violations

**P0 - Critique** (UI visible utilisateur final) :
- Strings affichés : tooltips, messages, labels
- Empty states, error messages
- Exemples : `"dans Odoo"`, `"via Odoo natif"`

**P1 - Important** (métadonnées exposées) :
- Labels de champs : `"ID Odoo"` → `"ID Système"`
- Headers de colonnes

**P2 - Mineur** (optionnel) :
- Commentaires code
- Console.log internes

### Étape 3 : Corrections Automatiques (--fix)

**Mapping de remplacement** :
| Pattern Original | Remplacement |
|-----------------|--------------|
| `dans Odoo` | `dans la configuration système` |
| `via Odoo natif` | `via l'interface d'administration` |
| `l'interface Odoo` | `l'interface d'administration` |
| `gérées dans Odoo` | `gérées dans l'interface d'administration` |
| `configurées dans Odoo` | `configurées dans l'interface d'administration` |
| `ID Odoo` | `ID Système` |

**Application** :
- Mode `--fix` : Edit automatique des fichiers P0
- Sans `--fix` : Rapport uniquement

### Étape 4 : Rapport de Sortie

**Format** :
```
🔍 Violations Odoo UI détectées : 7

[P0] CRITIQUE (6)
  ❌ backoffice/src/components/common/VariantManager.tsx:304
     "dans Odoo" → "dans la configuration système"

  ❌ backoffice/src/components/common/VariantManager.tsx:328
     "modifiez cet attribut dans Odoo" → "...dans la configuration système"

  [...]

[P1] IMPORTANT (1)
  ⚠️  backoffice/src/pages/ProductDetail.tsx:478
     "ID Odoo" → "ID Système"

✅ Exception préservée : frontend/src/app/legal/page.tsx
```

## Tests Post-Correction

### Vérifications Build
```bash
cd backoffice && npm run build  # TypeScript OK
cd frontend && npm run build    # Next.js OK
```

### Vérifications Manuelles UI
1. **VariantManager** : Tooltip attribut sans variantes
2. **Pricelists** : Empty state
3. **PricelistDetail** : Messages règles de prix
4. **Warehouses** : Note configuration
5. **ProductDetail** : Label métadonnée
6. **Legal** : Mentions Odoo présentes ✅

## Intégration CI/CD (Optionnel)

### Hook Pre-Commit
Fichier : `.githooks/pre-commit-no-odoo`
- Bloque commits avec violations P0
- Ignore legal/

### GitHub Actions
Fichier : `.github/workflows/no-odoo-check.yml`
- Check PR automatique
- Bloque merge si violations

## Métriques de Succès

- ✅ 100% violations P0 détectées
- ✅ Corrections ciblées (pas de sur-engineering)
- ✅ Page legal/ préservée (conformité LGPL)
- ✅ Builds frontend/backoffice OK
- ✅ Aucun "Odoo" visible dans UI (hors legal/)

### Étape 5 : Vérifications Sécurité Avancées (--security)

**Mode** : `/no-odoo --security` ou automatique avec `--fix`

**Objectif** : Anonymiser l'infrastructure backend contre reconnaissance automatisée (Wappalyzer, Shodan, BuiltWith)

#### **P0-SEC - Vecteurs Critiques**

**1. Route API publique `/api/odoo/`**
- ❌ Risque : Indicateur évident pour scanners
- ✅ Solution : Renommer → `/api/backend/`
- Fichiers : `vitrine-client/src/app/api/odoo/` + références

**2. Messages d'erreur exposant "Odoo"**
- ❌ `{ error: 'Odoo returned 500' }`
- ✅ `{ error: 'Backend error 500' }`
- Grep : `grep -r "Odoo returned\|Odoo API error" vitrine-client/src/app/api`

**3. Cookie `session_id` typique Odoo**
- ❌ `cookies.set('session_id', ...)`
- ✅ `cookies.set('_auth_token', ...)`
- Fichier : `vitrine-client/src/app/api/auth/[...path]/route.ts:53`

#### **P1-SEC - Métadonnées Exposées**

**4. Hostname `*.odoo.com` dans next.config.ts**
- Supprimer de `remotePatterns` (ligne 16)

**5. Header HTTP `Server: Werkzeug/3.0.1 Python/3.12.3`**
- Masquer via nginx : `proxy_hide_header Server;` + `add_header Server "nginx";`
- Fichier : `nginx/nginx.conf` blocs `/api/` et `/web/`

**6. Commentaires "Odoo" dans config**
- `// Configuration images Odoo` → `// Image proxy configuration`

#### **Vérifications Automatiques**

```bash
# Test header Server masqué
curl -I http://localhost:8069 | grep Server
# Attendu : "Server: nginx"

# Test route /api/backend/ accessible
curl http://localhost:3001/api/backend/ecommerce/site-config
# Attendu : JSON valide (pas 404)

# Test cookie _auth_token créé
# Vérifier DevTools → Application → Cookies après login
```

## Violations Connues Résolues

### UI (Dashboard + Vitrine) - 27 fichiers
1. `ApiGuide.tsx` - P0 : `dans Odoo` → `dans la base de données système` ✅
2. `Tenants.tsx` - P0 : `gérées dans Odoo` → `via l'interface d'administration système` ✅
3. `Warehouses.tsx` - P0 : `via Odoo natif` → `via l'interface d'administration intégrée` ✅
4. `SiteConfig.tsx` - P0 : `dans Odoo` → `dans la base de données système` ✅
5. `stock-notices.ts` - P0 : `dans Odoo` → `dans l'interface d'administration` ✅
6. `ModularLayout.tsx` - P0 : Suppression 4 commentaires "Odoo-style" ✅
7. `finance-notices.ts` - P2 : Fix apostrophes échappées ✅

### Sécurité (Vitrine) - 18 fichiers
8. Route `/api/odoo/` → `/api/backend/` ✅
9. Messages erreur : 14 occurrences "Odoo returned" → "Backend error" ✅
10. Cookie `session_id` → `_auth_token` ✅
11. `next.config.ts` : Commentaire + hostname `*.odoo.com` supprimés ✅
12. `nginx.conf` : Headers `Server` masqués dans `/api/` et `/web/` ✅

### Phase 1 - Infrastructure Hardening ✅ (2026-01-26)

**45 fichiers modifiés** - Infrastructure 100% anonymisée

#### **1. Page test-api supprimée**
```bash
rm -rf vitrine-client/src/app/test-api
```
✅ Aucune URL backend hardcodée exposée publiquement

#### **2. Builds nettoyés**
```bash
rm -rf vitrine-client/.next vitrine-client/out
npm run build  # Rebuild propre
```
✅ Ancien dossier `/api/odoo/` supprimé des artifacts

#### **3. Classe BackendClient**
```ts
// AVANT: export class OdooClient
// APRÈS: export class BackendClient
```
✅ Nom classe anonymisé dans bundles

#### **4. Fonction getBackendImageUrl**
```ts
// AVANT: export function getOdooImageUrl(path)
// APRÈS: export function getBackendImageUrl(path)
```
✅ Nom fonction masqué dans autocomplete DevTools

#### **5. Variables env renommées**
```bash
# 22 fichiers corrigés
ODOO_URL → BACKEND_URL
NEXT_PUBLIC_ODOO_URL → NEXT_PUBLIC_BACKEND_URL
ODOO_DATABASE → BACKEND_DATABASE
```
✅ Aucune variable "ODOO" dans code source

#### **6. Commentaires nettoyés**
- `// Proxies images from Odoo` → `// Proxies images from backend`
- `// Odoo expects JSON-RPC POST` → `// backend expects JSON-RPC POST`
- `// Some Odoo endpoints` → `// Some endpoints`
✅ 15+ commentaires anonymisés

#### **7. Pattern odoo:8069 supprimé**
```ts
// AVANT: url.includes('odoo:8069')
// APRÈS: (supprimé)
```
✅ Pattern Docker hostname éliminé

#### **8. Validation build production**
```bash
Build Output:
  ├ ƒ /api/backend/[...path]  ✅
  ├ ✗ /api/odoo/              (absent) ✅
  ├ ✗ /test-api               (absent) ✅

Bundles statiques:
  - "odoo" occurrences: 15 (legal/node_modules uniquement)
  - "OdooClient": 0 ✅
  - "getOdooImageUrl": 0 ✅
```
