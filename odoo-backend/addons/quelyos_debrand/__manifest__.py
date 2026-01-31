{
    'name': 'Quelyos Debrand',
    'version': '19.0.1.0.2',
    'category': 'Quelyos/Branding',
    'summary': 'Anonymisation complète Odoo - Branding Quelyos',
    'description': '''
        Module de debranding pour remplacer toutes les références Odoo par Quelyos.
        - Suppression des mentions "Odoo" dans l'interface
        - Modification couleur navbar uniquement (pas de modification thème global)
        - Logo et favicon personnalisés
        - OdooBot → QuelyosBot
    ''',
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'LGPL-3',
    'depends': ['base', 'web', 'mail'],
    'assets': {
        'web._assets_primary_variables': [
            ('prepend', 'quelyos_debrand/static/src/scss/primary_variables.scss'),
        ],
        'web.assets_backend': [
            'quelyos_debrand/static/src/scss/debranding.scss',
            'quelyos_debrand/static/src/js/debranding.js',
            'quelyos_debrand/static/src/xml/webclient_templates.xml',
        ],
        'web.assets_frontend': [
            'quelyos_debrand/static/src/scss/debranding.scss',
        ],
    },
    'data': [
        'security/ir.model.access.csv',
        'data/debrand_data.xml',
        'views/res_config_settings_views.xml',
        'views/webclient_templates.xml',
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}
