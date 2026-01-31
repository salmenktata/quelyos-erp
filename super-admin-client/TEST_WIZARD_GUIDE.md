# 🧪 Guide de Test - Wizard Installation Guidée

## ✅ Checklist de Test Interactif

Suivez ce guide étape par étape et cochez ✅ au fur et à mesure.

---

## 🎬 Préparation

- [ ] **Navigateur ouvert** sur http://localhost:9000/tenants
- [ ] **Vous êtes connecté** (ou mode DEV activé)
- [ ] **Vous voyez** le bouton **"Installation Guidée" ✨** (gradient teal→emerald)

---

## 📍 Test 1 : Accès au Wizard

### Actions
1. [ ] Cliquer sur le bouton **"Installation Guidée" ✨**

### Résultats attendus
- [ ] URL change pour `/tenants/install`
- [ ] Page wizard s'affiche avec :
  - [ ] Titre "Installation Guidée" avec icône Sparkles
  - [ ] Sous-titre "Créez une nouvelle instance complète en quelques clics"
  - [ ] **Stepper horizontal** affichant 5 étapes (1/5 actif en teal)
  - [ ] Card blanche avec Step 1 affiché

---

## 📋 Test 2 : Step 1 - Informations de base

### État initial
- [ ] **4 champs** affichés :
  - [ ] "Nom de la boutique" (icône Building)
  - [ ] "Domaine" (icône Globe, en lecture seule, grisé)
  - [ ] "Email administrateur" (icône Mail)
  - [ ] "Nom administrateur" (icône User)
- [ ] Bouton "Suivant" visible en bas à droite
- [ ] Bouton "Précédent" désactivé (grisé) en bas à gauche

### Actions - Validation email invalide
1. [ ] Taper dans Email : `test@invalid`
2. [ ] Cliquer en dehors du champ

### Résultats
- [ ] Message erreur rouge sous le champ : "Veuillez entrer une adresse email valide"
- [ ] Bouton "Suivant" **désactivé** (grisé)

### Actions - Remplissage valide
1. [ ] **Nom boutique** : `Boutique Test Claude`
2. [ ] Observer le champ **Domaine**
3. [ ] **Email** : `admin@test-wizard.com`
4. [ ] **Nom admin** : `Claude Admin`

### Résultats
- [ ] Domaine auto-généré : `boutique-test-claude.quelyos.com`
- [ ] Bouton "Suivant" **activé** (teal)
- [ ] Pas de messages d'erreur

### Actions - Navigation
1. [ ] Cliquer sur **"Suivant"**

### Résultats
- [ ] Transition vers Step 2
- [ ] Stepper : Étape 1 avec checkmark vert, Étape 2 avec ring teal

---

## 💳 Test 3 : Step 2 - Choix du Plan

### État initial
- [ ] Titre "Choisissez votre plan"
- [ ] **3 cards plan** affichées côte à côte :
  - [ ] **Starter** : 49€/mois, 5 users, 1000 produits
  - [ ] **Pro** : 99€/mois, 20 users, 10K produits, badge "Recommandé"
  - [ ] **Enterprise** : 299€/mois, Illimité
- [ ] Aucune card sélectionnée par défaut (borders grises)
- [ ] Bouton "Précédent" activé
- [ ] Bouton "Suivant" activé (car un plan est pré-sélectionné: Starter)

### Actions - Sélection plan
1. [ ] Cliquer sur la card **Pro**

### Résultats
- [ ] Card Pro : **Border teal** + background teal-50
- [ ] Checkmark vert en haut à droite de la card
- [ ] Badge "Recommandé" visible
- [ ] Autres cards : Borders grises

### Actions - Navigation
1. [ ] Cliquer sur **"Suivant"**

### Résultats
- [ ] Transition vers Step 3
- [ ] Stepper : 2 checkmarks verts, Étape 3 active

---

## 🗄️ Test 4 : Step 3 - Configuration Seed Data

### État initial
- [ ] Titre "Configuration des données de test"
- [ ] **Toggle principal** "Générer des données de test" : **Activé** (bleu)
- [ ] Warning amber : "Les données générées sont fictives..."
- [ ] **Section Volumétrie** : 3 options (Minimal, Standard avec badge "Recommandé", Large)
- [ ] Standard **sélectionné** par défaut (border teal)
- [ ] **Section Modules** : 8 modules affichés en grid 2 colonnes
- [ ] **Tous cochés** par défaut (8/8)
- [ ] **Section Options avancées** : 2 checkboxes cochées

### Actions - Test toggle OFF
1. [ ] Cliquer sur le **toggle** "Générer données de test"

### Résultats
- [ ] Toggle devient gris (OFF)
- [ ] Sections Volumétrie, Modules, Options **disparaissent**
- [ ] Warning amber disparaît
- [ ] Bouton "Suivant" reste activé

### Actions - Réactiver seed
1. [ ] Re-cliquer sur le **toggle** (ON)

### Résultats
- [ ] Sections réapparaissent
- [ ] Configuration par défaut restaurée

### Actions - Test volumétrie Large
1. [ ] Cliquer sur **"Large"**

### Résultats
- [ ] Card Large : Border teal + background teal-50
- [ ] Texte "Génération plus longue" visible en amber

### Actions - Test modules
1. [ ] Décocher **"Boutique"**
2. [ ] Décocher **"Stock"**

### Résultats
- [ ] Checkboxes décochées
- [ ] 6/8 modules restants cochés
- [ ] Bouton "Suivant" reste activé

### Actions - Test validation modules vides
1. [ ] Décocher **tous les modules** (0/8)

### Résultats
- [ ] Bouton "Suivant" **désactivé** (grisé)

### Actions - Restaurer config valide
1. [ ] Re-cocher au moins **"CRM"** et **"Store"**
2. [ ] Sélectionner volumétrie **"Standard"**

### Résultats
- [ ] Bouton "Suivant" **activé**

### Actions - Navigation
1. [ ] Cliquer sur **"Suivant"**

### Résultats
- [ ] Transition vers Step 4
- [ ] Stepper : 3 checkmarks, Étape 4 active

---

## ✅ Test 5 : Step 4 - Validation

### État initial
- [ ] Titre "Validation et lancement"
- [ ] Sous-titre "Vérifiez votre configuration..."
- [ ] **3 sections** affichées :

#### Section 1 : Informations de base
- [ ] Nom : `Boutique Test Claude`
- [ ] Domaine (icône globe) : `boutique-test-claude.quelyos.com`
- [ ] Email (icône mail) : `admin@test-wizard.com`
- [ ] Nom admin (icône user) : `Claude Admin`

#### Section 2 : Plan sélectionné
- [ ] Badge teal : `PRO`

#### Section 3 : Données de test
- [ ] Volumétrie : `Standard (~2000 enregistrements)`
- [ ] **Liste modules** en badges gris (CRM, Store, etc.)
- [ ] Checkboxes options :
  - [ ] Relations : Coché (teal)
  - [ ] Unsplash : Coché (teal)

### Vérifications visuelles
- [ ] Pas de warning amber (car Standard, pas Large)
- [ ] Note finale teal : "Prêt à lancer l'installation ?"
- [ ] Bouton "Précédent" activé
- [ ] Bouton **"Lancer l'installation"** (icône Play) activé et teal

### Actions - Test navigation arrière
1. [ ] Cliquer sur **"Précédent"**
2. [ ] Observer Step 3
3. [ ] Re-cliquer **"Suivant"** pour revenir à Step 4

### Résultats
- [ ] Configuration **préservée**
- [ ] Retour à Step 4 avec mêmes données

---

## 🚀 Test 6 : Step 5 - Lancement Installation

### ⚠️ IMPORTANT
**Ce test va créer un VRAI tenant dans la base de données !**

- [ ] Je confirme vouloir créer un tenant de test
- [ ] Backend Odoo est **actif** (port 8069)
- [ ] PostgreSQL est **actif** (port 5432)

### Actions
1. [ ] Cliquer sur **"Lancer l'installation"** ▶️

### Résultats attendus - Phase Provisioning

#### Affichage immédiat
- [ ] Transition vers Step 5
- [ ] Stepper : 4 checkmarks, Étape 5 active
- [ ] **Spinner animé** teal (rotation)
- [ ] Titre : "Provisioning de l'instance"
- [ ] Sous-titre : "Configuration infrastructure backend en cours..."
- [ ] **Progress bar** teal (commence à 0%)
- [ ] Pourcentage affiché en grand : `0%`
- [ ] Texte étape courante : "Initialisation..." ou "Creating company..."

#### Pendant le provisioning (observer 1-2 minutes)
- [ ] Progress bar **augmente progressivement** (0% → 100%)
- [ ] Pourcentage **mis à jour** toutes les 3 secondes
- [ ] Texte étape change (ex: "Creating admin user...", "Setting up warehouse...")
- [ ] **Pas d'erreur** console navigateur (F12)

#### Fin provisioning
- [ ] Progress bar atteint **100%**
- [ ] Transition automatique vers **Phase Seed Data**

---

### Résultats attendus - Phase Seed Data

#### Affichage
- [ ] **Nouveau spinner** teal (rotation)
- [ ] Titre change : "Génération des données de test"
- [ ] Sous-titre : "Création de données fictives en cours..."
- [ ] **Progress bar reset** à 0%
- [ ] Module courant affiché : "store", "crm", etc.

#### Pendant la génération (observer 2-5 minutes)
- [ ] Progress bar augmente (0% → 100%)
- [ ] Module courant **change** (store → crm → marketing...)
- [ ] Pourcentage mis à jour toutes les 3 secondes

#### Fin seed data
- [ ] Progress bar atteint **100%**
- [ ] Transition vers **Page Succès** ✅

---

### Résultats attendus - Page Succès

#### Affichage principal
- [ ] **Icône checkmark verte** (grande, h-16)
- [ ] Titre : "Installation réussie !"
- [ ] Sous-titre : "Votre instance est prête à être utilisée"

#### Section "Accès à votre instance"
- [ ] **Card blanche** avec 2 URLs :
  - [ ] Boutique : URL affichée (ex: `https://boutique-test-claude.quelyos.com`)
  - [ ] Backoffice : URL affichée (ex: `https://admin.boutique-test-claude.quelyos.com`)
- [ ] **Boutons "Ouvrir"** avec icône ExternalLink (teal)

#### Section "Informations de connexion" (fond amber)
- [ ] Icône warning (AlertTriangle)
- [ ] Titre : "Informations de connexion"
- [ ] Warning : "Changez votre mot de passe lors de la première connexion"
- [ ] Email affiché : `admin@test-wizard.com` (en code)
- [ ] Mot de passe temporaire affiché (ex: `TempPass123!`) (en code)

#### Section "Données générées"
- [ ] **Grid responsive** (2×4 ou 4×4)
- [ ] Pour chaque module généré :
  - [ ] Count en grand (teal, ex: `250`)
  - [ ] Nom module (ex: "store", "crm")
  - [ ] Durée en secondes (petit texte gris)
- [ ] **Total ~2000 enregistrements** si Standard

#### Boutons actions
- [ ] Bouton primaire teal : **"Créer une autre instance"**
- [ ] Bouton secondaire gris : **"Retour aux tenants"**

---

## 🔗 Test 7 : Accès URLs

### Actions - Test URL Boutique
1. [ ] Cliquer sur bouton **"Ouvrir"** à côté de Boutique
2. [ ] Observer nouvel onglet

### Résultats
- [ ] Nouvel onglet s'ouvre
- [ ] URL commence par `https://...` ou `http://localhost:3001/...` (selon config)
- [ ] Site e-commerce s'affiche (ou erreur si backend pas configuré pour multi-tenants)

### Actions - Test URL Backoffice
1. [ ] Cliquer sur bouton **"Ouvrir"** à côté de Backoffice
2. [ ] Observer nouvel onglet

### Résultats
- [ ] Nouvel onglet s'ouvre
- [ ] Page login dashboard s'affiche
- [ ] Possibilité de se connecter avec :
  - Email : `admin@test-wizard.com`
  - Password : (celui affiché dans section amber)

---

## 🔄 Test 8 : Navigation Post-Installation

### Actions - Créer une autre instance
1. [ ] Revenir à l'onglet wizard
2. [ ] Cliquer sur **"Créer une autre instance"**

### Résultats
- [ ] Retour à `/tenants/install`
- [ ] Wizard **reset** à Step 1
- [ ] Formulaires vides

### Actions - Retour aux tenants
1. [ ] Compléter Step 1 avec données fictives
2. [ ] Step 2 : Sélectionner plan
3. [ ] Step 3 : **Désactiver seed data** (toggle OFF)
4. [ ] Step 4 : Valider
5. [ ] **NE PAS lancer** (pour éviter créer un autre tenant)
6. [ ] Cliquer sur **"Précédent"** plusieurs fois
7. [ ] Retourner à Step 1
8. [ ] Ouvrir manuellement `/tenants` dans URL

### Résultats
- [ ] Page Tenants s'affiche
- [ ] **Nouveau tenant visible** dans la liste : "Boutique Test Claude"
- [ ] Tenant affiché avec :
  - [ ] Logo (gradient teal/emerald par défaut)
  - [ ] Nom : `Boutique Test Claude`
  - [ ] Domain : `boutique-test-claude.quelyos.com`
  - [ ] Plan : Badge `PRO`
  - [ ] État : `TRIAL` ou `ACTIVE`

---

## 🌓 Test 9 : Dark Mode

### Actions
1. [ ] Ouvrir à nouveau `/tenants/install`
2. [ ] Cliquer sur **toggle dark mode** (dans navbar)

### Résultats - Step 1
- [ ] Background page : Gris foncé (dark:bg-gray-900)
- [ ] Card wizard : Gris sombre (dark:bg-gray-800)
- [ ] Textes : Blancs (dark:text-white)
- [ ] Inputs : Gris foncé (dark:bg-gray-700)
- [ ] Borders : Visibles (dark:border-gray-700)
- [ ] Bouton "Suivant" : Teal visible (dark:bg-teal-500)

### Actions - Parcourir toutes les étapes en dark mode
1. [ ] Remplir Step 1 → Suivant
2. [ ] Step 2 : Observer cards plan
3. [ ] Sélectionner Pro → Suivant
4. [ ] Step 3 : Observer modules/volumétrie
5. [ ] Suivant
6. [ ] Step 4 : Observer récapitulatif

### Résultats
- [ ] **Tous les éléments lisibles** en dark mode
- [ ] Pas de texte invisible
- [ ] Progress bars visibles (teal)
- [ ] Warnings amber visibles (dark:bg-amber-900/20)
- [ ] Checkmarks verts visibles
- [ ] Badges lisibles

---

## ✅ Test 10 : Vérification Console

### Actions
1. [ ] Ouvrir **Console développeur** (F12)
2. [ ] Onglet **Console**
3. [ ] Observer pendant navigation dans wizard

### Résultats attendus
- [ ] **Aucune erreur** rouge
- [ ] Pas de warnings critiques
- [ ] Requêtes API visibles (si onglet Network ouvert)

---

## 📊 Résumé Final

### Fonctionnalités validées
- [ ] Navigation wizard (5 étapes)
- [ ] Stepper visuel (checkmarks)
- [ ] Validation formulaires (email, modules)
- [ ] Auto-génération domain
- [ ] Sélection plan (cards)
- [ ] Configuration seed data (toggle, volumétrie, modules)
- [ ] Récapitulatif complet
- [ ] Lancement provisioning (polling)
- [ ] Génération seed data (polling)
- [ ] Page succès (URLs, credentials, stats)
- [ ] Navigation post-installation
- [ ] Dark mode complet
- [ ] Responsive design

### Temps total observé
- [ ] Provisioning : _____ minutes
- [ ] Seed data (Standard) : _____ minutes
- [ ] **Total** : _____ minutes

### Problèmes rencontrés
```
(Noter ici tout bug, erreur, ou comportement inattendu)







```

---

## 🎯 Prochaines Actions

Si tous les tests sont ✅ :
- [ ] Committer les changements
- [ ] Tester sur d'autres navigateurs (Safari, Firefox)
- [ ] Tester mode production (`npm run build`)
- [ ] Documenter dans CHANGELOG

---

**Date du test** : _______________
**Navigateur** : _______________ (version)
**OS** : _______________

Fin du guide de test.
