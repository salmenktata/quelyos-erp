# Commande /saas-parity - Vérification Parité Cross-SaaS

## Description
Vérifie la cohérence entre le ERP complet (dashboard-client) et les 7 SaaS spécialisés. S'assure que chaque SaaS reflète fidèlement les fonctionnalités du module ERP correspondant.

## Usage
```bash
/saas-parity [saas-name]
```

## Options
- `all` - Vérifier tous les 7 SaaS (défaut)
- `finance` - Quelyos Finance uniquement
- `store` - Quelyos Store uniquement
- `copilote` - Quelyos Copilote uniquement
- `sales` - Quelyos Sales uniquement
- `retail` - Quelyos Retail uniquement
- `team` - Quelyos Team uniquement
- `support` - Quelyos Support uniquement

## Instructions

### Étape 1 : Inventaire des pages ERP (source de vérité)

Pour le SaaS ciblé, lister toutes les pages du module correspondant dans dashboard-client :

| SaaS | Modules ERP | Pages dashboard-client à vérifier |
|------|-------------|-----------------------------------|
| Quelyos Finance | finance | dashboard-client/src/pages/finance/ |
| Quelyos Store | store + marketing | dashboard-client/src/pages/store/ + marketing/ |
| Quelyos Copilote | stock + hr + GMAO | dashboard-client/src/pages/stock/ + hr/ |
| Quelyos Sales | crm + marketing | dashboard-client/src/pages/crm/ + marketing/ |
| Quelyos Retail | pos + store + stock | dashboard-client/src/pages/pos/ + store/ + stock/ |
| Quelyos Team | hr | dashboard-client/src/pages/hr/ |
| Quelyos Support | support | dashboard-client/src/pages/support/ |

### Étape 2 : Comparer avec le SaaS

Pour chaque page du ERP :
1. Vérifier qu'elle existe dans le SaaS correspondant (apps/[saas]/)
2. Comparer les fonctionnalités (formulaires, tableaux, filtres, actions)
3. Vérifier que les composants viennent de @quelyos/ui-kit
4. Vérifier que le client API vient de @quelyos/api-client
5. Vérifier le branding (couleurs, logo, nom du SaaS)

### Étape 3 : Vérifier l'anonymisation Odoo

Lancer une vérification /no-odoo sur le dossier apps/[saas-name]/ :
- Aucune référence "Odoo", "odoo", "OCA" dans le code
- Aucun champ Odoo non mappé (list_price → price, etc.)
- Pas d'URL backend exposée

### Étape 4 : Vérifier les packages partagés

- [ ] @quelyos/ui-kit : tous les composants communs importés depuis le package
- [ ] @quelyos/api-client : client API unifié, pas de fetch custom
- [ ] @quelyos/utils : helpers partagés (dates, format, currency)
- [ ] Pas de duplication de code avec dashboard-client

### Étape 5 : Rapport

Générer un rapport par SaaS :

```
=== Parité SaaS : [Nom SaaS] ===

📊 Score de parité : XX%

✅ Pages présentes : X/Y
  - [liste des pages OK]

❌ Pages manquantes : Z
  - [liste des pages manquantes]

⚠️ Différences fonctionnelles :
  - [page] : [description de la différence]

🔒 Anonymisation Odoo : ✅/❌
📦 Packages partagés : ✅/❌
🎨 Branding conforme : ✅/❌

📋 Actions requises :
1. [action]
2. [action]
```

## Objectif
Garantir que chaque SaaS standalone offre la même qualité fonctionnelle que le module correspondant dans le ERP complet, tout en maintenant l'indépendance du branding et le respect des packages partagés.
