# Guide d'Économie de Tokens

## Pour l'utilisateur

### ✅ Requêtes économiques
```
❌ "Explore le codebase et trouve les erreurs"
✅ "Vérifie frontend/src/app/account/orders/page.tsx ligne 45"

❌ "Regarde tous les types"
✅ "Quel est le type Product dans shared/types ?"

❌ "Cherche partout où on utilise X"
✅ "Cherche X dans frontend/src/components/"
```

### 💡 Astuces
1. **Être précis** : Indiquer le fichier exact si connu
2. **Limiter la portée** : "dans frontend/" vs "partout"
3. **Questions ciblées** : 1 question = 1 fichier idéalement
4. **Réutiliser le contexte** : Référencer fichiers déjà lus dans la conversation

### 📊 Consommation estimée
- Lecture 1 fichier 100 lignes : ~500 tokens
- Agent Task/Explore : ~5000-15000 tokens
- Grep/Glob direct : ~200-500 tokens
- Lecture types complets : ~10000+ tokens

## Pour Claude

### Workflow optimisé
1. **Demander précision** si requête vague
2. **Glob** pour localiser fichier
3. **Read** ciblé (max 500 lignes)
4. **Edit** minimal
5. **Réponse courte**

### Checklist avant action
- [ ] Ai-je vraiment besoin de lire ce fichier ?
- [ ] Puis-je utiliser Grep au lieu de Read ?
- [ ] Puis-je limiter à 200-300 lignes ?
- [ ] Est-ce que Task est vraiment nécessaire ?
- [ ] Ma réponse peut-elle être plus courte ?

### Red flags
- 🚨 Lecture de fichiers > 1000 lignes
- 🚨 Utilisation Task pour recherche simple
- 🚨 Lecture multiple du même fichier
- 🚨 Exploration large sans besoin
