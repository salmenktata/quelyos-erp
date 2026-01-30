# 🔒 Automatisations Sécurité - Guide de Configuration

Ce document décrit les 3 automatisations sécurité mises en place pour assurer un monitoring continu du projet Quelyos Suite.

---

## 📋 Table des Matières

1. [CI/CD Security Scan (Hebdomadaire)](#1-cicd-security-scan-hebdomadaire)
2. [Quarterly Security Audit (Trimestriel)](#2-quarterly-security-audit-trimestriel)
3. [Sentry Monitoring (Production)](#3-sentry-monitoring-production)

---

## 1. CI/CD Security Scan (Hebdomadaire)

### Description

Workflow GitHub Actions qui s'exécute automatiquement :
- **Tous les lundis à 6h UTC**
- **À chaque push sur `main`** (si `package.json` ou `pnpm-lock.yaml` modifiés)
- **Manuellement** via l'onglet Actions

### Fichier

`.github/workflows/security.yml`

### Scans Effectués

1. **NPM Audit** (JavaScript/TypeScript)
   - Dashboard-client, super-admin-client, vitrine-client, vitrine-quelyos
   - Détecte vulnérabilités CRITICAL/HIGH/MODERATE/LOW
   - **Bloque le build si CRITICAL ou HIGH détectées** ❌

2. **Python Audit** (Backend Odoo)
   - pip-audit sur `odoo-backend/requirements.txt`
   - Détecte vulnérabilités CVE dans dépendances Python

3. **Secret Scanning**
   - Gitleaks : Détection secrets hardcodés (API keys, passwords)
   - TruffleHog : Détection secrets dans historique Git

4. **CodeQL Analysis**
   - Analyse statique JavaScript/Python
   - Détection patterns vulnérables (injection, XSS, etc.)

5. **SAST (Bandit)**
   - Analyse sécurité Python backend
   - Détection HIGH/MEDIUM severity issues

### Configuration

**Variables d'environnement requises :**
```yaml
# .github/workflows/security.yml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'
  PYTHON_VERSION: '3.11'
```

**Secrets GitHub (optionnels) :**
- `GITHUB_TOKEN` : Automatiquement fourni par GitHub Actions

### Exemple de Résultat

```
✅ NPM Audit : 0 CRITICAL, 0 HIGH (build OK)
⚠️  Python Audit : 1 MODERATE (build continue)
✅ Secret Scanning : No secrets found
✅ CodeQL : No vulnerabilities
✅ SAST : 0 HIGH issues
```

### Que Faire si le Build Échoue ?

```bash
# 1. Identifier les vulnérabilités
pnpm audit --audit-level=high

# 2. Tenter auto-fix
pnpm audit fix

# 3. Upgrade manuel si nécessaire
pnpm update <package-name>

# 4. Si aucun fix disponible : migrer vers alternative sécurisée
#    (Exemple : xlsx → exceljs)
```

---

## 2. Quarterly Security Audit (Trimestriel)

### Description

Audit de sécurité **approfondi** exécuté automatiquement le **1er jour de chaque trimestre** (janvier, avril, juillet, octobre) à 9h UTC.

### Fichier

`.github/workflows/security-quarterly.yml`

### Différences vs Scan Hebdomadaire

| Feature | Hebdomadaire | Trimestriel |
|---------|-------------|-------------|
| Fréquence | Tous les lundis | 1er janv/avr/juil/oct |
| NPM Audit | Comptage simple | **Détails vulnérabilités JSON** |
| Python Audit | pip-audit | pip-audit + safety |
| Code Quality Metrics | ❌ | **✅ Compte fichiers TS/Py** |
| Security Best Practices | ❌ | **✅ console.log, XSS, secrets** |
| Issue Creation | ❌ | **✅ (TODO)** |
| Notification | ❌ | **✅ (TODO)** |

### Scans Supplémentaires

#### Code Quality Metrics
```bash
Total TypeScript files : 1245
Total Python files : 389
```

#### Security Best Practices Check

| Check | Status |
|-------|--------|
| console.log usage | ✅ 0 |
| Unsanitized HTML | ✅ 0 |
| Hardcoded secrets | ⚠️ 3 |

### Configuration Schedule

```yaml
# Tous les 1er janvier, avril, juillet, octobre à 9h UTC
on:
  schedule:
    - cron: '0 9 1 1,4,7,10 *'
```

### Actions Manuelles Post-Audit

1. **Lire le rapport** : Actions → Quarterly Security Audit → Summary
2. **Créer issue si CRITICAL/HIGH** :
   ```bash
   gh issue create \
     --title "🔒 [SECURITY] Quarterly Audit - 3 HIGH vulnerabilities" \
     --body "See workflow run: [URL]" \
     --label "security,P0"
   ```
3. **Planifier corrections** : Ajouter à sprint suivant

### Roadmap

**TODO (prochaines itérations) :**
- [ ] Auto-création issue GitHub si CRITICAL/HIGH
- [ ] Notification Slack/Email
- [ ] Dashboard Security Score (A-F)
- [ ] Comparaison trimestre précédent

---

## 3. Sentry Monitoring (Production)

### Description

Monitoring en temps réel des **erreurs** et **événements de sécurité** en production via Sentry.

### Fichiers

- `vitrine-quelyos/app/lib/sentry.ts` : Configuration Sentry
- `vitrine-quelyos/app/lib/logger.ts` : Logger intégré Sentry

### Configuration

#### 1. Créer un Compte Sentry

1. S'inscrire sur [sentry.io](https://sentry.io)
2. Créer un projet **Next.js**
3. Copier le **DSN** (Data Source Name)

#### 2. Ajouter Variables d'Environnement

**.env (local dev)** :
```bash
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@sentry.io/[PROJECT_ID]
```

**GitHub Secrets (production)** :
```bash
# Settings → Secrets → Actions → New repository secret
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@sentry.io/[PROJECT_ID]
```

**Vercel (si déployé sur Vercel)** :
```bash
# Settings → Environment Variables
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@sentry.io/[PROJECT_ID]
```

#### 3. Installer Dépendances

```bash
cd vitrine-quelyos
pnpm add @sentry/nextjs
```

#### 4. Initialiser Sentry

**app/layout.tsx** (ou instrumentation.ts) :
```typescript
import { initSentry } from '@/lib/sentry';

// Initialiser Sentry au démarrage
initSentry();
```

### Usage

#### Capturer Erreurs Automatiquement

```typescript
import { logger } from '@/lib/logger';

try {
  const data = await fetchData();
} catch (error) {
  // En production : envoyé automatiquement à Sentry
  logger.error('Erreur chargement données:', error);
}
```

#### Capturer Événements de Sécurité

```typescript
import { captureSecurityEvent } from '@/lib/sentry';

// Détection injection SQL
captureSecurityEvent('SQL injection attempt detected', {
  type: 'sql_injection',
  userIp: request.ip,
  payload: userInput,
});
```

#### Détecter Patterns Suspects

```typescript
import { detectSuspiciousPatterns } from '@/lib/sentry';

const isSuspicious = detectSuspiciousPatterns(
  userInput,
  'contact-form'
);

if (isSuspicious) {
  // Alerte Sentry automatique + retour erreur
  return { error: 'Invalid input' };
}
```

#### Monitorer Performance API

```typescript
import { monitoredFetch } from '@/lib/sentry';

// Auto-track si > 3s
const data = await monitoredFetch<Product[]>(
  '/api/products',
  { method: 'GET' },
  { operation: 'fetch-products' }
);
```

### Patterns Suspects Détectés

| Pattern | Type | Exemple |
|---------|------|---------|
| `OR.*=` | SQL Injection | `' OR 1=1--` |
| `UNION SELECT` | SQL Injection | `UNION SELECT password` |
| `<script>` | XSS | `<script>alert(1)</script>` |
| `javascript:` | XSS | `javascript:void(0)` |
| `../` | Path Traversal | `../../etc/passwd` |
| `rm -rf` | Command Injection | `; rm -rf /` |

### Alertes Sentry

**Configurées automatiquement :**
1. **Erreurs 5xx** → Alerte immédiate
2. **Performance > 3s** → Warning
3. **Patterns suspects** → Security warning
4. **Rate limit dépassé** → Info

**À configurer dans Sentry UI :**
1. Sentry → Alerts → New Alert Rule
2. Conditions :
   - `event.level = error`
   - `event.tags[security_event] is set`
3. Actions :
   - Send email to `security@quelyos.com`
   - Notify Slack channel `#security-alerts`

### Dashboard Sentry

**Widgets recommandés :**
1. **Errors by Environment** (production vs staging)
2. **Top 10 Issues** (fréquence)
3. **Security Events** (filter: `security_event` tag)
4. **Performance P95** (requêtes > 3s)

### Limites

**Sentry est activé uniquement en production** (`NODE_ENV=production`) pour :
- Éviter bruit développement
- Réduire coûts (plan gratuit : 5k events/mois)
- Protéger vie privée dev

**En développement :**
- Logs console standard
- Pas d'envoi Sentry

---

## 🔄 Workflow Complet

### Développement

```
1. Code feature
2. ESLint local (pre-commit hook)
3. Push vers branche feature
4. CI pipeline + Security scan (si package.json modifié)
5. Code review
6. Merge vers main
```

### Production

```
1. Deploy vers production
2. Sentry monitoring actif (24/7)
3. Alerts si erreurs > seuil
4. Weekly security scan (lundis)
5. Quarterly audit (trimestres)
```

### Incident Sécurité

```
1. Sentry détecte pattern suspect
2. Alert email/Slack
3. Investigation logs Sentry
4. Fix vulnérabilité
5. Deploy hotfix
6. Post-mortem
```

---

## 📊 Métriques de Succès

**Objectifs 2026 :**
- ✅ 0 vulnérabilités CRITICAL/HIGH en production
- ✅ Score sécurité A (95+/100)
- ✅ Temps moyen de résolution P0 : < 48h
- ✅ Audits trimestriels automatiques : 4/an
- ✅ Sentry errors < 10/jour en production

---

## 🔧 Troubleshooting

### Build bloqué par npm audit

```bash
# Identifier packages vulnérables
pnpm audit --audit-level=high --json > audit.json
cat audit.json | jq '.vulnerabilities'

# Si fix impossible : migrer vers alternative
# Exemple : xlsx → exceljs (déjà fait)
```

### Sentry ne reçoit pas d'erreurs

```bash
# 1. Vérifier DSN
echo $NEXT_PUBLIC_SENTRY_DSN

# 2. Vérifier NODE_ENV
echo $NODE_ENV  # Doit être 'production'

# 3. Test manuel
node -e "
  const Sentry = require('@sentry/nextjs');
  Sentry.init({ dsn: 'YOUR_DSN' });
  Sentry.captureMessage('Test');
"
```

### Workflow GitHub Actions échoue

```bash
# 1. Vérifier logs
https://github.com/salmenktata/quelyosSuite/actions

# 2. Re-run job
Actions → [Workflow] → Re-run failed jobs

# 3. Debug localement
act -j npm-audit  # Requiert Docker + act CLI
```

---

## 📚 Ressources

- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm audit docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Maintenu par** : Claude Sonnet 4.5
**Dernière mise à jour** : 2026-01-30
**Statut** : ✅ Actif
