# Conventions API - Quelyos Suite

**Date** : 2026-01-30
**Version** : 2.0

## Architecture API Suite

**Backend unique** : Odoo 19 (port 8069) partagé par tous les frontends
**Client partagé** : `@quelyos/api-client` (package monorepo) utilisé par toutes les apps
**Authentification** : JWT + tenant isolation via `company_id`

| Consommateur | Package | Base URL |
|---|---|---|
| ERP Complet (dashboard-client) | `@quelyos/api-client` ou local `lib/api.ts` | `http://localhost:8069/api` |
| Super Admin (super-admin-client) | `@quelyos/api-client` | `http://localhost:8069/api` |
| Site Vitrine (vitrine-quelyos) | fetch direct | `/api/` (proxy Next.js) |
| E-commerce (vitrine-client) | fetch direct | `/api/` (proxy Next.js) |

---

## 📐 Format des Données

### Réponses API (Backend → Frontend)

**Format** : **camelCase** (JavaScript/TypeScript)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "listPrice": 99.99,
    "qtyAvailable": 10,
    "categoryId": {
      "id": 5,
      "name": "Electronics"
    },
    "imageUrl": "https://...",
    "createdAt": "2026-01-26T10:00:00Z"
  }
}
```

**Implémentation** : Toutes les méthodes `to_frontend_config()` des modèles Odoo retournent du camelCase.

**Exemples** :
- `tenant.to_frontend_config()` → `{ primaryColor, fontFamily, ... }`
- `preset.to_frontend_config()` → `{ primaryDark, defaultDark, ... }`

---

### Requêtes API (Frontend → Backend)

**Format** : **snake_case OU camelCase acceptés** (conversion automatique)

```json
{
  "name": "Product Name",
  "list_price": 99.99,
  "qty_available": 10
}
```

OU

```json
{
  "name": "Product Name",
  "listPrice": 99.99,
  "qtyAvailable": 10
}
```

**Implémentation** : Les méthodes `_prepare_*_values()` des contrôleurs gèrent automatiquement les deux formats.

**Exemple** :
```python
def _prepare_preset_values(self, data, update=False):
    values = {}

    # Accepter camelCase
    if 'primaryColor' in data:
        values['primary_color'] = data['primaryColor']

    # OU snake_case
    if 'primary_color' in data:
        values['primary_color'] = data['primary_color']

    return values
```

---

## 🔄 Wrapper Standard des Réponses

### Succès

```json
{
  "success": true,
  "data": { ... },
  "message": "Optionnel: message de confirmation"
}
```

### Erreur

```json
{
  "success": false,
  "error": "Message d'erreur lisible",
  "error_code": "ERROR_CODE_CONSTANT"
}
```

**Codes d'erreur standard** :
- `MISSING_FIELDS` : Champs requis manquants
- `NOT_FOUND` : Ressource introuvable (404)
- `FORBIDDEN` : Accès refusé (403)
- `UNAUTHORIZED` : Authentification requise (401)
- `SERVER_ERROR` : Erreur serveur (500)
- `VALIDATION_ERROR` : Données invalides (400)

---

## 📝 Conventions de Nommage

### Endpoints

**Format** : REST standard

```
GET    /api/ecommerce/{resource}              → Liste
GET    /api/ecommerce/{resource}/<id>         → Détail
POST   /api/ecommerce/{resource}/create       → Création
PUT    /api/ecommerce/{resource}/<id>/update  → Modification
DELETE /api/ecommerce/{resource}/<id>/delete  → Suppression
POST   /api/ecommerce/{resource}/<id>/{action} → Action spécifique
```

**Exemples** :
- `GET /api/ecommerce/products` : Liste produits
- `POST /api/ecommerce/products/create` : Créer produit
- `PUT /api/ecommerce/products/42/update` : Modifier produit 42
- `POST /api/ecommerce/orders/123/cancel` : Annuler commande 123

---

## 🔐 Authentification

### Header

```
X-Session-Id: {session_id}
```

Utilisé par le middleware `_authenticate_from_header()` dans `BaseController`.

### Réponse 401

```json
{
  "success": false,
  "error": "Session expirée. Veuillez vous reconnecter.",
  "error_code": "UNAUTHORIZED"
}
```

---

## 🎨 Mapping Champs Spéciaux

### Couleurs

**Backend (Odoo)** : `primary_color`, `secondary_dark`, etc.
**Frontend (Response)** : `primaryColor`, `secondaryDark`, etc.
**Frontend (Request)** : Les deux acceptés

### Relations Odoo Many2one

**Backend** : Tuple `[id, name]`
**Frontend** : Objet `{ id: number, name: string }`

```python
# Backend
category_id = fields.Many2one('product.category')
# Valeur Odoo : (42, "Electronics")

# Frontend conversion
'categoryId': {
    'id': self.category_id.id,
    'name': self.category_id.name
}
```

### Dates

**Backend** : ISO 8601 string
**Frontend** : ISO 8601 string (parse avec `new Date()`)

```python
'createdAt': self.create_date.isoformat() if self.create_date else None
```

---

## ✅ Checklist Nouvelle Endpoint

Quand vous créez un nouvel endpoint :

- [ ] Utiliser `BaseController` comme parent
- [ ] Implémenter OPTIONS pour CORS
- [ ] Wrapper réponse dans `{ success, data/error }`
- [ ] Méthode `to_frontend_config()` retourne camelCase
- [ ] Méthode `_prepare_*_values()` accepte camelCase + snake_case
- [ ] Authentification via `_authenticate_from_header()` si requis
- [ ] Logger les actions importantes
- [ ] Gérer les exceptions avec try/except
- [ ] Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)

---

## 📚 Références

### Exemples de contrôleurs conformes

- `controllers/tenant.py` : CRUD complet avec authentification
- `controllers/theme_preset.py` : CRUD admin avec validation
- `controllers/checkout.py` : Workflow complexe multi-étapes

### Exemples de modèles conformes

- `models/tenant.py` : Conversion camelCase via `to_frontend_config()`
- `models/theme_preset.py` : Relations many2many, validation

---

## 🚀 Migration Existant

Si vous trouvez un endpoint non conforme :

1. **Créer méthode `to_frontend_config()`** si manquante
2. **Ajouter wrapper `{ success, data }`** si manquant
3. **Supporter camelCase** en input dans `_prepare_*_values()`
4. **Documenter dans LOGME.md** la modification

**Ne jamais casser la compatibilité** : Ajouter support camelCase sans retirer snake_case.
