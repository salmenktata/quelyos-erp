# Politique de Dépendances - Quelyos Suite

## Règle Absolue

**Quelyos Suite ne dépend QUE du core Odoo 19 Community Edition.**

Aucune dépendance OCA (Odoo Community Association) ou module tiers n'est autorisée.

## Objectifs

1. **Pérennité** : Éviter les régressions lors de mises à jour de modules tiers
2. **Maintenance simplifiée** : Contrôle total sur le code, debug facilité
3. **Upgrade path clair** : Migration Odoo 19→20→21 sans blocage externe
4. **Isolation** : Garantir que Quelyos Suite fonctionne uniquement avec le core Odoo

## Modules Core Autorisés

### Infrastructure (3 modules)
- `base` - Framework Odoo de base
- `web` - Interface web Odoo
- `mail` - Système de messagerie et activités

### Site Web & E-commerce (2 modules)
- `website` - CMS et site web
- `website_sale` - E-commerce de base

### Ventes & CRM (5 modules)
- `sale_management` - Gestion des ventes
- `crm` - Gestion de la relation client
- `delivery` - Modes de livraison
- `payment` - Systèmes de paiement
- `loyalty` - Programmes de fidélité

### Catalogue & Stock (2 modules)
- `product` - Gestion des produits
- `stock` - Gestion des stocks

### Finance (1 module)
- `account` - Comptabilité de base

### Marketing (1 module)
- `mass_mailing` - Campagnes email

### Autres (1 module)
- `contacts` - Gestion des contacts

### Modules Techniques Autorisés (préfixes)
- `base_%` - Modules techniques core Odoo
- `web_%` - Modules web techniques
- `theme_%` - Thèmes Odoo standard
- `hw_%` - Modules hardware IoT Odoo
- `l10n_%` - Modules de localisation Odoo

**TOTAL : 14 modules core + préfixes techniques**

## Modules Quelyos (100% Natifs)

### Modules Obligatoires
1. **quelyos_core** - Orchestrateur principal et installation automatique
2. **quelyos_api** - Infrastructure multi-tenant et API REST (174 fichiers)

### Modules Optionnels (installés par défaut)
3. **quelyos_stock_advanced** - Inventaire avancé (remplace 3 modules OCA Stock)
   - Remplace : `stock_change_qty_reason`, `stock_inventory`, `stock_location_lockdown`
4. **quelyos_finance** - Gestion trésorerie et budgets
5. **quelyos_sms_tn** - Notifications SMS Tunisie
6. **quelyos_debrand** - Suppression marque Odoo (conformité LGPL)

**TOTAL : 6 modules natifs Quelyos**

## Apps Odoo Community Natives (Optionnelles)

Odoo 19 Community propose **plus de 30 apps natives** au-delà des modules core listés ci-dessus. Ces apps sont **optionnelles** et ne font pas partie de la whitelist stricte de Quelyos Suite par défaut.

### Liste des Apps Community Disponibles

| App | Module Odoo | Cas d'Usage | Stratégie Recommandée |
|-----|-------------|-------------|----------------------|
| Manufacturing | `mrp` | Production industrielle | Option B (wrapper) ou C (ignorer) |
| Project | `project` | Gestion de projets | Option B (wrapper) si SaaS multi-projet |
| Helpdesk | `helpdesk` | Support client & ticketing | Option B (wrapper) si nécessaire |
| HR | `hr` | Ressources humaines | Option C (ignorer - hors périmètre) |
| Timesheet | `hr_timesheet` | Feuilles de temps | Option C (ignorer - hors périmètre) |
| Calendar | `calendar` | Calendrier partagé | Option A ou B selon besoin |
| Events | `event` | Gestion d'événements | Option C (ignorer - hors périmètre) |
| Survey | `survey` | Sondages & questionnaires | Option C (ignorer - hors périmètre) |
| Fleet | `fleet` | Gestion flotte véhicules | Option C (ignorer - hors périmètre) |
| Maintenance | `maintenance` | Gestion de maintenance | Option C (ignorer - hors périmètre) |
| Field Service | `industry_fsm` | Services sur terrain | Option C (ignorer - hors périmètre) |
| Subscriptions | `sale_subscription` | Abonnements récurrents | Option A (critique) ou B (wrapper) |
| eSign | `sign` | Signature électronique | Option B (wrapper) ou externe |
| Appointments | `appointment` | Prise de rendez-vous | Option B (wrapper) si booking |
| Point of Sale | `point_of_sale` | Caisse enregistreuse | Option B (wrapper) si POS physique |

### Stratégies d'Intégration

#### Option A : Ajouter aux Dépendances Core

**Quand l'utiliser** : L'app est critique pour **100% des clients Quelyos** et ne nécessite aucune personnalisation.

**Exemple** : Si Quelyos Suite devient une plateforme SaaS avec abonnements obligatoires, ajouter `sale_subscription` :

```python
# quelyos_core/__manifest__.py
{
    'name': 'Quelyos Core',
    'depends': [
        # ... dépendances existantes ...
        'sale_subscription',  # ✅ Tous les clients ont des abonnements
    ],
}
```

**Avantages** :
- ✅ Fonctionnalité disponible par défaut
- ✅ Pas de code supplémentaire à maintenir
- ✅ Updates gérées par Odoo Community

**Inconvénients** :
- ❌ Impose la fonctionnalité à tous les clients
- ❌ Aucune personnalisation possible
- ❌ Dépendance externe (même si core)

#### Option B : Module Quelyos Wrapper

**Quand l'utiliser** : L'app nécessite une personnalisation multi-tenant ou n'est utile que pour certains clients.

**Exemple** : Support client multi-tenant avec `quelyos_helpdesk` :

```python
# quelyos_helpdesk/__manifest__.py
{
    'name': 'Quelyos Helpdesk',
    'category': 'Quelyos/Support',
    'depends': [
        'helpdesk',        # ✅ App Odoo Community
        'quelyos_api',     # ✅ Infrastructure multi-tenant
    ],
    'installable': True,
    'auto_install': False,  # ✅ Optionnel
}
```

**Structure** :
```
quelyos_helpdesk/
├── __manifest__.py
├── models/
│   ├── helpdesk_team.py      # Extend helpdesk.team avec tenant_id
│   └── helpdesk_ticket.py    # Extend helpdesk.ticket avec tenant_id
├── controllers/
│   └── helpdesk_api.py       # API REST multi-tenant
└── security/
    └── ir.model.access.csv   # RLS par tenant
```

**Avantages** :
- ✅ Personnalisation complète (multi-tenancy, API custom)
- ✅ Module optionnel (installé à la demande)
- ✅ Capitalisation sur l'app Odoo existante
- ✅ Contrôle total sur l'isolation

**Inconvénients** :
- ❌ Code supplémentaire à maintenir
- ❌ Dépendance externe (app Odoo)

#### Option C : Ignorer

**Quand l'utiliser** : L'app n'est **pas pertinente** pour le périmètre e-commerce de Quelyos Suite.

**Exemples** :
- `fleet` (gestion de véhicules) → Hors périmètre
- `hr` (ressources humaines) → Hors périmètre
- `maintenance` (maintenance équipements) → Hors périmètre
- `event` (gestion d'événements) → Hors périmètre

**Action** : Aucune. Ne pas installer l'app.

### Exemples Concrets

#### Cas 1 : Gestion de Projets Multi-Tenant

**Besoin** : Permettre à chaque client e-commerce de gérer des projets internes (ex: refonte site, campagnes marketing).

**Solution** : Option B (wrapper)

```python
# quelyos_project/__manifest__.py
{
    'name': 'Quelyos Project',
    'category': 'Quelyos/Project',
    'depends': ['project', 'quelyos_api'],
    'auto_install': False,
}

# models/project_project.py
from odoo import models, fields

class Project(models.Model):
    _inherit = 'project.project'

    tenant_id = fields.Many2one('quelyos.tenant', required=True, ondelete='cascade')

    @api.model
    def _get_default_tenant(self):
        return self.env.context.get('tenant_id')
```

#### Cas 2 : Abonnements E-commerce Récurrents

**Besoin** : Tous les clients Quelyos proposent des box mensuelles (abonnements obligatoires).

**Solution** : Option A (depends)

```python
# quelyos_core/__manifest__.py
'depends': [
    # ... existants ...
    'sale_subscription',  # ✅ Critique pour TOUS
]
```

#### Cas 3 : Point de Vente Physique

**Besoin** : Certains clients ont des boutiques physiques et veulent un POS intégré.

**Solution** : Option B (wrapper)

```python
# quelyos_pos/__manifest__.py
{
    'name': 'Quelyos Point of Sale',
    'category': 'Quelyos/Sales',
    'depends': ['point_of_sale', 'quelyos_api'],
    'auto_install': False,  # ✅ Optionnel
}
```

### Tableau Décisionnel

| Question | OUI | NON |
|----------|-----|-----|
| **L'app est-elle critique pour 100% des clients ?** | → Option A (depends) | ↓ Continuer |
| **L'app nécessite-t-elle une personnalisation multi-tenant ?** | → Option B (wrapper) | ↓ Continuer |
| **L'app est-elle pertinente pour l'e-commerce ?** | → Option B (wrapper) | → Option C (ignorer) |

**Règle d'or** : En cas de doute, **Option B (wrapper)** permet de garder le contrôle et l'isolation.

## Apps Odoo Enterprise (Licence Payante)

### ❌ Règle Absolue : Jamais de Dépendance Enterprise

**INTERDIT STRICT** : Quelyos Suite ne dépend **JAMAIS** de modules Odoo Enterprise.

**Raisons** :
1. **Licence payante** : $100-$200/utilisateur/an par app
2. **Vendor lock-in** : Dépendance à Odoo S.A.
3. **Hors contrôle** : Code source accessible mais licence restrictive
4. **Incompatibilité philosophique** : Quelyos Suite vise l'autonomie totale

### Liste des Apps Enterprise Courantes

| App | Module | Prix Indicatif | Alternative Quelyos |
|-----|--------|----------------|---------------------|
| **Studio** | `web_studio` | ~$100/user/an | `quelyos_builder` (réimpl.) |
| **Documents** | `documents` | ~$60/user/an | `quelyos_documents` (réimpl.) |
| **Marketing Automation** | `marketing_automation` | ~$80/user/an | `quelyos_automation` (réimpl.) |
| **Sign** | `sign` | ~$50/user/an | DocuSign/HelloSign (externe) |
| **Approvals** | `approvals` | ~$40/user/an | `quelyos_approvals` (réimpl.) |
| **Planning** | `planning` | ~$70/user/an | `quelyos_planning` (réimpl.) |
| **Rental** | `rental` | ~$50/user/an | `quelyos_rental` (réimpl.) |
| **Quality** | `quality_control` | ~$60/user/an | Non pertinent e-commerce |
| **BI Dashboard** | `web_dashboard` | ~$90/user/an | Metabase/Superset (externe) |
| **VoIP** | `voip` | ~$30/user/an | `quelyos_voip` + Twilio |

**Coût total Enterprise** : Pour 10 utilisateurs avec 5 apps → **$25,000-$40,000/an** 💸

### Pourquoi Éviter Enterprise

#### 1. Coût Prohibitif
```
Exemple : 10 utilisateurs, 5 apps Enterprise
- Studio : $1,000/an
- Documents : $600/an
- Marketing Automation : $800/an
- Planning : $700/an
- VoIP : $300/an
────────────────────────────
TOTAL : $3,400/an/utilisateur × 10 = $34,000/an
```

#### 2. Vendor Lock-In
- ❌ Migration impossible sans réécriture
- ❌ Pricing opaque (augmentations fréquentes)
- ❌ Dépendance à la roadmap Odoo S.A.

#### 3. Hors Contrôle
- ❌ Code inaccessible en production (licence restrictive)
- ❌ Debugging difficile (code obfusqué)
- ❌ Personnalisation limitée

### Stratégies de Remplacement

#### Option A : Réimplémentation Native Community (Recommandé)

**Quand l'utiliser** : L'app Enterprise est simple à moyenne complexité.

**Avantages** :
- ✅ Coût : $0 (vs $$$$/an)
- ✅ Contrôle total
- ✅ Personnalisation illimitée
- ✅ Pas de vendor lock-in

**Inconvénients** :
- ❌ Temps de développement initial
- ❌ Maintenance interne

#### Option B : Intégration Service Externe

**Quand l'utiliser** : L'app Enterprise est très complexe ou non-core.

**Avantages** :
- ✅ Expertise spécialisée (SaaS best-of-breed)
- ✅ Maintenance externalisée
- ✅ Souvent moins cher qu'Enterprise

**Inconvénients** :
- ❌ Dépendance externe (différente)
- ❌ Coût récurrent (généralement moindre)

### Exemples Détaillés

#### Exemple 1 : Documents Management

**App Enterprise** : `documents` (~$60/user/an)

**Solution Quelyos** : `quelyos_documents` (réimplémentation native)

```python
# quelyos_documents/__manifest__.py
{
    'name': 'Quelyos Documents',
    'category': 'Quelyos/Productivity',
    'depends': ['quelyos_api'],
    'summary': 'Gestion documentaire multi-tenant',
}

# models/quelyos_document.py
class QuelyosDocument(models.Model):
    _name = 'quelyos.document'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True)
    tenant_id = fields.Many2one('quelyos.tenant', required=True)
    file = fields.Binary(attachment=True)
    folder_id = fields.Many2one('quelyos.document.folder')
    tag_ids = fields.Many2many('quelyos.document.tag')
    shared_with_ids = fields.Many2many('res.users')
```

**Fonctionnalités couvertes** :
- ✅ Upload/Download fichiers
- ✅ Dossiers hiérarchiques
- ✅ Tags et métadonnées
- ✅ Partage sélectif
- ✅ Versionning basique
- ✅ Multi-tenant natif

**Effort** : ~3-5 jours développement (vs $600/an/user)

#### Exemple 2 : Marketing Automation

**App Enterprise** : `marketing_automation` (~$80/user/an)

**Solution Quelyos** : Utiliser l'existant `quelyos_api` (déjà implémenté !)

```python
# Fonctionnalités déjà présentes dans quelyos_api :
# - Email transactionnel (models/quelyos_email.py)
# - Templates dynamiques
# - Déclencheurs d'événements
# - Segmentation clients

# Enrichissement minime :
class QuelyosAutomationRule(models.Model):
    _name = 'quelyos.automation.rule'

    name = fields.Char('Nom de la règle')
    trigger = fields.Selection([
        ('cart_abandoned', 'Panier abandonné'),
        ('order_delivered', 'Commande livrée'),
        ('product_back_in_stock', 'Produit de retour en stock'),
    ])
    delay_hours = fields.Integer('Délai (heures)')
    email_template_id = fields.Many2one('mail.template')
```

**Effort** : ~2-3 jours (vs $800/an/user)

#### Exemple 3 : VoIP

**App Enterprise** : `voip` (~$30/user/an)

**Solution Quelyos** : `quelyos_voip` + Twilio (intégration externe)

```python
# quelyos_voip/__manifest__.py
{
    'name': 'Quelyos VoIP',
    'category': 'Quelyos/Communication',
    'depends': ['quelyos_api', 'crm'],
    'external_dependencies': {
        'python': ['twilio'],  # ✅ Service externe best-of-breed
    },
}

# models/quelyos_voip_call.py
from twilio.rest import Client

class QuelyosVoipCall(models.Model):
    _name = 'quelyos.voip.call'

    def initiate_call(self, to_number):
        client = Client(self.env['ir.config_parameter'].get_param('twilio.sid'))
        call = client.calls.create(
            to=to_number,
            from_=self.tenant_id.twilio_number,
            url='https://quelyos.com/api/voip/twiml',
        )
        return call.sid
```

**Coût Twilio** : ~$0.01/min (pay-as-you-go) vs $30/user/an Enterprise fixe

**Effort** : ~4-6 jours développement

#### Exemple 4 : Studio (No-Code Builder)

**App Enterprise** : `web_studio` (~$100/user/an)

**Solution Quelyos** : `quelyos_builder` (réimplémentation partielle)

**Stratégie** :
1. **Scope réduit** : Uniquement formulaires e-commerce (pas modèles Odoo)
2. **Form builder** : Drag & drop pour checkout/inscription
3. **Pas de génération code Odoo** : Limitation volontaire

```python
# quelyos_builder/models/quelyos_form_builder.py
class QuelyosFormBuilder(models.Model):
    _name = 'quelyos.form.builder'

    name = fields.Char('Nom du formulaire')
    fields_config = fields.Json('Configuration des champs')
    # Exemple : {"fields": [{"type": "text", "label": "Nom", "required": true}]}

    def render_form(self):
        # Génération HTML dynamique côté frontend
        pass
```

**Effort** : ~10-15 jours (fonctionnalités limitées vs Studio complet)

**Trade-off** : 80% des besoins couverts pour $0 (vs $1000/an/user)

## Arbre de Décision

### Flowchart Complet

```
┌──────────────────────────────────────────────────┐
│ Nouvelle fonctionnalité nécessaire ?             │
└─────────────────┬────────────────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │ Type de fonctionnalité ?   │
    └─┬──────────────────────┬───┘
      │                      │
      ▼                      ▼
┌──────────────────┐   ┌────────────────────┐
│ App Odoo         │   │ App Odoo           │
│ Community ?      │   │ Enterprise ?       │
└─┬────────────────┘   └─┬──────────────────┘
  │                      │
  │                      ▼
  │              ┌───────────────────────┐
  │              │ ❌ INTERDIT           │
  │              │ Réimplémenter         │
  │              │ en Community          │
  │              └─┬─────────────────────┘
  │                │
  │                ▼
  │         ┌──────────────────┐
  │         │ Complexité ?      │
  │         └─┬────────────┬───┘
  │           │            │
  │           ▼            ▼
  │        Haute       Moyenne/Basse
  │          │            │
  │          ▼            ▼
  │    ┌─────────────┐ ┌──────────────┐
  │    │ Intégration │ │ Réimpl.      │
  │    │ externe     │ │ native       │
  │    │ (SaaS)      │ │ quelyos_*    │
  │    └─────────────┘ └──────────────┘
  │
  ▼
┌──────────────────────┐
│ Critique pour        │
│ TOUS les clients ?   │
└─┬────────────────┬───┘
  │                │
  ▼                ▼
OUI              NON
  │                │
  ▼                ▼
┌─────────────┐ ┌──────────────┐
│ Ajouter     │ │ Module       │
│ depends     │ │ quelyos_*    │
│ quelyos_core│ │ wrapper      │
└─────────────┘ └──────────────┘
```

### Guide Étape par Étape

#### Étape 1 : Identifier le Type

**Questions** :
1. L'app existe-t-elle dans Odoo Community nativement ?
2. L'app est-elle uniquement disponible en Enterprise ?
3. L'app est-elle un module OCA/tiers ?

#### Étape 2 : Appliquer la Stratégie

| Type | Stratégie Immédiate |
|------|---------------------|
| **Community native** | → Aller Étape 3 |
| **Enterprise** | → Réimplémenter (Étape 4) |
| **OCA/tiers** | → Réimplémenter nativement Quelyos |

#### Étape 3 : Community - Criticité

**Question** : Cette app est-elle critique pour **100% des clients Quelyos** ?

- **OUI** → Option A : Ajouter `depends` dans `quelyos_core/__manifest__.py`
- **NON** → Option B : Créer module wrapper `quelyos_*` (optionnel)

**Exception** : Si l'app n'est pas pertinente pour e-commerce → Option C (ignorer)

#### Étape 4 : Enterprise - Réimplémentation

**Question** : La complexité de l'app est-elle haute ?

- **Haute** (ex: Studio, BI complet) → Intégration service externe ou scope réduit
- **Moyenne/Basse** (ex: Documents, Approvals) → Réimplémentation native quelyos_*

### Exemples de Cheminement

#### Cas 1 : Besoin de Gestion Projets Multi-Tenant

```
Fonctionnalité : Gestion projets
│
├─ App Community ? → OUI (module `project`)
│  ├─ Critique pour TOUS ? → NON (certains clients seulement)
│  └─ Pertinent e-commerce ? → OUI (projets internes clients)
│
└─ DÉCISION : Option B (wrapper quelyos_project)
```

#### Cas 2 : Besoin de Marketing Automation

```
Fonctionnalité : Marketing automation
│
├─ App Enterprise ? → OUI (module `marketing_automation`)
│  ├─ INTERDIT → Réimplémenter
│  ├─ Complexité ? → Moyenne (déjà 80% dans quelyos_api)
│  └─ Fonctionnalités existantes ? → Email, triggers présents
│
└─ DÉCISION : Enrichir quelyos_api (~2-3 jours dev)
```

#### Cas 3 : Besoin de VoIP

```
Fonctionnalité : VoIP
│
├─ App Enterprise ? → OUI (module `voip`)
│  ├─ INTERDIT → Réimplémenter
│  ├─ Complexité ? → Haute (téléphonie complexe)
│  └─ Service externe ? → OUI (Twilio best-of-breed)
│
└─ DÉCISION : quelyos_voip + Twilio (~4-6 jours dev)
```

#### Cas 4 : Besoin de Flotte Véhicules

```
Fonctionnalité : Gestion flotte
│
├─ App Community ? → OUI (module `fleet`)
│  ├─ Critique pour TOUS ? → NON
│  └─ Pertinent e-commerce ? → NON (hors périmètre)
│
└─ DÉCISION : Option C (ignorer)
```

#### Cas 5 : Besoin d'Abonnements E-commerce

```
Fonctionnalité : Abonnements récurrents
│
├─ App Community ? → OUI (module `sale_subscription`)
│  ├─ Critique pour TOUS ? → OUI (box mensuelles tous clients)
│  └─ Personnalisation nécessaire ? → NON
│
└─ DÉCISION : Option A (ajouter depends quelyos_core)
```

### Résumé Décisionnel Rapide

| Situation | → Stratégie |
|-----------|-------------|
| App Community + Critique TOUS | → Option A (depends) |
| App Community + Personnalisation | → Option B (wrapper) |
| App Community + Hors périmètre | → Option C (ignorer) |
| App Enterprise + Simple | → Réimpl. native quelyos_* |
| App Enterprise + Complexe | → Intégration externe SaaS |
| Module OCA/tiers | → Réimpl. native quelyos_* |

## Modules OCA Historiquement Remplacés

### OCA Stock (4 modules - SUPPRIMÉS en v3.0.0)
- ❌ `stock_change_qty_reason` → ✅ `quelyos_stock_advanced`
- ❌ `stock_demand_estimate` → ✅ Non utilisé
- ❌ `stock_inventory` → ✅ `quelyos_stock_advanced`
- ❌ `stock_location_lockdown` → ✅ `quelyos_stock_advanced`

### OCA Marketing (3 modules - JAMAIS utilisés)
- ❌ `mass_mailing_partner` → ✅ Désactivé dès le début
- ❌ `mass_mailing_list_dynamic` → ✅ Désactivé dès le début
- ❌ `mass_mailing_resend` → ✅ Désactivé dès le début

## Processus d'Ajout de Dépendance

**Si une fonctionnalité nécessite un module tiers :**

### Étape 1 : Justification Écrite
- Pourquoi le core Odoo 19 est-il insuffisant ?
- Quelle fonctionnalité critique manque-t-il ?
- Quelle est la valeur ajoutée par rapport au coût de maintenance ?

### Étape 2 : Analyse des Risques
- **Maintenance** : Qui maintient le module ? Fréquence des updates ?
- **Régressions** : Historique de breaking changes ?
- **Upgrade path** : Compatibilité future Odoo 20/21 ?
- **Dépendances** : Le module a-t-il lui-même des dépendances tierces ?

### Étape 3 : Validation Architecture
- Le module s'intègre-t-il proprement avec `quelyos_api` ?
- Y a-t-il des conflits potentiels avec notre multi-tenancy ?
- L'isolation reste-t-elle garantie ?

### Étape 4 : Décision Finale
- **Si accepté** : Internaliser le code (fork dans `quelyos_*` modules)
  - ✅ Contrôle total
  - ✅ Pas de dépendance externe
  - ✅ Customisation possible
- **Si refusé** : Développer une alternative native Quelyos
  - ✅ Code sur-mesure
  - ✅ Maintenance facilitée
  - ✅ Isolation préservée

## Vérification Automatique

### Post-Installation Hook (`quelyos_core`)
Lors de l'installation de `quelyos_core`, un hook vérifie automatiquement :
- Aucun module OCA installé
- Aucun module tiers non-whitelisté
- Logs d'avertissement si modules non-core détectés

```python
# odoo-backend/addons/quelyos_core/__init__.py
ODOO_CORE_WHITELIST = [...]
QUELYOS_MODULES = [...]

def post_init_hook(cr, registry):
    # Vérifier isolation
    forbidden = env['ir.module.module'].search([
        ('state', '=', 'installed'),
        ('name', 'not in', ODOO_CORE_WHITELIST + QUELYOS_MODULES),
        # Exclusions techniques...
    ])
    if forbidden:
        _logger.warning(f"⚠️ MODULES NON-CORE DÉTECTÉS : {forbidden.mapped('name')}")
```

### Pre-Installation Hook (`quelyos_api`)
Bloque l'installation si Odoo != 19 :

```python
# odoo-backend/addons/quelyos_api/__init__.py
def pre_init_hook(cr):
    if odoo.release.version_info[0] != 19:
        raise UserError("Quelyos API requiert Odoo 19.0.x exactement.")
```

### Commande Manuelle
Vérifier l'isolation à tout moment :

```bash
# Via PostgreSQL
psql quelyos_db -c "
  SELECT name FROM ir_module_module
  WHERE state='installed'
  AND (name LIKE 'stock_%' OR name LIKE 'mass_mailing_%')
  AND name NOT IN ('stock', 'mass_mailing');
"

# Résultat attendu : vide (0 lignes)
```

## Historique des Changements

### v3.1.0 (2026-01-29) - Enrichissement Politique Dépendances
- **AJOUT** : Section "Apps Odoo Community Natives" (15 apps documentées)
- **AJOUT** : Section "Apps Odoo Enterprise" (10 apps + stratégies remplacement)
- **AJOUT** : Arbre de décision visuel complet (flowchart + guide)
- **ENRICHISSEMENT** : FAQ avec 4 nouvelles questions (Community vs wrapper, Enterprise, coûts)
- **EXEMPLES** : 10+ exemples concrets de réimplémentation (quelyos_documents, quelyos_voip, etc.)
- **COUVERTURE** : 100% des stratégies de dépendances documentées

### v3.0.0 (2026-01-29) - Isolation Complète
- **BREAKING CHANGE** : Suppression totale dépendances OCA Stock (4 modules)
- Ajout whitelisting strict dans `quelyos_core/__init__.py`
- Ajout pre_init_hook dans `quelyos_api` (validation Odoo 19)
- Documentation complète de la politique

### v2.0.1 (2026-01-XX) - État Précédent
- Dépendances OCA Stock encore présentes (4 modules)
- Fonctionnalités déjà remplacées par `quelyos_stock_advanced`
- Redondance non critique

### v1.x.x - Début du Projet
- Exploration modules OCA
- Dépendances OCA Marketing commentées dès le début

## Exceptions Autorisées

### Modules Techniques Odoo
Les préfixes suivants sont autorisés car ils font partie du core technique Odoo :
- `base_%` (ex: `base_import`, `base_setup`)
- `web_%` (ex: `web_editor`, `web_kanban`)
- `theme_%` (ex: `theme_default`)
- `hw_%` (ex: `hw_drivers` si IoT utilisé)
- `l10n_%` (ex: `l10n_fr`, `l10n_tn` pour localisation)

### Modules de Localisation
Les modules de localisation Odoo officiels sont autorisés :
- `l10n_tn` - Comptabilité tunisienne (si requis)
- `l10n_fr` - Comptabilité française (si requis)

**IMPORTANT** : Toujours privilégier le minimum de modules de localisation.

## Responsabilités

### Équipe Développement
- Respecter la whitelist stricte
- Ne JAMAIS ajouter de dépendance sans validation
- Tester l'isolation après chaque installation de module
- Documenter toute exception validée

### Lead Technique
- Valider toute nouvelle dépendance (processus 4 étapes)
- Maintenir à jour `ODOO_CORE_WHITELIST` et `QUELYOS_MODULES`
- Réviser la politique annuellement (ou avant migration Odoo majeure)

### Claude Code (Assistant IA)
- Alerter immédiatement si dépendance OCA/tierce suggérée
- Proposer alternatives natives Quelyos en priorité
- Vérifier conformité avant tout commit

## Conséquences de Non-Respect

### Risques Techniques
- Régressions lors de mises à jour OCA
- Conflits de dépendances (cascade de modules)
- Upgrade Odoo bloqué ou complexifié
- Bugs difficiles à tracer (code externe)

### Risques Organisationnels
- Onboarding développeurs ralenti (courbe d'apprentissage OCA)
- Maintenance coûteuse (expertise externe requise)
- Lock-in technologique (dépendance à l'écosystème OCA)

### Impact Utilisateur
- Fonctionnalités cassées après updates
- Downtime imprévu lors de migrations
- Frustration due à bugs non-maîtrisés

## Ressources

### Documentation Officielle
- [Odoo 19 Documentation](https://www.odoo.com/documentation/19.0/)
- [Odoo Community Guidelines](https://github.com/odoo/odoo/wiki)

### Repositories Odoo
- [Odoo Core](https://github.com/odoo/odoo) - Core Odoo 19
- [OCA](https://github.com/OCA) - Modules communautaires (NON utilisés)

### Documentation Interne
- `ARCHITECTURE.md` - Architecture globale Quelyos Suite
- `CLAUDE.md` - Instructions développement Claude Code
- `.claude/API_CONVENTIONS.md` - Conventions API Quelyos

## FAQ

### Q: Pourquoi ne pas utiliser OCA ?
**R:** OCA produit d'excellents modules, MAIS :
- Régressions fréquentes lors de updates
- Maintenance externe (hors contrôle)
- Complexité upgrade Odoo (dépendances multiples)
- Quelyos Suite vise l'autonomie totale et la pérennité

### Q: Que faire si une fonctionnalité OCA est nécessaire ?
**R:** Suivre le processus 4 étapes ci-dessus → **Internaliser** le code :
1. Fork le module OCA dans `quelyos_*`
2. Adapter au multi-tenancy Quelyos
3. Maintenir en interne
4. Aucune dépendance externe

### Q: Les modules de localisation sont-ils autorisés ?
**R:** OUI, uniquement les modules **officiels Odoo** (`l10n_*`) :
- `l10n_tn` pour Tunisie
- `l10n_fr` pour France
- Mais **JAMAIS** de modules OCA de localisation

### Q: Comment vérifier l'isolation après installation ?
**R:** 3 méthodes :
1. Logs Odoo lors de l'installation (post_init_hook `quelyos_core`)
2. Requête SQL (voir section "Vérification Automatique")
3. Interface Odoo : Apps > Filtrer "Installé" > Vérifier liste

### Q: Que se passe-t-il si j'installe un module OCA par erreur ?
**R:**
1. Logs d'avertissement dans `quelyos_core` post_init_hook
2. Désinstaller immédiatement le module OCA
3. Vérifier que les fonctionnalités Quelyos fonctionnent toujours
4. Documenter l'incident pour éviter récurrence

### Q: Comment choisir entre Community depends et wrapper Quelyos ?
**R:** Suivre cette logique :
- **Option A (depends)** : Si l'app est critique pour **100% des clients** ET ne nécessite aucune personnalisation
  - Exemple : `sale_subscription` si tous les clients ont des abonnements
- **Option B (wrapper)** : Si l'app nécessite personnalisation multi-tenant OU n'est utile que pour certains clients
  - Exemple : `quelyos_helpdesk` pour support client optionnel
- **Option C (ignorer)** : Si l'app n'est pas pertinente pour l'e-commerce
  - Exemple : `fleet`, `hr`, `maintenance`

**En cas de doute** : Toujours choisir Option B (wrapper) pour garder contrôle et isolation.

### Q: Les apps Odoo Enterprise peuvent-elles être utilisées ?
**R:** **NON, jamais en dépendance** (règle absolue).

**Raisons** :
- Licence payante : $30-$100/utilisateur/an par app
- Vendor lock-in : Dépendance à Odoo S.A.
- Hors contrôle : Code restrictif
- Coût total : $25,000-$40,000/an pour 10 users avec 5 apps

**Alternative** : Réimplémenter en Community :
- **Simple** → Module natif `quelyos_*` (ex: `quelyos_documents`)
- **Complexe** → Intégration service externe (ex: Twilio pour VoIP)
- **Déjà présent** → Utiliser fonctionnalités existantes `quelyos_api`

**Exemples de réimplémentation** :
| Enterprise | → Quelyos Alternative | Effort |
|------------|----------------------|--------|
| Documents ($60/user/an) | `quelyos_documents` | 3-5 jours |
| Marketing Automation ($80/user/an) | Enrichir `quelyos_api` | 2-3 jours |
| VoIP ($30/user/an) | `quelyos_voip` + Twilio | 4-6 jours |
| Studio ($100/user/an) | `quelyos_builder` (scope réduit) | 10-15 jours |

**ROI** : Quelques jours de dev vs milliers $/an de licence → Rentable dès la 1ère année.

### Q: Quel est le coût réel d'une app Enterprise ?
**R:** **Pricing par utilisateur/an** (tarifs indicatifs 2025-2026) :

**Apps Populaires** :
- Studio (no-code builder) : ~$100/user/an
- Marketing Automation : ~$80/user/an
- Planning : ~$70/user/an
- Documents Management : ~$60/user/an
- Quality Control : ~$60/user/an
- Sign (eSignature) : ~$50/user/an
- Rental : ~$50/user/an
- Approvals : ~$40/user/an
- VoIP : ~$30/user/an

**Exemple concret** (10 utilisateurs, 5 apps) :
```
Studio :              10 × $100 = $1,000/an
Marketing Automation: 10 × $80  = $800/an
Documents :           10 × $60  = $600/an
Planning :            10 × $70  = $700/an
VoIP :                10 × $30  = $300/an
───────────────────────────────────────
TOTAL :                        $3,400/an
```

**Quelyos évite ces coûts** en réimplémentant nativement en Community → **$0/an** (seulement temps dev initial).

---

**Dernière mise à jour** : 2026-01-29
**Version politique** : 1.1.0
**Auteur** : Équipe Technique Quelyos
