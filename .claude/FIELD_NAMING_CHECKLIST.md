# ✅ Checklist Nommage Champs - À Utiliser Systématiquement

## 🎯 Avant de créer un champ dans un modèle Odoo

### Étape 1 : Identifier le type de modèle
```bash
# Chercher _name ou _inherit dans le fichier
grep -E "^\s+_name\s*=|^\s+_inherit\s*=" models/mon_fichier.py
```

- **Si `_name = 'quelyos.*'`** → ✅ Pas de préfixe x_ nécessaire (STOP)
- **Si `_inherit = 'odoo.model'`** → ⚠️ Continuer étape 2

---

### Étape 2 : Identifier le type de champ

#### A. C'est un NOUVEAU champ ?
```python
# Vous créez un champ qui n'existe PAS dans Odoo core
x_mon_champ = fields.Type(...)  # ✅ x_ OBLIGATOIRE
```

#### B. C'est une EXTENSION/OVERRIDE de champ Odoo ?
```python
# 1. selection_add (ajouter valeurs à Selection existant)
code = fields.Selection(  # ✅ PAS de x_ (nom original)
    selection_add=[('new', 'Nouveau')]
)

# 2. compute override (modifier calcul)
name = fields.Char(  # ✅ PAS de x_ (nom original)
    compute='_compute_name',
    store=True
)

# 3. domain override (modifier domaine)
partner_id = fields.Many2one(  # ✅ PAS de x_ (nom original)
    domain="[('is_company', '=', True)]"
)

# 4. related override (modifier related)
company_id = fields.Many2one(  # ✅ PAS de x_ (nom original)
    related='partner_id.company_id'
)

# 5. Modifier default, required, help, etc.
active = fields.Boolean(  # ✅ PAS de x_ (nom original)
    default=True,
    help="Texte modifié"
)
```

#### C. C'est tenant_id ?
```python
tenant_id = fields.Many2one('quelyos.tenant')  # ✅ Exception, PAS de x_
```

---

## 🚨 Cas Critiques - ATTENTION !

### ❌ Erreur #1 : selection_add avec x_
```python
# ❌ FAUX
x_type = fields.Selection(
    selection_add=[('new', 'Nouveau')]
)

# ✅ CORRECT
type = fields.Selection(
    selection_add=[('new', 'Nouveau')]
)
```

### ❌ Erreur #2 : Override compute avec x_
```python
# ❌ FAUX
x_name = fields.Char(
    compute='_compute_name'
)

# ✅ CORRECT
name = fields.Char(
    compute='_compute_name'
)
```

### ❌ Erreur #3 : Confusion _name vs _inherit
```python
# ❌ FAUX - _name = 'quelyos.*' avec x_ inutile
class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    x_name = fields.Char()  # Inutile !

# ✅ CORRECT
class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    name = fields.Char()  # Pas de x_
```

---

## 📊 Tableau Récapitulatif

| Situation | Préfixe x_ ? | Exemple |
|-----------|--------------|---------|
| `_name = 'quelyos.*'` | ❌ NON | `name = fields.Char()` |
| `_inherit` + NOUVEAU champ | ✅ OUI | `x_mtbf = fields.Float()` |
| `_inherit` + selection_add | ❌ NON | `code = fields.Selection(selection_add=...)` |
| `_inherit` + compute override | ❌ NON | `name = fields.Char(compute=...)` |
| `_inherit` + domain override | ❌ NON | `partner_id = fields.Many2one(domain=...)` |
| `_inherit` + related override | ❌ NON | `company_id = fields.Many2one(related=...)` |
| `tenant_id` (partout) | ❌ NON | `tenant_id = fields.Many2one('quelyos.tenant')` |

---

## 🔍 Comment vérifier si un champ existe dans Odoo ?

### Méthode 1 : Documentation Odoo
```bash
# Chercher dans la doc officielle
https://www.odoo.com/documentation/19.0/developer/reference/backend/orm.html
```

### Méthode 2 : Code source Odoo
```bash
# Chercher le champ dans le code Odoo
grep -r "def _inherit = 'maintenance.equipment'" /usr/lib/python3/dist-packages/odoo/addons/
```

### Méthode 3 : Shell Odoo
```python
# Dans le shell Odoo
self.env['maintenance.equipment']._fields.keys()
```

---

## ⚡ Workflow Rapide

```bash
# 1. Lire le modèle
$ grep "_inherit\|_name" models/mon_fichier.py

# 2. Si _inherit → Vérifier si champ existe dans Odoo
$ grep "mon_champ" /odoo/addons/maintenance/models/*.py

# 3. Décider
#   - Champ trouvé → PAS de x_ (override/extension)
#   - Champ non trouvé → x_ OBLIGATOIRE (nouveau)
#   - Exception tenant_id → PAS de x_
```

---

## 📝 Exemples Complets

### Exemple 1 : Modèle Quelyos pur
```python
class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    
    # ✅ Tous sans x_ (modèle Quelyos pur)
    name = fields.Char()
    code = fields.Char()
    domain = fields.Char()
```

### Exemple 2 : Héritage avec nouveaux champs
```python
class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'
    
    # ✅ Nouveaux champs → x_ obligatoire
    x_mtbf_hours = fields.Float()
    x_is_critical = fields.Boolean()
    
    # ❌ tenant_id → Exception
    tenant_id = fields.Many2one('quelyos.tenant')
```

### Exemple 3 : Héritage avec extension
```python
class ProductTemplate(models.Model):
    _inherit = 'product.template'
    
    # ✅ Extension Selection existant → PAS de x_
    type = fields.Selection(
        selection_add=[
            ('service', 'Service'),
        ]
    )
    
    # ✅ Nouveaux champs → x_ obligatoire
    x_is_featured = fields.Boolean()
    x_trending_score = fields.Integer()
```

---

## 🎯 Références

- `.claude/FIELD_NAMING_RULES.md` - Règles complètes
- `.claude/ODOO_ISOLATION_RULES.md` - Isolation Odoo
- `CLAUDE.md` - Instructions principales
