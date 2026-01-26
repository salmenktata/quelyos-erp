# 🔑 Comment Obtenir les Clés API Images (2 minutes)

## ⚡ Option 1 : Unsplash (Recommandé - Plus Simple)

### Étapes (30 secondes)
1. **Aller sur** : https://unsplash.com/oauth/applications/new
2. **Se connecter** (ou créer compte gratuit)
3. **Remplir le formulaire** :
   - Application name : `Quelyos Backoffice`
   - Description : `Image search for hero slides`
   - ✅ Cocher "I accept the terms"
4. **Cliquer** "Create Application"
5. **Copier** la clé **Access Key** (commence par `xxx...`)

### Configuration
```bash
# Ouvrir dashboard-client/.env
VITE_UNSPLASH_ACCESS_KEY=votre_cle_ici
```

### Limites
- ✅ **50 requêtes/heure** (mode Démo)
- ✅ Upgrade gratuit à **5000 req/h** après validation app

---

## ⚡ Option 2 : Pexels (Alternative)

### Étapes (30 secondes)
1. **Aller sur** : https://www.pexels.com/api/new/
2. **Se connecter** (ou créer compte gratuit)
3. **Remplir le formulaire** :
   - First Name / Last Name
   - Email (déjà pré-rempli)
   - Use case : `Website/App`
   - Description : `E-commerce hero slide images`
4. **Cliquer** "Generate API Key"
5. **Copier** la clé API affichée

### Configuration
```bash
# Ouvrir dashboard-client/.env
VITE_PEXELS_API_KEY=votre_cle_ici
```

### Limites
- ✅ **200 requêtes/heure** (gratuit)

---

## 🚀 Après Configuration

1. **Sauvegarder** le fichier `.env`
2. **Redémarrer** le backoffice :
   ```bash
   /restart-backoffice
   # ou
   ./scripts/dev-stop.sh backoffice && ./scripts/dev-start.sh backoffice
   ```
3. **Tester** : Aller dans Hero Slides > Chercher "sunset" ou "business"

---

## ⚠️ Erreur "Session Expired" ?

### Causes possibles
1. **Clé non configurée** → Suivre les étapes ci-dessus
2. **Clé invalide** → Vérifier qu'elle est bien copiée (pas d'espace)
3. **Limite atteinte** → Attendre 1h ou utiliser l'autre API
4. **Mauvais format** :
   - Unsplash : Pas de `Client-ID` devant, juste la clé
   - Pexels : Juste la clé, pas de préfixe

### Solution rapide
```bash
# Vérifier le fichier .env
cat dashboard-client/.env | grep API_KEY

# Les lignes doivent ressembler à :
# VITE_UNSPLASH_ACCESS_KEY=abc123xyz...
# VITE_PEXELS_API_KEY=def456uvw...
```

---

## 💡 Sans Clé API ?

Le système fonctionne **SANS clé** avec :
- ✅ 4 images de démonstration pré-chargées
- ✅ Possibilité de coller n'importe quelle URL d'image

La recherche par mots-clés nécessite une clé API (gratuite).

---

## 📚 Plus d'Infos

- Unsplash : https://unsplash.com/documentation
- Pexels : https://www.pexels.com/api/documentation/
- Guide complet : `IMAGE_API_SETUP.md`
