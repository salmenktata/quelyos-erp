# Commande /restart-copilote - Relancer le serveur Quelyos Copilote

## Description
Relance le serveur de développement Vite pour Quelyos Copilote (port 3012).

## Usage
```bash
/restart-copilote
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3012
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/copilote-ops/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3012/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3012
lsof -ti:3012 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/copilote-ops && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Copilote arrêté (port 3012)
🚀 Redémarrage du serveur Quelyos Copilote...
✅ Serveur Quelyos Copilote démarré avec succès sur http://localhost:3012/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Copilote
💡 Solutions possibles :
- Vérifier que le dossier apps/copilote-ops/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3012 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : stock + GMAO + hr
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Copilote sans chercher manuellement le processus.
