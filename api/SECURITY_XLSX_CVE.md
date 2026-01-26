# 🔒 Vulnérabilités xlsx (CVE non patchées)

## Statut

⚠️ **ATTENTION** : Le package `xlsx@0.18.5` (dernière version disponible) contient **2 vulnérabilités HIGH** sans correctif officiel.

## CVE Détectées

### CVE-1: Prototype Pollution
- **Package** : `xlsx <0.19.3`
- **Sévérité** : HIGH
- **CVE** : [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
- **Impact** : Injection propriétés dans `Object.prototype`, corruption données, RCE possible

### CVE-2: Regular Expression Denial of Service (ReDoS)
- **Package** : `xlsx <0.20.2`
- **Sévérité** : HIGH
- **CVE** : [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)
- **Impact** : CPU 100% via regex malveillante, DoS serveur

## Problème

La version `0.18.5` est la **dernière version publiée sur npm** (janvier 2026).
Les versions patchées `0.19.3` et `0.20.2` **n'existent pas** sur le registre officiel.

```bash
$ pnpm view xlsx versions
# Latest: 0.18.5 (vulnérable)
```

## Mitigations Actuelles

### 1. Validation stricte des fichiers uploadés
```javascript
// Vérifier que seuls les fichiers Excel légitimes sont acceptés
// Limiter la taille (max 10 MB)
// Scanner antivirus (clamscan déjà en place)
```

### 2. Isolation traitement Excel
```javascript
// Traiter les fichiers dans un worker isolé
// Timeout strict (30s max)
// Limiter CPU/mémoire allouée
```

### 3. Whitelist utilisateurs
```javascript
// Restreindre upload Excel aux administrateurs vérifiés uniquement
// Pas d'upload public de fichiers Excel
```

## Solution Recommandée (TODO)

**Migrer vers une alternative sécurisée :**

### Option 1 : ExcelJS (recommandé)
```bash
pnpm add exceljs
pnpm remove xlsx
```

**Avantages** :
- ✅ Activement maintenu (dernier commit : janvier 2026)
- ✅ Aucune vulnérabilité CVE connue
- ✅ API moderne (async/await, streams)
- ✅ Support Excel 2007+ (.xlsx)

**Migration** :
```javascript
// Avant (xlsx)
const XLSX = require('xlsx');
const workbook = XLSX.readFile('file.xlsx');

// Après (exceljs)
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('file.xlsx');
```

### Option 2 : node-xlsx
```bash
pnpm add node-xlsx
```

**Avantages** :
- ✅ Plus léger que ExcelJS
- ✅ API simple (similar à xlsx)

**Inconvénients** :
- ⚠️  Moins de fonctionnalités (pas de styles, formules)

## Plan d'Action

### Court Terme (Immédiat)
- [x] Documenter CVE xlsx dans ce fichier
- [x] Vérifier mitigations en place (clamscan, validation, whitelist)
- [ ] Auditer code utilisant xlsx (identifier usages critiques)

### Moyen Terme (Avant release)
- [ ] Évaluer ExcelJS vs node-xlsx (POC)
- [ ] Migrer code vers alternative choisie
- [ ] Tester import/export Excel (régression tests)
- [ ] Retirer dépendance xlsx du package.json

### Long Terme
- [ ] Ajouter tests sécurité Excel (fuzzing, fichiers malveillants)
- [ ] Automatiser scan CVE en CI/CD (pnpm audit dans GitHub Actions)

## Risque Résiduel

**Niveau** : MODERATE (mitigé par contrôles en place)

**Justification** :
- Upload Excel réservé aux admins (pas d'accès public)
- Validation taille/type fichier
- Scanner antivirus actif
- Aucun incident détecté à ce jour

**Note** : Ce risque sera réduit à LOW après migration vers ExcelJS.

---

**Date** : 2026-01-26
**Auteur** : Claude Code (Audit Sécurité)
**Statut** : EN ATTENTE MIGRATION
