{
    'name': 'Quelyos Finance',
    'version': '19.0.1.0.0',
    'category': 'Accounting/Finance',
    'summary': 'Module Finance pour Quelyos ERP - Gestion trésorerie, budgets, portefeuilles',
    'description': """
        Module Finance Quelyos
        ======================
        - Gestion des catégories (revenus/dépenses)
        - Gestion des portefeuilles de comptes
        - Gestion des flux de paiement
        - Budgets et suivi
        - Alertes de trésorerie
        - API REST pour dashboard frontend
    """,
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'account',
        'mail',
        'quelyos_api',
    ],
    'data': [
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
