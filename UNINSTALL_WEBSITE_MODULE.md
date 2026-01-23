# 🗑️ Guide: Désinstaller le Module "Site Web" d'Odoo

## 🎯 Problème

Le module "Site Web" (website) ne peut pas être désinstallé directement car d'autres modules en dépendent.

---

## 🔍 Étape 1: Identifier les Modules Dépendants

### Méthode A: Via l'interface Odoo (RECOMMANDÉ)

1. **Ouvrez Odoo**: `http://localhost:8069`
2. **Allez dans Apps**: Menu → Apps
3. **Recherchez "Site Web"**: Dans la barre de recherche
4. **Cliquez sur le module "Site Web"**
5. **Vérifiez l'onglet "Informations"**: Vous verrez la liste des modules qui en dépendent

### Méthode B: Via SQL (Alternative)

```bash
docker exec -it quelyos-db psql -U odoo -d quelyos -c "
SELECT
    m.name as module_name,
    m.shortdesc as description,
    m.state as state
FROM ir_module_module m
INNER JOIN ir_module_module_dependency d ON d.module_id = m.id
WHERE d.name = 'website'
  AND m.state IN ('installed', 'to upgrade', 'to install')
ORDER BY m.name;
"
```

---

## 📋 Étape 2: Désinstaller les Modules Dépendants

### Modules Courants qui Dépendent de "Site Web":

Voici les modules Odoo courants qui dépendent de `website` et doivent être désinstallés EN PREMIER:

- ✅ `website_sale` - eCommerce (Boutique en ligne)
- ✅ `website_blog` - Blog
- ✅ `website_forum` - Forum
- ✅ `website_event` - Événements
- ✅ `website_hr_recruitment` - Recrutement
- ✅ `website_slides` - eLearning
- ✅ `website_livechat` - Chat en direct
- ✅ `website_payment` - Paiements en ligne
- ✅ `website_crm` - CRM sur le site
- ✅ `website_partner` - Annuaire de partenaires

### Pour Désinstaller via l'Interface:

1. **Apps** → Recherchez chaque module ci-dessus
2. Cliquez sur le module → **Désinstaller**
3. Confirmez la désinstallation
4. Répétez pour tous les modules dépendants

### Pour Désinstaller via Commande (Plus Rapide):

```bash
# Désinstaller tous les modules website_* en une fois
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall website_sale,website_blog,website_forum,website_event,website_hr_recruitment,website_slides,website_livechat,website_payment,website_crm,website_partner \
  --stop-after-init

# Redémarrer Odoo
docker-compose -f /Users/salmenktata/Projets/GitHub/QuelyosERP/backend/docker-compose.yml restart odoo
```

---

## 🗑️ Étape 3: Désinstaller le Module "Site Web"

Une fois tous les modules dépendants désinstallés:

### Option A: Via l'Interface (RECOMMANDÉ)

1. **Apps** → Recherchez "Site Web"
2. Cliquez sur le module **Site Web**
3. Cliquez sur **Désinstaller**
4. Confirmez

### Option B: Via Commande

```bash
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall website \
  --stop-after-init

# Redémarrer Odoo
docker-compose -f /Users/salmenktata/Projets/GitHub/QuelyosERP/backend/docker-compose.yml restart odoo
```

---

## ⚠️ Problèmes Courants

### 1. Erreur: "Cannot uninstall module because other modules depend on it"

**Cause**: Il reste des modules dépendants installés

**Solution**:
```bash
# Lister TOUS les modules installés qui dépendent de website
docker exec -it quelyos-db psql -U odoo -d quelyos -c "
SELECT m.name, m.state
FROM ir_module_module m
INNER JOIN ir_module_module_dependency d ON d.module_id = m.id
WHERE d.name = 'website' AND m.state != 'uninstalled'
ORDER BY m.name;
"
```

Désinstallez chaque module listé.

### 2. Le bouton "Désinstaller" est grisé

**Cause**: Le module est marqué comme "application" ou requis par le système

**Solution**:
```bash
# Forcer la désinstallation via SQL (ATTENTION: À utiliser en dernier recours)
docker exec -it quelyos-db psql -U odoo -d quelyos -c "
UPDATE ir_module_module
SET state = 'uninstalled', demo = false
WHERE name = 'website';
"

# Puis redémarrer
docker-compose -f /Users/salmenktata/Projets/GitHub/QuelyosERP/backend/docker-compose.yml restart odoo
```

⚠️ **ATTENTION**: Cette méthode peut laisser des données orphelines dans la base.

### 3. Erreur après désinstallation

**Cause**: Données ou vues orphelines

**Solution**:
```bash
# Nettoyer les vues orphelines
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --update=all --stop-after-init

# Redémarrer
docker-compose -f /Users/salmenktata/Projets/GitHub/QuelyosERP/backend/docker-compose.yml restart odoo
```

---

## 🎯 Solution Rapide pour Votre Cas

### Si vous avez le module `quelyos_ecommerce` installé:

Le module `quelyos_ecommerce` pourrait dépendre de `website` ou `website_sale`.

**Vérifiez le manifest**:
```bash
grep -n "website" /Users/salmenktata/Projets/GitHub/QuelyosERP/backend/addons/quelyos_ecommerce/__manifest__.py
```

**Si `website` est dans les dépendances**, vous devez:
1. Modifier `__manifest__.py` pour retirer la dépendance `website`
2. OU désinstaller `quelyos_ecommerce` d'abord

### Commande Complète de Désinstallation:

```bash
# 1. Désinstaller quelyos_ecommerce (si installé)
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall quelyos_ecommerce \
  --stop-after-init

# 2. Désinstaller tous les modules website_*
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall website_sale,website_blog,website_forum,website_event \
  --stop-after-init

# 3. Désinstaller website
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --uninstall website \
  --stop-after-init

# 4. Redémarrer
cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
docker-compose restart odoo
```

---

## 📊 Vérification Post-Désinstallation

### Vérifier que le module est bien désinstallé:

```bash
docker exec -it quelyos-db psql -U odoo -d quelyos -c "
SELECT name, state, shortdesc
FROM ir_module_module
WHERE name = 'website';
"
```

**Résultat attendu**: `state = 'uninstalled'`

### Vérifier qu'il n'y a pas d'erreurs:

```bash
docker logs quelyos-odoo --tail 50 | grep -i "error\|exception"
```

---

## 🆘 Si Rien ne Fonctionne

### Solution Nucléaire: Réinitialiser la Base de Données

⚠️ **ATTENTION**: Ceci supprimera TOUTES vos données!

```bash
# Sauvegarder d'abord (si nécessaire)
docker exec quelyos-odoo odoo -d quelyos --db_host=db --db_user=odoo --db_password=odoo \
  --backup-db quelyos_backup.sql

# Arrêter Odoo
cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
docker-compose stop odoo

# Supprimer la base
docker exec quelyos-db psql -U odoo -c "DROP DATABASE quelyos;"
docker exec quelyos-db psql -U odoo -c "CREATE DATABASE quelyos OWNER odoo;"

# Redémarrer Odoo (réinitialisera avec base vierge)
docker-compose up -d odoo
```

---

## 📝 Checklist de Désinstallation

- [ ] Identifier les modules dépendants de `website`
- [ ] Désinstaller chaque module dépendant
- [ ] Vérifier qu'il ne reste aucune dépendance
- [ ] Désinstaller le module `website`
- [ ] Redémarrer Odoo
- [ ] Vérifier dans Apps que le module est bien désinstallé
- [ ] Vérifier les logs pour s'assurer qu'il n'y a pas d'erreurs

---

## 🎉 Succès!

Si tout fonctionne:
- ✅ Le module "Site Web" n'apparaît plus dans Apps
- ✅ Aucune erreur dans les logs
- ✅ Odoo démarre normalement

---

**Besoin d'aide?** Dites-moi quelle erreur spécifique vous rencontrez et je vous guiderai!
