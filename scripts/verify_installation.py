#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de vérification post-installation Quelyos Suite
Utilise XML-RPC pour vérifier que tous les modules attendus sont installés
et que la configuration de base est correcte.

Usage:
    python3 scripts/verify_installation.py --db quelyos_production
    python3 scripts/verify_installation.py --db quelyos_production --url http://localhost:8069
"""

import argparse
import sys
import xmlrpc.client


class Colors:
    """Codes ANSI pour couleurs terminal"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text):
    """Affiche un en-tête formaté"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")


def print_success(text):
    """Affiche un message de succès"""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")


def print_error(text):
    """Affiche un message d'erreur"""
    print(f"{Colors.RED}✗ {text}{Colors.END}")


def print_warning(text):
    """Affiche un avertissement"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")


def print_info(text):
    """Affiche une information"""
    print(f"  {text}")


def verify_modules(models, db, uid, password):
    """
    Vérifie que tous les modules attendus sont installés.

    Returns:
        tuple: (success: bool, installed_modules: list)
    """
    print_header("VÉRIFICATION DES MODULES")

    # Modules attendus (Odoo standard + OCA + Quelyos)
    expected_modules = {
        'Odoo Standard': [
            'base', 'web', 'mail', 'website', 'website_sale',
            'sale_management', 'product', 'account', 'crm', 'delivery',
            'payment', 'loyalty', 'stock', 'contacts', 'mass_mailing'
        ],
        'OCA Stock': [
            'stock_available_unreserved', 'stock_change_qty_reason',
            'stock_demand_estimate', 'stock_inventory', 'stock_location_lockdown'
        ],
        'OCA Marketing': [
            'mass_mailing_partner', 'mass_mailing_list_dynamic', 'mass_mailing_resend'
        ],
        'Quelyos Core': ['quelyos_core'],
        'Quelyos Infrastructure': ['quelyos_api'],
        'Quelyos Optionnels': ['quelyos_stock_advanced', 'quelyos_finance', 'quelyos_sms_tn']
    }

    all_success = True
    installed_modules = []

    for category, modules in expected_modules.items():
        print(f"\n{Colors.BOLD}{category}:{Colors.END}")

        for module_name in modules:
            try:
                # Rechercher le module
                module_ids = models.execute_kw(
                    db, uid, password,
                    'ir.module.module', 'search',
                    [[('name', '=', module_name)]]
                )

                if not module_ids:
                    if module_name in ['quelyos_stock_advanced', 'quelyos_finance', 'quelyos_sms_tn']:
                        print_warning(f"{module_name} - Non trouvé (optionnel)")
                    else:
                        print_error(f"{module_name} - NON TROUVÉ")
                        all_success = False
                    continue

                # Vérifier l'état
                module_data = models.execute_kw(
                    db, uid, password,
                    'ir.module.module', 'read',
                    [module_ids], {'fields': ['state', 'shortdesc']}
                )

                state = module_data[0]['state']
                if state == 'installed':
                    print_success(f"{module_name}")
                    installed_modules.append(module_name)
                elif state in ['to install', 'to upgrade']:
                    print_warning(f"{module_name} - En attente (state: {state})")
                    all_success = False
                else:
                    if module_name in ['quelyos_stock_advanced', 'quelyos_finance', 'quelyos_sms_tn']:
                        print_info(f"{module_name} - Non installé (optionnel)")
                    else:
                        print_error(f"{module_name} - Non installé (state: {state})")
                        all_success = False

            except Exception as e:
                print_error(f"{module_name} - Erreur : {str(e)}")
                all_success = False

    return all_success, installed_modules


def verify_tenant_admin(models, db, uid, password):
    """
    Vérifie que le tenant admin par défaut existe.

    Returns:
        bool: True si le tenant admin existe
    """
    print_header("VÉRIFICATION TENANT ADMIN")

    try:
        # Rechercher le tenant admin
        tenant_ids = models.execute_kw(
            db, uid, password,
            'quelyos.tenant', 'search',
            [[('code', '=', 'admin')]]
        )

        if not tenant_ids:
            print_error("Tenant admin (code=admin) NON TROUVÉ")
            return False

        # Récupérer les détails
        tenant_data = models.execute_kw(
            db, uid, password,
            'quelyos.tenant', 'read',
            [tenant_ids], {'fields': ['name', 'code', 'subscription_plan_id', 'active']}
        )

        tenant = tenant_data[0]
        print_success(f"Tenant admin trouvé : {tenant['name']}")
        print_info(f"  Code: {tenant['code']}")
        print_info(f"  Plan: {tenant['subscription_plan_id'][1] if tenant['subscription_plan_id'] else 'Aucun'}")
        print_info(f"  Actif: {tenant['active']}")

        return True

    except Exception as e:
        print_error(f"Erreur vérification tenant : {str(e)}")
        return False


def verify_subscription_plans(models, db, uid, password):
    """
    Vérifie que les plans d'abonnement existent.

    Returns:
        bool: True si au moins 1 plan existe
    """
    print_header("VÉRIFICATION PLANS D'ABONNEMENT")

    try:
        # Compter les plans
        plan_count = models.execute_kw(
            db, uid, password,
            'quelyos.subscription.plan', 'search_count',
            [[]]
        )

        if plan_count == 0:
            print_error("Aucun plan d'abonnement trouvé")
            return False

        # Récupérer les plans
        plan_ids = models.execute_kw(
            db, uid, password,
            'quelyos.subscription.plan', 'search',
            [[]]
        )

        plans_data = models.execute_kw(
            db, uid, password,
            'quelyos.subscription.plan', 'read',
            [plan_ids], {'fields': ['name', 'code', 'monthly_price']}
        )

        print_success(f"{plan_count} plans d'abonnement trouvés :")
        for plan in plans_data:
            print_info(f"  - {plan['name']} ({plan['code']}) : {plan['monthly_price']} TND/mois")

        return True

    except Exception as e:
        print_error(f"Erreur vérification plans : {str(e)}")
        return False


def verify_groups(models, db, uid, password):
    """
    Vérifie que les groupes de permissions Quelyos existent.

    Returns:
        bool: True si au moins 1 groupe Quelyos existe
    """
    print_header("VÉRIFICATION GROUPES DE PERMISSIONS")

    try:
        # Rechercher les groupes Quelyos
        group_ids = models.execute_kw(
            db, uid, password,
            'res.groups', 'search',
            [[('name', 'ilike', 'Quelyos')]]
        )

        if not group_ids:
            print_warning("Aucun groupe Quelyos trouvé")
            return False

        groups_data = models.execute_kw(
            db, uid, password,
            'res.groups', 'read',
            [group_ids], {'fields': ['name', 'category_id']}
        )

        print_success(f"{len(groups_data)} groupes Quelyos trouvés :")
        for group in groups_data[:10]:  # Limiter à 10 pour lisibilité
            print_info(f"  - {group['name']}")

        if len(groups_data) > 10:
            print_info(f"  ... et {len(groups_data) - 10} autres")

        return True

    except Exception as e:
        print_error(f"Erreur vérification groupes : {str(e)}")
        return False


def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(
        description='Vérification post-installation Quelyos Suite'
    )
    parser.add_argument('--db', required=True, help='Nom de la base de données')
    parser.add_argument('--url', default='http://localhost:8069', help='URL du serveur Odoo')
    parser.add_argument('--username', default='admin', help='Nom utilisateur')
    parser.add_argument('--password', default='admin', help='Mot de passe')

    args = parser.parse_args()

    print_header(f"VÉRIFICATION INSTALLATION QUELYOS SUITE")
    print_info(f"Base de données : {args.db}")
    print_info(f"URL serveur     : {args.url}")
    print_info(f"Utilisateur     : {args.username}")

    try:
        # Connexion à Odoo via XML-RPC
        common = xmlrpc.client.ServerProxy(f'{args.url}/xmlrpc/2/common')
        models = xmlrpc.client.ServerProxy(f'{args.url}/xmlrpc/2/object')

        # Authentification
        uid = common.authenticate(args.db, args.username, args.password, {})
        if not uid:
            print_error("Échec de l'authentification")
            sys.exit(1)

        print_success(f"Authentification réussie (UID: {uid})")

        # Exécuter les vérifications
        results = {}
        results['modules'], installed_modules = verify_modules(models, args.db, uid, args.password)

        # Vérifier tenant/plans uniquement si quelyos_api est installé
        if 'quelyos_api' in installed_modules:
            results['tenant'] = verify_tenant_admin(models, args.db, uid, args.password)
            results['plans'] = verify_subscription_plans(models, args.db, uid, args.password)
            results['groups'] = verify_groups(models, args.db, uid, args.password)
        else:
            print_warning("quelyos_api non installé - skip vérification tenant/plans/groupes")

        # Résumé final
        print_header("RÉSUMÉ")
        all_success = all(results.values())

        if all_success:
            print_success("TOUTES LES VÉRIFICATIONS SONT PASSÉES ✓")
            print_info("\nInstallation Quelyos Suite correcte !")
            sys.exit(0)
        else:
            print_error("CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ ✗")
            print_info("\nVoir les erreurs ci-dessus pour plus de détails.")
            sys.exit(1)

    except Exception as e:
        print_error(f"Erreur générale : {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
