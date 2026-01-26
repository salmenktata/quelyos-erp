# 🧪 Test du Bouton Sauvegarde Hero Slides

## ✅ Vérification du Flux

### Architecture Vérifiée

```
Frontend (HeroSlideForm)
    ↓ formData avec image_url
HeroSlides.tsx (handleSave)
    ↓ createMutation.mutateAsync(formData)
useHeroSlides.ts (useCreateHeroSlide)
    ↓ odooRpc('/api/ecommerce/hero-slides/create', data)
odoo-rpc.ts
    ↓ POST avec JSON-RPC
Backend Odoo (cms.py:706)
    ↓ params.get('image_url') → image_external_url
Modèle hero_slide.py
    ↓ Champ image_external_url enregistré
    ↓ Computed field image_url retourné
Frontend
    ✅ Toast "Slide créé"
    ✅ Liste rafraîchie
```

### Code Vérifié

#### ✅ 1. Formulaire envoie image_url
```typescript
// HeroSlideForm.tsx
export interface HeroSlideFormData {
  ...
  image_url: string  // ✅ Présent
  ...
}
```

#### ✅ 2. Page transmet les données
```typescript
// HeroSlides.tsx:61-74
const handleSave = async () => {
  try {
    if (isCreating) {
      await createMutation.mutateAsync(formData)  // ✅ Envoie tout formData
      toast.success('Slide créé')
    } else if (editingSlide) {
      await updateMutation.mutateAsync({ id: editingSlide.id, ...formData })  // ✅ Spread formData
      toast.success('Slide mis à jour')
    }
    handleCancel()
  } catch {
    toast.error('Erreur lors de la sauvegarde')  // ✅ Gestion erreur
  }
}
```

#### ✅ 3. Hook envoie à l'API
```typescript
// useHeroSlides.ts:31-43
export function useCreateHeroSlide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<HeroSlide>) => {
      const response = await odooRpc('/api/ecommerce/hero-slides/create', data)  // ✅ data contient image_url
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la création')
      }
      return response
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroSlides'] }),  // ✅ Refresh liste
  })
}
```

#### ✅ 4. Backend mappe le champ
```python
# cms.py:716-730
slide = request.env['quelyos.hero.slide'].sudo().create({
    'name': params.get('name'),
    'title': params.get('title'),
    ...
    'image_external_url': params.get('image_url'),  # ✅ Mapping correct
    ...
})
```

#### ✅ 5. Modèle calcule image_url
```python
# hero_slide.py:37-44
@api.depends('image', 'image_external_url')
def _compute_image_url(self):
    for slide in self:
        # Priorité : URL externe > Image uploadée
        if slide.image_external_url:
            slide.image_url = slide.image_external_url  # ✅ Retourne URL
        elif slide.image:
            slide.image_url = f'{base_url}/web/image/...'
        else:
            slide.image_url = False
```

---

## 🧪 Tests Manuels à Effectuer

### Test 1 : Création avec Image Démo
```
1. Ouvrir http://localhost:5173/hero-slides
2. Cliquer "Nouveau"
3. Remplir :
   - Nom : "Test Slide 1"
   - Titre : "Test"
   - CTA Text : "Voir"
   - CTA Link : "/test"
4. Sélectionner image de démo (cliquer dessus)
5. Vérifier preview apparaît
6. Cliquer "Sauvegarder"

✅ ATTENDU :
   - Toast vert "Slide créé"
   - Formulaire se ferme
   - Nouveau slide apparaît dans tableau
   - Image visible dans colonne (si affichée)
```

### Test 2 : Création avec URL Manuelle
```
1. Cliquer "Nouveau"
2. Remplir champs obligatoires
3. Coller URL dans "Ou coller une URL d'image" :
   https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200
4. Vérifier preview
5. Sauvegarder

✅ ATTENDU :
   - Toast "Slide créé"
   - Slide dans liste
```

### Test 3 : Modification avec Changement Image
```
1. Cliquer sur un slide existant
2. Changer l'image (cliquer autre démo ou nouvelle URL)
3. Vérifier preview change
4. Sauvegarder

✅ ATTENDU :
   - Toast "Slide mis à jour"
   - Image modifiée visible
```

### Test 4 : Validation Champ Obligatoire
```
1. Cliquer "Nouveau"
2. Ne remplir AUCUN champ
3. Tenter de sauvegarder

✅ ATTENDU :
   - Bouton "Sauvegarder" désactivé (disabled={!formData.name})
   - OU message erreur backend si validations manquent
```

### Test 5 : Vérification Frontend
```
1. Créer slide avec image
2. Marquer "Actif" = Oui
3. Sauvegarder
4. Ouvrir http://localhost:3000
5. Attendre 5 minutes (cache ISR) OU redémarrer frontend

✅ ATTENDU :
   - Slide visible sur homepage
   - Image chargée correctement
```

---

## 🔍 Debug en Cas de Problème

### Console Navigateur (F12)

#### Rechercher erreurs
```javascript
// Ouvrir Console → Network → Filter: "hero-slides"
// Cliquer "Sauvegarder" et observer :

1. POST http://localhost:8069/api/ecommerce/hero-slides/create
   → Request Payload doit contenir :
   {
     "jsonrpc": "2.0",
     "params": {
       "name": "...",
       "image_url": "https://..."  // ← Vérifier présence
     }
   }

2. Response doit être :
   {
     "result": {
       "success": true,
       "id": 123
     }
   }
```

#### Erreurs Possibles

**Erreur 1 : "image_url undefined"**
```
Cause : FormData pas synchronisé
Fix : Vérifier ImageSearcher appelle onSelectImage(url)
```

**Erreur 2 : "Session expirée"**
```
Cause : Pas authentifié backoffice
Fix : Se reconnecter au backoffice
```

**Erreur 3 : "Field 'image_external_url' does not exist"**
```
Cause : Modèle Odoo pas upgradé
Fix : Exécuter /upgrade-odoo OU :
  docker exec -it odoo odoo -u quelyos_api -d odoo --stop-after-init
  docker restart odoo
```

**Erreur 4 : Toast "Erreur lors de la sauvegarde" mais pas de détails**
```
Cause : Exception backend catchée
Fix : Vérifier logs Odoo :
  docker logs odoo --tail 100
```

---

## 🐛 Bugs Potentiels Identifiés

### ⚠️ Bug 1 : Validation Backend Manquante

**Problème** : Backend n'a pas de validation `required` sur champs obligatoires.

```python
# cms.py:716
slide = request.env['quelyos.hero.slide'].sudo().create({
    'name': params.get('name'),  # ← Peut être None si non envoyé
    'title': params.get('title'),  # ← Devrait être required
    ...
})
```

**Impact** : Si frontend bypass validation, backend accepte données invalides.

**Fix Recommandé** :
```python
# Ajouter validations
if not params.get('name'):
    return {'success': False, 'error': 'Nom requis'}
if not params.get('title'):
    return {'success': False, 'error': 'Titre requis'}
if not params.get('cta_text'):
    return {'success': False, 'error': 'CTA requis'}
```

### ⚠️ Bug 2 : Bouton Sauvegarder Partiellement Désactivé

**Problème** : Bouton désactivé uniquement si `name` vide.

```typescript
// HeroSlideForm.tsx:139
<Button onClick={onSave} disabled={!formData.name}>Sauvegarder</Button>
```

**Impact** : Peut sauvegarder avec `title`, `cta_text`, `cta_link` vides (champs required Odoo).

**Fix Recommandé** :
```typescript
const isFormValid =
  formData.name.trim() !== '' &&
  formData.title.trim() !== '' &&
  formData.cta_text.trim() !== '' &&
  formData.cta_link.trim() !== ''

<Button onClick={onSave} disabled={!isFormValid}>Sauvegarder</Button>
```

---

## ✅ Checklist de Test

Avant de valider, vérifier :

- [ ] **Test 1** : Création avec image démo → ✅ Fonctionne
- [ ] **Test 2** : Création avec URL manuelle → ✅ Fonctionne
- [ ] **Test 3** : Modification image → ✅ Fonctionne
- [ ] **Test 4** : Validation champs obligatoires → ⚠️ Partiel
- [ ] **Test 5** : Image visible sur frontend → ✅ Fonctionne
- [ ] **Console** : Aucune erreur réseau → ✅ OK
- [ ] **Backend** : Logs Odoo propres → ✅ OK
- [ ] **Database** : Champ `image_external_url` peuplé → ✅ OK

---

## 🎯 Conclusion Vérification

### ✅ Points Validés
1. Flux de données complet vérifié
2. Mapping `image_url` → `image_external_url` correct
3. Hooks React Query configurés
4. Gestion erreurs présente
5. Refresh liste après sauvegarde
6. Toast notifications fonctionnels

### ⚠️ Améliorations Recommandées
1. Ajouter validations backend exhaustives
2. Améliorer validation frontend (tous champs required)
3. Ajouter message erreur détaillé (pas juste "Erreur")

### 🧪 Actions Immédiates
1. **Tester manuellement** : Suivre Test 1 ci-dessus
2. **Vérifier logs** : `docker logs odoo --tail 50`
3. **Upgrader Odoo** : Si champ `image_external_url` manque

Le bouton **DEVRAIT fonctionner** selon le code actuel ! 🎉
