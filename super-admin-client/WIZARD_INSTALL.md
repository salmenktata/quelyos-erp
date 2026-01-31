# Wizard Installation One-Click - Documentation

## 📋 Vue d'ensemble

Le wizard "Installation Guidée" permet de créer une nouvelle instance Quelyos complète en 5 étapes simples, en combinant :
- Provisioning infrastructure backend
- Génération optionnelle de données de test
- Suivi en temps réel de la progression

## 🎯 Accès

**URL** : http://localhost:9000/tenants/install

**Point d'entrée** : Bouton "Installation Guidée" ✨ sur la page Tenants

## 🛤️ Parcours Utilisateur

### Étape 1 : Informations de base
- **Nom de la boutique** : Saisie libre (min 2 caractères)
- **Domaine** : Auto-généré depuis le nom (slugifié)
- **Email administrateur** : Validation format email
- **Nom administrateur** : Saisie libre (min 2 caractères)

**Validation** : Tous les champs doivent être valides pour passer à l'étape suivante.

---

### Étape 2 : Choix du plan
3 plans disponibles sous forme de cards :
- **Starter** : 5 users, 1000 produits, 500 commandes/mois (49€/mois)
- **Pro** : 20 users, 10K produits, 5K commandes/mois (99€/mois) - **Recommandé**
- **Enterprise** : Illimité (299€/mois)

Chaque card affiche :
- Prix et période
- Limites (users, produits, commandes)
- Liste de fonctionnalités
- Badge "Recommandé" sur Pro

**Validation** : Un plan doit être sélectionné.

---

### Étape 3 : Configuration données de test

#### Toggle principal
- **Générer données de test** : Activé par défaut
- Si désactivé → Passer directement à l'étape 4

#### Si activé

**Volumétrie** (3 options) :
- Minimal : ~200 enregistrements
- Standard : ~2000 enregistrements (Recommandé)
- Large : ~5000 enregistrements (Warning : génération plus longue)

**Modules** (8 modules disponibles) :
- Boutique (produits, catégories, variantes)
- Stock (entrepôts, mouvements, inventaire)
- CRM (clients, opportunités, leads)
- Marketing (campagnes, newsletters)
- Finance (factures, paiements, comptabilité)
- Point de Vente (caisses, sessions, tickets)
- Support (tickets, FAQ, SLA)
- RH (employés, contrats, présences)

**Options avancées** :
- ✅ Générer les relations entre entités
- ✅ Images haute qualité (Unsplash)

**Validation** : Si seed activé, au moins 1 module doit être sélectionné.

---

### Étape 4 : Validation et lancement

Récapitulatif complet de la configuration :

#### Section "Informations de base"
- Nom de la boutique
- Domaine (avec icône globe)
- Email administrateur (avec icône mail)
- Nom administrateur (avec icône user)

#### Section "Plan sélectionné"
- Badge avec nom du plan

#### Section "Données de test"
- Si désactivé : Message "Aucune donnée de test ne sera générée"
- Si activé :
  - Volumétrie sélectionnée
  - Liste des modules (badges)
  - Checkboxes options avancées

**Warning volumétrie Large** :
> ⚠️ Volumétrie importante sélectionnée
> La génération de 5000+ enregistrements peut prendre plusieurs minutes.

**Note finale** :
> ✓ Prêt à lancer l'installation ? Le processus commencera immédiatement.

**Bouton** : "Lancer l'installation" ▶️

---

### Étape 5 : Progression et résultats

#### Phase 1 : Provisioning (automatique)

**Affichage** :
- Icône spinner animé (teal)
- Titre : "Provisioning de l'instance"
- Sous-titre : "Configuration infrastructure backend en cours..."
- Progress bar (0% → 100%)
- Pourcentage en grand (3xl)
- Étape courante (texte)

**Polling** : Toutes les 3 secondes via `GET /api/super-admin/provisioning/status/{job_id}`

**Durée estimée** : 1-2 minutes

---

#### Phase 2 : Seed Data (si activé, automatique)

**Affichage** :
- Icône spinner animé
- Titre : "Génération des données de test"
- Sous-titre : "Création de données fictives en cours..."
- Progress bar (0% → 100%)
- Pourcentage en grand
- Module courant (texte)

**Polling** : Toutes les 3 secondes via `GET /api/super-admin/seed-data/status/{job_id}`

**Durée estimée** :
- Minimal : 30s - 1min
- Standard : 2-5min
- Large : 5-10min

---

#### Phase 3 : Succès ✅

**Affichage** :
- Icône checkmark verte (h-16)
- Titre : "Installation réussie !"
- Sous-titre : "Votre instance est prête à être utilisée"

**Section "Accès à votre instance"** :
- Card avec URLs cliquables (External Link icon)
  - Boutique : `{store_url}`
  - Backoffice : `{admin_url}`

**Section "Informations de connexion"** (fond amber) :
- ⚠️ Warning : "Changez votre mot de passe lors de la première connexion"
- Email : `{admin_email}` (code)
- Mot de passe temporaire : `{temp_password}` (code)

**Section "Données générées"** (si seed activé) :
- Grid 2×4 ou 4×4 (responsive)
- Pour chaque module :
  - Count (texte 2xl teal)
  - Nom module (capitalize)
  - Durée (xs, gray)

**Actions** :
- Bouton primaire : "Créer une autre instance" → `/tenants/install`
- Bouton secondaire : "Retour aux tenants" → `/tenants`

---

#### Phase Erreur ❌

**Affichage** :
- Icône X rouge (h-16)
- Titre : "Erreur lors de l'installation"
- Message d'erreur (provisioningStatus.error_message ou seedStatus.error_message)

**Actions** :
- Bouton : "Retour aux tenants" → `/tenants`

---

## 🔧 Architecture Technique

### Fichiers créés

```
super-admin-client/
├── src/
│   ├── hooks/
│   │   └── useInstallWizard.ts         (État global wizard)
│   ├── components/
│   │   └── wizard/
│   │       ├── InstallWizard.tsx       (Container principal)
│   │       ├── WizardStepper.tsx       (Stepper visuel)
│   │       ├── steps/
│   │       │   ├── Step1TenantInfo.tsx
│   │       │   ├── Step2PlanSelection.tsx
│   │       │   ├── Step3SeedConfig.tsx
│   │       │   ├── Step4Validation.tsx
│   │       │   ├── Step5Progress.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   └── pages/
│       └── InstallWizardPage.tsx       (Page wrapper)
```

### Fichiers modifiés

- `src/components/AuthenticatedApp.tsx` : Route `/tenants/install`
- `src/pages/Tenants.tsx` : Bouton "Installation Guidée"

---

## 🎨 Design System

### Couleurs

**Light Mode** :
- Primaire : `bg-teal-600 hover:bg-teal-700`
- Secondaire : `bg-gray-600 hover:bg-gray-700`
- Success : `bg-green-500`
- Error : `bg-red-500`
- Warning : `bg-amber-50 border-amber-200 text-amber-700`

**Dark Mode** :
- Primaire : `dark:bg-teal-500 dark:hover:bg-teal-600`
- Secondaire : `dark:bg-gray-500 dark:hover:bg-gray-600`
- Success : `dark:bg-green-400`
- Error : `dark:bg-red-400`
- Warning : `dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300`

### Icônes (lucide-react)

- Building : Tenant info
- Mail : Email
- User : Administrateur
- Globe : Domaine
- CreditCard : Plan
- Database : Seed data
- Sparkles : Installation guidée
- CheckCircle : Succès / Étape complétée
- XCircle : Erreur
- Loader2 : Spinner (animate-spin)
- AlertTriangle : Warning
- ExternalLink : Lien externe
- ArrowLeft / ArrowRight : Navigation
- Play : Lancer

---

## 🔌 API Endpoints Utilisés

### Provisioning

**POST** `/api/super-admin/tenants`
```json
{
  "name": "Ma Boutique",
  "domain": "ma-boutique.quelyos.com",
  "plan_code": "pro",
  "admin_email": "admin@example.com",
  "admin_name": "Jean Dupont"
}
```

**Response** :
```json
{
  "success": true,
  "data": {
    "tenant_id": 123,
    "provisioning_job_id": "prov-uuid-123"
  }
}
```

---

**GET** `/api/super-admin/provisioning/status/{job_id}`

**Response** :
```json
{
  "success": true,
  "data": {
    "status": "running",  // pending | running | completed | failed
    "progress_percent": 65,
    "current_step": "Creating warehouse...",
    "tenant_id": 123,
    "store_url": "https://ma-boutique.quelyos.com",
    "admin_url": "https://admin.ma-boutique.quelyos.com",
    "temp_password": "TempPass123!",
    "error_message": null
  }
}
```

---

### Seed Data

**POST** `/api/super-admin/seed-data/generate`
```json
{
  "tenant_id": 123,
  "volumetry": "standard",
  "modules": ["store", "stock", "crm", "marketing"],
  "reset_before_seed": false,
  "enable_relations": true,
  "enable_unsplash_images": true
}
```

**Response** :
```json
{
  "success": true,
  "job_id": "seed-uuid-456"
}
```

---

**GET** `/api/super-admin/seed-data/status/{job_id}`

**Response** :
```json
{
  "success": true,
  "data": {
    "status": "running",  // pending | running | completed | error
    "progress_percent": 45,
    "current_module": "crm",
    "results": {
      "store": { "count": 250, "duration_seconds": 12.5 },
      "stock": { "count": 150, "duration_seconds": 8.2 }
    },
    "error_message": null
  }
}
```

---

## ✅ Checklist Tests

### Navigation
- [ ] Bouton "Installation Guidée" visible sur `/tenants`
- [ ] Clic bouton → Navigation vers `/tenants/install`
- [ ] URL directe `/tenants/install` fonctionne

### Step 1
- [ ] Email invalide → Message erreur inline
- [ ] Nom < 2 chars → Message erreur inline
- [ ] Domain auto-généré correctement (slug)
- [ ] Bouton "Suivant" désactivé si validation échoue

### Step 2
- [ ] 3 plans affichés (Starter, Pro, Enterprise)
- [ ] Badge "Recommandé" sur Pro
- [ ] Sélection plan → Border teal + checkmark
- [ ] Bouton "Suivant" activé après sélection

### Step 3
- [ ] Toggle "Générer données" ON par défaut
- [ ] Si OFF → Masquer options seed
- [ ] Volumétrie Standard sélectionnée par défaut
- [ ] 8 modules tous cochés par défaut
- [ ] Options avancées cochées par défaut
- [ ] Décochage tous modules + seed ON → Bouton désactivé

### Step 4
- [ ] Récapitulatif complet affiché
- [ ] Toutes les infos Step 1 visibles
- [ ] Plan sélectionné affiché (badge)
- [ ] Modules seed affichés (badges)
- [ ] Warning si volumétrie Large
- [ ] Bouton "Lancer l'installation" ▶️

### Step 5
- [ ] Phase provisioning démarre automatiquement
- [ ] Progress bar 0% → 100%
- [ ] Polling toutes les 3s
- [ ] Transition automatique vers seed (si activé)
- [ ] Phase seed progress 0% → 100%
- [ ] Page succès affiche URLs + credentials + stats
- [ ] Boutons "Créer autre" et "Retour" fonctionnels

### Dark Mode
- [ ] Tous éléments visibles en dark mode
- [ ] Progress bars visibles (teal)
- [ ] Cards plan lisibles
- [ ] Inputs forms adaptés
- [ ] Warning amber visible

---

## 🚀 Tests End-to-End Recommandés

### Scénario 1 : Installation complète avec seed Standard

1. Ouvrir http://localhost:9000/tenants
2. Cliquer "Installation Guidée" ✨
3. Step 1 : Remplir "Boutique Test", email, nom admin
4. Step 2 : Sélectionner Pro
5. Step 3 : Laisser par défaut (Standard, tous modules)
6. Step 4 : Valider récapitulatif
7. Step 5 : Observer provisioning (~1min)
8. Step 5 : Observer seed (~3min)
9. Vérifier page succès : URLs, credentials, stats
10. Cliquer URL boutique → Ouvrir nouvel onglet
11. Cliquer URL backoffice → Se connecter avec credentials

**Résultat attendu** : Instance complète fonctionnelle avec ~2000 enregistrements.

---

### Scénario 2 : Installation sans seed data

1. Lancer wizard
2. Step 3 : Désactiver toggle "Générer données"
3. Valider + lancer
4. Vérifier : Seulement phase provisioning (pas seed)
5. Page succès : Pas de section "Données générées"

**Résultat attendu** : Instance vide fonctionnelle.

---

### Scénario 3 : Gestion erreurs

1. Step 1 : Email invalide → Vérifier message erreur
2. Step 3 : Décocher tous modules + seed ON → Bouton désactivé
3. (Simuler erreur backend 500) → Vérifier page erreur

---

## 📊 Métriques de Performance

### Temps moyens observés

- **Provisioning** : 1-2 minutes (12 étapes)
- **Seed Minimal** : 30s - 1min (~200 records)
- **Seed Standard** : 2-5min (~2000 records)
- **Seed Large** : 5-10min (~5000 records)

### Polling

- **Intervalle** : 3 secondes
- **Arrêt automatique** : Quand status = `completed` ou `failed` ou `error`

---

## 🔐 Sécurité

- ✅ **Validation frontend** : Email format, min length
- ✅ **Validation backend** : Endpoints API (à implémenter côté Odoo)
- ✅ **Credentials temporaires** : Password affiché une seule fois
- ✅ **Anonymisation Odoo** : Termes backend génériques (infrastructure, provisioning)

---

## 🎯 Next Steps (Améliorations futures)

- [ ] Confirmation modal si user quitte pendant provisioning
- [ ] Timeout protection (warning si > 5min)
- [ ] Retry automatique en cas d'erreur réseau
- [ ] Sauvegarde config wizard (localStorage)
- [ ] Export rapport installation (PDF)
- [ ] Notification email après installation
- [ ] Analytics tracking (mixpanel events)

---

## 📝 Notes Développeur

### État du wizard (useInstallWizard)

```typescript
interface InstallConfig {
  // Step 1
  name: string
  domain: string
  admin_email: string
  admin_name: string

  // Step 2
  plan_code: 'starter' | 'pro' | 'enterprise'

  // Step 3
  generate_seed: boolean
  seed_volumetry?: 'minimal' | 'standard' | 'large'
  seed_modules?: string[]
  seed_enable_relations?: boolean
  seed_enable_unsplash?: boolean
}
```

### Validation par étape

- **Step 1** : Email regex + length >= 2
- **Step 2** : plan_code !== null
- **Step 3** : !generate_seed || seed_modules.length > 0
- **Step 4** : Toujours valide
- **Step 5** : Pas de validation (auto-démarrage)

---

Fin du document.
