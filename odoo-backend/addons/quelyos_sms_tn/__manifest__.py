# -*- coding: utf-8 -*-
{
    'name': 'Quelyos SMS Tunisie',
    'version': '19.0.1.0.1',
    'category': 'Marketing',
    'summary': 'Envoi de SMS via API Tunisie SMS pour notifications e-commerce',
    'description': """
        Module SMS pour Quelyos Suite
        ==============================

        Fonctionnalités :
        - Envoi de SMS via API Tunisie SMS
        - Notifications automatiques : paniers abandonnés, confirmations commandes, livraisons
        - Gestion quotas SMS par abonnement
        - Historique et logs d'envois
        - File d'attente avec retry automatique
        - Fallback email en cas d'échec critique

        Configuration requise :
        - API Key Tunisie SMS
        - Nom expéditeur (max 11 caractères)
    """,
    'author': 'Quelyos',
    'website': 'https://quelyos.com',
    'license': 'AGPL-3',
    'depends': [
        'base',
        'mail',
        'sale_management',
        'quelyos_api',  # Pour subscription_quota_mixin et tenant
    ],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/sms_provider_data.xml',
        'data/ir_cron_sms_queue.xml',
        'views/sms_log_views.xml',
        'views/sms_config_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
