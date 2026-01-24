# Plan d'Action - Sprints de Parité Fonctionnelle

**Date de création** : 2026-01-24
**Basé sur** : Audit `/parity` complet
**Parité actuelle** : 82% (98 endpoints, 0 gaps P0, 10 gaps P1)
**Objectif** : Atteindre 95%+ de parité fonctionnelle

---

## 📊 Vue d'Ensemble

| Sprint | Durée | Gaps résolus | Parité cible | Priorité |
|--------|-------|--------------|--------------|----------|
| **Sprint 1 - Production MVP** | 1-2 semaines | 3 gaps P1 haute priorité | ~87% | 🔴 CRITIQUE |
| **Sprint 2 - UX Premium** | 1 semaine | 3 gaps P1 moyenne | ~90% | 🟡 HAUTE |
| **Sprint 3 - Optimisation** | 1 semaine | 4 gaps P1 basse | ~95% | 🟢 MOYENNE |

**Total effort estimé** : 3-4 semaines pour atteindre 95% de parité

---

## 🚀 Sprint 1 : Production MVP (1-2 semaines)

**Objectif** : Combler les gaps P1 critiques pour atteindre 87% de parité

### Tâche 1.1 : Interface Factures Backoffice

**Effort** : 1 jour
**Impact** : ⭐⭐⭐⭐⭐ (Obligation légale, comptabilité)
**Module** : Factures

**Backend** : ✅ Déjà prêt (4 endpoints account.move)
- `/api/ecommerce/invoices` (liste)
- `/api/ecommerce/invoices/<id>` (détail)
- `/api/ecommerce/orders/<id>/create-invoice` (création)
- `/api/ecommerce/invoices/<id>/post` (validation)

**À implémenter** :
1. **Page Invoices.tsx** (~300 lignes)
   - Tableau liste factures (pagination 20/page)
   - Colonnes : N°, Date, Client, Commande liée, Montant HT/TTC, Statut (draft/open/paid/cancel)
   - Filtres : statut, date, client, montant
   - Actions : Voir détail, Télécharger PDF, Confirmer (si draft), Annuler

2. **Page InvoiceDetail.tsx** (~250 lignes)
   - Informations facture (n°, date émission, échéance, client, commande)
   - Lignes facture (produit, quantité, prix unitaire, total)
   - Totaux (HT, TVA, TTC)
   - Boutons actions : Confirmer facture (draft→open), Enregistrer paiement (open→paid), Télécharger PDF, Annuler

3. **Hook useInvoices.ts** (déjà existant, vérifier compatibilité)
   - `useInvoices()` pour liste
   - `useInvoice(id)` pour détail
   - `useCreateInvoice()` pour création depuis commande
   - `useConfirmInvoice()` pour validation
   - `useDownloadInvoicePDF()` pour téléchargement

4. **Intégration OrderDetail.tsx**
   - Bouton "Créer facture" si commande confirmée et pas de facture
   - Lien vers facture si existe

**Critères de succès** :
- [ ] Liste factures opérationnelle avec filtres
- [ ] Détail facture complet
- [ ] Bouton "Créer facture" depuis commande
- [ ] Téléchargement PDF fonctionnel
- [ ] Workflow draft → open → paid complet

---

### Tâche 1.2 : Graphiques Analytics Temporels

**Effort** : 2 jours
**Impact** : ⭐⭐⭐⭐ (Décision business, KPIs évolution)
**Module** : Analytics

**Backend à enrichir** :
- Endpoint `/api/ecommerce/analytics/stats` avec nouveaux params :
  - `date_from` (date début période)
  - `date_to` (date fin période)
  - `granularity` ("day", "week", "month")
- Retourner séries temporelles : `{ labels: [...], revenue: [...], orders: [...], customers: [...] }`

**Frontend à implémenter** :
1. **Intégration Chart.js** ou **Recharts**
   ```bash
   cd backoffice && npm install chart.js react-chartjs-2
   # OU
   cd backoffice && npm install recharts
   ```

2. **Composant RevenueChart.tsx** (~150 lignes)
   - Graphique ligne CA par jour/semaine/mois
   - Filtres période : 7j, 30j, 3m, 12m, Personnalisé
   - Tooltip au survol avec détails
   - Export image PNG (optionnel)

3. **Composant OrdersChart.tsx** (~100 lignes)
   - Graphique barres nombre commandes par période
   - Même filtres période

4. **Mise à jour Analytics.tsx**
   - Intégrer les 2 graphiques sous les KPI cards
   - Sélecteur période global (tabs 7j/30j/3m/12m/custom)
   - Date picker pour période personnalisée

**Critères de succès** :
- [ ] Graphique CA temporel avec granularité sélectionnable
- [ ] Graphique commandes temporel
- [ ] Filtres période fonctionnels (7j, 30j, 3m, 12m, custom)
- [ ] Tooltips informatifs au survol
- [ ] Performance correcte (< 2s chargement)

---

### Tâche 1.3 : Panier Abandonné - Sauvegarde & Relance

**Effort** : 3 jours
**Impact** : ⭐⭐⭐⭐⭐ (Conversion e-commerce +15-30% de CA)
**Module** : Panier

**Backend à implémenter** :

1. **Endpoint `/api/ecommerce/cart/abandoned`** (liste paniers abandonnés pour admin)
   - Critère : sale.order state=draft, date > 24h, montant > 0€
   - Retourner : client, montant, date dernière activité, produits

2. **Endpoint `/api/ecommerce/cart/recover/<token>`** (récupérer panier invité)
   - Générer token unique par panier
   - Associer panier au token
   - Retourner panier si token valide

3. **Cron Odoo** : Email relance panier abandonné
   - Exécution quotidienne (cron.xml)
   - Critère : sale.order state=draft, date > 24h, email envoyé = False
   - Template email avec lien récupération : `https://quelyos.com/cart/recover/<token>`
   - Tracker envoi (nouveau champ `abandoned_cart_email_sent`)

**Frontend à implémenter** :

1. **localStorage sauvegarde panier invité**
   - Sauvegarder cart_id dans localStorage après chaque modification
   - Restaurer panier au retour (si session valide)

2. **Page `/cart/recover` (Next.js)**
   - Récupérer token depuis URL
   - Appeler endpoint `/cart/recover/<token>`
   - Restaurer panier dans store Zustand
   - Rediriger vers `/cart`

3. **Template email** (Odoo mail.template)
   - Objet : "Votre panier vous attend !"
   - Corps HTML avec produits, montant, lien CTA récupération
   - Design responsive email

**Backoffice admin** :

1. **Page AbandonedCarts.tsx** (~200 lignes)
   - Liste paniers abandonnés avec infos client
   - Filtres : date, montant min, statut email
   - Actions : Voir détails, Envoyer relance manuelle

**Critères de succès** :
- [ ] Panier invité sauvegardé dans localStorage
- [ ] Page `/cart/recover` fonctionnelle
- [ ] Cron email relance opérationnel (test manuel)
- [ ] Template email design responsive
- [ ] Page admin paniers abandonnés complète
- [ ] Tracking emails envoyés

---

## 🎨 Sprint 2 : UX Premium (1 semaine)

**Objectif** : Améliorer UX paiement et livraison (parité ~90%)

### Tâche 2.1 : Stripe Elements UI Carte

**Effort** : 1 jour
**Impact** : ⭐⭐⭐ (UX paiement sécurisé)
**Module** : Paiement

**À implémenter** :
1. Installer Stripe React SDK
   ```bash
   cd frontend && npm install @stripe/react-stripe-js @stripe/stripe-js
   ```

2. **Composant StripeCardForm.tsx**
   - Wrapper `<Elements>` Stripe
   - `<CardElement>` pour saisie carte
   - Gestion erreurs validation
   - Loading state bouton paiement
   - Intégration avec `/payment/init` et `/payment/confirm`

3. **Mise à jour `/checkout/payment`**
   - Remplacer formulaire placeholder par `<StripeCardForm>`
   - Workflow complet : init PaymentIntent → CardElement → confirm

**Critères de succès** :
- [ ] Widget Stripe Elements affiché
- [ ] Paiement carte fonctionnel end-to-end
- [ ] Gestion erreurs (carte refusée, etc.)
- [ ] UX sécurisée et rassurante

---

### Tâche 2.2 : Remboursements UI

**Effort** : 1 jour
**Impact** : ⭐⭐⭐ (SAV, gestion retours)
**Module** : Paiement

**Backend** : ✅ Endpoint déjà existant (vérifier `/payment/refund`)

**À implémenter** :
1. **Bouton "Rembourser" dans Payments.tsx**
   - Visible si transaction = "authorized" ou "done"
   - Modal confirmation avec montant

2. **Modal RefundModal.tsx** (~100 lignes)
   - Montant remboursement (total ou partiel)
   - Motif (dropdown : erreur, retour client, geste commercial, autre)
   - Confirmation danger

3. **Hook useRefundPayment()**
   - Mutation React Query
   - Appel endpoint `/payment/refund`
   - Toast success/error

**Critères de succès** :
- [ ] Bouton "Rembourser" visible si applicable
- [ ] Modal confirmation complète
- [ ] Remboursement fonctionnel (test mode Stripe)
- [ ] Statut transaction mis à jour après remboursement

---

### Tâche 2.3 : Bon de Livraison PDF

**Effort** : 2 jours
**Impact** : ⭐⭐⭐ (Document logistique obligatoire)
**Module** : Commandes

**Backend à implémenter** :

1. **Report Qweb Odoo** (delivery_slip.xml)
   - Template PDF bon de livraison
   - Informations : N° commande, date, client, adresse livraison, produits (nom, qty), signature

2. **Endpoint `/api/ecommerce/orders/<id>/delivery-slip`**
   - Générer PDF via `report.render_qweb_pdf()`
   - Retourner base64 ou URL téléchargement

**Frontend à implémenter** :

1. **Bouton "Télécharger bon de livraison" dans OrderDetail.tsx**
   - Visible si commande confirmée
   - Appel endpoint → download PDF

2. **Hook useDownloadDeliverySlip()**
   - Fetch PDF
   - Trigger download navigateur

**Critères de succès** :
- [ ] Template PDF bon de livraison créé
- [ ] Bouton téléchargement opérationnel
- [ ] PDF généré conforme (infos complètes)
- [ ] Download navigateur fonctionnel

---

## 📊 Sprint 3 : Optimisation (1 semaine, optionnel)

**Objectif** : Outils admin et automatisation (parité ~95%)

### Tâche 3.1 : Alertes Stock Bas Automatiques

**Effort** : 2 jours
**Impact** : ⭐⭐ (Éviter ruptures)
**Module** : Stock

**À implémenter** :

1. **Champ seuil stock par produit** (optionnel)
   - Ajouter champ `stock_alert_threshold` sur product.template (default 5)
   - UI dans ProductForm.tsx

2. **Cron Odoo** : Vérification stock quotidienne
   - Rechercher produits avec `qty_available <= stock_alert_threshold`
   - Créer activité mail.activity pour admin
   - OU envoyer email récapitulatif

3. **Page admin Alerts.tsx** (optionnel)
   - Liste produits en rupture/stock faible
   - Actions : Commander, Ajuster stock

**Critères de succès** :
- [ ] Cron détection stock faible
- [ ] Notifications admin (email ou activité)
- [ ] Seuil paramétrable par produit

---

### Tâche 3.2 : Export CSV Clients

**Effort** : 0.5 jour
**Impact** : ⭐⭐ (Comptabilité, emailing)
**Module** : Clients

**À implémenter** :

1. **Endpoint `/api/ecommerce/customers/export`**
   - Similaire à `/products/export`
   - Colonnes : ID, Nom, Email, Téléphone, Ville, Pays, Date inscription, Nb commandes, Total dépensé

2. **Bouton "Exporter CSV" dans Customers.tsx**
   - Trigger download CSV

**Critères de succès** :
- [ ] Endpoint export opérationnel
- [ ] Download CSV fonctionnel
- [ ] Colonnes complètes et formatées

---

### Tâche 3.3 : Historique Changements Statut Commandes

**Effort** : 2 jours
**Impact** : ⭐⭐ (Traçabilité, audit)
**Module** : Commandes

**À implémenter** :

1. **Exploiter modèle mail.message Odoo**
   - Odoo track automatiquement changements de statut dans mail.message
   - Endpoint `/api/ecommerce/orders/<id>/history`
   - Retourner liste changements : date, auteur, ancien statut, nouveau statut

2. **Composant OrderTimeline.tsx** (~150 lignes)
   - Timeline verticale avec événements
   - Icônes par type (création, confirmation, livraison, annulation)
   - Date + heure + auteur

3. **Intégration OrderDetail.tsx**
   - Section "Historique" avec timeline

**Critères de succès** :
- [ ] Endpoint historique fonctionnel
- [ ] Timeline visuelle claire
- [ ] Tous changements de statut tracés

---

### Tâche 3.4 : Tracking Livraison Intégré (Optionnel)

**Effort** : 3-4 jours
**Impact** : ⭐⭐⭐ (Expérience client)
**Module** : Commandes

**À implémenter** :

1. **Intégration APIs transporteurs**
   - Colissimo : API tracking
   - Mondial Relay : API tracking
   - OU modules Odoo delivery_*

2. **Endpoint `/api/ecommerce/orders/<id>/tracking`**
   - Retourner statut tracking temps réel : en préparation, expédié, en transit, livré
   - Événements timeline transporteur

3. **Composant TrackingTimeline.tsx**
   - Timeline événements livraison
   - Map localisation colis (optionnel)

4. **Page client `/account/orders/[id]`**
   - Afficher tracking si disponible

**Critères de succès** :
- [ ] APIs transporteurs intégrées
- [ ] Statut tracking temps réel
- [ ] Timeline événements livraison
- [ ] Affichage client fonctionnel

---

## 📋 Checklist de Validation

### Avant de démarrer chaque sprint

- [ ] Lire le sprint plan et comprendre objectifs
- [ ] Vérifier que backend Odoo est à jour
- [ ] Créer branche Git `sprint-X-<nom-tache>`
- [ ] Créer issues GitHub pour chaque tâche

### Pendant le sprint

- [ ] Commit fréquents avec messages explicites
- [ ] Tests manuels après chaque tâche
- [ ] Update README.md si nouveaux endpoints
- [ ] Update LOGME.md à chaque étape importante

### À la fin de chaque sprint

- [ ] Tests complets (backend + frontend + backoffice)
- [ ] Merge branch dans main
- [ ] Update README.md avec nouveaux scores de parité
- [ ] Update LOGME.md avec bilan sprint
- [ ] Ré-exécuter `/parity` pour valider progression

---

## 🎯 KPIs de Succès

| Métrique | Avant Sprint 1 | Après Sprint 1 | Après Sprint 2 | Après Sprint 3 |
|----------|----------------|----------------|----------------|----------------|
| **Parité globale** | 82% | ~87% | ~90% | ~95% |
| **Gaps P0** | 0 ✅ | 0 ✅ | 0 ✅ | 0 ✅ |
| **Gaps P1** | 10 | 7 | 4 | 0 ✅ |
| **Endpoints API** | 98 | ~102 | ~105 | ~110 |
| **Pages Backoffice** | 16 | 17-18 | 18-19 | 19-20 |

---

## 🚀 Prochaines Étapes Immédiates

1. **Créer issues GitHub** pour les 10 gaps P1 (voir template `.github/ISSUE_TEMPLATE/gap-p1.md`)
2. **Planifier Sprint 1** avec jalons clairs (2 semaines max)
3. **Démarrer Tâche 1.1** : Interface Factures (plus rapide, backend prêt)
4. **Paralléliser si équipe** : 1 dev sur Factures, 1 dev sur Analytics, 1 dev sur Panier Abandonné

**Date cible fin Sprint 1** : 2026-02-07 (2 semaines)
**Date cible fin Sprint 2** : 2026-02-14 (1 semaine supplémentaire)
**Date cible fin Sprint 3** : 2026-02-21 (1 semaine supplémentaire)

**Parité 95%+ atteinte le 2026-02-21** 🎉
