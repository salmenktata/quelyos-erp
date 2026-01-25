# Parité Fonctionnelle Totale avec Odoo

## Principe
Quelyos ERP = 100% fonctionnalités Odoo + UX exceptionnelle, SANS modifier Odoo.

## Règle 1 : Audit obligatoire avant "module terminé"
1. Lister TOUTES les fonctionnalités Odoo du module
2. Vérifier chaque fonctionnalité dans Quelyos (Backend + Frontend + Backoffice)
3. Documenter dans README.md avec statut : ✅ Implémenté, 🟡 Partiel, 🔴 Manquant
4. Prioriser gaps : P0 (Bloquant), P1 (Important), P2 (Nice-to-have)

## Règle 2 : NE JAMAIS modifier Odoo

### INTERDIT
- Modifier schéma DB Odoo
- Ajouter champs custom aux modèles standards
- Modifier méthodes core Odoo
- Créer tables SQL hors ORM
- Modifier workflows standards

### AUTORISÉ
- API JSON-RPC Odoo (search, read, write, create, unlink)
- Modèles existants (product.template, sale.order, res.partner...)
- Champs calculés Odoo (qty_available, amount_total...)
- State management frontend (Zustand, localStorage)
- Calculs/agrégations côté frontend

## Règle 3 : Alertes immédiates

### CRITIQUES (bloquant)
- Modification schéma DB
- Nouveau modèle custom `quelyos.*`
- Champ stocké sur modèle standard
- API breaking change

### IMPORTANTES (validation requise)
- Fonctionnalité Odoo non implémentée
- Écart fonctionnel vs Odoo natif
- Performance dégradée

## Format tableau correspondance
```markdown
| Fonctionnalité Odoo | Backend | Frontend | Backoffice | Statut | Priorité |
|---------------------|---------|----------|------------|--------|----------|
| Créer produit | POST /api/... | - | ProductForm | ✅ | - |
```
