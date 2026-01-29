# Déploiement Dashboard Client

## 🔧 Développement

### Configuration actuelle
- **Frontend** : http://localhost:5175
- **Backend** : http://localhost:8069
- **Méthode** : Accès direct via CORS

### Variables d'environnement
Fichier `.env.development` (déjà configuré) :
```env
VITE_API_URL=http://localhost:8069
```

### Authentification
- **Méthode** : Header `X-Session-Id`
- Le `session_id` est stocké dans `localStorage`
- Envoyé dans chaque requête via le header `X-Session-Id`
- Pas de cookies cross-origin (CORS avec `credentials: 'omit'`)

---

## 🚀 Production

### Architecture recommandée : Reverse Proxy

```
[Client Browser]
     ↓
[Nginx/Caddy sur port 443]
     ↓
     ├─→ /          → Frontend (port 3000)
     └─→ /api/*     → Backend Odoo (port 8069)
```

**Avantages** :
- ✅ Même origine pour le navigateur (pas de CORS)
- ✅ Cookies fonctionnent automatiquement
- ✅ HTTPS centralisé
- ✅ Cache et optimisations possibles

---

## 📝 Configuration Nginx

### Fichier `/etc/nginx/sites-available/quelyos-admin`

```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name admin.votredomaine.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name admin.votredomaine.com;

    # Certificats SSL (Let's Encrypt recommandé)
    ssl_certificate /etc/letsencrypt/live/admin.votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.votredomaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Logs
    access_log /var/log/nginx/quelyos-admin-access.log;
    error_log /var/log/nginx/quelyos-admin-error.log;

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend React (build Vite)
    location / {
        root /var/www/quelyos-admin/dist;
        try_files $uri $uri/ /index.html;

        # Cache assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend Odoo (proxy)
    location /api/ {
        proxy_pass http://localhost:8069/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Pas de cache pour les API
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
    }

    # Images Odoo
    location /web/image/ {
        proxy_pass http://localhost:8069/web/image/;
        proxy_set_header Host $host;
        proxy_cache_valid 200 1h;
    }
}
```

### Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/quelyos-admin /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 📝 Configuration Caddy (Alternative simple)

### Fichier `Caddyfile`

```caddy
admin.votredomaine.com {
    # Frontend
    root * /var/www/quelyos-admin/dist
    try_files {path} /index.html
    file_server

    # Backend API
    reverse_proxy /api/* localhost:8069 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
    }

    # Images Odoo
    reverse_proxy /web/image/* localhost:8069
}
```

### Démarrer Caddy

```bash
sudo caddy start
```

**Avantages de Caddy** :
- ✅ HTTPS automatique (Let's Encrypt intégré)
- ✅ Configuration plus simple
- ✅ Rechargement sans downtime

---

## 🔧 Build Production

### 1. Créer `.env.production`

```env
# URL vide = requêtes relatives (via reverse proxy)
VITE_API_URL=
```

### 2. Build du frontend

```bash
cd dashboard-client
pnpm build
```

Le build sera dans `dist/`.

### 3. Déployer

```bash
# Copier le build vers le serveur
rsync -avz dist/ user@server:/var/www/quelyos-admin/dist/

# Ou avec SCP
scp -r dist/* user@server:/var/www/quelyos-admin/dist/
```

---

## ✅ Vérification

### 1. Frontend accessible
```bash
curl https://admin.votredomaine.com
```

### 2. API accessible (même origine)
```bash
curl https://admin.votredomaine.com/api/ecommerce/products
```

### 3. Cookies fonctionnent
Les cookies sont maintenant automatiquement envoyés car frontend et backend partagent la même origine (`admin.votredomaine.com`).

---

## 🔐 Sécurité Production

### À faire AVANT le déploiement

1. **Modifier `quelyos_api/config.py`** :
   ```python
   ALLOWED_ORIGINS = [
       'https://admin.votredomaine.com',
   ]
   ```

2. **Variables d'environnement Odoo** :
   ```bash
   export QUELYOS_DEV_MODE=False
   ```

3. **Firewall** :
   ```bash
   # Bloquer l'accès direct à Odoo (port 8069)
   sudo ufw deny 8069

   # Autoriser seulement localhost
   sudo ufw allow from 127.0.0.1 to any port 8069
   ```

4. **HTTPS obligatoire** :
   - Nginx : redirection 301 HTTP→HTTPS (déjà dans la config)
   - Let's Encrypt : certificats gratuits

---

## 📊 Monitoring

### Logs Nginx
```bash
# Accès
tail -f /var/log/nginx/quelyos-admin-access.log

# Erreurs
tail -f /var/log/nginx/quelyos-admin-error.log
```

### Logs Odoo
```bash
docker logs -f quelyos-odoo
```

---

## 🆘 Dépannage

### Erreur 502 Bad Gateway
```bash
# Vérifier qu'Odoo tourne
docker ps | grep quelyos-odoo

# Vérifier les logs Nginx
tail -50 /var/log/nginx/quelyos-admin-error.log
```

### Erreur CORS en production
→ Vérifier que `VITE_API_URL` est vide dans `.env.production`

### Assets ne chargent pas
```bash
# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/quelyos-admin/dist
sudo chmod -R 755 /var/www/quelyos-admin/dist
```

---

## 📚 Ressources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
