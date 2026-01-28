# -*- coding: utf-8 -*-
"""
Méthodes de paiement pour le Point de Vente.

Définit les différentes façons de payer en caisse :
- Espèces
- Carte bancaire
- Paiements digitaux (Flouci, Konnect)
- Chèques
- Avoirs/Bons
"""

from odoo import models, fields, api


class POSPaymentMethod(models.Model):
    _name = 'quelyos.pos.payment.method'
    _description = 'Méthode de Paiement POS'
    _order = 'sequence, id'

    name = fields.Char(
        string='Nom',
        required=True,
        translate=True,
        help="Nom affiché de la méthode de paiement"
    )
    code = fields.Char(
        string='Code',
        required=True,
        index=True,
        help="Code technique unique (cash, card, flouci, konnect, check)"
    )
    type = fields.Selection(
        selection=[
            ('cash', 'Espèces'),
            ('card', 'Carte bancaire'),
            ('digital', 'Paiement digital'),
            ('check', 'Chèque'),
            ('voucher', 'Avoir / Bon'),
            ('other', 'Autre'),
        ],
        string='Type',
        required=True,
        default='cash',
        help="Type de méthode de paiement"
    )
    sequence = fields.Integer(
        string='Séquence',
        default=10,
        help="Ordre d'affichage"
    )

    # Options caisse
    is_cash_count = fields.Boolean(
        string='Inclure dans comptage caisse',
        default=False,
        help="Si coché, ce mode est inclus dans le comptage de caisse"
    )
    open_cash_drawer = fields.Boolean(
        string='Ouvrir tiroir-caisse',
        default=False,
        help="Si coché, ouvre le tiroir-caisse automatiquement"
    )
    allow_split = fields.Boolean(
        string='Autoriser paiement partiel',
        default=True,
        help="Autoriser ce mode dans un paiement fractionné"
    )

    # Intégration provider externe
    payment_provider_id = fields.Many2one(
        'payment.provider',
        string='Provider de paiement',
        help="Provider Odoo pour paiements en ligne (Flouci, Konnect)"
    )

    # Comptabilité
    journal_id = fields.Many2one(
        'account.journal',
        string='Journal comptable',
        domain=[('type', 'in', ['cash', 'bank'])],
        help="Journal pour l'enregistrement comptable"
    )

    # Company/Tenant
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company
    )

    active = fields.Boolean(
        string='Actif',
        default=True
    )

    # Icône pour le frontend
    icon = fields.Char(
        string='Icône',
        default='banknotes',
        help="Nom de l'icône lucide-react (banknotes, credit-card, smartphone, etc.)"
    )

    _sql_constraints = [
        ('code_company_unique', 'UNIQUE(code, company_id)',
         'Le code de la méthode de paiement doit être unique par société'),
    ]

    @api.onchange('type')
    def _onchange_type(self):
        """Met à jour les options par défaut selon le type"""
        if self.type == 'cash':
            self.is_cash_count = True
            self.open_cash_drawer = True
            self.icon = 'banknotes'
        elif self.type == 'card':
            self.is_cash_count = False
            self.open_cash_drawer = False
            self.icon = 'credit-card'
        elif self.type == 'digital':
            self.is_cash_count = False
            self.open_cash_drawer = False
            self.icon = 'smartphone'
        elif self.type == 'check':
            self.is_cash_count = False
            self.open_cash_drawer = True
            self.icon = 'file-text'
        elif self.type == 'voucher':
            self.is_cash_count = False
            self.open_cash_drawer = False
            self.icon = 'ticket'

    def to_frontend_dict(self):
        """Convertit pour le frontend (anonymisation Odoo)"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'type': self.type,
            'icon': self.icon or 'banknotes',
            'allowSplit': self.allow_split,
            'openDrawer': self.open_cash_drawer,
            'requiresOnline': self.type == 'digital',
        }
