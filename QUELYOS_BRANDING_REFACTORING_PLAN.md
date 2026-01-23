# Plan de Refactoring: quelyos_branding

**Date:** 2026-01-23
**Module:** quelyos_branding
**Grade Actuel:** 5/10 (MODERATE - NEEDS REFACTORING)
**Target:** 8.5/10 (EXCELLENT)

---

## 📊 Executive Summary

### Analyse Complète
- **Total lignes:** ~3,922 lignes
- **Fichiers:** 17 composants (Python + JS + SCSS)
- **Issues critiques:** 6
- **Issues majeurs:** 12
- **Tests:** 0% coverage ❌

### Issues Prioritaires

| Priorité | Issue | Sévérité | Impact |
|----------|-------|----------|--------|
| P0 🔴 | God Class (611 lignes) | CRITICAL | Maintenabilité |
| P0 🔴 | JavaScript Performance (2s polling) | HIGH | UX/Performance |
| P0 🔴 | Sélecteurs CSS invalides | CRITICAL | Fonctionnalité |
| P1 🟠 | Cache non thread-safe | MEDIUM | Concurrent access |
| P1 🟠 | Duplication code | MEDIUM | Maintenabilité |
| P1 🟠 | Tests manquants | HIGH | Qualité |

---

## 🎯 Phase 1: Refactoring Python (Semaine 1-2)

### 1.1 Splitter le God Class [res_config_settings.py](backend/addons/quelyos_branding/models/res_config_settings.py)

**Problème:** 611 lignes, 28 champs, 19 méthodes

**Solution:** Créer 4 classes séparées

#### Nouvelle Structure
```python
models/
├── res_config_settings.py        # 150 lignes - Orchestration
├── validators/
│   ├── __init__.py
│   └── image_validator.py        # 150 lignes - Validation images
├── managers/
│   ├── __init__.py
│   ├── logo_manager.py           # 120 lignes - CRUD logos
│   └── theme_manager.py          # 80 lignes - Gestion thèmes
└── utils/
    ├── __init__.py
    └── config_helpers.py         # 60 lignes - Helpers
```

#### A. ImageValidator (validators/image_validator.py)

**Extraire depuis res_config_settings.py:**
- `_validate_image()` (79 lignes)
- Logique magic bytes
- Validation PIL

**Code recommandé:**
```python
# validators/image_validator.py
from odoo import models, api
from odoo.exceptions import ValidationError
import base64
import io

class ImageValidator(models.AbstractModel):
    _name = 'quelyos.branding.image.validator'
    _description = 'Validateur d\'images Quelyos'

    MAGIC_BYTES = {
        b'\xFF\xD8\xFF': 'jpg',
        b'\x89\x50\x4E\x47': 'png',
        b'\x47\x49\x46\x38': 'gif',
        b'\x00\x00\x01\x00': 'ico',
        b'\x3C\x73\x76\x67': 'svg',
    }

    MAX_FILE_SIZES = {
        'logo_main': 2 * 1024 * 1024,      # 2 MB
        'logo_white': 2 * 1024 * 1024,     # 2 MB
        'logo_small': 1 * 1024 * 1024,     # 1 MB
        'logo_email': 1 * 1024 * 1024,     # 1 MB
        'favicon': 512 * 1024,             # 512 KB
    }

    ALLOWED_FORMATS = {
        'logo_main': ['png', 'jpg', 'svg'],
        'logo_white': ['png', 'svg'],
        'logo_small': ['png', 'jpg'],
        'logo_email': ['png', 'jpg'],
        'favicon': ['ico', 'png'],
    }

    @api.model
    def validate_image(self, image_data, image_type):
        """
        Valide une image avec magic bytes et format.

        Args:
            image_data (bytes): Données image en base64
            image_type (str): Type d'image (logo_main, logo_white, etc.)

        Returns:
            tuple: (is_valid, format, message)

        Raises:
            ValidationError: Si image invalide
        """
        if not image_data:
            raise ValidationError("Image vide")

        try:
            # Décoder base64
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            raise ValidationError(f"Décodage base64 échoué: {str(e)}")

        # 1. Vérifier taille
        file_size = len(image_bytes)
        max_size = self.MAX_FILE_SIZES.get(image_type, 2 * 1024 * 1024)

        if file_size > max_size:
            max_size_mb = max_size / (1024 * 1024)
            raise ValidationError(
                f"Image trop grande: {file_size / (1024 * 1024):.2f} MB "
                f"(maximum: {max_size_mb} MB)"
            )

        # 2. Détection format via magic bytes
        detected_format = self._detect_format_magic_bytes(image_bytes)

        # 3. Vérifier format autorisé
        allowed = self.ALLOWED_FORMATS.get(image_type, [])
        if detected_format not in allowed:
            raise ValidationError(
                f"Format {detected_format} non autorisé pour {image_type}. "
                f"Formats autorisés: {', '.join(allowed)}"
            )

        # 4. Validation PIL (fallback)
        if detected_format in ['png', 'jpg', 'gif']:
            self._validate_with_pil(image_bytes, detected_format)

        return True, detected_format, "Image valide"

    def _detect_format_magic_bytes(self, image_bytes):
        """Détecte le format via magic bytes."""
        for magic, fmt in self.MAGIC_BYTES.items():
            if image_bytes[:len(magic)] == magic:
                return fmt

        raise ValidationError(
            "Format d'image non reconnu. "
            "Formats supportés: PNG, JPG, GIF, ICO, SVG"
        )

    def _validate_with_pil(self, image_bytes, expected_format):
        """Validation supplémentaire avec PIL."""
        try:
            from PIL import Image
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()

            # Vérifier dimensions
            if img.size[0] > 4000 or img.size[1] > 4000:
                raise ValidationError(
                    f"Dimensions trop grandes: {img.size[0]}x{img.size[1]} "
                    f"(maximum: 4000x4000)"
                )

            # Vérifier correspondance format
            pil_format = img.format.lower()
            if pil_format not in [expected_format, 'jpeg'] and expected_format != 'jpg':
                raise ValidationError(
                    f"Format PIL ({pil_format}) ne correspond pas "
                    f"au format détecté ({expected_format})"
                )

        except ImportError:
            # PIL non installé, skip validation
            pass
        except Exception as e:
            raise ValidationError(f"Validation PIL échouée: {str(e)}")

        return True
```

#### B. LogoManager (managers/logo_manager.py)

**Responsabilités:**
- CRUD logos (create, read, update, delete)
- Gestion attachments
- Cache cleanup

**Code recommandé:**
```python
# managers/logo_manager.py
from odoo import models, api
import base64

class LogoManager(models.AbstractModel):
    _name = 'quelyos.branding.logo.manager'
    _description = 'Gestionnaire de logos Quelyos'

    LOGO_TYPES = ['logo_main', 'logo_white', 'logo_small', 'logo_email', 'favicon']

    @api.model
    def save_logo(self, logo_type, logo_data, filename=None):
        """
        Sauvegarde un logo avec validation.

        Args:
            logo_type (str): Type de logo
            logo_data (bytes): Données base64
            filename (str): Nom fichier (optionnel)

        Returns:
            int: ID de l'attachment créé
        """
        # Validation
        validator = self.env['quelyos.branding.image.validator']
        validator.validate_image(logo_data, logo_type)

        # Supprimer ancien logo
        self._delete_old_logo(logo_type)

        # Créer attachment
        attachment = self._create_attachment(logo_type, logo_data, filename)

        # Sauvegarder référence
        self._save_logo_reference(logo_type, attachment.id)

        # Invalider cache
        self._clear_logo_cache()

        return attachment.id

    def _delete_old_logo(self, logo_type):
        """Supprime l'ancien logo."""
        IrAttachment = self.env['ir.attachment'].sudo()

        old_attachments = IrAttachment.search([
            ('res_model', '=', 'quelyos.branding'),
            ('res_field', '=', logo_type),
        ])

        if old_attachments:
            old_attachments.unlink()

    def _create_attachment(self, logo_type, logo_data, filename):
        """Crée un attachment pour le logo."""
        if not filename:
            # Déterminer extension
            validator = self.env['quelyos.branding.image.validator']
            image_bytes = base64.b64decode(logo_data)
            detected_format = validator._detect_format_magic_bytes(image_bytes)
            filename = f'{logo_type}.{detected_format}'

        return self.env['ir.attachment'].sudo().create({
            'name': filename,
            'type': 'binary',
            'datas': logo_data,
            'res_model': 'quelyos.branding',
            'res_field': logo_type,
            'public': True,
        })

    def _save_logo_reference(self, logo_type, attachment_id):
        """Sauvegarde la référence dans config."""
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        IrConfigParameter.set_param(
            f'quelyos.branding.{logo_type}_id',
            str(attachment_id)
        )

    def _clear_logo_cache(self):
        """Invalide le cache des logos."""
        # Appeler le controller pour clear cache
        from odoo.addons.quelyos_branding.controllers.logo_controller import clear_logo_cache
        clear_logo_cache()

    @api.model
    def get_logo_url(self, logo_type):
        """Retourne l'URL d'un logo."""
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        attachment_id = IrConfigParameter.get_param(
            f'quelyos.branding.{logo_type}_id'
        )

        if attachment_id:
            return f'/quelyos/logo/{logo_type}'

        # Fallback vers logo par défaut
        return f'/quelyos_branding/static/src/img/{logo_type}_default.png'
```

#### C. ThemeManager (managers/theme_manager.py)

**Responsabilités:**
- Gestion presets thèmes
- Application couleurs
- Notifications

**Code recommandé:**
```python
# managers/theme_manager.py
from odoo import models, api

class ThemeManager(models.AbstractModel):
    _name = 'quelyos.branding.theme.manager'
    _description = 'Gestionnaire de thèmes Quelyos'

    THEME_PRESETS = {
        'blue': {
            'primary': '#1e40af',
            'secondary': '#10b981',
            'name': 'Thème bleu professionnel',
        },
        'green': {
            'primary': '#059669',
            'secondary': '#34d399',
            'name': 'Thème vert écologique',
        },
        'purple': {
            'primary': '#7c3aed',
            'secondary': '#a78bfa',
            'name': 'Thème violet créatif',
        },
        'red': {
            'primary': '#dc2626',
            'secondary': '#f59e0b',
            'name': 'Thème rouge dynamique',
        },
    }

    @api.model
    def apply_theme(self, theme_name, config_settings=None):
        """
        Applique un preset de thème.

        Args:
            theme_name (str): Nom du thème (blue, green, purple, red)
            config_settings: Instance de res.config.settings (optionnel)

        Returns:
            dict: Notification à afficher
        """
        if theme_name not in self.THEME_PRESETS:
            raise ValueError(f"Thème invalide: {theme_name}")

        theme = self.THEME_PRESETS[theme_name]

        if config_settings:
            # Appliquer directement sur l'objet config
            config_settings.quelyos_branding_primary_color = theme['primary']
            config_settings.quelyos_branding_secondary_color = theme['secondary']
        else:
            # Sauvegarder dans config parameters
            IrConfigParameter = self.env['ir.config_parameter'].sudo()
            IrConfigParameter.set_param(
                'quelyos.branding.primary_color',
                theme['primary']
            )
            IrConfigParameter.set_param(
                'quelyos.branding.secondary_color',
                theme['secondary']
            )

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': 'Thème appliqué',
                'message': theme['name'],
                'type': 'success',
                'sticky': False,
            }
        }

    @api.model
    def get_current_theme(self):
        """Retourne le nom du thème actuel."""
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        primary = IrConfigParameter.get_param(
            'quelyos.branding.primary_color',
            '#1e40af'
        )
        secondary = IrConfigParameter.get_param(
            'quelyos.branding.secondary_color',
            '#10b981'
        )

        # Identifier le preset
        for name, theme in self.THEME_PRESETS.items():
            if theme['primary'] == primary and theme['secondary'] == secondary:
                return name

        return 'custom'
```

#### D. res_config_settings.py (Simplifié)

**Réduit à 150 lignes:**
```python
# models/res_config_settings.py (simplifié)
from odoo import models, fields, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # ========== Champs uniquement ==========
    quelyos_branding_company_name = fields.Char(...)
    quelyos_branding_primary_color = fields.Char(...)
    # ... 28 champs total

    # ========== Délégation aux managers ==========

    @api.onchange('quelyos_branding_logo_main')
    def _onchange_logo_main(self):
        """Valide le logo principal."""
        if self.quelyos_branding_logo_main:
            validator = self.env['quelyos.branding.image.validator']
            validator.validate_image(
                self.quelyos_branding_logo_main,
                'logo_main'
            )

    def action_set_blue_theme(self):
        """Applique le thème bleu."""
        theme_manager = self.env['quelyos.branding.theme.manager']
        return theme_manager.apply_theme('blue', config_settings=self)

    def action_save_logo_main(self):
        """Sauvegarde le logo principal."""
        logo_manager = self.env['quelyos.branding.logo.manager']
        logo_manager.save_logo(
            'logo_main',
            self.quelyos_branding_logo_main,
            'logo_main.png'
        )

    # ... autres méthodes déléguées
```

**Gain:** 611 lignes → 150 lignes (75% réduction!)

---

## 🚀 Phase 2: Optimisation JavaScript (Semaine 3)

### 2.1 remove_odoo_branding.js - Réduire Performance Impact

**Problème:**
- 2-second polling loop (HIGH CPU)
- 100ms debounce (trop agressif)
- TreeWalker sur tous les nœuds (O(n))

**Solution:**

#### A. Augmenter Intervalles
```javascript
// AVANT
window.addEventListener('DOMContentLoaded', function() {
    init();
});

window.addEventListener('load', function() {
    setTimeout(replaceOdooText, 500);
});

setInterval(function() {
    replaceOdooText();
    replacePurpleColors();
    removeOdooPromotions();
}, 2000); // ⚠️ 2 secondes

// APRÈS
window.addEventListener('DOMContentLoaded', async function() {
    await init();
});

window.addEventListener('load', function() {
    setTimeout(updateBrandingAsync, 500);
});

// Réduire à 10 secondes OU supprimer complètement
setInterval(function() {
    updateBrandingAsync();
}, 10000); // ✅ 10 secondes (5x moins agressif)
```

#### B. Debounce Plus Long
```javascript
// AVANT
let quelyosDebounceTimer;
function observeDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
        clearTimeout(quelyosDebounceTimer);
        quelyosDebounceTimer = setTimeout(function() {
            replaceOdooText();
        }, 100); // ⚠️ 100ms
    });
    // ...
}

// APRÈS
let quelyosDebounceTimer;
function observeDOMChanges() {
    const observer = new MutationObserver(function(mutations) {
        clearTimeout(quelyosDebounceTimer);
        quelyosDebounceTimer = setTimeout(function() {
            requestAnimationFrame(() => {
                updateBrandingAsync();
            });
        }, 500); // ✅ 500ms (5x moins agressif)
    });
    // ...
}
```

#### C. Cleanup sur Unload
```javascript
// Nouveau: Cleanup resources
window.addEventListener('beforeunload', function() {
    // Disconnect observer
    if (window.quelyosObserver) {
        window.quelyosObserver.disconnect();
    }

    // Clear interval
    if (window.quelyosBrandingInterval) {
        clearInterval(window.quelyosBrandingInterval);
    }

    // Clear timeout
    if (window.quelyosDebounceTimer) {
        clearTimeout(window.quelyosDebounceTimer);
    }
});
```

#### D. Fonction Async Consolidée
```javascript
// Nouveau: Fonction unique pour toutes les mises à jour
async function updateBrandingAsync() {
    try {
        // Utiliser Promise.all pour paralléliser
        await Promise.all([
            updatePageTitle(),
            replaceOdooText(),
            replacePurpleColors(),
            removeOdooPromotions(),
            updateBodyClasses()
        ]);
        console.log('✅ Quelyos: Branding updated');
    } catch (error) {
        console.error('❌ Quelyos: Branding error', error);
    }
}

// Utiliser partout
window.addEventListener('DOMContentLoaded', updateBrandingAsync);
window.addEventListener('load', () => setTimeout(updateBrandingAsync, 500));
window.quelyosBrandingInterval = setInterval(updateBrandingAsync, 10000);
```

**Gain Performance:** 5x réduction CPU usage

---

### 2.2 hide_enterprise_features.js - Fix Selectors

**Problème:** Sélecteurs invalides + performance

**Solution:**

```javascript
// AVANT (INVALID)
const badges = document.querySelectorAll(
    '.o_kanban_record .badge:contains("Enterprise")'  // ❌ :contains() invalid
);

// APRÈS (VALID)
function hideEnterpriseElements() {
    // Méthode 1: Utiliser Array.from + filter
    const badges = Array.from(document.querySelectorAll('.o_kanban_record .badge'))
        .filter(badge => badge.textContent.includes('Enterprise'));

    badges.forEach(badge => {
        badge.style.display = 'none';
        badge.closest('.o_kanban_record')?.classList.add('quelyos-enterprise-hidden');
    });

    // Méthode 2: XPath (si vraiment nécessaire)
    const xpath = "//span[contains(@class, 'badge') and contains(text(), 'Enterprise')]";
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    for (let i = 0; i < result.snapshotLength; i++) {
        const badge = result.snapshotItem(i);
        badge.style.display = 'none';
    }
}
```

**Gain:** Fonctionne correctement (actuel ne marche pas!)

---

## 🔧 Phase 3: Fixes CSS (Semaine 3)

### 3.1 _hide_enterprise.scss - Corriger Sélecteurs Invalides

**Problème:** `:contains()` et `:has()` invalides

**Solution:**

```scss
// AVANT (INVALID)
.o_kanban_record .badge:contains("Enterprise") {
    display: none !important;  // ❌ Ne fonctionne pas
}

.modal-dialog:has(.o_upgrade_content) {  // ⚠️ Support limité
    display: none !important;
}

// APRÈS (VALID)
// Option 1: Utiliser classes ajoutées par JS
.o_kanban_record .badge.quelyos-enterprise-badge {
    display: none !important;
}

.modal-dialog.quelyos-upgrade-modal {
    display: none !important;
}

// Option 2: Attribute selectors (plus robuste)
.o_kanban_record .badge[data-enterprise="true"] {
    display: none !important;
}

// Si :has() nécessaire, ajouter fallback
@supports selector(:has(*)) {
    .modal-dialog:has(.o_upgrade_content) {
        display: none !important;
    }
}

// Fallback pour navigateurs sans :has()
.modal-dialog.has-upgrade-content {
    display: none !important;
}
```

### 3.2 quelyos_branding.scss - Réduire !important

**Problème:** 37+ instances de `!important`

**Solution:** Augmenter spécificité au lieu d'utiliser !important

```scss
// AVANT
* {
    &[style*="rgb(124, 123, 173)"] {
        color: var(--quelyos-blue-700) !important;  // ⚠️ Wildcard + !important
    }
}

// APRÈS
// Cibler spécifiquement au lieu de wildcard
.o_main_navbar,
.o_action_manager,
.o_control_panel {
    &[style*="rgb(124, 123, 173)"],
    & [style*="rgb(124, 123, 173)"] {
        color: var(--quelyos-blue-700);  // ✅ Plus de !important
    }
}

// Si vraiment nécessaire, augmenter spécificité
body .o_main_navbar[style*="rgb(124, 123, 173)"] {
    color: var(--quelyos-blue-700);
}
```

**Gain:** Cascade CSS correcte, moins de conflits

---

## 🔒 Phase 4: Thread-Safe Caching (Semaine 4)

### 4.1 logo_controller.py - Remplacer Cache Global

**Problème:**
```python
# Module-level dict (NOT thread-safe)
_logo_cache = {}

def get_logo(self, logo_type, **kwargs):
    if logo_type not in _logo_cache:
        # Race condition possible!
        _logo_cache[logo_type] = self._load_logo(logo_type)
    return _logo_cache[logo_type]
```

**Solution:**

#### Option A: Utiliser @tools.ormcache (Recommandé)
```python
from odoo import http, tools
from odoo.http import request

class QuelyosLogoController(http.Controller):

    @http.route('/quelyos/logo/<string:logo_type>', type='http', auth='public')
    @tools.ormcache('logo_type')
    def get_logo(self, logo_type, **kwargs):
        """
        Serve logo with Odoo cache (thread-safe).
        Cache invalidated automatically on record changes.
        """
        # Pas besoin de gérer le cache manuellement
        logo_data = self._load_logo_from_db(logo_type)

        if not logo_data:
            logo_data = self._load_fallback_logo(logo_type)

        return request.make_response(
            logo_data,
            headers=[
                ('Content-Type', self._get_content_type(logo_type)),
                ('Cache-Control', 'public, max-age=604800'),  # 7 days
                ('ETag', self._generate_etag(logo_type)),
            ]
        )

    def _load_logo_from_db(self, logo_type):
        """Load logo from ir.attachment."""
        IrConfigParameter = request.env['ir.config_parameter'].sudo()
        attachment_id = IrConfigParameter.get_param(
            f'quelyos.branding.{logo_type}_id'
        )

        if attachment_id:
            attachment = request.env['ir.attachment'].sudo().browse(int(attachment_id))
            if attachment.exists():
                return base64.b64decode(attachment.datas)

        return None

    def _generate_etag(self, logo_type):
        """Generate ETag for cache validation."""
        IrConfigParameter = request.env['ir.config_parameter'].sudo()
        attachment_id = IrConfigParameter.get_param(
            f'quelyos.branding.{logo_type}_id',
            'default'
        )
        import hashlib
        return hashlib.md5(f'{logo_type}-{attachment_id}'.encode()).hexdigest()
```

#### Option B: Utiliser Request Cache
```python
class QuelyosLogoController(http.Controller):

    @http.route('/quelyos/logo/<string:logo_type>', type='http', auth='public')
    def get_logo(self, logo_type, **kwargs):
        # Use request-scoped cache
        cache_key = f'quelyos_logo_{logo_type}'

        if hasattr(request, '_logo_cache'):
            logo_data = request._logo_cache.get(cache_key)
            if logo_data:
                return self._make_response(logo_data, logo_type)
        else:
            request._logo_cache = {}

        # Load logo
        logo_data = self._load_logo_from_db(logo_type)

        # Cache in request
        request._logo_cache[cache_key] = logo_data

        return self._make_response(logo_data, logo_type)
```

**Gain:** Thread-safe, pas de race conditions

---

## 🧪 Phase 5: Tests Automatisés (Semaine 5-6)

### 5.1 Tests Unitaires

#### A. test_image_validator.py
```python
# tests/test_image_validator.py
from odoo.tests import TransactionCase
from odoo.exceptions import ValidationError
import base64

class TestImageValidator(TransactionCase):

    def setUp(self):
        super().setUp()
        self.validator = self.env['quelyos.branding.image.validator']

    def test_validate_image_valid_png(self):
        """Test validation PNG valide."""
        # Créer un PNG minimal (1x1 transparent)
        png_data = base64.b64encode(
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01\x00\x00'
            b'\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        )

        # Doit passer sans erreur
        is_valid, fmt, msg = self.validator.validate_image(png_data, 'logo_main')
        self.assertTrue(is_valid)
        self.assertEqual(fmt, 'png')

    def test_validate_image_too_large(self):
        """Test image trop grande (> 2 MB)."""
        # Créer fake data de 3 MB
        large_data = base64.b64encode(b'x' * (3 * 1024 * 1024))

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_image(large_data, 'logo_main')

        self.assertIn('trop grande', str(cm.exception))

    def test_validate_image_invalid_format(self):
        """Test format invalide."""
        # GIF pour logo_white (seulement PNG/SVG autorisé)
        gif_data = base64.b64encode(b'GIF89a\x01\x00\x01\x00\x00\x00\x00;')

        with self.assertRaises(ValidationError) as cm:
            self.validator.validate_image(gif_data, 'logo_white')

        self.assertIn('non autorisé', str(cm.exception))

    # ... 20+ autres tests
```

#### B. test_logo_manager.py
```python
# tests/test_logo_manager.py
class TestLogoManager(TransactionCase):

    def setUp(self):
        super().setUp()
        self.manager = self.env['quelyos.branding.logo.manager']

    def test_save_logo_creates_attachment(self):
        """Test sauvegarde logo crée un attachment."""
        png_data = self._create_test_png()

        attachment_id = self.manager.save_logo('logo_main', png_data)

        attachment = self.env['ir.attachment'].browse(attachment_id)
        self.assertTrue(attachment.exists())
        self.assertEqual(attachment.res_model, 'quelyos.branding')

    def test_save_logo_deletes_old(self):
        """Test sauvegarde supprime ancien logo."""
        # Créer premier logo
        png_data1 = self._create_test_png()
        attachment_id1 = self.manager.save_logo('logo_main', png_data1)

        # Créer second logo
        png_data2 = self._create_test_png()
        attachment_id2 = self.manager.save_logo('logo_main', png_data2)

        # Vérifier que premier est supprimé
        attachment1 = self.env['ir.attachment'].browse(attachment_id1)
        self.assertFalse(attachment1.exists())

        # Second existe
        attachment2 = self.env['ir.attachment'].browse(attachment_id2)
        self.assertTrue(attachment2.exists())

    # ... 10+ autres tests
```

#### C. test_theme_manager.py
```python
# tests/test_theme_manager.py
class TestThemeManager(TransactionCase):

    def setUp(self):
        super().setUp()
        self.manager = self.env['quelyos.branding.theme.manager']

    def test_apply_theme_blue(self):
        """Test application thème bleu."""
        result = self.manager.apply_theme('blue')

        # Vérifier notification
        self.assertEqual(result['type'], 'ir.actions.client')
        self.assertEqual(result['tag'], 'display_notification')

        # Vérifier couleurs enregistrées
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        primary = IrConfigParameter.get_param('quelyos.branding.primary_color')
        secondary = IrConfigParameter.get_param('quelyos.branding.secondary_color')

        self.assertEqual(primary, '#1e40af')
        self.assertEqual(secondary, '#10b981')

    def test_get_current_theme_custom(self):
        """Test détection thème custom."""
        # Définir couleurs personnalisées
        IrConfigParameter = self.env['ir.config_parameter'].sudo()
        IrConfigParameter.set_param('quelyos.branding.primary_color', '#123456')
        IrConfigParameter.set_param('quelyos.branding.secondary_color', '#abcdef')

        current = self.manager.get_current_theme()
        self.assertEqual(current, 'custom')

    # ... 8+ autres tests
```

### 5.2 Tests Intégration

#### D. test_logo_controller.py
```python
# tests/test_logo_controller.py
from odoo.tests import HttpCase

class TestLogoController(HttpCase):

    def test_get_logo_returns_image(self):
        """Test /quelyos/logo/logo_main retourne une image."""
        # Upload logo
        logo_manager = self.env['quelyos.branding.logo.manager']
        png_data = self._create_test_png()
        logo_manager.save_logo('logo_main', png_data)

        # Request logo
        response = self.url_open('/quelyos/logo/logo_main')

        self.assertEqual(response.status_code, 200)
        self.assertIn('image/', response.headers.get('Content-Type'))

    def test_get_logo_cache_headers(self):
        """Test headers de cache sont corrects."""
        response = self.url_open('/quelyos/logo/logo_main')

        self.assertIn('Cache-Control', response.headers)
        self.assertIn('ETag', response.headers)
        self.assertIn('max-age=604800', response.headers.get('Cache-Control'))

    # ... 6+ autres tests
```

**Target Coverage:** 80%+

---

## 📚 Phase 6: Documentation (Semaine 7)

### 6.1 Créer Documentation Complète

#### A. ARCHITECTURE.md
```markdown
# Architecture quelyos_branding

## Vue d'ensemble
Module de debranding et rebranding Odoo 19.0.

## Composants

### Python
- `ImageValidator`: Validation images (magic bytes, PIL)
- `LogoManager`: CRUD logos (attachment management)
- `ThemeManager`: Gestion presets couleurs
- `ResConfigSettings`: Orchestration configuration

### JavaScript
- `remove_odoo_branding.js`: Remplacement textes/couleurs
- `hide_enterprise_features.js`: Masquage features enterprise
- `error_handler.js`: Suppression erreurs ResizeObserver

### CSS/SCSS
- `_variables.scss`: Variables CSS (couleurs)
- `quelyos_branding.scss`: Styles core
- `_backend.scss`: Backend Odoo
- `_login.scss`: Page login
- `_website.scss`: Frontend e-commerce
- `_pos.scss`: Point of Sale
- `_reports.scss`: PDF reports

## Flow de données
[Diagrammes...]
```

#### B. CONFIGURATION_GUIDE.md
```markdown
# Guide de Configuration

## Installation
1. Installer le module
2. Configurer logos
3. Choisir thème
4. Activer debranding

## Upload Logos
- Logo principal: PNG/JPG/SVG, max 2 MB
- Logo blanc: PNG/SVG, max 2 MB
- Petit logo: PNG/JPG, max 1 MB
- ...

## Thèmes Disponibles
- Bleu professionnel (défaut)
- Vert écologique
- Violet créatif
- Rouge dynamique

## Personnalisation
[...]
```

#### C. TROUBLESHOOTING.md
```markdown
# Troubleshooting

## Logo ne s'affiche pas
- Vérifier format (magic bytes)
- Vérifier taille (< 2 MB)
- Clear cache navigateur

## Textes "Odoo" encore visibles
- Vérifier JavaScript chargé
- Ouvrir console (F12)
- Vérifier `quelyos_branding.init()`

...
```

---

## 📊 Timeline & Roadmap

### Semaine 1-2: Python Refactoring
- [ ] Créer ImageValidator
- [ ] Créer LogoManager
- [ ] Créer ThemeManager
- [ ] Simplifier ResConfigSettings
- [ ] Tests unitaires Python

**Livrable:** God Class éliminé, code maintenable

### Semaine 3: JavaScript & CSS
- [ ] Optimiser remove_odoo_branding.js
- [ ] Corriger sélecteurs CSS invalides
- [ ] Réduire !important
- [ ] Tests JavaScript (Jest/Mocha)

**Livrable:** Performance améliorée, CSS valide

### Semaine 4: Caching & Performance
- [ ] Thread-safe caching
- [ ] Profiling performance
- [ ] Optimisations ciblées

**Livrable:** Production-ready, thread-safe

### Semaine 5-6: Tests Automatisés
- [ ] Tests unitaires (40+)
- [ ] Tests intégration (10+)
- [ ] Coverage 80%+

**Livrable:** Code testé, régression-proof

### Semaine 7: Documentation
- [ ] Architecture doc
- [ ] Configuration guide
- [ ] Troubleshooting
- [ ] API documentation

**Livrable:** Module documenté

---

## 🎯 Métriques de Succès

| Métrique | Avant | Après | Target |
|----------|-------|-------|--------|
| **God Class** | 611 lignes | 150 lignes | < 200 |
| **Test Coverage** | 0% | 85% | > 80% |
| **JS Performance** | 2s polling | 10s polling | < 5s |
| **CSS Validity** | 2 invalid | 0 invalid | 0 |
| **Thread Safety** | Non | Oui | Oui |
| **Documentation** | 20% | 90% | > 80% |
| **Code Quality** | 5/10 | 8.5/10 | > 8/10 |

---

## 💡 Quick Wins (Immediate)

1. ✅ Fix invalid CSS selectors (30 min)
2. ✅ Increase polling interval 2s → 10s (15 min)
3. ✅ Add cleanup on page unload (30 min)
4. ✅ Use @tools.ormcache for logos (1 hour)
5. ✅ Consolidate theme setters (1 hour)

**Total: 3-4 heures pour gains immédiats**

---

**Préparé par:** Claude Code
**Date:** 2026-01-23
**Version:** 1.0
**Estimation totale:** 7 semaines (35 jours)
