# Commande /leverage - Capitalisation sur l'Existant Odoo

## Description

Commande de réflexion architecturale AVANT toute implémentation. Vérifie systématiquement ce qu'Odoo offre nativement pour éviter de réinventer la roue.

## Contexte Suite 7 SaaS

**Backend unique** : Odoo 19 (101 modèles, 764 endpoints, multi-tenant)
**7 SaaS** partagent ce backend → toute extension Odoo bénéficie potentiellement à plusieurs SaaS :

| Domaine Odoo | SaaS Bénéficiaires |
|---|---|
| `finance` | Quelyos Finance, Quelyos Retail |
| `stock` | Quelyos Copilote, Quelyos Retail |
| `hr` | Quelyos Team, Quelyos Copilote |
| `crm` + `marketing` | Quelyos Sales, Quelyos Support |
| `pos` + `store` | Quelyos Retail, Quelyos Store |
| `support` | Quelyos Support |

**Plan détaillé** : `docs/QUELYOS_SUITE_7_SAAS_PLAN.md`

## Objectif

**Question centrale** : "Est-ce qu'Odoo offre déjà cette fonctionnalité nativement ?"

Cette commande force une analyse avant de coder pour :
1. **Identifier** les modules/modèles Odoo natifs pertinents
2. **Évaluer** si hériter/étendre est préférable à créer from scratch
3. **Décider** la meilleure approche (natif, héritage, ou custom)
4. **Identifier** quels SaaS bénéficient de l'extension

---

## Usage

```bash
/leverage <fonctionnalité>
```

**Exemples** :
- `/leverage point de vente` → Analyse module `point_of_sale`
- `/leverage facturation` → Analyse module `account`
- `/leverage gestion RH` → Analyse module `hr`
- `/leverage CRM` → Analyse module `crm`

---

## Workflow de la Commande

### Étape 1 : Identification du Besoin

**1.1. Analyser la demande utilisateur**

Identifier les mots-clés fonctionnels :
- Vente/POS → `point_of_sale`, `sale`
- Stock/Inventaire → `stock`, `stock_account`
- Comptabilité → `account`, `account_accountant`
- RH/Employés → `hr`, `hr_expense`, `hr_holidays`
- CRM/Leads → `crm`
- Achats → `purchase`
- Production → `mrp`
- Site web → `website`, `website_sale`

### Étape 2 : Recherche Modules Odoo Natifs

**2.1. Rechercher dans la documentation Odoo 19**

```
WebSearch: "Odoo 19 <module> documentation"
```

**2.2. Identifier les modèles clés**

Pour chaque module pertinent, lister :
- Modèles principaux (`_name`)
- Champs importants
- Méthodes/workflows existants
- Vues et rapports

**2.3. Vérifier les modules OCA**

```
WebSearch: "OCA Odoo 19 <fonctionnalité>"
```

L'OCA (Odoo Community Association) offre souvent des extensions de qualité.

### Étape 3 : Matrice de Décision

**3.1. Générer la matrice comparative**

| Critère | Odoo Natif | Héritage/Extension | Custom Quelyos |
|---------|------------|-------------------|----------------|
| **Effort dev** | Aucun | Faible | Élevé |
| **Maintenance** | Odoo SA | Partagée | 100% Quelyos |
| **Mises à jour** | Automatiques | Compatibilité | À gérer |
| **Flexibilité** | Limitée | Moyenne | Totale |
| **Tests** | Éprouvé | Partiels | À créer |

**3.2. Évaluer chaque aspect**

Pour la fonctionnalité demandée, scorer :

| Aspect | Score 1-5 | Commentaire |
|--------|-----------|-------------|
| Couverture fonctionnelle native | ? | % des besoins couverts |
| Compatibilité multi-tenant | ? | Natif ou à adapter |
| Anonymisation possible | ? | Noms Odoo exposés ? |
| Intégration API React | ? | Routes/format adaptés ? |
| Performance | ? | Acceptable pour le cas d'usage |

### Étape 4 : Recommandation

**4.1. Générer la recommandation**

```markdown
## 🎯 Recommandation pour : <fonctionnalité>

### Modules Odoo pertinents
- `<module1>` : <description>
- `<module2>` : <description>

### Modèles natifs à exploiter
| Modèle Odoo | Utilisation recommandée |
|-------------|------------------------|
| `<model>` | Hériter / Utiliser directement |

### Approche recommandée

[ ] **Option A : Utiliser natif** (effort: ⭐)
    - Activer module(s) existant(s)
    - Configurer selon besoins

[ ] **Option B : Hériter/Étendre** (effort: ⭐⭐)
    - Créer `quelyos.<module>` qui _inherit
    - Ajouter champs/méthodes spécifiques

[x] **Option C : Custom + Intégration** (effort: ⭐⭐⭐)
    - Modèles custom `quelyos.<module>.*`
    - Intégration avec modèles natifs pour :
      - Comptabilité (account.move)
      - Stock (stock.picking)
      - etc.

### Justification
<Explication du choix>

### Points d'intégration Odoo natif
Même en custom, TOUJOURS utiliser :
- [ ] `account.move` pour écritures comptables
- [ ] `stock.picking` / `stock.move` pour mouvements stock
- [ ] `res.partner` pour clients/fournisseurs
- [ ] `product.product` pour produits
- [ ] `res.users` pour utilisateurs
- [ ] `mail.thread` pour historique/chatter
```

---

## Règles d'Or

### ✅ TOUJOURS utiliser le natif pour :

| Domaine | Modèle Odoo | Raison |
|---------|-------------|--------|
| **Comptabilité** | `account.move`, `account.journal` | Légal, audit, rapports |
| **Stock** | `stock.picking`, `stock.move` | Traçabilité, valorisation |
| **Produits** | `product.product`, `product.template` | Catalogue unifié |
| **Contacts** | `res.partner` | CRM, facturation, livraison |
| **Utilisateurs** | `res.users`, `res.groups` | Sécurité, droits |
| **Devises** | `res.currency` | Taux, conversions |
| **Sociétés** | `res.company` | Multi-société |

### ⚠️ Évaluer au cas par cas :

| Domaine | Natif possible | Quand custom ? |
|---------|---------------|----------------|
| **POS** | `point_of_sale` | Frontend React, API custom |
| **CRM** | `crm.lead` | Workflow très spécifique |
| **RH** | `hr.employee` | Modules Tunisie spécifiques |
| **E-commerce** | `website_sale` | Frontend Next.js séparé |

### ❌ Éviter de recréer :

- Séquences → `ir.sequence`
- Pièces jointes → `ir.attachment`
- Traductions → `ir.translation`
- Logs/Audit → `mail.message`
- Cron jobs → `ir.cron`
- Paramètres → `ir.config_parameter`

---

## Checklist Pré-Développement

Avant de créer un nouveau modèle `quelyos.*`, vérifier :

```markdown
## Checklist /leverage

### 1. Recherche existant
- [ ] Recherché dans modules Odoo core
- [ ] Recherché dans modules OCA
- [ ] Vérifié documentation Odoo 19
- [ ] Identifié modèles natifs similaires

### 2. Analyse gap
- [ ] Listé fonctionnalités manquantes du natif
- [ ] Évalué effort d'extension vs création
- [ ] Vérifié compatibilité multi-tenant
- [ ] Vérifié possibilité anonymisation

### 3. Décision architecture
- [ ] Choisi approche (natif/héritage/custom)
- [ ] Identifié intégrations obligatoires (compta, stock)
- [ ] Documenté justification dans le code

### 4. Intégrations natives
Si custom, s'assurer d'utiliser :
- [ ] `account.move` pour toute écriture comptable
- [ ] `stock.move` pour tout mouvement de stock
- [ ] `res.partner` pour tout contact
- [ ] `product.product` pour tout produit
- [ ] `mail.thread` pour historique
```

---

## Exemples Concrets

### Exemple 1 : Module POS

**Demande** : "Créer un point de vente"

**Analyse /leverage** :
- Module natif : `point_of_sale` (très complet)
- Problème : Frontend JS Odoo, pas React
- Problème : Multi-tenant pas natif
- Problème : Anonymisation impossible

**Décision** : Custom `quelyos.pos.*` MAIS avec intégrations :
- ✅ `account.move` pour comptabilité
- ✅ `stock.picking` pour sorties stock
- ✅ `product.product` pour catalogue
- ✅ `res.partner` pour clients

### Exemple 2 : Gestion Employés

**Demande** : "Gérer les employés"

**Analyse /leverage** :
- Module natif : `hr` (employés, départements, postes)
- Avantage : Structure complète
- Manque : Spécificités Tunisie (CNSS, etc.)

**Décision** : Hériter `hr.employee` :
```python
class HREmployee(models.Model):
    _inherit = 'hr.employee'

    # Champs Tunisie
    cnss_number = fields.Char('N° CNSS')
    cin = fields.Char('CIN')
```

### Exemple 3 : Facturation

**Demande** : "Générer des factures"

**Analyse /leverage** :
- Module natif : `account` (account.move)
- Couverture : 100% des besoins
- Légalement requis pour audit

**Décision** : Utiliser 100% natif
```python
# NE PAS créer quelyos.invoice
# Utiliser directement account.move
invoice = self.env['account.move'].create({
    'move_type': 'out_invoice',
    ...
})
```

---

## Commandes Liées

- `/parity` - Vérifier parité fonctionnelle Odoo ↔ Quelyos
- `/upgrade-odoo` - Mettre à jour module après modifications
- `/coherence` - Audit cohérence tri-couche

---

## Métriques de Succès

La commande est un succès si :

1. ✅ Modules Odoo natifs identifiés
2. ✅ Modèles pertinents listés
3. ✅ Matrice de décision générée
4. ✅ Recommandation claire (natif/héritage/custom)
5. ✅ Intégrations natives identifiées
6. ✅ Justification documentée

---

## Objectif Final

**Maximiser la réutilisation Odoo** pour :
- 📉 Réduire l'effort de développement
- 🔧 Faciliter la maintenance
- 📈 Bénéficier des mises à jour Odoo
- ✅ Garantir la fiabilité (code éprouvé)
- 🔗 Assurer les intégrations (compta, stock, etc.)

**Tout en gardant** :
- 🎨 Liberté frontend React
- 🏢 Support multi-tenant
- 🔒 Anonymisation Odoo
- 🚀 API moderne REST/JSON
