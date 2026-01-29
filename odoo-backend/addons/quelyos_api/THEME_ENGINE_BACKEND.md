# Theme Engine - Intégration Backend Odoo ✅

## 📊 Récapitulatif Implémentation

**Status** : ✅ **BACKEND COMPLET**

### 🎯 Composants Créés

| Composant | Fichier | Status |
|-----------|---------|--------|
| **Modèle Theme** | `models/theme.py` | ✅ |
| **Extension Tenant** | `models/tenant.py` | ✅ |
| **Controller API** | `controllers/theme.py` | ✅ |
| **Vues Odoo** | `views/theme_views.xml` | ✅ |
| **Données Migration** | `data/theme_data.xml` | ✅ |
| **Sécurité** | `security/ir.model.access.csv` | ✅ |
| **Manifest** | `__manifest__.py` | ✅ |

**TOTAL** : **7 fichiers** modifiés/créés

---

## 📝 Détails Modèles

### 1. quelyos.theme

**Fichier** : `models/theme.py`

**Champs principaux** :
```python
code                    # Identifiant unique (kebab-case)
name                    # Nom d'affichage
description             # Description courte
category                # Selection (fashion, tech, food, etc.)
config_json             # Configuration JSON complète (CDATA)
version                 # Version semver
is_public               # Boolean (visible par tous)
is_premium              # Boolean (payant)
price                   # Float (TND)
thumbnail               # Binary (image preview)
preview_url             # Char (URL démo)
screenshot_ids          # One2many → quelyos.theme.screenshot
review_ids              # One2many → quelyos.theme.review
downloads               # Integer (compteur)
rating                  # Float computed (moyenne avis)
tenant_ids              # Many2many (accès privé)
```

**Méthodes** :
- `get_theme_config()` : Retourne JSON config + métadonnées
- `action_increment_downloads()` : Incrémente compteur
- `api_list_themes(category, limit, offset, tenant_id)` : Liste filtrée

**Validations** :
- JSON valide (constrains)
- Code format kebab-case (regex)
- ID JSON = code modèle
- Prix >= 0

---

### 2. quelyos.tenant (extension)

**Fichier** : `models/tenant.py`

**Nouveaux champs** :
```python
active_theme_id         # Many2one → quelyos.theme
purchased_theme_ids     # Many2many → quelyos.theme
theme_overrides         # Text (JSON partiel)
```

**Nouvelles méthodes** :
```python
def get_active_theme_config(self):
    """
    Retourne config du thème actif avec overrides appliqués.
    Si pas de thème → active thème "default" automatiquement
    """

def _deep_merge_dict(base, override):
    """Merge récursif des overrides JSON"""

def action_set_theme(self, theme_code):
    """
    Active un thème pour le tenant.
    Vérifie : public OU acheté si premium
    """
```

---

### 3. quelyos.theme.screenshot

**Modèle secondaire** : Screenshots pour galerie

```python
theme_id        # Many2one → quelyos.theme
sequence        # Integer (ordre)
name            # Char (ex: Homepage, Product Page)
image           # Binary (screenshot)
```

---

### 4. quelyos.theme.review

**Modèle reviews** : Avis utilisateurs

```python
theme_id        # Many2one → quelyos.theme
tenant_id       # Many2one → quelyos.tenant
user_id         # Many2one → res.users
rating          # Integer (1-5)
title           # Char
comment         # Text
```

**Contrainte** : 1 review par tenant par thème

---

## 🌐 Endpoints API

**Fichier** : `controllers/theme.py`

### GET /api/themes/<code>

Récupère un thème par code.

**Params** :
- `theme_code` (str) : Code du thème

**Response** :
```json
{
  "success": true,
  "theme": {
    "id": "fashion-luxury",
    "name": "Fashion Luxury",
    "description": "...",
    "category": "fashion",
    "version": "1.0.0",
    "is_premium": false,
    "price": 0.0,
    "rating": 4.8,
    "downloads": 1523,
    "config": { ... }
  }
}
```

---

### GET /api/themes

Liste les thèmes disponibles.

**Params** :
- `category` (str, optional) : Filtrer par catégorie
- `limit` (int) : Default 50
- `offset` (int) : Default 0
- `tenant_id` (int, optional) : Pour thèmes privés

**Response** :
```json
{
  "success": true,
  "themes": [
    {
      "id": "fashion-luxury",
      "name": "Fashion Luxury",
      "description": "...",
      "category": "fashion",
      "is_premium": false,
      "price": 0.0,
      "rating": 4.8,
      "review_count": 156,
      "downloads": 1523,
      "thumbnail": "/web/image/quelyos.theme/1/thumbnail",
      "preview_url": "https://demo.quelyos.tn/fashion-luxury"
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

---

### GET /api/tenants/<id>/theme

Récupère le thème actif d'un tenant (avec overrides).

**Params** :
- `tenant_id` (int)

**Response** : Même que GET /api/themes/<code> mais avec overrides appliqués

---

### POST /api/tenants/<id>/theme/set

Active un thème pour un tenant.

**Params** :
- `tenant_id` (int)
- `theme_code` (str)

**Auth** : `user` (authentification requise)

**Response** :
```json
{
  "success": true,
  "theme_code": "tech-minimal",
  "theme_name": "Tech Minimal"
}
```

**Erreurs** :
- `Theme not found`
- `Theme not accessible` (si privé et pas autorisé)
- `Theme not purchased` (si premium non acheté)

---

### POST /api/tenants/<id>/theme/overrides

Définit des overrides JSON pour personnaliser le thème.

**Params** :
- `tenant_id` (int)
- `overrides` (dict) : JSON partiel

**Example** :
```json
{
  "colors": {
    "primary": "#ff0000"
  },
  "layouts": {
    "homepage": {
      "sections": [
        {
          "type": "hero",
          "variant": "custom",
          "config": { ... }
        }
      ]
    }
  }
}
```

---

### POST /api/themes/<id>/review

Ajoute un avis sur un thème.

**Params** :
- `theme_id` (int)
- `rating` (int) : 1-5
- `title` (str, optional)
- `comment` (str, optional)
- `tenant_id` (int, optional)

**Auth** : `user`

---

### GET /api/themes/<id>/reviews

Liste les avis d'un thème.

**Params** :
- `theme_id` (int)
- `limit` (int) : Default 10
- `offset` (int) : Default 0

---

## 🎨 Vues Odoo

**Fichier** : `views/theme_views.xml`

### Vue Tree

Liste des thèmes avec :
- Thumbnail
- Code, nom, catégorie
- Public/Premium toggles
- Prix, rating, downloads

### Vue Kanban

Galerie visuelle avec :
- Grandes images
- Badges (Premium)
- Note + téléchargements
- Bouton Preview (si URL définie)

### Vue Form

Formulaire complet avec :
- Header actions (Preview, Archive)
- Ribbons (Premium)
- Onglets :
  - **Config JSON** (widget ACE JSON)
  - **Avis** (liste reviews)
- Boutons stat (Reviews, Downloads)

### Vue Search

Filtres :
- Publics/Privés
- Gratuits/Premium
- Actifs/Archivés

Regroupements :
- Par catégorie
- Par premium/gratuit
- Par public/privé

### Actions & Menu

**Menu** :
```
Quelyos
└── Theme Engine
    ├── Thèmes
    └── Avis
```

---

## 📦 Données Migration

**Fichier** : `data/theme_data.xml`

### 3 Thèmes Pré-chargés

**1. Fashion Luxury** (`fashion-luxury`)
- Catégorie : Fashion
- Gratuit, Public
- 4 sections homepage (Hero Slider, Products, Newsletter, Testimonials)
- Layouts complets (homepage, productPage, categoryPage)

**2. Tech Minimal** (`tech-minimal`)
- Catégorie : Tech
- Gratuit, Public
- 4 sections homepage (Hero Centered, Carousel, Trust Badges, Newsletter)
- Design épuré, moderne

**3. Food Organic** (`food-organic`)
- Catégorie : Food
- Gratuit, Public
- 4 sections homepage (Hero Parallax, Grid Products, Testimonials, Newsletter)
- Ambiance chaleur

euse

**4. Default** (`default`)
- Alias vers Fashion Luxury
- Appliqué automatiquement si tenant sans thème

---

## 🔒 Sécurité

**Fichier** : `security/ir.model.access.csv`

**Droits d'accès** :

| Modèle | Public | User | Manager |
|--------|--------|------|---------|
| **quelyos.theme** | Read | Read/Write | Full |
| **quelyos.theme.screenshot** | Read | Read/Write/Create | Full |
| **quelyos.theme.review** | Read | Read/Write/Create | Full |

**Groupes utilisés** :
- `base.group_public` : Accès lecture thèmes
- `group_quelyos_home_user` : Gestion thèmes
- `group_quelyos_home_manager` : Administration complète

---

## 🚀 Installation & Upgrade

### 1. Upgrade du module

```bash
cd odoo-backend
./odoo-bin -u quelyos_api -d quelyos_db --stop-after-init
```

OU via commande :

```bash
/upgrade-odoo
```

### 2. Vérifier données chargées

```python
# Console Odoo
themes = env['quelyos.theme'].search([])
print(f"Thèmes chargés : {len(themes)}")
for theme in themes:
    print(f"- {theme.code} ({theme.name})")
```

**Attendu** :
```
Thèmes chargés : 4
- fashion-luxury (Fashion Luxury)
- tech-minimal (Tech Minimal)
- food-organic (Food Organic)
- default (Thème par Défaut)
```

### 3. Tester API

```bash
# Lister thèmes
curl -X POST http://localhost:8069/api/themes \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{}}'

# Récupérer thème spécifique
curl -X POST http://localhost:8069/api/themes/fashion-luxury \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{}}'

# Thème actif d'un tenant
curl -X POST http://localhost:8069/api/tenants/1/theme \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"call","params":{}}'
```

---

## 📋 Checklist Validation

### Modèles

- [x] Modèle `quelyos.theme` créé
- [x] Modèle `quelyos.theme.screenshot` créé
- [x] Modèle `quelyos.theme.review` créé
- [x] Extension `quelyos.tenant` (3 champs)
- [x] Méthodes `get_active_theme_config()` et `action_set_theme()`
- [x] Validations JSON Schema

### Controller

- [x] Endpoint GET `/api/themes/<code>`
- [x] Endpoint GET `/api/themes`
- [x] Endpoint GET `/api/tenants/<id>/theme`
- [x] Endpoint POST `/api/tenants/<id>/theme/set`
- [x] Endpoint POST `/api/tenants/<id>/theme/overrides`
- [x] Endpoint POST `/api/themes/<id>/review`
- [x] Endpoint GET `/api/themes/<id>/reviews`

### Vues

- [x] Vue Tree
- [x] Vue Kanban
- [x] Vue Form (avec ACE JSON)
- [x] Vue Search (filtres + regroupements)
- [x] Actions et menu
- [x] Extension vue Tenant (champs theme)

### Données

- [x] 3 thèmes pré-chargés (Fashion, Tech, Food)
- [x] Thème "default" alias
- [x] JSON config complets (CDATA)

### Sécurité

- [x] Droits quelyos.theme (public, user, manager)
- [x] Droits quelyos.theme.screenshot
- [x] Droits quelyos.theme.review

### Manifest

- [x] Import models/theme.py
- [x] Import controllers/theme.py
- [x] data/theme_data.xml dans manifest
- [x] views/theme_views.xml dans manifest
- [x] Version incrémentée

---

## 🎯 Prochaines Étapes (Frontend)

### 1. Tester endpoints depuis vitrine-client

```typescript
// vitrine-client/src/lib/theme.ts
export async function fetchTheme(themeCode: string) {
  const response = await fetch(`${process.env.BACKEND_URL}/api/themes/${themeCode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {}
    })
  });
  return response.json();
}
```

### 2. Adapter layout.tsx vitrine-client

```typescript
// vitrine-client/src/app/layout.tsx
import { ThemeRenderer } from '@/theme-engine';

export default async function RootLayout({ children }) {
  const tenant = await getTenant(); // depuis cookie/subdomain
  const themeResponse = await fetch(`/api/tenants/${tenant.id}/theme`);
  const themeData = await themeResponse.json();

  return (
    <html>
      <body>
        <ThemeRenderer config={themeData.result.theme.config}>
          {children}
        </ThemeRenderer>
      </body>
    </html>
  );
}
```

### 3. Page sélection thèmes (dashboard-client)

```typescript
// dashboard-client/src/pages/settings/themes.tsx
import { useState, useEffect } from 'react';

export default function ThemesPage() {
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    fetch('/api/themes').then(res => res.json()).then(data => {
      setThemes(data.result.themes);
    });
  }, []);

  const handleActivate = async (themeCode) => {
    await fetch(`/api/tenants/${tenantId}/theme/set`, {
      method: 'POST',
      body: JSON.stringify({ theme_code: themeCode })
    });
    window.location.reload(); // Refresh pour voir le nouveau thème
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {themes.map(theme => (
        <div key={theme.id} className="theme-card">
          <img src={theme.thumbnail} alt={theme.name} />
          <h3>{theme.name}</h3>
          <button onClick={() => handleActivate(theme.id)}>Activer</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Métriques Finales Backend

**Fichiers créés/modifiés** : 7
**Lignes Python** : ~800 (models + controller)
**Lignes XML** : ~400 (views + data)
**Modèles** : 3 (theme, screenshot, review)
**Endpoints API** : 7
**Thèmes pré-chargés** : 4

**Durée développement** : ~4-5 heures

---

**Date** : 29 janvier 2026
**Phase 3 Backend** : ✅ **COMPLÉTÉE**
**Status global** : **PRÊT POUR TESTS & INTÉGRATION FRONTEND**

## 🎉 Next Steps

1. **Upgrade Odoo** : `/upgrade-odoo`
2. **Tester API** : Appels CURL endpoints
3. **Frontend** : Adapter vitrine-client layout.tsx
4. **Dashboard** : Page sélection thèmes
5. **Tests E2E** : Activation thème → voir changements visuels
