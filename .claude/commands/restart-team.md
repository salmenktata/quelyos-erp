# Commande /restart-team - Relancer le serveur Quelyos Team

## Description
Relance le serveur de développement Vite pour Quelyos Team (port 3015).

## Usage
```bash
/restart-team
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3015
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/team-os/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3015/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3015
lsof -ti:3015 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/team-os && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Team arrêté (port 3015)
🚀 Redémarrage du serveur Quelyos Team...
✅ Serveur Quelyos Team démarré avec succès sur http://localhost:3015/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Team
💡 Solutions possibles :
- Vérifier que le dossier apps/team-os/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3015 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : hr
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Team sans chercher manuellement le processus.
