# Charte Graphique "Phoenix" - Quelyos Marketing

**Nom de la charte** : **Phoenix** (symbolise la transformation digitale et l'énergie créative)

**Version** : 1.0
**Date** : 30 janvier 2026
**Module** : Quelyos Marketing Platform
**Page de référence** : `/marketing/login`

---

## 🎨 Identité Visuelle

### Nom et Positionnement
- **Nom produit** : Quelyos Marketing Platform
- **Baseline** : "Le marketing social, automatisé par l'IA"
- **Promesse** : "20 minutes par semaine, zéro expertise, des clients en plus"
- **Cible** : Entrepreneurs et PME sans expertise marketing

---

## 🌈 Palette de Couleurs

### Couleurs Primaires

#### Fuchsia (Principal)
```css
/* Fuchsia 50-950 */
--fuchsia-50: #fdf4ff;
--fuchsia-100: #fae8ff;
--fuchsia-200: #f5d0fe;  /* Texte clair sur fond sombre */
--fuchsia-300: #f0abfc;  /* Accents, icônes, badges */
--fuchsia-400: #e879f9;  /* Hover states */
--fuchsia-500: #d946ef;  /* Couleur primaire principale */
--fuchsia-600: #c026d3;
--fuchsia-700: #a21caf;
--fuchsia-800: #86198f;
--fuchsia-900: #701a75;
--fuchsia-950: #4a044e;
```

**Utilisation** :
- Boutons primaires : `from-fuchsia-500`
- Borders actifs : `border-fuchsia-500`
- Focus rings : `ring-fuchsia-500/20`
- Badges : `bg-fuchsia-500/20 text-fuchsia-300`
- Icônes : `text-fuchsia-300`

#### Orange (Secondaire)
```css
/* Orange 50-950 */
--orange-50: #fff7ed;
--orange-100: #ffedd5;
--orange-200: #fed7aa;
--orange-300: #fdba74;  /* Texte clair, badges */
--orange-400: #fb923c;  /* Hover states */
--orange-500: #f97316;  /* Couleur secondaire */
--orange-600: #ea580c;
--orange-700: #c2410c;
--orange-800: #9a3412;
--orange-900: #7c2d12;
--orange-950: #431407;
```

**Utilisation** :
- Gradients : `to-orange-500`
- Ombres : `shadow-orange-500/25`
- Accents : `text-orange-300`
- Backgrounds animés : `bg-orange-500/20`

### Couleurs de Fond

#### Backgrounds Sombres
```css
/* Fond principal */
--bg-primary: #030712;        /* gray-950 */
--bg-secondary: #111827;      /* gray-900 */
--bg-tertiary: #1f2937;       /* gray-800 */

/* Fond avec transparence */
--bg-glass: rgba(15, 23, 42, 0.5);  /* slate-900/50 */
--bg-glass-light: rgba(255, 255, 255, 0.05);  /* white/5 */
```

#### Gradients de Fond
```css
/* Gradient principal (panneau gauche) */
background: linear-gradient(to bottom right,
  #030712,      /* gray-950 - en haut à gauche */
  #701a75,      /* fuchsia-950 - centre */
  #7c2d12       /* orange-950 - en bas à droite */
);

/* Éléments blur animés */
.blur-orb-fuchsia {
  background: rgba(217, 70, 239, 0.2);  /* fuchsia-500/20 */
  filter: blur(120px);
  animation: pulse 2s ease-in-out infinite;
}

.blur-orb-orange {
  background: rgba(249, 115, 22, 0.2);  /* orange-500/20 */
  filter: blur(100px);
  animation: pulse 2s ease-in-out infinite;
  animation-delay: 1s;
}
```

### Couleurs de Texte

```css
/* Texte principal */
--text-primary: #ffffff;           /* white */
--text-secondary: rgba(226, 232, 240, 0.9);  /* slate-200/90 */
--text-tertiary: #94a3b8;          /* slate-400 */
--text-muted: #64748b;             /* slate-500 */
--text-disabled: #475569;          /* slate-600 */

/* Texte sur fond clair */
--text-on-light: #0f172a;          /* slate-900 */
```

### Couleurs d'État

```css
/* Succès */
--success-bg: rgba(16, 185, 129, 0.1);    /* emerald-500/10 */
--success-border: rgba(16, 185, 129, 0.3);
--success-text: #6ee7b7;                   /* emerald-300 */

/* Erreur */
--error-bg: rgba(239, 68, 68, 0.1);       /* red-500/10 */
--error-border: rgba(239, 68, 68, 0.3);
--error-text: #fca5a5;                     /* red-300 */

/* Warning */
--warning-bg: rgba(245, 158, 11, 0.1);    /* amber-500/10 */
--warning-border: rgba(245, 158, 11, 0.3);
--warning-text: #fcd34d;                   /* amber-300 */
```

---

## 📐 Typographie

### Police Principale
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### Hiérarchie Typographique

#### H1 - Logo / Titre Principal
```css
.h1-logo {
  font-size: 1.5rem;        /* 24px */
  font-weight: 700;         /* bold */
  line-height: 2rem;
  letter-spacing: -0.025em; /* tracking-tight */
}
```

#### H2 - Titres de Section
```css
.h2-section {
  font-size: 2.25rem;       /* 36px - mobile */
  font-size: 3rem;          /* 48px - desktop xl: */
  font-weight: 700;
  line-height: 1.25;        /* leading-tight */
}
```

#### H3 - Sous-titres
```css
.h3-subtitle {
  font-size: 1.5rem;        /* 24px - mobile */
  font-size: 1.875rem;      /* 30px - desktop lg: */
  font-weight: 700;
}
```

#### Body Large
```css
.body-large {
  font-size: 1.125rem;      /* 18px */
  line-height: 1.75rem;
  color: rgba(226, 232, 240, 0.9);  /* slate-300/90 */
}
```

#### Body Regular
```css
.body-regular {
  font-size: 0.875rem;      /* 14px */
  line-height: 1.25rem;
  color: rgba(226, 232, 240, 0.9);  /* slate-200/90 */
}
```

#### Caption / Small
```css
.caption {
  font-size: 0.75rem;       /* 12px */
  line-height: 1rem;
  color: #94a3b8;           /* slate-400 */
}

.label-uppercase {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;    /* tracking-widest */
  color: rgba(250, 232, 255, 0.8);  /* fuchsia-200/80 */
}
```

### Gradients de Texte

```css
/* Gradient principal (titres accroche) */
.text-gradient-primary {
  background: linear-gradient(to right,
    #f0abfc,    /* fuchsia-300 */
    #f9a8d4,    /* pink-300 */
    #fdba74     /* orange-300 */
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

---

## 🧩 Composants UI

### Boutons

#### Bouton Primaire (CTA Principal)
```tsx
<button className="
  group flex h-12 w-full items-center justify-center gap-2
  rounded-xl
  bg-gradient-to-r from-fuchsia-500 to-orange-500
  font-semibold text-white
  shadow-lg shadow-orange-500/25
  transition-all duration-300
  hover:from-fuchsia-400 hover:to-orange-400
  hover:shadow-orange-500/40
  disabled:cursor-not-allowed disabled:opacity-50
">
  <span>Se connecter</span>
  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
</button>
```

**Specs** :
- Hauteur : `48px` (h-12)
- Border radius : `12px` (rounded-xl)
- Gradient : Fuchsia 500 → Orange 500
- Hover : Fuchsia 400 → Orange 400
- Shadow : `0 10px 15px rgba(249, 115, 22, 0.25)`
- Transition : `300ms all`

#### Bouton Secondaire (Outline)
```tsx
<button className="
  group inline-flex h-12 w-full items-center justify-center gap-2
  rounded-xl
  border border-slate-700/50 bg-slate-900/30
  font-medium text-white
  transition-all
  hover:border-slate-600/50 hover:bg-slate-800/50
">
  <span>Créer un compte gratuit</span>
  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
</button>
```

#### Boutons OAuth (Facebook)
```tsx
<button className="
  flex h-12 w-full items-center justify-center gap-3
  rounded-xl
  border border-[#1877F2]/30 bg-[#1877F2]/10
  font-medium text-white
  transition-all
  hover:bg-[#1877F2]/20
  disabled:opacity-50
">
  <FacebookIcon />
  <span>Continuer avec Facebook</span>
</button>
```

#### Boutons OAuth (Instagram)
```tsx
<button className="
  flex h-12 w-full items-center justify-center gap-3
  rounded-xl
  border border-purple-500/30
  bg-gradient-to-r from-purple-500/10 to-pink-500/10
  font-medium text-white
  transition-all
  hover:from-purple-500/20 hover:to-pink-500/20
  disabled:opacity-50
">
  <InstagramIcon />
  <span>Continuer avec Instagram</span>
</button>
```

### Champs de Formulaire

#### Input Standard
```tsx
<input className="
  h-12 w-full
  rounded-xl
  border border-slate-700/50
  bg-slate-900/50
  px-4
  text-white placeholder:text-slate-500
  transition-all
  focus:border-fuchsia-500
  focus:outline-none
  focus:ring-2 focus:ring-fuchsia-500/20
" />
```

**Specs** :
- Hauteur : `48px`
- Border : `1px solid rgba(51, 65, 85, 0.5)` (slate-700/50)
- Background : `rgba(15, 23, 42, 0.5)` (slate-900/50)
- Padding horizontal : `16px`
- Focus border : Fuchsia 500
- Focus ring : `0 0 0 4px rgba(217, 70, 239, 0.2)`

#### Input avec Icône
```tsx
<div className="relative">
  <input className="h-12 w-full rounded-xl ... pr-12" />
  <button className="
    absolute right-4 top-1/2 -translate-y-1/2
    text-slate-400
    transition-colors
    hover:text-slate-300
  ">
    <EyeOff className="h-5 w-5" />
  </button>
</div>
```

#### Label
```tsx
<label className="text-sm font-medium text-slate-300" htmlFor="email">
  Identifiant
</label>
```

### Badges

#### Badge Info (Pills)
```tsx
<div className="
  inline-flex items-center gap-2
  rounded-full
  border border-white/10 bg-white/10
  px-3 py-1.5
  text-xs font-medium text-fuchsia-200
  backdrop-blur-sm
">
  <Globe className="h-3.5 w-3.5" />
  <span>Facebook - Instagram - Bientôt TikTok</span>
</div>
```

### Cartes et Conteneurs

#### Carte Glass (Backdrop Blur)
```tsx
<div className="
  rounded-2xl
  border border-white/10
  bg-white/5
  p-6
  backdrop-blur-sm
">
  {/* Contenu */}
</div>
```

#### Alert/Notice
```tsx
<div className="
  flex items-center gap-2
  rounded-xl
  border border-amber-500/30
  bg-amber-500/10
  px-4 py-3
  text-sm text-amber-300
">
  <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
  {message}
</div>
```

### Dividers

#### Divider avec Texte
```tsx
<div className="flex items-center gap-4">
  <div className="h-px flex-1 bg-slate-800" />
  <span className="text-xs text-slate-500">OU</span>
  <div className="h-px flex-1 bg-slate-800" />
</div>
```

### Stats Cards

```tsx
<div className="space-y-1">
  <div className="flex items-center gap-2">
    <Clock className="h-4 w-4 text-fuchsia-300" />
    <span className="text-2xl font-bold text-white">20 min</span>
  </div>
  <p className="text-xs text-slate-400">Par semaine</p>
</div>
```

### Feature List Items

```tsx
<div className="flex items-center gap-3 text-sm text-slate-200/90">
  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-500/20">
    <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-300" />
  </div>
  IA spécialisée pour vos contenus
</div>
```

---

## 🎭 Animations et Transitions

### Durées Standards
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Animations Prédéfinies

#### Pulse (Orbes de fond)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Spin (Loading)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

#### Translate X (Chevrons)
```css
.group:hover .group-hover\:translate-x-1 {
  transform: translateX(0.25rem);
  transition: transform 300ms;
}
```

### Transitions par Composant

#### Boutons
```css
transition-property: all;
transition-duration: 300ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

#### Inputs (Focus)
```css
transition-property: all;
transition-duration: 150ms;
```

#### Links/Hover States
```css
transition-property: color, background-color, border-color;
transition-duration: 150ms;
```

---

## 📏 Espacements et Layout

### Système de Spacing (Tailwind)
```css
/* Échelle 4px */
0.5 = 2px   (0.125rem)
1   = 4px   (0.25rem)
2   = 8px   (0.5rem)
3   = 12px  (0.75rem)
4   = 16px  (1rem)
5   = 20px  (1.25rem)
6   = 24px  (1.5rem)
8   = 32px  (2rem)
10  = 40px  (2.5rem)
12  = 48px  (3rem)
16  = 64px  (4rem)
```

### Marges Internes (Padding)

#### Conteneurs Principaux
```css
/* Mobile */
.container-mobile {
  padding: 3rem 1.5rem;  /* py-12 px-6 */
}

/* Desktop */
.container-desktop {
  padding: 3rem;         /* p-12 - large */
  padding: 4rem;         /* xl:p-16 - xl */
}
```

#### Formulaires
```css
/* Espacement entre champs */
.form-spacing {
  gap: 1.25rem;  /* space-y-5 */
}

/* Espacement label → input */
.field-spacing {
  gap: 0.5rem;   /* space-y-2 */
}
```

### Marges Externes (Margin)

```css
/* Sections */
.section-spacing {
  margin-bottom: 2rem;   /* mb-8 */
}

/* Entre titre et paragraphe */
.title-paragraph-gap {
  gap: 0.5rem;           /* space-y-2 */
}
```

### Gaps (Flexbox/Grid)

```css
/* Boutons avec icône */
gap: 0.5rem;   /* gap-2 */

/* Stats grid */
gap: 1.5rem;   /* gap-6 */

/* Features list */
gap: 0.75rem;  /* gap-3 */
```

---

## 🌐 Layout Responsive

### Breakpoints
```css
/* Mobile first */
sm:  640px   /* @media (min-width: 640px) */
md:  768px
lg:  1024px  /* Split screen apparaît */
xl:  1280px  /* Optimisations texte/padding */
2xl: 1536px
```

### Structure Split-Screen

#### Mobile (< 1024px)
```css
.login-container {
  display: flex;
  flex-direction: column;
}

.branding-panel {
  display: none;  /* Caché sur mobile */
}

.form-panel {
  width: 100%;
}
```

#### Desktop (≥ 1024px)
```css
.login-container {
  display: flex;
  flex-direction: row;
}

.branding-panel {
  display: flex;
  width: 50%;      /* lg:w-1/2 */
  width: 55%;      /* xl:w-[55%] */
}

.form-panel {
  width: 50%;      /* lg:w-1/2 */
  width: 45%;      /* xl:w-[45%] */
}
```

---

## 🎨 Iconographie

### Librairie
**Source** : Inline SVG custom (inspiré de Heroicons)

### Tailles Standards
```css
.icon-xs:  h-3.5 w-3.5  (14px)
.icon-sm:  h-4 w-4      (16px)
.icon-md:  h-5 w-5      (20px)
.icon-lg:  h-6 w-6      (24px)
.icon-xl:  h-8 w-8      (32px)
```

### Icônes OAuth

#### Facebook
- **Couleur** : `#1877F2`
- **Background** : `rgba(24, 119, 242, 0.1)`
- **Border** : `rgba(24, 119, 242, 0.3)`

#### Instagram
- **Gradient** :
  ```css
  linear-gradient(115deg,
    #FFDC80 0%,   /* Jaune */
    #F77737 25%,  /* Orange */
    #E1306C 50%,  /* Rose */
    #C13584 75%,  /* Violet */
    #833AB4 100%  /* Violet foncé */
  )
  ```

### Icônes Fonctionnelles

| Icône | Contexte | Couleur |
|-------|----------|---------|
| `Shield` | Sécurité, confiance | `text-fuchsia-300` |
| `Zap` | Vitesse, performance | `text-fuchsia-300` |
| `Calendar` | Planning, organisation | `text-orange-300` |
| `CheckCircle2` | Validation, succès | `text-fuchsia-300` |
| `Globe` | International, réseaux | `text-white` |
| `Clock` | Temps gagné | `text-fuchsia-300` |
| `BarChart3` | Analytics, stats | `text-fuchsia-300` |
| `Users` | Communauté | `text-fuchsia-300` |
| `Eye/EyeOff` | Visibilité password | `text-slate-400` |
| `ChevronRight` | Navigation, CTA | `text-white` |
| `ArrowLeft` | Retour | `text-slate-400` |

---

## ✨ Effets Spéciaux

### Background Blur Orbs

```tsx
{/* Orbe Fuchsia (haut gauche) */}
<div className="
  absolute left-0 top-0
  h-[500px] w-[500px]
  animate-pulse
  rounded-full
  bg-fuchsia-500/20
  blur-[120px]
" />

{/* Orbe Orange (bas droite) */}
<div className="
  absolute bottom-0 right-0
  h-[400px] w-[400px]
  animate-pulse
  rounded-full
  bg-orange-500/20
  blur-[100px]
  delay-1000
" />
```

### Backdrop Blur (Glass Effect)

```css
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### Ombres (Shadows)

#### Ombres de Boutons
```css
/* Normal */
box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.25);  /* shadow-lg shadow-orange-500/25 */

/* Hover */
box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4);   /* shadow-orange-500/40 */
```

#### Ombres de Logo
```css
box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.25);  /* shadow-lg shadow-orange-500/25 */
```

---

## 📱 États Interactifs

### Focus States (Inputs)
```css
/* Default */
border: 1px solid rgba(51, 65, 85, 0.5);

/* Focus */
border: 1px solid #d946ef;  /* fuchsia-500 */
outline: none;
box-shadow: 0 0 0 4px rgba(217, 70, 239, 0.2);  /* ring-2 ring-fuchsia-500/20 */
```

### Hover States

#### Boutons Primaires
```css
/* Default */
background: linear-gradient(to right, #d946ef, #f97316);

/* Hover */
background: linear-gradient(to right, #e879f9, #fb923c);
box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4);
```

#### Boutons Secondaires
```css
/* Default */
border: 1px solid rgba(51, 65, 85, 0.5);
background: rgba(15, 23, 42, 0.3);

/* Hover */
border: 1px solid rgba(71, 85, 105, 0.5);
background: rgba(30, 41, 59, 0.5);
```

#### Links
```css
/* Default */
color: #94a3b8;  /* slate-400 */

/* Hover */
color: #cbd5e1;  /* slate-300 */
```

### Disabled States
```css
.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

### Active States (Checkbox)
```css
/* Unchecked */
background: rgba(15, 23, 42, 0.5);
border: 1px solid #334155;

/* Checked */
background: #d946ef;  /* fuchsia-500 */
border: 1px solid #d946ef;
```

---

## 🔤 Contenu Editorial

### Ton de Voix
- **Style** : Dynamique, accessible, confiant
- **Tutoiement** : Oui (ton amical)
- **Personnalité** : Énergique, rassurant, expert

### Messages Clés

#### Headlines
- "Le marketing social, automatisé par l'IA"
- "Bon retour !"
- "Connectez-vous pour accéder à votre espace marketing"

#### Propositions de Valeur
- "20 minutes par semaine, zéro expertise, des clients en plus"
- "IA spécialisée pour vos contenus"
- "Calendrier éditorial intelligent"
- "Inbox unifiée multi-réseaux"
- "Analytics et KPIs business"

#### CTA
- "Se connecter"
- "Créer un compte gratuit"
- "Continuer avec Facebook"
- "Continuer avec Instagram"

#### Stats
- **20 min** : Par semaine
- **4x** : Plus d'engagement
- **0** : Expertise requise

#### Trust Badges
- "RGPD Compliant"
- "IA 100% Française"
- "Planning auto"

---

## 📋 Checklist d'Implémentation

### Structure HTML/TSX
- [ ] Conteneur split-screen responsive
- [ ] Panneau gauche avec gradient et blur orbs
- [ ] Panneau droit avec formulaire centré
- [ ] Logo mobile (< lg)
- [ ] Bouton retour

### Formulaire
- [ ] 2 boutons OAuth (Facebook, Instagram)
- [ ] Divider "OU"
- [ ] Input identifiant
- [ ] Input password avec toggle visibility
- [ ] Checkbox "Se souvenir de moi"
- [ ] Lien "Mot de passe oublié"
- [ ] Bouton submit avec loading state
- [ ] Alert d'erreur
- [ ] Lien "Créer un compte"

### Design
- [ ] Gradient Fuchsia → Orange
- [ ] Blur orbs animés
- [ ] Ombres cohérentes
- [ ] Focus rings
- [ ] Hover states
- [ ] Transitions 300ms

### Accessibilité
- [ ] Labels associés aux inputs
- [ ] States ARIA (loading, error)
- [ ] Focus visible
- [ ] Contraste texte ≥ 4.5:1
- [ ] Navigation clavier

---

## 🎯 Différenciation vs Finance

| Aspect | Marketing (Phoenix) | Finance (Indigo) |
|--------|---------------------|------------------|
| **Couleur primaire** | Fuchsia 500 | Indigo 500 |
| **Couleur secondaire** | Orange 500 | Violet 500 |
| **Gradient** | Fuchsia → Orange | Indigo → Violet |
| **Baseline** | Marketing Platform | Finance Platform |
| **OAuth** | Facebook, Instagram | Google, LinkedIn |
| **Ton** | Créatif, énergique | Sérieux, professionnel |
| **Stats** | 20 min, 4x, 0 expertise | 2 500 entreprises, €45M |

---

## 📚 Ressources

### Palette de Couleurs Exportée
```json
{
  "name": "Quelyos Marketing Phoenix",
  "colors": {
    "primary": {
      "fuchsia": "#d946ef",
      "orange": "#f97316"
    },
    "backgrounds": {
      "dark": "#030712",
      "glass": "rgba(15, 23, 42, 0.5)"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "rgba(226, 232, 240, 0.9)",
      "muted": "#94a3b8"
    }
  }
}
```

### Figma / Sketch Variables
```
Fuchsia Primary: #D946EF
Orange Secondary: #F97316
Background Dark: #030712
Text Primary: #FFFFFF
```

---

**Créé le** : 30 janvier 2026
**Par** : Claude Code
**Pour** : Quelyos Marketing Platform
**Version** : 1.0
