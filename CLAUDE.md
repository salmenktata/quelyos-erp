# Instructions Claude Code - Quelyos ERP

## ⚡ MODE ÉCONOMIE TOKENS ACTIVÉ
**PRIORITÉ ABSOLUE** : Optimiser consommation tokens
- **Lectures limitées** : Max 500 lignes/fichier (use `limit` param)
- **Pas d'agents Task/Explore** : Utiliser Glob + Grep direct
- **Ciblé uniquement** : Demander fichier précis si requête vague
- **Réponses courtes** : Pas de répétition code, pas verbosité
- **Ignorer** : node_modules/, dist/, .next/, types volumineux
- Voir `.claude/OPTIMIZATION_MODE.md` et `.claude/GUIDE_ECONOMIE_TOKENS.md`

## Langue
Français pour communications. Code en anglais.

## Architecture
- `vitrine-quelyos/` : Next.js 14 (site vitrine : 3000)
- `vitrine-client/` : Next.js 16 (e-commerce : 3001)
- `dashboard-client/` : React + Vite (backoffice : 5175)
- `odoo-backend/addons/quelyos_api/` : Odoo 19 (API : 8069)

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour détails services et ports.

## Guides détaillés
Voir `.claude/reference/` pour conventions TS/Python, anti-patterns, UX/UI, parité Odoo.
**Conventions API** : `.claude/API_CONVENTIONS.md` (format données, endpoints, authentification)

## Workflow Odoo CRITIQUE
**Consultation doc Odoo 19 Community obligatoire**
- WebSearch pour vérifier modules/champs existants AVANT implémentation
- Doc officielle : https://www.odoo.com/documentation/19.0/

**Modification modèle = upgrade obligatoire**
1. Modifier code `models/`
2. Incrémenter version `__manifest__.py`
3. Alerter avec AskUserQuestion
4. Après commit : `/upgrade-odoo`

Alerter AVANT : schéma DB, modèles Odoo, endpoints API

## Commandes disponibles
**DevOps** : `/ship`, `/deploy`, `/test`, `/security`, `/perf`, `/db-sync`
**Odoo** : `/upgrade-odoo`, `/restart-odoo`, `/restart-backoffice`, `/restart-all`
**Qualité** : `/polish`, `/parity`, `/coherence`, `/clean`, `/analyze-page`, `/docs`

## Essentiels
1. Lire [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md) et [LOGME.md](docs/LOGME.md) en début de session
2. Utiliser scripts `./scripts/dev-start.sh all` et `./scripts/dev-stop.sh all`
3. Lire code avant modification
4. Modifications minimales
5. Alerter avant modif structurelle Odoo
6. Logger sécurisé (`@quelyos/logger` au lieu de `console.log`)
7. Tailwind + Zod uniquement
