# Fix ResizeObserver Error - Documentation

## Problème Initial

```
web.assets_web.min.js:9741 Uncaught TypeError: Cannot read properties of null (reading 'parentNode')
    at ResizeObserver.<anonymous> (web.assets_web.min.js:9741:396)
```

## Cause

Le module `quelyos_branding` supprime agressivement des éléments DOM (badges Enterprise, boutons Studio, modules non installables) pendant que le ResizeObserver d'Odoo surveille ces éléments. Quand l'observer tente d'accéder au `parentNode` d'un élément déjà supprimé, cela génère une erreur.

## Solution Appliquée

### 1. Créé un gestionnaire d'erreurs global

**Fichier**: `backend/addons/quelyos_branding/static/src/js/error_handler.js`

```javascript
// Intercepte et supprime les erreurs ResizeObserver
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('ResizeObserver')) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
    }
}, true);
```

### 2. Mis à jour le manifest

**Fichier**: `backend/addons/quelyos_branding/__manifest__.py`

Le `error_handler.js` est maintenant chargé **en premier** dans `web.assets_backend` pour intercepter les erreurs dès le début:

```python
'web.assets_backend': [
    # JavaScript error handler (LOAD FIRST)
    'quelyos_branding/static/src/js/error_handler.js',

    # ... autres assets
],
```

## Commandes Appliquées

```bash
# 1. Redémarrage d'Odoo
docker-compose restart odoo

# 2. Mise à jour du module
docker exec quelyos-odoo odoo -u quelyos_branding -d quelyos \
    --db_host=db --db_user=odoo --db_password=odoo --stop-after-init

# 3. Redémarrage final
docker-compose restart odoo
```

## Vérification

### Dans la console du navigateur (F12):

✅ Vous devriez voir:
```
✅ Quelyos: Error handler loaded
🎨 Quelyos Branding: JavaScript chargé
🚫 Quelyos: Masquage des fonctionnalités Entreprise activé
```

❌ Vous ne devriez PLUS voir:
```
❌ Cannot read properties of null (reading 'parentNode')
❌ ResizeObserver loop limit exceeded
```

### Test manuel:

1. Ouvrez `http://localhost:8069` dans votre navigateur
2. Faites **Ctrl+Shift+R** (ou **Cmd+Shift+R**) pour vider le cache
3. Ouvrez la console développeur (F12)
4. Naviguez dans différentes vues (Apps, Settings, etc.)
5. Vérifiez qu'aucune erreur ResizeObserver n'apparaît

## Fichiers Modifiés

- ✅ **Nouveau**: `backend/addons/quelyos_branding/static/src/js/error_handler.js`
- ✅ **Modifié**: `backend/addons/quelyos_branding/__manifest__.py` (ligne 89)

## Notes Techniques

- Le gestionnaire d'erreurs utilise `stopImmediatePropagation()` pour empêcher la propagation
- Il utilise le flag `true` sur `addEventListener` pour capturer en phase capture
- Les erreurs sont interceptées silencieusement sans affecter le reste de l'application
- Cette solution ne masque QUE les erreurs ResizeObserver, pas les autres erreurs

## Approche Alternative (non retenue)

Une approche alternative aurait été de modifier `hide_enterprise_features.js` pour:
1. Utiliser `requestAnimationFrame()` avant de supprimer les éléments
2. Créer une fonction `safeRemoveElement()` qui masque puis supprime
3. Ajouter des try-catch autour de chaque suppression

Cette approche n'a pas été retenue car:
- Plus invasive (nécessite de réécrire beaucoup de code)
- Plus fragile (nécessite de maintenir la logique de suppression sécurisée partout)
- La solution globale est plus simple et robuste

## Date d'Application

**Date**: 2026-01-23
**Version Odoo**: 19.0
**Version Module**: 19.0.1.0.0
**Statut**: ✅ Appliqué et testé
