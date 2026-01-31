# -*- coding: utf-8 -*-
{
    'name': 'Quelyos Suite - Installation Automatique',
    'version': '19.0.1.0.0',
    'category': 'Quelyos/Installation',
    'summary': 'Module orchestrateur pour installation complète Quelyos Suite',
    'description': """
Quelyos Suite - Installation Automatique
==========================================

Ce module installe automatiquement TOUS les prérequis et modules nécessaires
pour le bon fonctionnement de Quelyos Suite sur une instance Odoo 19 vierge.

Modules installés automatiquement :
------------------------------------

**Modules Odoo Core (Community)** :
- base, mail, web
- sale_management (Ventes)
- stock (Inventaire)
- account (Comptabilité)
- crm (CRM)
- website, website_sale (E-commerce)
- delivery, payment (Livraison, Paiements)
- product (Produits)
- contacts (Contacts)

**Modules OCA (Odoo Community Association)** :
- stock_inventory (Inventaire avancé)
- stock_warehouse_calendar (Calendrier entrepôt)

**Modules Quelyos** :
- quelyos_api (API REST + Backend complet)

**Dépendances Python** (auto-installées) :
- qrcode (Génération QR codes)
- Pillow (Manipulation images)
- faker (Données de test)

Installation
------------
1. Copier ce module dans addons/
2. Redémarrer Odoo
3. Apps > Update Apps List
4. Rechercher "Quelyos Suite"
5. Cliquer "Install"

Toutes les dépendances seront installées automatiquement !

""",
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'LGPL-3',
    
    # Auto-installation = True pour installation automatique
    'auto_install': False,
    'application': True,  # Module application (apparaît dans Apps)
    'installable': True,
    
    # Dépendances Python externes
    'external_dependencies': {
        'python': [
            'qrcode',
            'Pillow', 
            'faker',
        ],
    },
    
    # TOUTES les dépendances Odoo nécessaires
    'depends': [
        # === ODOO CORE MODULES (Community) ===
        'base',
        'mail',
        'web',
        'web_tour',
        
        # Ventes & CRM
        'sale_management',
        'crm',
        
        # Inventaire & Stock
        'stock',
        'stock_account',
        
        # Comptabilité
        'account',
        'account_accountant',  # Si disponible en Community
        
        # E-commerce
        'website',
        'website_sale',
        'website_sale_delivery',
        
        # Produits & Catalogue
        'product',
        
        # Livraison & Paiements
        'delivery',
        'payment',
        
        # Contacts
        'contacts',
        
        # === MODULES OCA (si installés) ===
        # Stock
        'stock_inventory',           # OCA stock-logistics-warehouse
        'stock_warehouse_calendar',  # OCA stock-logistics-warehouse
        
        # === MODULE PRINCIPAL QUELYOS ===
        'quelyos_api',  # Contient tout le backend Quelyos
    ],
    
    # Données d'installation
    'data': [
        'data/installer_data.xml',
    ],
    
    # Hooks d'installation
    'pre_init_hook': 'pre_init_hook',
    'post_init_hook': 'post_init_hook',
    'uninstall_hook': 'uninstall_hook',
}
