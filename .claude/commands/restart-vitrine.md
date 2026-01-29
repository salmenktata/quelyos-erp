# Commande /restart-vitrine - Relancer le serveur Site Vitrine

## Description
Relance le serveur de développement Next.js pour le site vitrine Quelyos (port 3000).

## Usage

```bash
/restart-vitrine
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3000
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Nettoyer le cache Next.js
1. Supprimer le dossier `.next` pour éviter les erreurs de cache corrompu

### Étape 3 : Relancer le serveur
1. Se placer dans le dossier `vitrine-quelyos/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3000")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Nettoyer le cache Next.js (évite les erreurs de routes-manifest.json corrompu)
rm -rf vitrine-quelyos/.next

# 3. Relancer le serveur
cd vitrine-quelyos && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur vitrine arrêté (port 3000)
🚀 Redémarrage du serveur vitrine...

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in XXXms

✅ Serveur vitrine démarré avec succès sur http://localhost:3000/
```

### Erreur
```
❌ Erreur lors du redémarrage du serveur vitrine
Détails : [message d'erreur]

💡 Solutions possibles :
- Vérifier que pnpm est installé
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
- Vérifier que le port 3000 n'est pas utilisé par un autre processus
```

## Règles Importantes

### ✅ À FAIRE
1. **Toujours vérifier** que le port 3000 est bien libéré avant de relancer
2. **Afficher les logs** en temps réel pour que l'utilisateur voie le démarrage
3. **Confirmer le succès** avec l'URL du serveur
4. **Gérer les erreurs** et proposer des solutions

### ❌ À ÉVITER
1. ❌ Ne jamais laisser plusieurs processus sur le même port
2. ❌ Ne jamais masquer les erreurs de compilation Next.js
3. ❌ Ne jamais relancer si le dossier vitrine-quelyos n'existe pas

## Notes Techniques

- **Port par défaut** : 3000 (configuré dans `next.config.ts`)
- **Processus** : Node.js exécutant Next.js
- **Délai démarrage** : ~5-10 secondes selon la taille du projet
- **Hot Module Replacement** : Activé automatiquement (Fast Refresh)
- **Gestionnaire de paquets** : pnpm (monorepo)

## Cas d'usage typiques

1. **Après modification de next.config.ts** : Redémarrage nécessaire
2. **Après modification de .env.local** : Redémarrage nécessaire
3. **Après installation de dépendances** : Redémarrage recommandé
4. **En cas de freeze/lag** : Redémarrage pour nettoyer le cache
5. **Port déjà utilisé** : Libérer et relancer
6. **Après correction erreur d'hydratation** : Redémarrage pour vider le cache

## Pages disponibles

Le site vitrine contient :
- **Page d'accueil** : http://localhost:3000/
- **Quelyos Finance** : http://localhost:3000/finance
- **Quelyos Marketing** : http://localhost:3000/marketing
- **E-commerce** : http://localhost:3000/ecommerce

---

## Objectif

Fournir un moyen rapide et fiable de redémarrer le serveur de développement du site vitrine sans avoir à quitter Claude Code ou chercher le processus manuellement.

**Gain de temps : 30-60 secondes par redémarrage.**
