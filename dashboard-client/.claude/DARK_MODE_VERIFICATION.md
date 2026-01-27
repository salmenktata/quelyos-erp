# Guide de Vérification Automatique du Dark Mode

## 🎯 Objectif

Éviter les problèmes de visibilité en mode dark en détectant automatiquement les classes CSS non adaptatives.

## 🚀 Utilisation

### Vérification manuelle

```bash
# Vérifier tout le projet
./scripts/check-dark-mode.sh

# Vérifier un dossier spécifique
./scripts/check-dark-mode.sh src/components/finance/
```

### Vérification automatique (pre-commit)

Le script est exécuté automatiquement avant chaque commit si configuré dans Husky.

## 📋 Checklist des Patterns à Vérifier

### 1. Classes de texte ✅
```tsx
// ❌ MAUVAIS
<h1 className="text-3xl font-bold text-gray-900">Titre</h1>

// ✅ BON
<h1 className="text-3xl font-bold text-gray-900 dark:!text-white">Titre</h1>
```

### 2. Classes de background ✅
```tsx
// ❌ MAUVAIS
<div className="bg-white p-4">Content</div>

// ✅ BON
<div className="bg-white dark:bg-gray-800 p-4">Content</div>
```

### 3. Classes de border ✅
```tsx
// ❌ MAUVAIS
<div className="border border-gray-200">Content</div>

// ✅ BON
<div className="border border-gray-200 dark:border-gray-700">Content</div>
```

### 4. Classes text-muted-foreground ✅
```tsx
// ✅ AUTOMATIQUE (défini dans index.css)
<p className="text-muted-foreground">Description</p>
// Devient automatiquement : text-gray-600 dark:text-gray-400
```

### 5. Dividers ✅
```tsx
// ❌ MAUVAIS
<div className="divide-y">...</div>

// ✅ BON
<div className="divide-y divide-gray-200 dark:divide-gray-700">...</div>
```

### 6. Hover states ✅
```tsx
// ❌ MAUVAIS
<button className="hover:bg-gray-100">Click</button>

// ✅ BON
<button className="hover:bg-gray-100 dark:hover:bg-gray-800">Click</button>
```

## 🔧 Corrections Automatiques

### Utiliser le modificateur `!important`

Pour les titres qui sont écrasés par des styles globaux :

```tsx
// Utiliser dark:!text-white au lieu de dark:text-white
<h1 className="text-3xl font-bold text-gray-900 dark:!text-white">Titre</h1>
```

### Classes Custom Adaptatives

Le projet définit des classes custom adaptatives dans `index.css` :

```css
@layer base {
  .text-muted-foreground {
    @apply text-gray-600 dark:text-gray-400;
  }
}
```

## 📊 Mapping des Couleurs

| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| `text-gray-900` | `dark:text-white` ou `dark:!text-white` | Titres principaux |
| `text-gray-700` | `dark:text-gray-300` | Textes secondaires |
| `text-gray-600` | `dark:text-gray-400` | Textes muted |
| `bg-white` | `dark:bg-gray-800` | Backgrounds principaux |
| `bg-gray-50` | `dark:bg-gray-900` | Backgrounds subtils |
| `border-gray-200` | `dark:border-gray-700` | Borders standard |
| `border-gray-300` | `dark:border-gray-600` | Borders accentuées |

## 🎨 Blocs Colorés

Pour les blocs informatifs (info, warning, error) :

```tsx
// Info (bleu)
<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
  <p className="text-blue-900 dark:text-blue-100">Message</p>
</div>

// Warning (jaune/orange)
<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
  <p className="text-amber-900 dark:text-amber-100">Message</p>
</div>

// Error (rouge)
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
  <p className="text-red-900 dark:text-red-100">Message</p>
</div>
```

## 🚨 Erreurs Fréquentes

### 1. Oublier les variantes dark sur les span/div imbriqués
```tsx
// ❌ MAUVAIS
<div>
  <span className="font-semibold">Montant</span>
  <span>1000 €</span>
</div>

// ✅ BON
<div>
  <span className="font-semibold text-gray-900 dark:text-white">Montant</span>
  <span className="text-gray-900 dark:text-white">1000 €</span>
</div>
```

### 2. Utiliser des classes de couleur sur des composants Shadcn/UI
```tsx
// ⚠️ ATTENTION : Les composants Shadcn peuvent avoir leurs propres styles
// Vérifier dans le composant source si les variantes dark sont présentes
<Label>Mon label</Label> // Vérifié ✅ (text-gray-900 dark:text-white)
<Button>Mon bouton</Button> // Vérifié ✅
```

### 3. Oublier les empty states et loading states
```tsx
// ❌ MAUVAIS
<p>Aucune donnée disponible</p>

// ✅ BON
<p className="text-gray-900 dark:text-white">Aucune donnée disponible</p>
```

## 🔄 Intégration CI/CD

Pour ajouter la vérification dans votre pipeline :

```yaml
# .github/workflows/ci.yml
- name: Check Dark Mode
  run: |
    chmod +x ./dashboard-client/scripts/check-dark-mode.sh
    ./dashboard-client/scripts/check-dark-mode.sh
```

## 📝 Processus de Review

Avant chaque commit/PR, vérifier :

1. ✅ Lancer `./scripts/check-dark-mode.sh`
2. ✅ Tester visuellement en mode dark (Cmd+Shift+D dans le navigateur)
3. ✅ Vérifier tous les états : normal, hover, focus, disabled
4. ✅ Vérifier les blocs colorés (info, warning, error)
5. ✅ Vérifier les formulaires (labels, inputs, placeholders)

## 🛠️ Outils Recommandés

### Extension Chrome/Firefox
- **Dark Reader** : Pour simuler le dark mode sur n'importe quel site
- **DevTools** : `Cmd+Shift+C` → Inspecter les classes appliquées

### VS Code Extensions
- **Tailwind CSS IntelliSense** : Autocomplétion avec preview des couleurs
- **Inline fold** : Plier les longues chaînes de classes pour mieux voir

## 📚 Ressources

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Shadcn/UI Theming](https://ui.shadcn.com/docs/theming)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
