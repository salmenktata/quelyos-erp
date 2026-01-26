# ⚡ Test Rapide : Bouton Sauvegarde Hero Slides

## 🎯 Test en 2 Minutes

### ✅ Test Positif (Tout OK)

```bash
1. Ouvrir http://localhost:5173/hero-slides
2. Cliquer "Nouveau"
3. Remplir :
   ✅ Nom : "Test"
   ✅ Titre : "Test Slide"
   ✅ Bouton principal : "Voir"
   ✅ Lien principal : "/test"
4. (Optionnel) Cliquer image démo
5. Cliquer "Sauvegarder"

RÉSULTAT ATTENDU :
✅ Toast vert "Slide créé"
✅ Formulaire se ferme
✅ Nouveau slide dans tableau
```

### ❌ Test Négatif (Validation)

```bash
1. Cliquer "Nouveau"
2. Remplir SEULEMENT :
   ✅ Nom : "Test"
   ❌ Titre : (vide)
   ❌ Bouton : (vide)
3. Observer bouton "Sauvegarder"

RÉSULTAT ATTENDU :
❌ Bouton "Sauvegarder" grisé (disabled)
❌ Message : "* Champs obligatoires : Nom, Titre, Bouton principal..."
❌ Impossible de cliquer
```

---

## 🔧 Améliorations Apportées

### 1. Validation Frontend Complète
**Avant** :
```typescript
disabled={!formData.name}  // ❌ Seulement nom vérifié
```

**Après** :
```typescript
disabled={
  !formData.name.trim() ||
  !formData.title.trim() ||
  !formData.cta_text.trim() ||
  !formData.cta_link.trim()
}  // ✅ Tous champs requis vérifiés
```

### 2. Indicateurs Visuels
- Labels avec `*` (ex: "Titre *")
- Attribut `required` sur inputs
- Message d'aide rouge en bas du formulaire

### 3. Validation Backend
**Ajoutée** :
```python
if not params.get('name'):
    return {'success': False, 'error': 'Le nom est requis'}
if not params.get('title'):
    return {'success': False, 'error': 'Le titre est requis'}
if not params.get('cta_text'):
    return {'success': False, 'error': 'Le texte du bouton principal est requis'}
if not params.get('cta_link'):
    return {'success': False, 'error': 'Le lien du bouton principal est requis'}
```

### 4. Messages d'Erreur Détaillés
**Avant** :
```typescript
catch {
  toast.error('Erreur lors de la sauvegarde')  // ❌ Générique
}
```

**Après** :
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
  toast.error(errorMessage)  // ✅ Message backend affiché
}
```

---

## 📊 Matrice de Test

| Cas | Nom | Titre | CTA Text | CTA Link | Bouton | Résultat Attendu |
|-----|-----|-------|----------|----------|--------|------------------|
| 1 | ✅ | ✅ | ✅ | ✅ | Actif | ✅ "Slide créé" |
| 2 | ❌ | ✅ | ✅ | ✅ | Disabled | ❌ Impossible cliquer |
| 3 | ✅ | ❌ | ✅ | ✅ | Disabled | ❌ Impossible cliquer |
| 4 | ✅ | ✅ | ❌ | ✅ | Disabled | ❌ Impossible cliquer |
| 5 | ✅ | ✅ | ✅ | ❌ | Disabled | ❌ Impossible cliquer |
| 6 | "" | ✅ | ✅ | ✅ | Disabled | ❌ Nom vide détecté |

---

## 🐛 Si Ça Ne Fonctionne Pas

### Problème 1 : Bouton reste grisé même avec tous les champs
**Diagnostic** : Vérifier espaces/tabs dans champs
```javascript
// Ouvrir Console (F12) :
console.log({
  name: formData.name,
  title: formData.title,
  cta_text: formData.cta_text,
  cta_link: formData.cta_link
})
// Tous doivent avoir valeur non vide
```

**Solution** : Re-taper textes sans copier-coller

### Problème 2 : Toast "Erreur" mais slide créé quand même
**Diagnostic** : Conflit cache React Query

**Solution** :
```bash
# Vider localStorage
localStorage.clear()
# Refresh page (Ctrl+Shift+R)
```

### Problème 3 : Erreur "Session expirée"
**Diagnostic** : Pas connecté au backoffice

**Solution** : Se reconnecter
```
http://localhost:5173/login
```

### Problème 4 : Validation backend ignorée
**Diagnostic** : Odoo pas redémarré après modif

**Solution** :
```bash
docker restart odoo
# Attendre 30sec
```

---

## ✅ Checklist Finale

Avant de passer à la prod :

- [ ] Test positif : Création fonctionne
- [ ] Test négatif : Bouton bloqué si champs vides
- [ ] Indicateurs `*` visibles sur champs requis
- [ ] Message aide rouge affiché si incomplet
- [ ] Toast affiche message détaillé (pas juste "Erreur")
- [ ] Backend retourne erreurs explicites
- [ ] Liste rafraîchie après création
- [ ] Modification fonctionne aussi

---

## 🎉 Confirmation Succès

**Si tous les tests passent** :

✅ Bouton sauvegarde **100% fonctionnel**
✅ Validations **frontend + backend** en place
✅ Expérience utilisateur **optimale**
✅ Messages d'erreur **clairs et utiles**

**Prêt pour production !** 🚀
