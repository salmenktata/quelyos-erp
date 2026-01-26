# Commande /restart-ecommerce - Relancer le serveur E-commerce

## Description
Relance le serveur de développement Next.js pour la boutique e-commerce Quelyos (port 3001).

## Usage

```bash
/restart-ecommerce
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3001
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `vitrine-client/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3001")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd vitrine-client && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur e-commerce arrêté (port 3001)
🚀 Redémarrage du serveur e-commerce...

  ▲ Next.js 16.x.x
  - Local:        http://localhost:3001
  - Environments: .env.local

 ✓ Ready in XXXms

✅ Serveur e-commerce démarré avec succès sur http://localhost:3001/
```

### Erreur
```
❌ Erreur lors du redémarrage du serveur e-commerce
Détails : [message d'erreur]

💡 Solutions possibles :
- Vérifier que pnpm est installé
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
- Vérifier que le port 3001 n'est pas utilisé par un autre processus
```

## Règles Importantes

### ✅ À FAIRE
1. **Toujours vérifier** que le port 3001 est bien libéré avant de relancer
2. **Afficher les logs** en temps réel pour que l'utilisateur voie le démarrage
3. **Confirmer le succès** avec l'URL du serveur
4. **Gérer les erreurs** et proposer des solutions

### ❌ À ÉVITER
1. ❌ Ne jamais laisser plusieurs processus sur le même port
2. ❌ Ne jamais masquer les erreurs de compilation Next.js
3. ❌ Ne jamais relancer si le dossier vitrine-client n'existe pas

## Notes Techniques

- **Port par défaut** : 3001 (configuré dans `package.json`)
- **Processus** : Node.js exécutant Next.js 16
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
7. **Après modification des composants de produits** : Redémarrage pour refresh

## Pages disponibles

Le site e-commerce contient :
- **Page d'accueil boutique** : http://localhost:3001/
- **Catalogue produits** : http://localhost:3001/products
- **Panier** : http://localhost:3001/cart
- **Checkout** : http://localhost:3001/checkout

---

## Objectif

Fournir un moyen rapide et fiable de redémarrer le serveur de développement de la boutique e-commerce sans avoir à quitter Claude Code ou chercher le processus manuellement.

**Gain de temps : 30-60 secondes par redémarrage.**
