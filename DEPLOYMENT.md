# Guide de Déploiement - Quelyos E-commerce

## 📋 Prérequis

- Serveur Linux (Ubuntu 22.04 LTS recommandé)
- Docker & Docker Compose installés
- Nom de domaine configuré
- Minimum 4GB RAM, 2 CPU, 40GB SSD
- Ports 80 et 443 ouverts

## 🚀 Déploiement Production

### Étape 1: Préparation du Serveur

```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installation Docker Compose
sudo apt install docker-compose-plugin

# Créer utilisateur pour l'application
sudo useradd -m -s /bin/bash quelyos
sudo usermod -aG docker quelyos
```

### Étape 2: Configuration DNS

Configurer les enregistrements DNS:

```
A    @              → IP_DU_SERVEUR
A    www            → IP_DU_SERVEUR
AAAA @              → IPv6_DU_SERVEUR (optionnel)
AAAA www            → IPv6_DU_SERVEUR (optionnel)
```

### Étape 3: Cloner le Projet

```bash
# Se connecter en tant qu'utilisateur quelyos
su - quelyos

# Cloner le repository
git clone https://github.com/your-org/QuelyosERP.git
cd QuelyosERP
```

### Étape 4: Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.production.example .env.production

# Éditer et configurer
nano .env.production
```

**Configurer**:
- `DB_PASSWORD`: Mot de passe PostgreSQL sécurisé
- `REDIS_PASSWORD`: Mot de passe Redis
- `SITE_URL`: https://votre-domaine.com
- `WEBHOOK_SECRET`: Générer avec `openssl rand -hex 32`
- `SESSION_SECRET`: Générer avec `openssl rand -hex 32`

### Étape 5: SSL/TLS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot

# Obtenir le certificat
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Créer le dossier SSL pour Nginx
mkdir -p nginx/ssl

# Copier les certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
sudo chown -R quelyos:quelyos nginx/ssl
```

**Renouvellement automatique**:
```bash
# Ajouter au crontab
sudo crontab -e

# Ajouter cette ligne (renouvellement tous les jours à 3h)
0 3 * * * certbot renew --quiet && docker-compose -f /home/quelyos/QuelyosERP/docker-compose.prod.yml restart nginx
```

### Étape 6: Configuration Nginx

```bash
# Éditer la configuration
nano nginx/nginx.conf

# Remplacer 'your-domain.com' par votre domaine
sed -i 's/your-domain.com/votre-domaine.com/g' nginx/nginx.conf
```

### Étape 7: Build & Démarrage

```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

### Étape 8: Installation Odoo

```bash
# Accéder à l'interface Odoo
https://votre-domaine.com/web

# Configuration initiale
- Master Password: choisir un mot de passe fort
- Database Name: quelyos
- Email: admin@votre-domaine.com
- Password: choisir un mot de passe fort
- Language: Français
- Country: Tunisie
```

### Étape 9: Installation Module E-commerce

Dans Odoo:
1. Aller dans **Apps**
2. Cliquer sur **Update Apps List**
3. Rechercher "**Quelyos E-commerce**"
4. Cliquer sur **Install**

### Étape 10: Configuration E-commerce

Dans Odoo → **E-commerce** → **Configuration**:

```
Frontend URL: https://votre-domaine.com
Webhook Secret: (copier depuis .env.production)
Enable Wishlist: ✓
Enable Comparison: ✓
Products per Page: 20
Cart Session Duration: 7 (jours)
Minimum Order Amount: 0
Enable Guest Checkout: ✓
```

### Étape 11: Vérification

```bash
# Tester le frontend
curl https://votre-domaine.com

# Tester l'API
curl https://votre-domaine.com/api/ecommerce/products

# Tester Odoo admin
curl https://votre-domaine.com/web

# Vérifier le SSL
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com
```

## 📊 Monitoring

### Logs

```bash
# Logs frontend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Logs Odoo
docker-compose -f docker-compose.prod.yml logs -f odoo

# Logs Nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Logs PostgreSQL
docker-compose -f docker-compose.prod.yml logs -f db
```

### Métriques

```bash
# Usage ressources
docker stats

# Espace disque
df -h

# Mémoire
free -m
```

## 🔒 Sécurité

### Firewall

```bash
# Installer UFW
sudo apt install ufw

# Configurer
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer
sudo ufw enable
```

### Fail2Ban

```bash
# Installer
sudo apt install fail2ban

# Copier la configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Éditer
sudo nano /etc/fail2ban/jail.local

# Ajouter pour Nginx
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

# Redémarrer
sudo systemctl restart fail2ban
```

### Mises à Jour de Sécurité

```bash
# Automatiser les mises à jour de sécurité
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 💾 Backup

### Script de Backup Automatique

```bash
# Créer le script
nano ~/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/backups/quelyos"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec quelyos_db_prod pg_dump -U odoo quelyos | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Odoo filestore
docker exec quelyos_odoo_prod tar czf /tmp/filestore_$DATE.tar.gz /var/lib/odoo
docker cp quelyos_odoo_prod:/tmp/filestore_$DATE.tar.gz $BACKUP_DIR/

# Backup Frontend
tar czf $BACKUP_DIR/frontend_$DATE.tar.gz -C ~/QuelyosERP/frontend .

# Nettoyer les backups > 30 jours
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Rendre exécutable
chmod +x ~/backup.sh

# Ajouter au crontab (tous les jours à 2h)
crontab -e
0 2 * * * /home/quelyos/backup.sh >> /var/log/quelyos_backup.log 2>&1
```

## 🔄 Mise à Jour

### Frontend

```bash
# Pull les changements
git pull origin main

# Rebuild
docker-compose -f docker-compose.prod.yml build frontend

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d frontend
```

### Backend (Module Odoo)

```bash
# Pull les changements
git pull origin main

# Redémarrer Odoo
docker-compose -f docker-compose.prod.yml restart odoo

# Mettre à jour le module dans Odoo
# Interface → Apps → Quelyos E-commerce → Upgrade
```

### Base de Données

```bash
# Backup avant migration
~/backup.sh

# Exécuter migrations si nécessaire
docker exec quelyos_odoo_prod odoo -d quelyos -u quelyos_ecommerce --stop-after-init
```

## 🚨 Troubleshooting

### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs [service_name]

# Vérifier la configuration
docker-compose -f docker-compose.prod.yml config

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart [service_name]
```

### Problème de mémoire

```bash
# Vérifier la RAM
free -m

# Limiter la mémoire des conteneurs
# Éditer docker-compose.prod.yml et ajouter:
deploy:
  resources:
    limits:
      memory: 2G
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que le backend est up
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs Nginx
docker-compose -f docker-compose.prod.yml logs nginx

# Tester la connexion backend
curl http://localhost:3000  # Frontend
curl http://localhost:8069/web/health  # Odoo
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
sudo certbot renew --force-renewal

# Copier les nouveaux certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/

# Redémarrer Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📈 Optimisation Performance

### PostgreSQL

```bash
# Éditer postgresql.conf
docker exec -it quelyos_db_prod bash
vi /var/lib/postgresql/data/postgresql.conf

# Optimisations recommandées
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
```

### Redis Cache

Le Redis est déjà configuré dans `docker-compose.prod.yml` pour améliorer les performances.

### Nginx Cache

Déjà configuré dans `nginx/nginx.conf` avec cache pour les assets statiques.

## 📞 Support

Pour toute question ou problème:
- Documentation: `/docs`
- Issues: https://github.com/your-org/QuelyosERP/issues
- Email: support@quelyos.com

## ✅ Checklist Post-Déploiement

- [ ] SSL/TLS configuré et fonctionnel
- [ ] Firewall activé (UFW)
- [ ] Fail2Ban configuré
- [ ] Backups automatiques (cron)
- [ ] Monitoring configuré
- [ ] Logs accessibles
- [ ] DNS configuré correctement
- [ ] Site accessible via HTTPS
- [ ] API fonctionnelle
- [ ] Odoo admin accessible
- [ ] Module e-commerce installé
- [ ] Produits de test créés
- [ ] Parcours d'achat testé
- [ ] Performance acceptable (Lighthouse >90)
- [ ] Renouvellement SSL automatique
- [ ] Documentation à jour
