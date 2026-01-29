# 📸 Configuration APIs Images (Unsplash & Pexels)

## 🎯 Fonctionnement par Défaut

**Aucune configuration requise !** Le système fonctionne immédiatement avec :
- ✅ 4 images de démonstration intégrées
- ✅ Possibilité de coller n'importe quelle URL d'image

## 🚀 Activation Recherche Illimitée (Optionnel)

Pour débloquer la recherche par mots-clés sur Unsplash et Pexels :

---

### 1️⃣ Unsplash (50 requêtes/heure - Gratuit)

#### Créer compte développeur
1. Aller sur [Unsplash Developers](https://unsplash.com/developers)
2. Cliquer "Register as a Developer"
3. Créer une nouvelle application
   - **Application name** : `Quelyos Backoffice`
   - **Description** : `Image search for e-commerce hero slides`
   - Accepter les conditions

#### Récupérer Access Key
1. Une fois l'app créée, copier **Access Key**
2. Ajouter dans `.env` :
   ```bash
   VITE_UNSPLASH_ACCESS_KEY=votre_access_key_ici
   ```

#### Limites
- ✅ **50 requêtes/heure** (mode Démo)
- ✅ Upgrade **5000 req/heure** (mode Production - gratuit après approbation)

---

### 2️⃣ Pexels (200 requêtes/heure - Gratuit)

#### Créer compte
1. Aller sur [Pexels API](https://www.pexels.com/api/)
2. Cliquer "Get Started"
3. Créer un compte gratuit

#### Récupérer API Key
1. Une fois connecté, aller dans **Your API Key**
2. Copier la clé API
3. Ajouter dans `.env` :
   ```bash
   VITE_PEXELS_API_KEY=votre_api_key_ici
   ```

#### Limites
- ✅ **200 requêtes/heure** (gratuit)
- ✅ Pas de limite mensuelle

---

## 🔧 Installation

### Fichier .env

Copier `.env.example` → `.env` :
```bash
cd dashboard-client
cp .env.example .env
```

Éditer `.env` et remplacer les valeurs :
```bash
# URL de l'API Odoo
VITE_API_URL=http://localhost:8069

# Unsplash (optionnel)
VITE_UNSPLASH_ACCESS_KEY=ton_access_key_unsplash

# Pexels (optionnel)
VITE_PEXELS_API_KEY=ton_api_key_pexels
```

### Redémarrer le serveur

```bash
pnpm dev
```

---

## 📊 Comparaison APIs

| API | Requêtes/heure | Qualité Images | Variété | Recommandation |
|-----|----------------|----------------|---------|----------------|
| **Pexels** | 200 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Meilleur choix** |
| **Unsplash** | 50 (démo) / 5000 (prod) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Excellent après approbation |

**Conseil** : Configurer **les deux** pour avoir plus de résultats et de diversité.

---

## 🎨 Utilisation dans Backoffice

### Avec API configurées
1. Ouvrir http://localhost:5173/hero-slides
2. Créer/Modifier un slide
3. Choisir source : **Les deux**, **Unsplash**, ou **Pexels**
4. Taper mot-clé : `sport`, `fitness`, `basketball`, etc.
5. Sélectionner image dans la grille
6. Sauvegarder

### Sans API (démo)
1. Utiliser les 4 images de démonstration
2. Ou coller URL externe manuellement

---

## ❓ FAQ

### Les images sont-elles libres de droits ?
✅ **Oui**, Unsplash et Pexels offrent des licences gratuites pour usage commercial.

### Dois-je créditer les photographes ?
- **Unsplash** : Recommandé mais pas obligatoire
- **Pexels** : Recommandé mais pas obligatoire
- Le système stocke automatiquement le nom du photographe

### Que se passe-t-il si je dépasse les limites ?
- **Unsplash** : Erreur HTTP 429, attendre 1h
- **Pexels** : Erreur HTTP 429, attendre 1h
- Le système continuera de fonctionner avec les images de démo

### Puis-je uploader mes propres images ?
Actuellement, le système utilise des URLs externes uniquement (Unsplash/Pexels/autre).
L'upload direct est disponible via l'endpoint backend mais non intégré dans le formulaire actuel.

---

## 🔒 Sécurité

- ✅ API keys stockées dans `.env` (non versionné)
- ✅ `.env` dans `.gitignore`
- ⚠️ **Ne jamais commit les API keys** dans le code

---

## 🐛 Dépannage

### Recherche ne fonctionne pas
1. Vérifier que `.env` contient les clés
2. Redémarrer `pnpm dev`
3. Vérifier console navigateur pour erreurs

### Images ne s'affichent pas
1. Vérifier connexion internet
2. Tester URL image dans navigateur
3. Vérifier CORS (normalement résolu par Unsplash/Pexels)

---

## 📚 Ressources

- [Unsplash API Docs](https://unsplash.com/documentation)
- [Pexels API Docs](https://www.pexels.com/api/documentation/)
- [Guide licences images libres](https://unsplash.com/license)
