# Commande /restart-docker - Redémarrer Docker Desktop

## Description
Redémarre Docker Desktop proprement pour résoudre les problèmes de daemon bloqué ou non réactif.

## Usage

```bash
/restart-docker
```

## Workflow de la commande

### Étape 1 : Diagnostic de l'état Docker
1. Vérifier si Docker Desktop est lancé
2. Tester la connexion au daemon Docker
3. Afficher l'état actuel des conteneurs (si accessible)

### Étape 2 : Arrêt propre de Docker Desktop
1. Quitter Docker Desktop avec AppleScript : `osascript -e 'quit app "Docker"'`
2. Attendre 5 secondes pour assurer l'arrêt complet
3. Vérifier qu'aucun processus Docker ne tourne plus

### Étape 3 : Redémarrage de Docker Desktop
1. Relancer Docker Desktop : `open -a Docker`
2. Attendre que le daemon soit prêt (polling sur `docker info`)
3. Afficher la confirmation de disponibilité

### Étape 4 : Vérification finale
1. Lister les conteneurs : `docker ps -a`
2. Vérifier les volumes : `docker volume ls`
3. Afficher l'état du contexte : `docker context ls`

## Commandes utilisées

```bash
# 1. Diagnostic initial
docker --version
docker context ls
docker info 2>&1 | head -20

# 2. Arrêt propre
osascript -e 'quit app "Docker"'
sleep 5

# 3. Redémarrage
open -a Docker

# 4. Attendre disponibilité (max 60s)
for i in {1..12}; do
  docker info >/dev/null 2>&1 && break
  sleep 5
done

# 5. Vérification finale
docker ps -a
docker volume ls
```

## Messages de sortie attendus

### Succès
```
🔍 Diagnostic Docker...
✅ Docker Desktop installé (version 29.1.5)
⚠️  Daemon non réactif - redémarrage nécessaire

🛑 Arrêt de Docker Desktop...
✅ Docker Desktop arrêté

🚀 Redémarrage de Docker Desktop...
⏳ Attente du daemon (10s)...
✅ Daemon Docker prêt

📋 État final :
✅ 3 conteneurs trouvés
✅ 3 volumes Docker disponibles
✅ Contexte : desktop-linux (actif)

💡 Docker Desktop est prêt. Vous pouvez lancer /restart-odoo
```

### Erreur
```
❌ Erreur lors du redémarrage de Docker
Détails : [message d'erreur]

💡 Solutions possibles :
- Vérifier que Docker Desktop est installé dans /Applications
- Redémarrer manuellement Docker Desktop depuis l'app
- Vérifier les permissions : Préférences Système → Confidentialité
- Réinstaller Docker Desktop si le problème persiste
```

## Règles Importantes

### ✅ À FAIRE
1. **Toujours attendre 5 secondes** après l'arrêt avant de relancer
2. **Vérifier le daemon** avec polling (max 60s) avant de confirmer
3. **Ne pas tuer les processus** avec `kill -9` (utiliser AppleScript)
4. **Afficher l'état final** pour confirmer que tout fonctionne

### ❌ À ÉVITER
1. ❌ Ne jamais utiliser `kill -9` sur les processus Docker (corruption possible)
2. ❌ Ne jamais forcer l'arrêt sans attendre la fin du `quit app`
3. ❌ Ne jamais redémarrer Docker pendant qu'un build est en cours
4. ❌ Ne jamais supprimer les volumes sans confirmation explicite

## Notes Techniques

- **Application** : Docker Desktop pour Mac
- **Socket** : `~/.docker/run/docker.sock`
- **Contexte par défaut** : `desktop-linux`
- **Délai démarrage** : ~10-20 secondes
- **Timeout max** : 60 secondes (12 tentatives × 5s)

## Cas d'usage typiques

1. **Daemon non réactif** : "Cannot connect to the Docker daemon"
2. **Docker bloqué au démarrage** : Logo qui tourne indéfiniment
3. **Après mise à jour macOS** : Reconfiguration des permissions
4. **Conteneurs qui ne démarrent plus** : Reset de l'état Docker
5. **Socket inexistant** : Recréation du socket Docker

## Problèmes connus et solutions

### Docker Desktop ne se lance pas
```bash
# Vérifier les logs Docker Desktop
tail -50 ~/Library/Containers/com.docker.docker/Data/log/vm/dockerd.log

# Réinitialiser les préférences (dernier recours)
rm ~/Library/Group\ Containers/group.com.docker/settings.json
```

### Le daemon met trop de temps à démarrer
- Augmenter les ressources allouées dans Docker Desktop → Preferences → Resources
- Vérifier l'espace disque disponible (Docker nécessite ~10GB)

### Erreur de permissions
```bash
# Vérifier/réparer les permissions du socket
ls -la ~/.docker/run/docker.sock
# Si nécessaire, redémarrer avec sudo (non recommandé)
```

## Commandes associées

```bash
# Diagnostic avancé
docker info
docker version --format '{{json .}}'
docker context ls

# Nettoyage (si nécessaire)
docker system prune -a --volumes  # ATTENTION : supprime TOUT

# Logs Docker Desktop
cat ~/Library/Containers/com.docker.docker/Data/log/vm/dockerd.log

# Vérifier processus Docker
ps aux | grep -i docker | grep -v grep
```

---

## Objectif

Fournir un moyen automatisé et fiable de redémarrer Docker Desktop sur macOS quand le daemon est bloqué ou non réactif.

**Gain de temps : 2-3 minutes par redémarrage manuel évité.**
