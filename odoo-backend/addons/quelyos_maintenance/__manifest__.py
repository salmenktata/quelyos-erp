# -*- coding: utf-8 -*-
{
    'name': 'Quelyos Maintenance (GMAO)',
    'version': '19.0.1.0.0',
    'category': 'Quelyos/Maintenance',
    'summary': 'GMAO Complète - Gestion Maintenance Assistée par Ordinateur',
    'description': """
Quelyos Maintenance (GMAO)
==========================

Module GMAO complet pour Quelyos Copilote Ops.
Gestion maintenance préventive et corrective des équipements.

Fonctionnalités :
-----------------
- **Équipements** : Gestion parc machines/matériel
- **Demandes Intervention** : Ticketing maintenance (corrective)
- **Maintenance Préventive** : Planification calendrier automatique
- **Équipes Techniques** : Affectation techniciens
- **MTBF/MTTR** : KPI performance équipements
- **Historique** : Traçabilité interventions
- **API REST** : Endpoints pour Copilote Ops frontend

API REST :
----------
- /api/maintenance/equipment/* - CRUD équipements
- /api/maintenance/requests/* - Demandes intervention
- /api/maintenance/schedule/* - Planning préventif
- /api/maintenance/teams/* - Équipes techniques
- /api/maintenance/reports/* - Rapports MTBF/MTTR

Architecture :
--------------
Hérite du module `maintenance` Odoo Community + extensions Quelyos.
Compatible Copilote Ops (port 3012).
    """,
    'author': 'Quelyos Development Team',
    'website': 'https://github.com/salmenktata/quelyosSuite',
    'license': 'LGPL-3',
    'depends': [
        'maintenance',  # Module Odoo Community
        'quelyos_api',
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/maintenance_sequence.xml',
        'views/maintenance_equipment_views.xml',
        'views/maintenance_request_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}
