# Intégration Theme Engine avec Backend Odoo

## 🎯 Vue d'Ensemble

Ce document détaille comment le Theme Engine s'intègre avec le backend Odoo pour permettre la gestion multi-tenant des thèmes.

## 🔄 Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    VITRINE-CLIENT (Next.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Theme Engine                                        │   │
│  │  - ThemeRenderer (rendu variables CSS)              │   │
│  │  - SectionRenderer (rendu sections dynamiques)      │   │
│  │  - Composants sections (HeroSlider, Products, etc.) │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ Utilise config JSON              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Fetch Theme depuis Backend                          │   │
│  │  GET /api/themes/{theme_id}                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSONRPC
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               ODOO-BACKEND (Python/Odoo 19)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Module: quelyos_api                                 │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Modèle: quelyos.theme                         │  │   │
│  │  │  - code (string, unique)                       │  │   │
│  │  │  - name (string)                               │  │   │
│  │  │  - category (selection)                        │  │   │
│  │  │  - config_json (text) ← CONFIG COMPLÈTE       │  │   │
│  │  │  - thumbnail (binary)                          │  │   │
│  │  │  - is_public (boolean)                         │  │   │
│  │  │  - price (float)                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Modèle: quelyos.tenant                        │  │   │
│  │  │  - active_theme_id (many2one → quelyos.theme) │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Endpoint: /api/themes/<theme_id>             │  │   │
│  │  │  Retourne: JSON config complet                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Modèles Odoo à Créer

### 1. Modèle `quelyos.theme`

```python
# odoo-backend/addons/quelyos_api/models/theme.py

from odoo import models, fields, api
import json

class QuelyosTheme(models.Model):
    _name = 'quelyos.theme'
    _description = 'Theme Configuration for E-commerce'
    _order = 'name'

    code = fields.Char(
        string='Code',
        required=True,
        index=True,
        help='Unique identifier (e.g., fashion-luxury)'
    )
    name = fields.Char(
        string='Name',
        required=True,
        translate=True
    )
    description = fields.Text(
        string='Description',
        translate=True
    )
    category = fields.Selection(
        selection=[
            ('fashion', 'Mode'),
            ('tech', 'High-Tech'),
            ('food', 'Alimentaire'),
            ('beauty', 'Beauté'),
            ('sports', 'Sports'),
            ('home', 'Maison'),
            ('general', 'Général'),
        ],
        string='Category',
        required=True,
        default='general'
    )
    config_json = fields.Text(
        string='Theme Configuration (JSON)',
        required=True,
        help='Complete theme configuration in JSON format'
    )
    thumbnail = fields.Binary(
        string='Thumbnail',
        attachment=True
    )
    preview_url = fields.Char(
        string='Preview URL',
        help='URL to live preview of this theme'
    )
    is_public = fields.Boolean(
        string='Public',
        default=True,
        help='If false, only specific tenants can use this theme'
    )
    is_premium = fields.Boolean(
        string='Premium',
        default=False
    )
    price = fields.Float(
        string='Price (TND)',
        default=0.0,
        help='0 = Free theme'
    )
    version = fields.Char(
        string='Version',
        default='1.0.0'
    )
    downloads = fields.Integer(
        string='Downloads',
        default=0,
        readonly=True
    )
    rating = fields.Float(
        string='Rating',
        compute='_compute_rating',
        store=True
    )
    active = fields.Boolean(
        string='Active',
        default=True
    )
    tenant_ids = fields.Many2many(
        comodel_name='quelyos.tenant',
        string='Authorized Tenants',
        help='If public=False, only these tenants can use this theme'
    )

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Theme code must be unique!')
    ]

    @api.depends('review_ids.rating')
    def _compute_rating(self):
        for theme in self:
            if theme.review_ids:
                theme.rating = sum(theme.review_ids.mapped('rating')) / len(theme.review_ids)
            else:
                theme.rating = 0.0

    @api.model
    def get_theme_config(self, theme_code):
        """
        Retourne la configuration JSON complète d'un thème
        Utilisé par l'endpoint API
        """
        theme = self.search([('code', '=', theme_code), ('active', '=', True)], limit=1)
        if not theme:
            return {'error': 'Theme not found'}

        try:
            config = json.loads(theme.config_json)
            return {
                'success': True,
                'theme': {
                    'id': theme.code,
                    'name': theme.name,
                    'description': theme.description,
                    'category': theme.category,
                    'version': theme.version,
                    'is_premium': theme.is_premium,
                    'config': config
                }
            }
        except json.JSONDecodeError:
            return {'error': 'Invalid JSON configuration'}

    def action_increment_downloads(self):
        """Incrémente le compteur de téléchargements"""
        self.ensure_one()
        self.downloads += 1
```

### 2. Extension Modèle `quelyos.tenant`

```python
# odoo-backend/addons/quelyos_api/models/tenant.py

from odoo import models, fields

class QuelyosTenant(models.Model):
    _inherit = 'quelyos.tenant'

    active_theme_id = fields.Many2one(
        comodel_name='quelyos.theme',
        string='Active Theme',
        help='Currently active theme for this tenant'
    )
    purchased_theme_ids = fields.Many2many(
        comodel_name='quelyos.theme',
        string='Purchased Themes',
        help='Premium themes purchased by this tenant'
    )

    def get_active_theme_config(self):
        """Retourne la config du thème actif"""
        self.ensure_one()
        if not self.active_theme_id:
            # Retourner thème par défaut
            default_theme = self.env['quelyos.theme'].search([
                ('code', '=', 'default'),
                ('is_public', '=', True)
            ], limit=1)
            return default_theme.get_theme_config(default_theme.code) if default_theme else {}

        return self.active_theme_id.get_theme_config(self.active_theme_id.code)
```

## 🌐 Endpoints API

### 1. Récupérer un thème par code

```python
# odoo-backend/addons/quelyos_api/controllers/theme.py

from odoo import http
from odoo.http import request
import json

class ThemeController(http.Controller):

    @http.route('/api/themes/<string:theme_code>', auth='public', type='jsonrpc', methods=['POST'])
    def get_theme(self, theme_code):
        """
        Récupère la configuration complète d'un thème
        """
        theme_model = request.env['quelyos.theme'].sudo()
        return theme_model.get_theme_config(theme_code)

    @http.route('/api/themes', auth='public', type='jsonrpc', methods=['POST'])
    def list_themes(self, category=None, limit=50, offset=0):
        """
        Liste les thèmes disponibles
        """
        domain = [('is_public', '=', True), ('active', '=', True)]
        if category:
            domain.append(('category', '=', category))

        themes = request.env['quelyos.theme'].sudo().search(domain, limit=limit, offset=offset)

        return {
            'success': True,
            'themes': [{
                'id': theme.code,
                'name': theme.name,
                'description': theme.description,
                'category': theme.category,
                'is_premium': theme.is_premium,
                'price': theme.price,
                'rating': theme.rating,
                'downloads': theme.downloads,
                'thumbnail': f'/web/image/quelyos.theme/{theme.id}/thumbnail' if theme.thumbnail else None
            } for theme in themes],
            'total': request.env['quelyos.theme'].sudo().search_count(domain)
        }

    @http.route('/api/tenants/<int:tenant_id>/theme', auth='user', type='jsonrpc', methods=['POST'])
    def get_tenant_theme(self, tenant_id):
        """
        Récupère le thème actif d'un tenant
        """
        tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)
        if not tenant.exists():
            return {'error': 'Tenant not found'}

        return tenant.get_active_theme_config()

    @http.route('/api/tenants/<int:tenant_id>/theme/set', auth='user', type='jsonrpc', methods=['POST'])
    def set_tenant_theme(self, tenant_id, theme_code):
        """
        Définit le thème actif pour un tenant
        """
        tenant = request.env['quelyos.tenant'].sudo().browse(tenant_id)
        if not tenant.exists():
            return {'error': 'Tenant not found'}

        theme = request.env['quelyos.theme'].sudo().search([('code', '=', theme_code)], limit=1)
        if not theme:
            return {'error': 'Theme not found'}

        # Vérifier si premium et si acheté
        if theme.is_premium and theme.price > 0:
            if theme not in tenant.purchased_theme_ids:
                return {'error': 'Theme not purchased'}

        tenant.active_theme_id = theme.id
        theme.action_increment_downloads()

        return {
            'success': True,
            'theme': theme.code
        }
```

## 💻 Utilisation Frontend (vitrine-client)

### 1. Récupération du thème au niveau layout

```typescript
// vitrine-client/src/app/layout.tsx

import { ThemeRenderer } from '@/theme-engine';
import type { ThemeConfig } from '@/theme-engine';

async function getActiveTheme(): Promise<ThemeConfig> {
  // Récupérer le tenant depuis cookie/subdomain
  const tenant = getTenantFromRequest(); // À implémenter

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/tenants/${tenant.id}/theme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} })
    });

    const data = await response.json();

    if (data.result?.success) {
      return data.result.theme.config as ThemeConfig;
    }

    // Fallback sur thème par défaut
    return (await import('@/theme-engine/themes/fashion-luxury.json')).default as ThemeConfig;

  } catch (error) {
    console.error('Error loading theme:', error);
    // Fallback
    return (await import('@/theme-engine/themes/fashion-luxury.json')).default as ThemeConfig;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeConfig = await getActiveTheme();

  return (
    <html lang="fr">
      <body>
        <ThemeRenderer config={themeConfig}>
          {children}
        </ThemeRenderer>
      </body>
    </html>
  );
}
```

### 2. Sélection de thème dans dashboard-client

```typescript
// dashboard-client/src/pages/settings/theme.tsx

import { useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  category: string;
  is_premium: boolean;
  price: number;
  thumbnail: string | null;
}

export default function ThemeSettingsPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  useEffect(() => {
    // Charger la liste des thèmes
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result?.success) {
          setThemes(data.result.themes);
        }
      });
  }, []);

  const handleSelectTheme = async (themeCode: string) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tenants/${tenantId}/theme/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: { theme_code: themeCode }
      })
    });

    const data = await response.json();
    if (data.result?.success) {
      setActiveTheme(themeCode);
      // Notification succès
    }
  };

  return (
    <Layout>
      <h1>Thèmes Disponibles</h1>
      <div className="grid grid-cols-3 gap-6">
        {themes.map(theme => (
          <div key={theme.id} className="theme-card">
            <img src={theme.thumbnail || '/placeholder.jpg'} alt={theme.name} />
            <h3>{theme.name}</h3>
            <p>{theme.category}</p>
            {theme.is_premium && <span className="badge">Premium - {theme.price} TND</span>}
            <button onClick={() => handleSelectTheme(theme.id)}>
              {activeTheme === theme.id ? 'Actif' : 'Activer'}
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
```

## 🔄 Flux de Données Complet

1. **Chargement initial (SSR)** :
   - Next.js récupère le tenant depuis subdomain/cookie
   - Appel API Odoo `/api/tenants/{id}/theme`
   - Odoo retourne le JSON config du thème actif
   - ThemeRenderer génère les variables CSS
   - Sections rendues avec SectionRenderer

2. **Changement de thème (dashboard)** :
   - Utilisateur clique "Activer" sur un thème
   - Appel `/api/tenants/{id}/theme/set` avec `theme_code`
   - Odoo met à jour `tenant.active_theme_id`
   - Dashboard affiche confirmation
   - **Refresh** de vitrine-client pour appliquer

3. **Données produits dans sections** :
   - Sections `FeaturedProducts` appellent `/api/products`
   - Odoo retourne produits formatés (standard, pas Odoo-specific)
   - Composants affichent avec styles du thème actif

## 🎨 Customisation Tenant

Les tenants peuvent **override** certaines parties du thème :

```python
# Modèle quelyos.tenant
class QuelyosTenant(models.Model):
    _inherit = 'quelyos.tenant'

    theme_overrides = fields.Text(
        string='Theme Overrides (JSON)',
        help='Partial JSON to override specific theme sections'
    )

    def get_active_theme_config(self):
        self.ensure_one()
        base_config = super().get_active_theme_config()

        if self.theme_overrides:
            try:
                overrides = json.loads(self.theme_overrides)
                # Merge overrides (deep merge)
                merged = self._deep_merge(base_config, overrides)
                return merged
            except json.JSONDecodeError:
                pass

        return base_config

    def _deep_merge(self, base, override):
        """Merge récursif de dictionnaires"""
        result = base.copy()
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        return result
```

Exemple override :

```json
{
  "colors": {
    "primary": "#custom-color"
  },
  "layouts": {
    "homepage": {
      "sections": [
        {
          "type": "hero-slider",
          "config": {
            "slides": [
              {
                "image": "/custom-tenant-image.jpg",
                "title": "Mon Titre Personnalisé"
              }
            ]
          }
        }
      ]
    }
  }
}
```

## ✅ Checklist Intégration

- [ ] Créer modèle `quelyos.theme` dans Odoo
- [ ] Créer controller `ThemeController` avec endpoints
- [ ] Étendre modèle `quelyos.tenant` (champ `active_theme_id`)
- [ ] Importer les 3 thèmes exemples en base Odoo
- [ ] Créer page sélection thèmes dans dashboard-client
- [ ] Adapter `vitrine-client/src/app/layout.tsx` pour fetch thème
- [ ] Tester rendu avec différents thèmes
- [ ] Implémenter système d'override (optionnel)
- [ ] Créer migration data pour thème par défaut

## 🚀 Prochaines Étapes

1. **Phase 2** : Compléter les 6 sections manquantes
2. **Phase 3** : Builder visuel (dashboard-client)
3. **Phase 4** : AI Theme Generation
4. **Phase 5** : Marketplace communautaire
