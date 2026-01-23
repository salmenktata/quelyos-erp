# 🎨 Guide des Variantes de Produits - Odoo 18.0

## 📋 Table des Matières

1. [Activation](#activation)
2. [Création d'Attributs](#création-dattributs)
3. [Application aux Produits](#application-aux-produits)
4. [Gestion Avancée](#gestion-avancée)
5. [Exemples](#exemples)

---

## ✅ Activation

### Méthode Interface

1. **Inventaire → Configuration → Paramètres**
2. Section **"Produits"**
3. Cocher **"Variantes"**
4. Cliquer sur **"Enregistrer"**

### Vérification

Les variantes sont activées quand vous voyez l'onglet **"Attributs & Variantes"** dans la fiche produit.

---

## 🏷️ Création d'Attributs

### Accès

```
Inventaire → Configuration → Attributs
```

### Champs Importants

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Nom** | Nom de l'attribut | Couleur, Taille, Matière |
| **Type d'affichage** | Comment afficher sur le site | Radio, Sélection, Couleur |
| **Type de création** | Quand créer la variante | Instantanément / Sur demande |
| **Valeurs** | Liste des valeurs possibles | Rouge, Bleu, Vert |

### Types de Création

- **Instantanément:** Crée toutes les variantes automatiquement (recommandé)
- **Dynamiquement:** Crée les variantes uniquement quand commandées
- **Jamais (option de prix):** Ne crée pas de variante, juste un supplément de prix

### Exemple: Créer l'attribut "Couleur"

1. Cliquer sur **"Nouveau"**
2. **Nom:** Couleur
3. **Type de création:** Créer instantanément
4. **Type d'affichage:** Couleur (si sur site web)
5. Ajouter des valeurs:
   - Cliquer **"Ajouter une ligne"**
   - Nom: Rouge | Code HTML: #FF0000
   - Nom: Bleu | Code HTML: #0000FF
   - Nom: Vert | Code HTML: #00FF00
6. **Enregistrer**

---

## 🛍️ Application aux Produits

### Étapes

1. **Inventaire → Produits → Produits**
2. Ouvrir ou créer un produit
3. Onglet **"Attributs & Variantes"**
4. **Ajouter une ligne**
5. Sélectionner **Attribut** (ex: Couleur)
6. Cocher les **Valeurs** voulues (ex: Rouge, Bleu)
7. **Enregistrer**

### Résultat

Les variantes sont créées automatiquement avec le format:
```
Nom du Produit (Attribut1: Valeur1, Attribut2: Valeur2)
```

Exemple:
```
T-Shirt Premium (Couleur: Rouge, Taille: M)
T-Shirt Premium (Couleur: Rouge, Taille: L)
T-Shirt Premium (Couleur: Bleu, Taille: M)
...
```

---

## ⚙️ Gestion Avancée

### Prix par Variante

**Méthode 1: Prix de base + Supplément**
- Le produit a un prix de base: 29,99€
- L'attribut "Taille XL" ajoute: +5,00€
- Résultat: T-Shirt XL = 34,99€

**Méthode 2: Prix spécifique par variante**
1. Onglet **"Attributs & Variantes"**
2. Bouton **"Configurer"**
3. Voir la liste des variantes
4. Modifier le prix de chaque variante individuellement

### Stock par Variante

Chaque variante a son propre stock:

1. **Inventaire → Produits → Variantes de produit**
2. Filtrer par produit
3. Modifier la quantité de chaque variante

Ou utiliser:
```
Inventaire → Opérations → Ajustements d'inventaire
```

### Images par Variante

1. Ouvrir une variante spécifique
2. Onglet **"Images"**
3. Ajouter l'image de la variante
4. Sur le site web, l'image change automatiquement selon la sélection

### Désactiver une Variante

1. Liste des variantes: **"Configurer"**
2. Cocher la case **"Archiver"** sur les variantes non désirées
3. Elles n'apparaîtront plus sur le site/ventes

---

## 📦 Exemples

### Exemple 1: T-Shirt Simple

**Attributs:**
- Couleur: Noir, Blanc, Rouge
- Taille: S, M, L, XL

**Nombre de variantes:** 3 × 4 = **12 variantes**

**Configuration:**
```
Produit: T-Shirt Basic
Prix de base: 19,99€

Attribut Couleur:
  - Noir (pas de supplément)
  - Blanc (pas de supplément)
  - Rouge (+2€)

Attribut Taille:
  - S (pas de supplément)
  - M (pas de supplément)
  - L (pas de supplément)
  - XL (+3€)
```

**Résultat prix:**
- T-Shirt Noir M: 19,99€
- T-Shirt Rouge M: 21,99€
- T-Shirt Noir XL: 22,99€
- T-Shirt Rouge XL: 24,99€

### Exemple 2: Ordinateur Configurable

**Attributs:**
- Processeur: i5, i7, i9
- RAM: 8GB, 16GB, 32GB
- Stockage: 256GB SSD, 512GB SSD, 1TB SSD

**Nombre de variantes:** 3 × 3 × 3 = **27 variantes**

**Type de création:** Dynamiquement
(Pour éviter de créer 27 variantes si certaines combinaisons ne se vendent jamais)

### Exemple 3: Chaussures

**Attributs:**
- Couleur: Noir, Marron, Blanc
- Pointure: 39, 40, 41, 42, 43, 44, 45

**Nombre de variantes:** 3 × 7 = **21 variantes**

**Stock par variante:** Important car chaque pointure a un stock différent

---

## 🔧 Commandes Utiles

### Lister tous les attributs

```python
# Via shell Odoo
attributes = env['product.attribute'].search([])
for attr in attributes:
    print(f"{attr.name}: {len(attr.value_ids)} valeurs")
```

### Créer un attribut via code

```python
# Couleur
color_attr = env['product.attribute'].create({
    'name': 'Couleur',
    'create_variant': 'always',
})

# Valeurs
env['product.attribute.value'].create([
    {'name': 'Rouge', 'attribute_id': color_attr.id},
    {'name': 'Bleu', 'attribute_id': color_attr.id},
    {'name': 'Vert', 'attribute_id': color_attr.id},
])
```

### Compter les variantes d'un produit

```python
product = env['product.template'].browse(PRODUCT_ID)
nb_variants = len(product.product_variant_ids)
print(f"Nombre de variantes: {nb_variants}")
```

---

## 🚨 Points d'Attention

### ⚠️ Trop de Variantes

**Problème:** Un produit avec 5 attributs de 5 valeurs chacun = 3,125 variantes!

**Solution:**
- Limiter le nombre d'attributs
- Utiliser "Type de création: Dynamiquement" pour les combinaisons rares
- Désactiver les combinaisons impossibles

### ⚠️ Stock et Variantes

Chaque variante a son propre stock. Si vous avez 10 T-Shirts mais 0 en Bleu/XL, le client ne pourra pas commander cette variante.

### ⚠️ Prix et Variantes

Si vous changez le prix de base du produit, cela affecte toutes les variantes (sauf celles avec prix spécifique).

---

## 📚 Modules Complémentaires

### Module "Product Variant Configurator"

Interface améliorée pour configurer les variantes sur le site web.

### Module "Product Matrix"

Interface en grille (matrice) pour saisir rapidement les stocks et prix de toutes les variantes.

### Module "Product Pack"

Créer des packs de plusieurs variantes.

---

## 🔗 Ressources

- **Documentation Odoo:** https://www.odoo.com/documentation/18.0/applications/sales/sales/products_prices/products/variants.html
- **Forum Odoo:** https://www.odoo.com/forum/help-1
- **Apps Odoo:** https://apps.odoo.com/apps/modules/browse?search=variant

---

**Dernière mise à jour:** 2026-01-22
**Version Odoo:** 18.0
**Projet:** Quelyos ERP
