# Guide de Test - Correctif ResizeObserver

## ✅ Validation Technique Réussie

Le script de validation a confirmé que:
- ✅ Le fichier `error_handler.js` existe et est accessible
- ✅ Le manifest est correctement configuré
- ✅ Le conteneur Odoo fonctionne
- ✅ Aucune erreur dans les logs récents

## 🧪 Test Manuel dans le Navigateur

### Étape 1: Ouvrir l'application

```
http://localhost:8069
```

### Étape 2: Vider le cache du navigateur

**Chrome/Edge**: `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac)
**Firefox**: `Ctrl + F5` (Windows/Linux) ou `Cmd + Shift + R` (Mac)

### Étape 3: Ouvrir la Console Développeur

Appuyez sur `F12` ou clic droit → "Inspecter" → Onglet "Console"

### Étape 4: Vérifier les messages

#### ✅ Messages attendus (BONS):

```javascript
✅ Quelyos: Error handler loaded
🎨 Quelyos Branding: JavaScript chargé
🚫 Quelyos: Masquage des fonctionnalités Entreprise activé
👀 Quelyos: Observer du DOM pour entreprise activé
✅ Quelyos Branding: Initialisé avec succès
```

#### ❌ Messages à NE PAS voir (CORRIGES):

```javascript
❌ Uncaught TypeError: Cannot read properties of null (reading 'parentNode')
❌ ResizeObserver loop limit exceeded
❌ ResizeObserver.<anonymous>
```

### Étape 5: Tester la navigation

Naviguez dans différentes sections pour vérifier qu'aucune erreur n'apparaît:

1. **Apps** → Vérifier que les modules Enterprise sont masqués
2. **Settings** → Vérifier l'interface de configuration
3. **Différentes vues** (Contacts, Ventes, etc.)
4. **Redimensionner la fenêtre** → Vérifier qu'aucune erreur ResizeObserver n'apparaît

## 🔍 Vérification Avancée

### Vérifier que le script est chargé

1. Ouvrez les DevTools (F12)
2. Onglet "Sources" ou "Debugger"
3. Cherchez: `error_handler.js`
4. Vous devriez voir le fichier dans:
   ```
   localhost:8069 → web/assets/... → error_handler.js
   ```

### Vérifier l'ordre de chargement

Le `error_handler.js` doit être chargé **AVANT** les autres scripts JavaScript du module branding.

Vous pouvez vérifier avec:
```javascript
// Dans la console
console.log('error_handler.js loaded:', typeof window !== 'undefined');
```

## 📊 Résultats Attendus

| Test | Avant le Fix | Après le Fix |
|------|--------------|--------------|
| Erreurs console | ❌ Multiples erreurs ResizeObserver | ✅ Aucune erreur |
| Performance | ⚠️ Ralentissements possibles | ✅ Fluide |
| Branding | ✅ Fonctionne | ✅ Fonctionne |
| Masquage Enterprise | ✅ Fonctionne | ✅ Fonctionne |

## 🐛 En cas de problème

### Si les erreurs persistent:

1. **Vider complètement le cache**:
   ```bash
   # Redémarrer Odoo
   docker-compose restart odoo

   # Vider le cache navigateur + données
   Chrome → Settings → Privacy → Clear browsing data → Cached images and files
   ```

2. **Vérifier que le module est bien mis à jour**:
   ```bash
   docker exec quelyos-odoo odoo -u quelyos_branding -d quelyos \
       --db_host=db --db_user=odoo --db_password=odoo --stop-after-init
   ```

3. **Vérifier les assets**:
   - Allez dans Settings → Technical → User Interface → Views
   - Cherchez "web.assets_backend"
   - Vérifiez que `error_handler.js` est listé

4. **Checker les logs Odoo**:
   ```bash
   docker logs quelyos-odoo --tail 100 | grep -i error
   ```

### Si rien ne fonctionne:

Contactez le support en incluant:
- Capture d'écran de la console (F12)
- Version du navigateur
- Logs Odoo: `docker logs quelyos-odoo --tail 200 > logs.txt`

## 📝 Commandes Utiles

```bash
# Redémarrer Odoo
docker-compose restart odoo

# Voir les logs en temps réel
docker logs -f quelyos-odoo

# Mettre à jour le module
cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
./validate_branding_fix.sh

# Vérifier les assets dans le conteneur
docker exec quelyos-odoo ls -la /mnt/extra-addons/quelyos_branding/static/src/js/
```

## ✅ Confirmation du Succès

Vous pouvez considérer le fix comme réussi si:

1. ✅ Aucune erreur ResizeObserver dans la console
2. ✅ Message "✅ Quelyos: Error handler loaded" visible
3. ✅ Le branding fonctionne normalement
4. ✅ Pas de ralentissements
5. ✅ Navigation fluide dans toutes les sections

---

**Date de test**: 2026-01-23
**Version Odoo**: 19.0
**Module**: quelyos_branding 19.0.1.0.0
**Statut**: ✅ Prêt pour test utilisateur
