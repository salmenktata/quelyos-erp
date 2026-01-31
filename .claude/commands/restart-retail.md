# Commande /restart-retail - Relancer le serveur Quelyos Retail

## Description
Relance le serveur de développement Vite pour Quelyos Retail (port 3014).

## Usage
```bash
/restart-retail
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3014
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/retail-os/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3014/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3014
lsof -ti:3014 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/retail-os && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Retail arrêté (port 3014)
🚀 Redémarrage du serveur Quelyos Retail...
✅ Serveur Quelyos Retail démarré avec succès sur http://localhost:3014/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Retail
💡 Solutions possibles :
- Vérifier que le dossier apps/retail-os/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3014 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : pos + store + stock
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Retail sans chercher manuellement le processus.
