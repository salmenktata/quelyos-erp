# Commande /restart-support - Relancer le serveur Quelyos Support

## Description
Relance le serveur de développement Vite pour Quelyos Support (port 3016).

## Usage
```bash
/restart-support
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3016
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/support-os/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3016/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3016
lsof -ti:3016 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/support-os && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Support arrêté (port 3016)
🚀 Redémarrage du serveur Quelyos Support...
✅ Serveur Quelyos Support démarré avec succès sur http://localhost:3016/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Support
💡 Solutions possibles :
- Vérifier que le dossier apps/support-os/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3016 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : support + crm
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Support sans chercher manuellement le processus.
