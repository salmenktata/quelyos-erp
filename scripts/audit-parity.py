#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'Audit de Parité Odoo ↔ Quelyos ERP

Usage: python scripts/audit-parity.py

Ce script génère automatiquement :
1. Liste des modèles Odoo utilisés dans l'API
2. Liste des endpoints API Quelyos
3. Rapport de parité (markdown)
4. Identification des gaps potentiels

Auteur: Claude
Date: 2026-01-24
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path


def scan_odoo_models():
    """
    Scanner backend/addons/quelyos_api/controllers/ pour trouver tous les modèles Odoo utilisés

    Cherche les patterns:
    - request.env['model.name']
    - env['model.name']

    Returns:
        set: Ensemble des modèles Odoo trouvés
    """
    models = set()
    controllers_path = Path('backend/addons/quelyos_api/controllers/')

    if not controllers_path.exists():
        print(f"⚠️  Chemin non trouvé : {controllers_path}")
        return models

    patterns = [
        r"request\.env\['([a-z\.]+)'\]",  # request.env['model.name']
        r"env\['([a-z\.]+)'\]",           # env['model.name'] (dans méthodes)
        r"self\.env\['([a-z\.]+)'\]",     # self.env['model.name']
    ]

    for py_file in controllers_path.rglob('*.py'):
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in patterns:
                    matches = re.findall(pattern, content)
                    models.update(matches)
        except Exception as e:
            print(f"⚠️  Erreur lecture {py_file}: {e}")

    return sorted(models)


def scan_api_endpoints():
    """
    Scanner controllers pour trouver tous les endpoints @http.route

    Returns:
        list: Liste des tuples (route, méthode HTTP, auth)
    """
    endpoints = []
    controllers_path = Path('backend/addons/quelyos_api/controllers/')

    if not controllers_path.exists():
        print(f"⚠️  Chemin non trouvé : {controllers_path}")
        return endpoints

    # Regex pour capturer route, méthode, auth
    route_pattern = r"@http\.route\('([^']+)'[^)]*methods=\['([^']+)'\][^)]*auth='([^']+)'"
    route_simple_pattern = r"@http\.route\('([^']+)'"

    for py_file in controllers_path.rglob('*.py'):
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()

                # Pattern complet avec méthode et auth
                matches = re.findall(route_pattern, content)
                for route, method, auth in matches:
                    endpoints.append({
                        'route': route,
                        'method': method,
                        'auth': auth,
                        'file': str(py_file.relative_to(Path.cwd()))
                    })

                # Pattern simple (si méthode/auth non trouvés)
                simple_matches = re.findall(route_simple_pattern, content)
                existing_routes = {ep['route'] for ep in endpoints}
                for route in simple_matches:
                    if route not in existing_routes:
                        endpoints.append({
                            'route': route,
                            'method': 'POST',  # Odoo par défaut
                            'auth': 'public',
                            'file': str(py_file.relative_to(Path.cwd()))
                        })
        except Exception as e:
            print(f"⚠️  Erreur lecture {py_file}: {e}")

    return sorted(endpoints, key=lambda x: x['route'])


def categorize_endpoints(endpoints):
    """
    Catégoriser les endpoints par domaine fonctionnel

    Returns:
        dict: Dictionnaire {catégorie: [endpoints]}
    """
    categories = {
        'auth': [],
        'products': [],
        'categories': [],
        'orders': [],
        'cart': [],
        'customers': [],
        'stock': [],
        'delivery': [],
        'payment': [],
        'coupons': [],
        'analytics': [],
        'other': []
    }

    for ep in endpoints:
        route = ep['route'].lower()
        categorized = False

        for category in categories.keys():
            if category in route:
                categories[category].append(ep)
                categorized = True
                break

        if not categorized:
            categories['other'].append(ep)

    return categories


def map_models_to_modules():
    """
    Mapper les modèles Odoo aux modules Odoo standards

    Returns:
        dict: {module_odoo: [models]}
    """
    mapping = {
        'sale_management': [
            'sale.order', 'sale.order.line', 'sale.order.template'
        ],
        'product': [
            'product.template', 'product.product', 'product.category',
            'product.pricelist', 'product.attribute', 'product.attribute.value'
        ],
        'stock': [
            'stock.quant', 'stock.move', 'stock.picking', 'stock.location',
            'stock.warehouse', 'stock.inventory'
        ],
        'contacts': [
            'res.partner', 'res.users', 'res.country', 'res.country.state'
        ],
        'delivery': [
            'delivery.carrier', 'delivery.price.rule'
        ],
        'payment': [
            'payment.provider', 'payment.transaction', 'payment.token'
        ],
        'loyalty': [
            'loyalty.program', 'loyalty.card', 'loyalty.reward', 'loyalty.rule'
        ],
        'base': [
            'ir.model', 'ir.model.access', 'ir.config_parameter', 'ir.attachment'
        ]
    }

    return mapping


def generate_parity_report(models, endpoints):
    """
    Générer rapport markdown de parité

    Args:
        models (set): Modèles Odoo utilisés
        endpoints (list): Endpoints API
    """
    report_lines = []

    # Header
    report_lines.append(f"# Rapport d'Audit de Parité Odoo ↔ Quelyos ERP")
    report_lines.append(f"\n**Généré le** : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report_lines.append("---\n")

    # Résumé
    report_lines.append("## 📊 Résumé")
    report_lines.append(f"\n- **Modèles Odoo utilisés** : {len(models)}")
    report_lines.append(f"- **Endpoints API** : {len(endpoints)}")

    categories = categorize_endpoints(endpoints)
    report_lines.append(f"\n### Endpoints par Catégorie\n")
    for category, eps in categories.items():
        if eps:
            report_lines.append(f"- **{category.capitalize()}** : {len(eps)} endpoints")

    report_lines.append("\n---\n")

    # Modèles Odoo
    report_lines.append("## 🗄️  Modèles Odoo Utilisés")
    report_lines.append(f"\n**Total** : {len(models)} modèles\n")

    model_mapping = map_models_to_modules()
    used_models_by_module = {}

    for model in models:
        found = False
        for module, module_models in model_mapping.items():
            if model in module_models:
                if module not in used_models_by_module:
                    used_models_by_module[module] = []
                used_models_by_module[module].append(model)
                found = True
                break
        if not found:
            if 'other' not in used_models_by_module:
                used_models_by_module['other'] = []
            used_models_by_module['other'].append(model)

    for module, module_models in sorted(used_models_by_module.items()):
        report_lines.append(f"\n### Module `{module}`\n")
        for model in sorted(module_models):
            report_lines.append(f"- `{model}`")

    report_lines.append("\n---\n")

    # Endpoints API
    report_lines.append("## 🔌 Endpoints API Quelyos")
    report_lines.append(f"\n**Total** : {len(endpoints)} endpoints\n")

    for category, eps in sorted(categories.items()):
        if eps:
            report_lines.append(f"\n### {category.capitalize()} ({len(eps)} endpoints)\n")
            report_lines.append("| Route | Méthode | Auth | Fichier |")
            report_lines.append("|-------|---------|------|---------|")
            for ep in eps:
                report_lines.append(f"| `{ep['route']}` | {ep['method']} | {ep['auth']} | `{ep['file']}` |")

    report_lines.append("\n---\n")

    # Analyse de Parité
    report_lines.append("## 🎯 Analyse de Parité\n")
    report_lines.append("### Couverture Fonctionnelle par Module Odoo\n")

    # Modules Odoo installés (depuis __manifest__.py)
    installed_modules = [
        'sale_management', 'stock', 'loyalty', 'contacts', 'delivery',
        'payment', 'product', 'base', 'website', 'website_sale'
    ]

    for module in installed_modules:
        if module in used_models_by_module:
            nb_models = len(used_models_by_module[module])
            total_models = len(model_mapping.get(module, []))
            coverage = (nb_models / total_models * 100) if total_models > 0 else 0
            status = "✅" if coverage > 50 else ("🟡" if coverage > 20 else "🔴")

            report_lines.append(f"- **{module}** : {status} {nb_models}/{total_models} modèles utilisés ({coverage:.0f}%)")
        else:
            report_lines.append(f"- **{module}** : 🔴 Aucun modèle utilisé (module installé mais non exploité)")

    report_lines.append("\n---\n")

    # Gaps Potentiels
    report_lines.append("## ⚠️  Gaps Potentiels Identifiés\n")
    report_lines.append("### Modules Odoo installés mais peu/pas exploités\n")

    underutilized = []
    for module in installed_modules:
        if module not in used_models_by_module or len(used_models_by_module[module]) == 0:
            underutilized.append(module)

    if underutilized:
        for module in underutilized:
            report_lines.append(f"- 🔴 **{module}** : Module installé mais aucun modèle exploité via API")
    else:
        report_lines.append("✅ Tous les modules installés sont exploités.\n")

    report_lines.append("\n### Fonctionnalités Odoo standard potentiellement manquantes\n")
    report_lines.append("""
⚠️  **Note** : Cette section nécessite un audit manuel approfondi pour chaque module.

**Prochaines étapes recommandées** :

1. **Consulter documentation Odoo** pour chaque module installé
2. **Lister toutes les fonctionnalités** disponibles dans Odoo natif
3. **Créer tableaux de correspondance** dans README.md (format standardisé)
4. **Identifier gaps critiques** (P0 : Bloquant, P1 : Important, P2 : Nice-to-have)
5. **Prioriser implémentation** des gaps P0 et P1

**Modules prioritaires à auditer** :
- `sale_management` (commandes, devis, workflows)
- `stock` (gestion stock, inventaire, mouvements)
- `product` (variantes, images, attributs)
- `contacts` (clients, adresses, historique)
""")

    report_lines.append("\n---\n")

    # Recommandations
    report_lines.append("## 💡 Recommandations\n")
    report_lines.append("### Actions Immédiates\n")
    report_lines.append("""
1. **Créer tableaux de correspondance** dans README.md pour TOUS les modules :
   - Format : `| Fonctionnalité Odoo | Backend API | Frontend | Backoffice | Statut | Priorité | Notes |`
   - Statuts : ✅ Implémenté, 🟡 Partiel, 🔴 Manquant (P0/P1/P2)

2. **Implémenter tests de parité** :
   - Backend (pytest) : 60+ tests validant API === Odoo DB
   - E2E (Playwright) : 15+ tests validant Frontend === Backend === Odoo

3. **Prioriser gaps P0 (bloquants)** :
   - Upload images multiples produits
   - Édition variantes produits
   - Créer factures depuis commandes
   - Marquer commandes comme payées

4. **Documenter approche "surcouche"** :
   - Aucune modification du modèle Odoo
   - Exploiter modèles existants via API JSON-RPC
   - Fonctionnalités additionnelles frontend-only

5. **Automatiser validation** :
   - Intégrer ce script dans CI/CD (.github/workflows/ci.yml)
   - Générer rapport à chaque PR
   - Bloquer merge si gaps P0 détectés
""")

    report_lines.append("\n### Outils et Ressources\n")
    report_lines.append("""
- **Documentation Odoo officielle** : https://www.odoo.com/documentation/19.0/
- **API Reference Odoo** : https://www.odoo.com/documentation/19.0/developer/reference/backend/orm.html
- **Tests Odoo** : pytest-odoo, requests pour tests API
- **Tests E2E** : Playwright déjà configuré dans frontend/
- **CI/CD** : GitHub Actions (.github/workflows/ci.yml)
""")

    report_lines.append("\n---\n")
    report_lines.append(f"\n*Rapport généré par `scripts/audit-parity.py`*")

    # Écrire le rapport
    report_content = '\n'.join(report_lines)
    report_path = Path('PARITY_REPORT.md')

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)

    print(f"\n✅ Rapport généré : {report_path}")
    print(f"   - {len(models)} modèles Odoo utilisés")
    print(f"   - {len(endpoints)} endpoints API")
    print(f"\n📖 Consultez {report_path} pour le rapport complet.\n")


def main():
    """
    Point d'entrée principal du script
    """
    print("\n" + "="*60)
    print("🔍 Audit de Parité Odoo ↔ Quelyos ERP")
    print("="*60 + "\n")

    # Scanner modèles Odoo
    print("📊 Scan des modèles Odoo utilisés...")
    models = scan_odoo_models()
    print(f"   ✅ {len(models)} modèles trouvés")

    # Scanner endpoints API
    print("\n🔌 Scan des endpoints API Quelyos...")
    endpoints = scan_api_endpoints()
    print(f"   ✅ {len(endpoints)} endpoints trouvés")

    # Générer rapport
    print("\n📝 Génération du rapport de parité...")
    generate_parity_report(models, endpoints)

    print("="*60)
    print("✅ Audit terminé avec succès !")
    print("="*60 + "\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Audit interrompu par l'utilisateur.")
    except Exception as e:
        print(f"\n\n❌ Erreur lors de l'audit : {e}")
        raise
