# -*- coding: utf-8 -*-
{
    'name': 'Quelyos Core Orchestrator',
    'version': '19.0.2.0.0',
    'category': 'Quelyos/Foundation',
    'summary': 'Orchestrateur principal Quelyos Suite - Installation automatique complète',
    'description': """
        Quelyos Core Orchestrator
        =========================
        Module orchestrateur de la suite Quelyos qui automatise l'installation complète de l'ERP.

        **Installation en 1 clic** : Tous les modules requis sont installés automatiquement.

        Modules Odoo Standard installés :
        ---------------------------------
        - Gestion des ventes (sale_management, crm, delivery, payment, loyalty)
        - Gestion du stock (stock)
        - Gestion des contacts (contacts)
        - Site web et e-commerce (website, website_sale)
        - Comptabilité de base (account)
        - Produits et catalogue (product)
        - Email marketing (mass_mailing)

        Modules OCA installés :
        -----------------------
        - **Stock** (v19) : stock_available_unreserved, stock_change_qty_reason,
          stock_demand_estimate, stock_inventory, stock_location_lockdown
        - **Marketing** (v16) : mass_mailing_partner, mass_mailing_list_dynamic,
          mass_mailing_resend

        Modules Quelyos installés automatiquement :
        -------------------------------------------
        - **quelyos_api** : Infrastructure multi-tenant et API REST (TOUJOURS)
        - **quelyos_stock_advanced** : Inventaire avancé (par défaut OUI)
        - **quelyos_finance** : Gestion trésorerie et budgets (par défaut OUI)
        - **quelyos_sms_tn** : Notifications SMS Tunisie (par défaut OUI)

        Configuration :
        --------------
        Modifier les paramètres système dans Paramètres > Technique > Paramètres > Paramètres système :
        - quelyos.install_stock_advanced
        - quelyos.install_finance
        - quelyos.install_sms_tn

        Architecture :
        --------------
        Ce module utilise le mécanisme natif de dépendances Odoo + post_init_hook pour garantir
        un ordre d'installation correct et une configuration système optimale.
    """,
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'LGPL-3',
    'depends': [
        # Odoo Standard Core
        'base',
        'web',
        'mail',
        'website',
        'website_sale',
        # Odoo Standard Commerce
        'sale_management',
        'product',
        'account',
        'crm',
        'delivery',
        'payment',
        'loyalty',
        # Odoo Standard Inventory
        'stock',
        'contacts',
        # Odoo Standard Marketing
        'mass_mailing',
        # OCA Stock (v19) - Fonctionnalités avancées inventaire
        'stock_available_unreserved',
        'stock_change_qty_reason',
        'stock_demand_estimate',
        'stock_inventory',
        'stock_location_lockdown',
        # OCA Marketing (v16) - Fonctionnalités avancées emailing
        'mass_mailing_partner',
        'mass_mailing_list_dynamic',
        'mass_mailing_resend',
    ],
    'data': [
        'data/module_category_data.xml',
        'data/config_data.xml',
        'data/installer_config_data.xml',
    ],
    'post_init_hook': 'post_init_hook',
    'installable': True,
    'application': True,
    'auto_install': False,
    'sequence': 1,
}
