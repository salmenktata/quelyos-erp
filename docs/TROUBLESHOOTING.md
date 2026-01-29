# Guide de Dépannage Quelyos Suite

Guide de résolution des erreurs courantes lors de l'installation et de l'utilisation de Quelyos Suite.

## Table des Matières

1. [Erreurs Installation](#erreurs-installation)
2. [Erreurs Modules](#erreurs-modules)
3. [Erreurs Base de Données](#erreurs-base-de-données)
4. [Erreurs API REST](#erreurs-api-rest)
5. [Erreurs Frontends](#erreurs-frontends)
6. [Performance](#performance)
7. [Logs et Debug](#logs-et-debug)

---

## Erreurs Installation

### Module NOT FOUND

**Symptôme** :
```
Module quelyos_api NOT FOUND dans addons_path
```

**Cause** : Le module n'est pas dans l'addons_path d'Odoo.

**Solution** :

1. Vérifier que le repo est cloné :
   ```bash
   ls -la /opt/odoo/quelyos-suite/odoo-backend/addons/
   ```

2. Vérifier l'addons_path dans `/etc/odoo/odoo.conf` :
   ```ini
   addons_path = /opt/odoo/odoo-19/addons,/opt/odoo/quelyos-suite/odoo-backend/addons,...
   ```

3. Redémarrer Odoo :
   ```bash
   sudo systemctl restart odoo
   ```

4. Mettre à jour la liste des apps :
   Odoo UI > Apps > Bouton "Update Apps List" (mode debug)

---

### Version Mismatch OCA

**Symptôme** :
```
Module 'stock_inventory' version 16.0 incompatible with Odoo 19.0
```

**Cause** : Mauvaise branche OCA clonée.

**Solution** :

1. Vérifier la branche clonée :
   ```bash
   cd /opt/odoo/oca-addons/stock-logistics-warehouse
   git branch
   ```

2. Changer vers la bonne branche :
   ```bash
   # Pour modules Stock OCA
   git fetch origin 19.0
   git checkout 19.0

   # Pour modules Marketing OCA (compatibles v19)
   cd /opt/odoo/oca-addons/social
   git fetch origin 16.0
   git checkout 16.0
   ```

3. Redémarrer Odoo :
   ```bash
   sudo systemctl restart odoo
   ```

---

### post_init_hook Failed

**Symptôme** :
```
Error during post_init_hook: Module quelyos_api installation failed
```

**Cause** : Erreur lors de l'installation automatique des modules Quelyos.

**Solution** :

1. Vérifier les logs Odoo :
   ```bash
   tail -n 100 /var/log/odoo/odoo-server.log | grep -i error
   ```

2. Chercher la ligne exacte de l'erreur :
   ```bash
   grep "QUELYOS SUITE ORCHESTRATOR" /var/log/odoo/odoo-server.log
   ```

3. Si quelyos_api est le problème, vérifier ses dépendances :
   ```bash
   cat /opt/odoo/quelyos-suite/odoo-backend/addons/quelyos_api/__manifest__.py | grep depends
   ```

4. Installer le module manquant manuellement :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -i <module_manquant> --stop-after-init
   ```

---

### Installation Bloquée (Stuck)

**Symptôme** : L'installation reste bloquée sur "Installing..." pendant plus de 10 minutes.

**Cause** : Problème de workers ou de mémoire.

**Solution** :

1. **Arrêter Odoo** :
   ```bash
   sudo systemctl stop odoo
   ```

2. **Vérifier les processus zombie** :
   ```bash
   ps aux | grep odoo
   sudo kill -9 <PID>
   ```

3. **Réduire les workers temporairement** dans `/etc/odoo/odoo.conf` :
   ```ini
   workers = 0
   max_cron_threads = 0
   ```

4. **Lancer installation en mode direct** :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -i quelyos_core --stop-after-init --log-level=debug
   ```

5. **Restaurer workers après installation** et redémarrer :
   ```ini
   workers = 2
   max_cron_threads = 1
   ```

---

## Erreurs Modules

### Tenant Admin Non Créé

**Symptôme** :
```
quelyos.tenant NOT FOUND (code=admin)
```

**Cause** : Le post_init_hook de quelyos_api n'a pas créé le tenant admin.

**Solution** :

1. Vérifier si quelyos_api est installé :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin shell -c /etc/odoo/odoo.conf -d quelyos_production
   ```

   ```python
   env['ir.module.module'].search([('name', '=', 'quelyos_api')]).state
   # Doit retourner 'installed'
   ```

2. Si installé mais tenant manquant, upgrader quelyos_api :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -u quelyos_api --stop-after-init
   ```

3. Vérifier le fichier data :
   ```bash
   cat /opt/odoo/quelyos-suite/odoo-backend/addons/quelyos_api/data/default_admin_tenant.xml
   ```

4. Si toujours absent, créer manuellement via shell :
   ```python
   plan = env['quelyos.subscription.plan'].search([('code', '=', 'enterprise')], limit=1)
   env['quelyos.tenant'].create({
       'name': 'Admin Tenant',
       'code': 'admin',
       'subscription_plan_id': plan.id,
       'active': True,
   })
   env.cr.commit()
   ```

---

### Plans d'Abonnement Manquants

**Symptôme** :
```
No subscription plans found
```

**Solution** :

1. Vérifier si les plans existent :
   ```python
   env['quelyos.subscription.plan'].search([])
   ```

2. Si vide, upgrader quelyos_api :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -u quelyos_api --stop-after-init
   ```

3. Vérifier le fichier data :
   ```bash
   cat /opt/odoo/quelyos-suite/odoo-backend/addons/quelyos_api/data/subscription_plan_data.xml
   ```

---

### Groupes de Permissions Manquants

**Symptôme** : Erreurs d'accès lors de l'utilisation de l'API.

**Solution** :

1. Vérifier les groupes Quelyos :
   ```python
   env['res.groups'].search([('name', 'ilike', 'Quelyos')])
   ```

2. Si vide, upgrader quelyos_api :
   ```bash
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -u quelyos_api --stop-after-init
   ```

---

## Erreurs Base de Données

### Erreur de Connexion PostgreSQL

**Symptôme** :
```
FATAL: password authentication failed for user "odoo"
```

**Solution** :

1. Vérifier que l'utilisateur PostgreSQL existe :
   ```bash
   sudo -u postgres psql -c "\du"
   ```

2. Si absent, créer :
   ```bash
   sudo -u postgres createuser -s odoo
   ```

3. Vérifier `/etc/odoo/odoo.conf` :
   ```ini
   db_user = odoo
   db_password = False
   ```

---

### Base de Données Corrompue

**Symptôme** : Erreurs SQL répétées, tables manquantes.

**Solution** :

1. **Backup de la DB** :
   ```bash
   sudo -u postgres pg_dump -Fc quelyos_production > backup_$(date +%Y%m%d).dump
   ```

2. **Drop et recréer** :
   ```bash
   sudo -u postgres dropdb quelyos_production
   sudo -u postgres createdb -O odoo quelyos_production
   ```

3. **Réinstaller** :
   ```bash
   ./scripts/install_quelyos_suite.sh quelyos_production
   ```

---

## Erreurs API REST

### 404 Not Found sur /api/*

**Symptôme** :
```bash
curl http://localhost:8069/api/products
# 404 Not Found
```

**Cause** : quelyos_api non installé ou routes non enregistrées.

**Solution** :

1. Vérifier installation quelyos_api :
   ```python
   env['ir.module.module'].search([('name', '=', 'quelyos_api')]).state
   ```

2. Vérifier les controllers :
   ```bash
   ls -la /opt/odoo/quelyos-suite/odoo-backend/addons/quelyos_api/controllers/
   ```

3. Redémarrer Odoo :
   ```bash
   sudo systemctl restart odoo
   ```

---

### 500 Internal Server Error

**Symptôme** : API retourne erreur 500.

**Solution** :

1. Vérifier les logs :
   ```bash
   tail -f /var/log/odoo/odoo-server.log | grep ERROR
   ```

2. Activer mode debug dans `/etc/odoo/odoo.conf` :
   ```ini
   log_level = debug
   ```

3. Tester avec curl verbose :
   ```bash
   curl -v http://localhost:8069/api/products?tenant_code=admin
   ```

---

### Tenant Code Invalid

**Symptôme** :
```json
{"error": "Tenant not found"}
```

**Solution** :

1. Vérifier que le tenant existe :
   ```python
   env['quelyos.tenant'].search([('code', '=', 'admin')])
   ```

2. Vérifier le code dans l'URL :
   ```bash
   curl http://localhost:8069/api/products?tenant_code=admin
   ```

---

## Erreurs Frontends

### BACKEND_URL Not Reachable

**Symptôme** :
```
Error: Network error - Could not connect to backend
```

**Solution** :

1. Vérifier que Odoo tourne :
   ```bash
   sudo systemctl status odoo
   curl http://localhost:8069/web/database/selector
   ```

2. Vérifier .env.local :
   ```bash
   cat vitrine-client/.env.local
   ```

3. Tester la connexion :
   ```bash
   curl http://localhost:8069/api/products?tenant_code=admin
   ```

---

### CORS Errors

**Symptôme** :
```
Access to fetch at 'http://localhost:8069/api/products' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solution** : Par défaut, Odoo 19 ne gère pas CORS. Utiliser un proxy inverse (nginx) ou installer module `web_cors`.

---

## Performance

### Odoo Lent (High CPU)

**Solution** :

1. Augmenter workers dans `/etc/odoo/odoo.conf` :
   ```ini
   workers = 4
   max_cron_threads = 2
   ```

2. Augmenter mémoire PostgreSQL dans `/etc/postgresql/*/main/postgresql.conf` :
   ```ini
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

3. Redémarrer :
   ```bash
   sudo systemctl restart postgresql
   sudo systemctl restart odoo
   ```

---

### Installation Lente (>10 min)

**Solution** :

1. Installer en mode direct (sans workers) :
   ```bash
   sudo systemctl stop odoo
   sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -i quelyos_core --stop-after-init
   ```

2. Vérifier connexion internet (modules OCA téléchargés) :
   ```bash
   ping github.com
   ```

---

## Logs et Debug

### Voir Logs Odoo en Temps Réel

```bash
tail -f /var/log/odoo/odoo-server.log
```

### Filtrer Erreurs uniquement

```bash
tail -f /var/log/odoo/odoo-server.log | grep -i error
```

### Voir Logs post_init_hook

```bash
grep "QUELYOS SUITE ORCHESTRATOR" /var/log/odoo/odoo-server.log
```

### Activer Mode Debug Odoo

1. **Via URL** : http://localhost:8069/web?debug=1

2. **Via Config** :
   ```ini
   log_level = debug
   ```

---

## Commandes Utiles

### Redémarrer Tous les Services

```bash
sudo systemctl restart postgresql
sudo systemctl restart odoo
```

### Vérifier État Services

```bash
sudo systemctl status postgresql
sudo systemctl status odoo
```

### Ouvrir Shell Odoo

```bash
sudo -u odoo /opt/odoo/odoo-19/odoo-bin shell -c /etc/odoo/odoo.conf -d quelyos_production
```

### Upgrade Module

```bash
sudo -u odoo /opt/odoo/odoo-19/odoo-bin -c /etc/odoo/odoo.conf -d quelyos_production -u <module_name> --stop-after-init
```

### Désinstaller Module

```bash
# Via shell Python
env['ir.module.module'].search([('name', '=', 'module_name')]).button_immediate_uninstall()
```

---

## Support Avancé

Si aucune solution ci-dessus ne fonctionne :

1. **Créer une issue GitHub** : https://github.com/salmenktata/QuelyosSuite/issues

2. **Inclure** :
   - Logs Odoo complets
   - Version Odoo (`/opt/odoo/odoo-19/odoo-bin --version`)
   - Version PostgreSQL (`psql --version`)
   - Système d'exploitation (`uname -a`)
   - Étapes de reproduction

3. **Logs utiles** :
   ```bash
   sudo journalctl -u odoo -n 200 --no-pager > odoo_logs.txt
   tail -n 200 /var/log/odoo/odoo-server.log > odoo_server_logs.txt
   ```

---

**Bonne résolution ! 🔧**
