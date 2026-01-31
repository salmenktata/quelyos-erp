# Commande /restart-sales - Relancer le serveur Quelyos Sales

## Description
Relance le serveur de développement Vite pour Quelyos Sales (port 3013).

## Usage
```bash
/restart-sales
```

## Workflow de la commande

### Étape 1 : Arrêter le processus existant
1. Identifier le processus qui tourne sur le port 3013
2. Tuer le processus proprement (SIGTERM puis SIGKILL si nécessaire)
3. Vérifier que le port est libéré

### Étape 2 : Relancer le serveur
1. Se placer dans le dossier `apps/sales-os/`
2. Exécuter `pnpm dev` en arrière-plan
3. Attendre que le serveur soit prêt (message "Local: http://localhost:3013/")
4. Confirmer que le serveur est accessible

## Commandes utilisées

```bash
# 1. Trouver et arrêter le processus sur le port 3013
lsof -ti:3013 | xargs kill -9 2>/dev/null || true

# 2. Relancer le serveur
cd apps/sales-os && pnpm dev
```

## Messages de sortie attendus

### Succès
```
✅ Serveur Quelyos Sales arrêté (port 3013)
🚀 Redémarrage du serveur Quelyos Sales...
✅ Serveur Quelyos Sales démarré avec succès sur http://localhost:3013/
```

### Erreur
```
❌ Erreur lors du redémarrage de Quelyos Sales
💡 Solutions possibles :
- Vérifier que le dossier apps/sales-os/ existe
- Vérifier que les dépendances sont installées (pnpm install)
- Vérifier les logs d'erreur ci-dessus
```

## Notes Techniques
- **Port par défaut** : 3013 (configuré dans `vite.config.ts`)
- **Processus** : Node.js exécutant Vite
- **Modules ERP inclus** : crm + marketing
- **Packages partagés** : @quelyos/ui-kit, @quelyos/api-client, @quelyos/utils

## Objectif
Fournir un moyen rapide de relancer le frontend SaaS Quelyos Sales sans chercher manuellement le processus.
