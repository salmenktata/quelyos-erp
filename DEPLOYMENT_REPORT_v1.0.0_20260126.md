# 🚀 Rapport de Déploiement Production - v1.0.0

**Date** : 2026-01-26 17:45:00
**Environnement** : Production (VPS Contabo)
**Version** : v1.0.0
**Domaine** : quelyos.com
**Déployé par** : Claude Code (validé par Utilisateur)

---

## ✅ Checklist Validation

### Phase 1 - Pré-Validation ✅
- [x] Git status clean (branche main, tous fichiers commités)
- [x] Variables environnement créées (.env.production pour 3 services)
- [x] Dépendances à jour (aucune CVE CRITICAL/HIGH détectée)
- [x] Dernier commit descriptif (fix: correction imports)

**Commits inclus dans ce déploiement** :
- fix: correction imports ecms → store dans App.tsx pour build production
- feat: ajout notices pages Stock/CRM + harmonisation position (après header)
- feat: refonte système notices + modules CRM/ECMS + nettoyage pages obsolètes

### Phase 2 - Tests ⚠️
- [x] **SKIPPED** - Mode déploiement rapide (tests à effectuer sur VPS)

**Note** : Tests manuels recommandés post-déploiement sur VPS.

### Phase 3 - Sécurité ⚠️
- [x] **À VALIDER** - Audit sécurité recommandé post-déploiement

**Actions recommandées post-déploiement** :
- Exécuter `/security` sur environnement production
- Configurer fail2ban + firewall sur VPS
- Activer HTTPS via Let's Encrypt/Certbot

### Phase 4 - Backup ✅
- [x] Backup DB créé : `backups/quelyos_production_20260126_174419.sql.gz` (373 B)
- [x] Note : DB presque vide (nouvelle installation)

### Phase 5 - Build Production ✅
- [x] **vitrine-client** (Next.js e-commerce) : Build réussi ✅
- [x] **vitrine-quelyos** (Next.js site vitrine) : Build réussi ✅
- [x] **dashboard-client** (React backoffice) : Build réussi ✅ (bundle 2.9 MB)

**Warnings détectés** :
- Bundle backoffice : 2.9 MB (optimisation code-splitting recommandée future)
- Warnings CSS non bloquants (tailwind template strings)

---

## 📊 Métriques Clés

- **Tests totaux** : SKIPPED (mode déploiement rapide)
- **Score sécurité** : À VALIDER post-déploiement
- **Bundle size frontend** : Standard Next.js
- **Bundle size backoffice** : 2.9 MB (acceptable, optimisation future)
- **Commits déployés** : 3 features majeures

---

## 🎯 Changements Déployés

### ✨ Nouvelles Fonctionnalités
- **Système notices centralisé** : Monitoring stock, analytics, CRM, marketing, finance
- **Module CRM** : Gestion clients/catégories dans backoffice (déplacé dans `/crm`)
- **Module E-Commerce** : Pages store/produits/commandes (déplacé dans `/store`)
- **Page NoticeAnalytics** : Dashboard centralisant toutes les notices système
- **Navigation modulaire** : Séparateurs améliorés dans menu latéral

### 🔧 Corrections
- Fix imports `ecms/*` → `store/*` pour build production
- Harmonisation position notices (après header)
- Nettoyage pages obsolètes (suppression doublons)

### 📁 Refactoring Architecture
- Réorganisation pages : `/pages/ecms` → `/pages/store`
- Ajout dossier `/pages/crm` pour modules CRM
- Bibliothèque notices : `src/lib/notices/` (stock, analytics, CRM, marketing, finance)

---

## 🌐 Configuration DNS Requise

**IMPORTANT** : Avant de tester les URLs, configurer les enregistrements DNS suivants :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ (quelyos.com) | `[IP_VPS_CONTABO]` | 3600 |
| A | www | `[IP_VPS_CONTABO]` | 3600 |
| A | admin | `[IP_VPS_CONTABO]` | 3600 |
| A | api | `[IP_VPS_CONTABO]` | 3600 |

**Résultat attendu** :
- `https://quelyos.com` → Frontend E-commerce (port 3001)
- `https://www.quelyos.com` → Frontend E-commerce (port 3001)
- `https://admin.quelyos.com` → Backoffice React (port 5175)
- `https://api.quelyos.com` → Backend Odoo (port 8069)

**Documentation complète** : Voir `PRODUCTION_DNS_CONFIG.md`

**Timeline propagation DNS** : 15-60 minutes (attendre avant tests)

---

## 🔐 Fichiers .env.production Créés

### 1. Backend Odoo (`odoo-backend/.env.production`)
```bash
DB_HOST=127.0.0.1
DB_NAME=quelyos_production
DB_USER=odoo
DB_PASSWORD=<généré_32_chars>
ODOO_MASTER_PASSWORD=<généré_32_chars>
ODOO_URL=https://api.quelyos.com
FRONTEND_URL=https://quelyos.com
BACKOFFICE_URL=https://admin.quelyos.com
```

### 2. Frontend E-commerce (`vitrine-client/.env.production`)
```bash
NEXT_PUBLIC_ODOO_URL=https://api.quelyos.com
ODOO_DATABASE=quelyos_production
ODOO_WEBHOOK_SECRET=<généré_32_chars>
NEXT_PUBLIC_SITE_URL=https://quelyos.com
# Stripe : À configurer avec vos clés production
```

### 3. Backoffice React (`dashboard-client/.env.production`)
```bash
VITE_API_URL=https://api.quelyos.com
VITE_SHOP_URL=https://quelyos.com
NODE_ENV=production
```

**⚠️ IMPORTANT** : Ces fichiers contiennent des secrets sensibles et sont dans `.gitignore`.
**À transférer manuellement** sur le VPS via SCP/SFTP sécurisé.

---

## 🚀 Instructions Déploiement Sur VPS Contabo

### Prérequis VPS
```bash
# Sur VPS Contabo, installer dépendances
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm postgresql redis-server nginx certbot python3-certbot-nginx

# Installer Docker + Docker Compose (pour Odoo)
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
```

---

### Étape 1 : Cloner le Projet

```bash
ssh user@[IP_VPS_CONTABO]
cd /var/www
sudo git clone https://github.com/VOTRE_USER/QuelyosSuite.git quelyos
sudo chown -R $USER:$USER /var/www/quelyos
cd quelyos
git checkout main
```

---

### Étape 2 : Transférer Fichiers .env.production

**Depuis votre machine locale** :
```bash
# Copier les fichiers .env.production vers VPS
scp odoo-backend/.env.production user@[IP_VPS]:/var/www/quelyos/odoo-backend/
scp vitrine-client/.env.production user@[IP_VPS]:/var/www/quelyos/vitrine-client/
scp dashboard-client/.env.production user@[IP_VPS]:/var/www/quelyos/dashboard-client/
```

---

### Étape 3 : Configurer PostgreSQL

```bash
# Sur VPS
sudo -u postgres psql

-- Dans psql
CREATE DATABASE quelyos_production;
CREATE USER odoo WITH PASSWORD 'VOTRE_PASSWORD_DU_ENV_PRODUCTION';
GRANT ALL PRIVILEGES ON DATABASE quelyos_production TO odoo;
ALTER DATABASE quelyos_production OWNER TO odoo;
\q
```

---

### Étape 4 : Démarrer Backend Odoo (Docker)

```bash
cd /var/www/quelyos/odoo-backend

# Créer fichier docker-compose.prod.yml si nécessaire
# Ou utiliser docker-compose.yml existant

docker-compose up -d

# Vérifier santé services
docker-compose ps
curl http://localhost:8069/web/health
```

---

### Étape 5 : Build & Démarrer Frontend E-commerce

```bash
cd /var/www/quelyos/vitrine-client

npm install --production
npm run build

# Installer PM2 pour gestion process
sudo npm install -g pm2

# Démarrer avec PM2
pm2 start npm --name "quelyos-ecommerce" -- start
pm2 save
pm2 startup  # Suivre instructions pour auto-start au boot
```

---

### Étape 6 : Build & Démarrer Site Vitrine

```bash
cd /var/www/quelyos/vitrine-quelyos

npm install --production
npm run build

pm2 start npm --name "quelyos-vitrine" -- start
pm2 save
```

---

### Étape 7 : Build & Servir Backoffice React

```bash
cd /var/www/quelyos/dashboard-client

npm install --production
npm run build

# Le dossier dist/ contient le build statique
# À servir via Nginx (voir étape 8)
```

---

### Étape 8 : Configurer Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/quelyos.conf
```

**Contenu du fichier** :
```nginx
# Frontend E-commerce (quelyos.com)
server {
    listen 80;
    server_name quelyos.com www.quelyos.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Site Vitrine (vitrine.quelyos.com ou intégré selon architecture)
# Similaire à ci-dessus avec port 3000

# Backoffice Admin (admin.quelyos.com)
server {
    listen 80;
    server_name admin.quelyos.com;

    root /var/www/quelyos/dashboard-client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend Odoo API (api.quelyos.com)
server {
    listen 80;
    server_name api.quelyos.com;

    location / {
        proxy_pass http://127.0.0.1:8069;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_redirect off;
    }
}
```

**Activer configuration** :
```bash
sudo ln -s /etc/nginx/sites-available/quelyos.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Étape 9 : Activer HTTPS (Let's Encrypt)

**Après propagation DNS (attendre 30 min)** :
```bash
sudo certbot --nginx -d quelyos.com -d www.quelyos.com -d admin.quelyos.com -d api.quelyos.com

# Tester renouvellement automatique
sudo certbot renew --dry-run
```

---

### Étape 10 : Vérification Post-Déploiement

```bash
# Vérifier services démarrés
pm2 status
docker-compose ps
sudo systemctl status nginx

# Smoke tests (après propagation DNS)
curl -I https://quelyos.com
curl -I https://admin.quelyos.com
curl -I https://api.quelyos.com/web/health

# Vérifier logs
pm2 logs quelyos-ecommerce
pm2 logs quelyos-vitrine
docker-compose logs -f odoo
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Plan de Rollback

**Si problème critique détecté en production** :

### 1. Rollback Code
```bash
cd /var/www/quelyos
git log --oneline -5  # Identifier commit précédent stable
git checkout 4a857d4  # Exemple : commit stable précédent
```

### 2. Rollback Builds
```bash
# Rebuild services avec version précédente
cd vitrine-client && npm run build
cd ../vitrine-quelyos && npm run build
cd ../dashboard-client && npm run build

# Redémarrer services
pm2 restart all
docker-compose restart odoo
sudo systemctl reload nginx
```

### 3. Rollback Base de Données (si nécessaire)
```bash
cd /var/www/quelyos/odoo-backend
gunzip -c backups/quelyos_production_20260126_174419.sql.gz | \
  docker-compose exec -T db psql -U odoo -d quelyos_production
docker-compose restart odoo
```

### 4. Vérification Post-Rollback
```bash
curl -I https://quelyos.com
curl -I https://admin.quelyos.com
curl -I https://api.quelyos.com/web/health
```

**Temps estimé rollback** : 10-15 minutes

---

## 📋 Checklist Post-Déploiement (À Faire Sur VPS)

- [ ] Configuration DNS propagée (dig/nslookup)
- [ ] Certificats SSL générés et valides (cadenas vert navigateur)
- [ ] Tous services démarrés (pm2 status, docker ps)
- [ ] Frontend e-commerce accessible (https://quelyos.com)
- [ ] Backoffice accessible (https://admin.quelyos.com)
- [ ] Backend API répond (https://api.quelyos.com/web/health)
- [ ] Aucune erreur 500 dans logs Nginx
- [ ] Connexion Odoo fonctionne (admin/admin)
- [ ] Créer utilisateur admin production (supprimer admin/admin)
- [ ] Configurer clés Stripe production
- [ ] Configurer SMTP email (si envoi emails)
- [ ] Tests fonctionnels critiques :
  - [ ] Affichage catalogue produits
  - [ ] Ajout panier
  - [ ] Processus checkout
  - [ ] Login backoffice
  - [ ] CRUD produits backoffice
- [ ] Monitoring activé (PM2, logs, alertes)
- [ ] Backup automatique DB configuré (cron)
- [ ] Firewall configuré (ufw/iptables)
- [ ] Fail2ban activé (protection brute-force)

---

## 🔐 Sécurité Post-Déploiement Recommandée

### Firewall UFW
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Fail2ban (protection brute-force)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Backup Automatique DB (Cron)
```bash
crontab -e

# Backup quotidien à 3h du matin
0 3 * * * cd /var/www/quelyos/odoo-backend && docker-compose exec -T db pg_dump -U odoo -d quelyos_production | gzip > backups/daily_$(date +\%Y\%m\%d).sql.gz

# Nettoyage backups > 7 jours
0 4 * * * find /var/www/quelyos/odoo-backend/backups -name "daily_*.sql.gz" -mtime +7 -delete
```

---

## 📞 Support & Ressources

**Documentation complète** :
- Architecture : `ARCHITECTURE.md`
- Configuration DNS : `PRODUCTION_DNS_CONFIG.md`
- Guide API : `.claude/API_CONVENTIONS.md`
- Logs développement : `docs/LOGME.md`

**En cas de problème** :
1. Vérifier logs : `pm2 logs`, `docker-compose logs`, `/var/log/nginx/`
2. Vérifier variables env : fichiers `.env.production`
3. Vérifier DNS propagé : `dig quelyos.com`
4. Plan de rollback ci-dessus

---

## ✅ STATUT : PRÊT POUR DÉPLOIEMENT

**Builds validés localement** ✅
**Configuration .env créée** ✅
**Backup DB effectué** ✅
**Documentation complète fournie** ✅

**Prochaines étapes** :
1. Configurer DNS chez registrar (15-60 min propagation)
2. Déployer sur VPS selon instructions ci-dessus
3. Activer HTTPS via Certbot
4. Exécuter checklist post-déploiement
5. Tests fonctionnels en production

---

**Bon déploiement ! 🚀**

---

*Rapport généré automatiquement par Claude Code le 2026-01-26 à 17:45*
