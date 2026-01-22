{
    'name': 'Quelyos Core',
    'version': '16.0.1.0.0',
    'category': 'Sales/Point of Sale',
    'summary': 'Core module for Quelyos ERP - Multi-tenant SaaS Retail Platform',
    'description': """
        Quelyos ERP Core Module
        =======================
        This module provides the foundation for the Quelyos multi-tenant
        retail platform including:
        - Multi-tenant provisioning
        - Base configurations
        - Shared utilities
    """,
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'sale',
        'stock',
        'point_of_sale',
        'website_sale',
        'account',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/quelyos_tenant_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
