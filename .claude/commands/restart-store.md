# Commande /restart-store - Relancer le serveur Quelyos Store

## Description
Relance le serveur de développement Vite pour Quelyos Store (port 3011).

## Usage
```bash
/restart-store
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3011
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/store-os/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3011/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3011
lsof -ti:3011 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/store-os && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Store arrêté (port 3011)
🚀 Redémarrage du serveur Quelyos Store...
✅ Serveur Quelyos Store démarré avec succès sur http://localhost:3011/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Store
💡 Solutions possibles :
- Vérifier que le dossier apps/store-os/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3011 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : store + marketing
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Store sans chercher manuellement le processus.
