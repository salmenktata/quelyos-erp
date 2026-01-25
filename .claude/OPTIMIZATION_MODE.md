# MODE OPTIMISATION TOKENS ACTIVÉ

## RÈGLES STRICTES

### 1. Lectures limitées
- **MAX 500 lignes** par fichier (sauf demande explicite)
- **Jamais** : node_modules/, dist/, .next/, types complets
- **Ciblé** : Lire fichier spécifique demandé uniquement

### 2. Agents Task = INTERDIT sauf exception
- ❌ `Task(Explore)` pour recherches générales
- ✅ Utiliser `Glob` + `Grep` direct
- Exception : tâches complexes multi-étapes UNIQUEMENT

### 3. Réponses ultra-concises
- Pas de répétition de code
- Pas d'explications longues
- Aller droit au but

### 4. Stratégie de travail
1. **Demander** : "Quel fichier précis ?"
2. **Cibler** : Lire SEULEMENT ce fichier
3. **Modifier** : Edit minimal
4. **Confirmer** : Réponse courte

### 5. Anti-patterns à éviter
- ❌ Lire tous les types d'un coup
- ❌ Explorer toute l'arborescence
- ❌ Lire fichiers de config volumineux
- ❌ Utiliser Task pour recherche simple
- ❌ Réponses verbeuses

## Gain estimé : 70-80% de tokens économisés
