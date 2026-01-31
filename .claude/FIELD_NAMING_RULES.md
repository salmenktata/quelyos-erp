# 🏷️ Règles de Nommage Champs Odoo - À RESPECTER DÈS L'ÉCRITURE

## ⚠️ RÈGLE ABSOLUE
**TOUJOURS vérifier `_name` vs `_inherit` AVANT de créer un champ**

---

## 📋 Décision : Préfixe x_ ou pas ?

### ✅ Modèles `_name = 'quelyos.*'` (NOUVEAUX modèles Quelyos)
**Champs SANS préfixe x_ autorisés**

```python
class MyModel(models.Model):
    _name = 'quelyos.my_model'  # ← Modèle Quelyos pur
    _description = 'Mon modèle custom'
    
    # ✅ OK - Pas de risque collision avec Odoo
    name = fields.Char('Nom')
    code = fields.Char('Code')
    custom_field = fields.Integer('Champ custom')
    is_active = fields.Boolean('Actif')
```

**Raison** : Modèle entièrement custom, aucun risque de collision avec Odoo core.

---

### ❌ Modèles `_inherit` (HÉRITAGE Odoo core)
**Préfixe x_ OBLIGATOIRE sur tous les champs ajoutés**

```python
class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'  # ← Héritage Odoo core
    
    # ✅ OBLIGATOIRE - Préfixe x_
    x_mtbf_hours = fields.Float('MTBF')
    x_is_critical = fields.Boolean('Critique')
    x_serial_number = fields.Char('N° Série')
    
    # ❌ INTERDIT - Collision possible avec Odoo 19.1+
    mtbf_hours = fields.Float('MTBF')  # Risque collision !
    is_critical = fields.Boolean('Critique')  # Risque collision !
```

**Raison** : Éviter collision si Odoo 19.1+ ajoute un champ du même nom.

---

## 🚫 Exceptions (ne PAS préfixer x_)

### 1. Champ multi-tenant standard
```python
tenant_id = fields.Many2one('quelyos.tenant')  # ✅ Exception autorisée
```

### 2. Champs core Odoo overridés (modification comportement)
```python
class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    # ✅ Override champ Odoo existant (pas x_)
    name = fields.Char(
        string='Nom produit',
        compute='_compute_name',  # Modification comportement
        store=True
    )
```

**Champs core Odoo** (ne jamais ajouter, seulement override) :
- `name`, `active`, `sequence`, `company_id`, `state`
- `currency_id` (pour champs Monetary)
- `color` (pour tags/catégories Odoo standard)

---

## 📝 Checklist Création Champ

Avant de créer un champ, se poser ces questions :

1. **Le modèle est-il `_name = 'quelyos.*'` ?**
   - ✅ Oui → Pas de préfixe x_ nécessaire
   - ❌ Non (c'est un `_inherit`) → Préfixe x_ OBLIGATOIRE

2. **C'est un champ `tenant_id` ?**
   - ✅ Oui → Exception, pas de x_
   - ❌ Non → Suivre règle 1

3. **C'est un override de champ Odoo existant ?**
   - ✅ Oui (modification comportement) → Pas de x_
   - ❌ Non (nouveau champ) → Préfixe x_ si _inherit

---

## ❌ Exemples INCORRECTS

```python
# ❌ MAUVAIS - _inherit sans préfixe x_
class HREmployee(models.Model):
    _inherit = 'hr.employee'
    
    employee_number = fields.Char()  # RISQUE COLLISION !
    first_name = fields.Char()       # RISQUE COLLISION !
```

```python
# ❌ MAUVAIS - _name avec préfixe x_ (inutile)
class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    
    x_name = fields.Char()  # Inutile, aucun risque collision
    x_code = fields.Char()  # Inutile, aucun risque collision
```

---

## ✅ Exemples CORRECTS

```python
# ✅ BON - _inherit avec préfixe x_
class HREmployee(models.Model):
    _inherit = 'hr.employee'
    
    x_employee_number = fields.Char()
    x_first_name = fields.Char()
    x_last_name = fields.Char()
```

```python
# ✅ BON - _name sans préfixe x_
class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    
    name = fields.Char()
    code = fields.Char()
    domain = fields.Char()
```

```python
# ✅ BON - Override champ Odoo (pas de x_)
class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    # Override champ existant
    name = fields.Char(compute='_compute_name', store=True)
    
    # Nouveau champ → x_ obligatoire
    x_is_featured = fields.Boolean()
```

---

## 🎯 Cas d'Usage Fréquents

### Maintenance (GMAO)
```python
class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'
    
    # ✅ Nouveaux champs → x_ obligatoire
    x_mtbf_hours = fields.Float()
    x_is_critical = fields.Boolean()
```

### RH
```python
class HREmployee(models.Model):
    _inherit = 'hr.employee'
    
    # ✅ Nouveaux champs → x_ obligatoire
    x_employee_number = fields.Char()
    x_cnss = fields.Char()
```

### Stock
```python
class StockQuant(models.Model):
    _inherit = 'stock.quant'
    
    # ✅ Nouveaux champs → x_ obligatoire
    x_low_stock_threshold = fields.Float()
```

---

## 📖 Références

- `.claude/ODOO_ISOLATION_RULES.md` - Règles complètes isolation Odoo
- `.claude/MIGRATION_FIELDS_PREFIX.md` - Plan migration champs existants
- `.claude/MIGRATION_TEMPLATE.py` - Template migration avec alias

---

## ⚡ Résumé Visuel

```
┌─────────────────────────────────────────────────────────┐
│ Création nouveau champ Odoo                              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │ _name = 'quelyos.*' ?   │
           └─────────────────────────┘
                    │          │
              ✅ OUI          ❌ NON
                    │          │
                    ▼          ▼
         ┌──────────────┐  ┌────────────────┐
         │ Pas de x_    │  │ _inherit ?     │
         │ name = ...   │  └────────────────┘
         └──────────────┘          │
                                   ▼
                        ┌──────────────────────┐
                        │ Override existant ?  │
                        └──────────────────────┘
                              │          │
                        ✅ OUI        ❌ NON
                              │          │
                              ▼          ▼
                    ┌──────────────┐  ┌──────────────┐
                    │ Pas de x_    │  │ x_ REQUIS !  │
                    │ name = ...   │  │ x_name = ... │
                    └──────────────┘  └──────────────┘
```

---

## 🔄 Migration Progressive

Si vous trouvez des champs sans préfixe x_ dans un modèle `_inherit`, suivre :
1. Créer branche `migration/[model]-fields-prefix`
2. Suivre template `.claude/MIGRATION_TEMPLATE.py`
3. Tester upgrade
4. Documenter dans `.claude/MIGRATION_FIELDS_PREFIX.md`

---

## ⚠️ EXCEPTION IMPORTANTE : selection_add

### ❌ NE PAS préfixer x_ pour selection_add
Quand vous **étendez** un champ Selection Odoo existant avec `selection_add`, **ne PAS** ajouter de préfixe `x_`.

**Raison** : Vous n'ajoutez pas un nouveau champ, vous étendez un champ Odoo core existant.

```python
# ✅ CORRECT - Extension Selection sans x_
class MyModel(models.Model):
    _inherit = 'some.model'
    
    code = fields.Selection(
        selection_add=[
            ('custom_value', 'Valeur Custom'),
            ('another_value', 'Autre Valeur'),
        ],
        ondelete={'custom_value': 'set default', 'another_value': 'cascade'}
    )

# ❌ INCORRECT - selection_add avec x_ (erreur !)
class MyModel(models.Model):
    _inherit = 'some.model'
    
    x_code = fields.Selection(  # ERREUR : le champ s'appelle 'code' dans Odoo !
        selection_add=[...]
    )
```

### Autres extensions de champs Odoo core
Même règle pour :
- `selection_add` (ajouter valeurs à Selection)
- `domain` override (modifier domaine)
- `related` redéfinition (modifier related)
- `compute` override (modifier compute)

**Règle générale** : Si vous **modifiez un champ Odoo existant**, gardez le nom original (sans `x_`).

---

## 📊 Récapitulatif Exceptions (ne PAS préfixer x_)

| Cas | Exemple | Raison |
|-----|---------|--------|
| Modèle `_name = 'quelyos.*'` | `name = fields.Char()` | Modèle Quelyos pur, pas de collision |
| Champ `tenant_id` | `tenant_id = fields.Many2one()` | Standard multi-tenant Quelyos |
| Override champ Odoo | `name = fields.Char(compute=...)` | Modification champ existant |
| **selection_add** | `code = fields.Selection(selection_add=...)` | **Extension champ existant** |
| domain/related override | `partner_id = fields.Many2one(domain=...)` | Modification champ existant |

---

## ✅ Checklist Finale

Avant de créer un champ dans un modèle `_inherit` :

1. ✅ C'est un **nouveau champ** ? → Préfixe `x_` OBLIGATOIRE
2. ❌ C'est `tenant_id` ? → Exception, pas de `x_`
3. ❌ C'est un **override/extension** de champ Odoo ? → Pas de `x_`
   - Override avec `compute`, `domain`, `related`
   - Extension avec `selection_add`
   - Modification `default`, `required`, `help`

