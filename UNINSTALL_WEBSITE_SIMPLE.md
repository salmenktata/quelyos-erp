# 🗑️ Désinstaller le Module "Site Web" - Guide Simple

## 🎯 Problème

Vous ne pouvez pas désinstaller "Site Web" car **4 modules** en dépendent.

---

## ✅ Solution en 2 Étapes (5 minutes)

### Étape 1: Désinstaller les 4 Modules Dépendants

1. **Ouvrez Odoo**: http://localhost:8069
2. **Allez dans Apps** (menu principal)
3. **Désinstallez ces 4 modules** (cherchez-les un par un):

   | Module à Rechercher | Nom Complet | Action |
   |---------------------|-------------|--------|
   | `contact` ou `crm` | **Website CRM** / Formulaire de contact | Cliquez → **Désinstaller** |
   | `mail` | **Website Mail** / Site web Messagerie | Cliquez → **Désinstaller** |
   | `payment` | **Website Payment** / Site web Paiement | Cliquez → **Désinstaller** |
   | `sms` | **Website SMS** / Envoyer un SMS | Cliquez → **Désinstaller** |

4. **Confirmez** chaque désinstallation

### Étape 2: Désinstaller "Site Web"

1. **Dans Apps**, recherchez **"Site Web"** ou **"Website"**
2. **Cliquez** sur le module **Site Web**
3. **Cliquez** sur **Désinstaller**
4. **Confirmez**

---

## 🚀 Méthode Alternative: Script Automatique

Si vous préférez automatiser:

```bash
cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
chmod +x uninstall_website_sql.sh
./uninstall_website_sql.sh
```

Ce script va:
1. Montrer les modules installés
2. Les marquer pour désinstallation
3. Redémarrer Odoo
4. Les désinstaller automatiquement

---

## ⚠️ Si le Bouton "Désinstaller" est Grisé

### Solution: Forcer via SQL

```bash
# Marquer les modules pour désinstallation
docker exec quelyos-db psql -U odoo -d quelyos -c "
UPDATE ir_module_module
SET state = 'to remove'
WHERE name IN ('website_crm', 'website_mail', 'website_payment', 'website_sms', 'website')
  AND state = 'installed';
"

# Redémarrer Odoo
cd /Users/salmenktata/Projets/GitHub/QuelyosERP/backend
docker-compose restart odoo
```

Après le redémarrage, allez dans Apps → Les modules devraient être désinstallés.

---

## 📊 Vérifier que c'est Désinstallé

```bash
docker exec quelyos-db psql -U odoo -d quelyos -c "
SELECT name, state
FROM ir_module_module
WHERE name IN ('website', 'website_crm', 'website_mail', 'website_payment', 'website_sms')
ORDER BY name;
"
```

**Résultat attendu**: Tous les modules doivent avoir `state = 'uninstalled'`

---

## ❓ Quelle Méthode Choisir?

| Méthode | Avantages | Quand l'utiliser |
|---------|-----------|------------------|
| **Interface Web** (Recommandé) | ✅ Sûre, officielle, pas de risque | Toujours en premier |
| **Script SQL** | ⚡ Rapide, automatique | Si l'interface ne fonctionne pas |

---

## 🆘 Besoin d'Aide?

**Si rien ne fonctionne**, envoyez-moi cette info:

```bash
docker exec quelyos-db psql -U odoo -d quelyos -c "
SELECT name, state, shortdesc
FROM ir_module_module
WHERE name LIKE 'website%' AND state != 'uninstalled'
ORDER BY name;
"
```

Et je vous guiderai pas à pas! 🚀
