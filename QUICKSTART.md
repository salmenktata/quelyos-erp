# 🚀 Quickstart - Test Local Production

Guide rapide pour tester l'infrastructure de production en local.

## Option 1 : Production minimale (sans monitoring)

### 1. Créer le fichier de configuration

```bash
cp .env.production.example .env.production
```

Éditer `.env.production` avec ces valeurs minimales pour le test local :

```bash
# Base de données
DB_USER=odoo
DB_PASSWORD=odoo_prod_2024
DB_NAME=quelyos_prod

# Odoo
ODOO_WORKERS=2
ODOO_MAX_CRON_THREADS=1
ODOO_LIMIT_TIME_CPU=300
ODOO_LIMIT_TIME_REAL=600

# Frontend
NEXT_PUBLIC_SITE_URL=http://localhost
NEXT_PUBLIC_API_URL=http://localhost/api
ODOO_URL=http://odoo:8069
ODOO_DB=quelyos_prod

# Domaine (pour test local)
DOMAIN=localhost
LETSENCRYPT_EMAIL=test@localhost

# Stripe (pour test, utiliser les clés de test)
STRIPE_PUBLIC_KEY=pk_test_XXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXX

# Sécurité (générer avec: openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# CORS
CORS_ORIGINS=http://localhost,http://localhost:3000
```

### 2. Déployer

```bash
./deploy.sh
```

Le script va :
- Vérifier Docker et les prérequis
- Builder les images (peut prendre 5-10 minutes)
- Démarrer les 6 services
- Exécuter les healthchecks

### 3. Accéder aux services

Attendez 1-2 minutes que tous les services démarrent, puis :

```bash
# Vérifier que tout est OK
./healthcheck.sh

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

**URLs disponibles** :
- Frontend : http://localhost
- Backoffice : http://localhost/admin
- API Odoo : http://localhost/api
- Interface Odoo : http://localhost/web

**Credentials Odoo par défaut** :
- Email : `admin`
- Password : `admin`

---

## Option 2 : Production + Monitoring complet

### 1. Configurer les variables monitoring

Ajouter dans `.env.production` :

```bash
# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin_monitoring_2024

# Alertmanager (optionnel pour test local)
ALERT_EMAIL=test@localhost
SLACK_WEBHOOK=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

### 2. Déployer avec monitoring

```bash
# Déployer production + monitoring (14 services)
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d

# Attendre que tout démarre (2-3 minutes)
sleep 120

# Vérifier
./healthcheck.sh
```

### 3. Accéder aux services de monitoring

**Métriques et dashboards** :
- Prometheus : http://localhost:9090
- Grafana : http://localhost:3001 (admin / admin_monitoring_2024)
- Alertmanager : http://localhost:9093

**Métriques système** :
- cAdvisor : http://localhost:8080
- Node Exporter : http://localhost:9100/metrics

Dans **Grafana** :
1. Se connecter (admin / admin_monitoring_2024)
2. Aller dans **Configuration** → **Data Sources**
3. Ajouter Prometheus : `http://prometheus:9090`
4. Ajouter Loki : `http://loki:3100`
5. Importer des dashboards :
   - Docker Monitoring : ID `193`
   - Node Exporter Full : ID `1860`
   - PostgreSQL : ID `9628`

---

## Commandes utiles

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f odoo

# Monitoring
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
```

### Redémarrer un service

```bash
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart odoo
```

### Arrêter tout

```bash
# Arrêter production
docker-compose -f docker-compose.prod.yml down

# Arrêter production + monitoring
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml down

# Arrêter et supprimer les volumes (ATTENTION: perte de données)
docker-compose -f docker-compose.prod.yml down -v
```

### Nettoyer

```bash
# Supprimer les images non utilisées
docker system prune -a

# Supprimer tout (images + volumes)
docker system prune -a --volumes
```

### Tester l'API

```bash
# Healthcheck
curl http://localhost/health

# API Odoo
curl http://localhost/api/health

# Frontend
curl -I http://localhost/

# Backoffice
curl -I http://localhost/admin
```

### Créer un backup

```bash
./backup.sh

# Les backups sont dans ./backups/
ls -lh backups/
```

---

## Troubleshooting

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs

# Vérifier l'état
docker-compose -f docker-compose.prod.yml ps
```

### PostgreSQL ne démarre pas

```bash
# Vérifier les logs PostgreSQL
docker-compose -f docker-compose.prod.yml logs db

# Problème de permissions
sudo chown -R 999:999 backups/
```

### Frontend ne build pas

```bash
# Vérifier les logs du build
docker-compose -f docker-compose.prod.yml build frontend

# Problème de mémoire : augmenter la RAM allouée à Docker
# Docker Desktop → Settings → Resources → Memory (minimum 4GB recommandé)
```

### Port déjà utilisé

```bash
# Vérifier quel processus utilise le port 80
sudo lsof -i :80

# Arrêter Apache/Nginx local si nécessaire
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Odoo ne se connecte pas à PostgreSQL

```bash
# Vérifier que PostgreSQL est prêt
docker exec quelyos-db-prod pg_isready -U odoo

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml config | grep DB_
```

---

## Test des workflows GitHub Actions (CI/CD)

Les workflows sont configurés dans `.github/workflows/` :

### Test CI en local avec act

```bash
# Installer act (https://github.com/nektos/act)
brew install act  # macOS
# ou
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Lister les workflows
act -l

# Tester le workflow CI
act push -W .github/workflows/ci.yml

# Tester le workflow CD (sans vraiment déployer)
act push -W .github/workflows/deploy.yml --dry-run
```

### Test sur GitHub

Les workflows se déclenchent automatiquement :
- **CI** : Sur chaque push et pull request
- **CD** : Sur push vers `main` ou tags `v*`

Voir les résultats : https://github.com/votre-compte/QuelyosERP/actions

---

## Performance

### Build rapide (cache)

Les Dockerfiles utilisent le cache pour accélérer les builds suivants :

```bash
# Premier build : ~10 minutes
# Builds suivants : ~2-3 minutes (si pas de changement dans package.json)
```

### Optimisations pour le test local

Dans `docker-compose.prod.yml`, vous pouvez temporairement :
- Réduire `ODOO_WORKERS=1` (au lieu de 4)
- Commenter le service `certbot` (inutile en local)

---

## Prochaines étapes

1. **Tester l'API** : Utiliser Postman/Insomnia pour tester les 45 endpoints
2. **Créer des données** : Via l'interface Odoo (/web) ou le backoffice (/admin)
3. **Configurer Grafana** : Importer les dashboards recommandés
4. **Tester les alertes** : Simuler une charge pour déclencher les alertes
5. **Backup/Restore** : Tester la sauvegarde et restauration

**Bon test ! 🚀**
