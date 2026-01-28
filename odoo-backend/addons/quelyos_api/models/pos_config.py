# -*- coding: utf-8 -*-
"""
Configuration des terminaux Point de Vente.

Chaque terminal POS a sa propre configuration :
- Entrepôt de prélèvement stock
- Liste de prix
- Méthodes de paiement autorisées
- Utilisateurs autorisés
- Options d'interface (kiosk, remises, etc.)
"""

from odoo import models, fields, api
from odoo.exceptions import ValidationError


class POSConfig(models.Model):
    _name = 'quelyos.pos.config'
    _description = 'Configuration Terminal POS'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Nom du terminal',
        required=True,
        tracking=True,
        help="Nom affiché du terminal (ex: Caisse 1, Kiosk Entrée)"
    )
    code = fields.Char(
        string='Code',
        required=True,
        index=True,
        tracking=True,
        help="Code technique unique (ex: POS-01, KIOSK-01)"
    )
    sequence = fields.Integer(
        string='Séquence',
        default=10,
        help="Ordre d'affichage dans la liste"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # LIENS TENANT / COMPANY
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        help="Tenant propriétaire de ce terminal"
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        related='tenant_id.company_id',
        store=True,
        readonly=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONFIGURATION STOCK / PRIX
    # ═══════════════════════════════════════════════════════════════════════════

    warehouse_id = fields.Many2one(
        'stock.warehouse',
        string='Entrepôt',
        required=True,
        domain="[('company_id', '=', company_id)]",
        help="Entrepôt pour le prélèvement stock des ventes"
    )
    picking_type_id = fields.Many2one(
        'stock.picking.type',
        string='Type d\'opération',
        compute='_compute_picking_type',
        store=True,
        help="Type d'opération de sortie pour les ventes POS"
    )
    pricelist_id = fields.Many2one(
        'product.pricelist',
        string='Liste de prix',
        required=True,
        domain="[('company_id', 'in', [company_id, False])]",
        help="Liste de prix utilisée pour ce terminal"
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Devise',
        related='pricelist_id.currency_id',
        readonly=True,
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES DE PAIEMENT
    # ═══════════════════════════════════════════════════════════════════════════

    payment_method_ids = fields.Many2many(
        'quelyos.pos.payment.method',
        'pos_config_payment_method_rel',
        'config_id',
        'payment_method_id',
        string='Méthodes de paiement',
        domain="[('company_id', '=', company_id), ('active', '=', True)]",
        help="Méthodes de paiement autorisées sur ce terminal"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # UTILISATEURS
    # ═══════════════════════════════════════════════════════════════════════════

    user_ids = fields.Many2many(
        'res.users',
        'pos_config_user_rel',
        'config_id',
        'user_id',
        string='Caissiers autorisés',
        domain="[('company_id', '=', company_id)]",
        help="Utilisateurs autorisés à utiliser ce terminal"
    )
    restrict_users = fields.Boolean(
        string='Restreindre aux caissiers',
        default=False,
        help="Si coché, seuls les caissiers listés peuvent utiliser ce terminal"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # OPTIONS INTERFACE
    # ═══════════════════════════════════════════════════════════════════════════

    is_kiosk = fields.Boolean(
        string='Mode Kiosque',
        default=False,
        tracking=True,
        help="Terminal en libre-service pour les clients"
    )
    allow_manual_discount = fields.Boolean(
        string='Remise manuelle',
        default=True,
        help="Autoriser les remises manuelles sur les lignes"
    )
    max_discount_percent = fields.Float(
        string='Remise max (%)',
        default=20.0,
        help="Pourcentage maximum de remise autorisé"
    )
    require_customer = fields.Boolean(
        string='Client obligatoire',
        default=False,
        help="Exiger la sélection d'un client pour chaque vente"
    )
    allow_order_notes = fields.Boolean(
        string='Notes sur commande',
        default=True,
        help="Autoriser les notes sur la commande et les lignes"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # PÉRIPHÉRIQUES
    # ═══════════════════════════════════════════════════════════════════════════

    receipt_printer = fields.Selection(
        selection=[
            ('none', 'Aucune'),
            ('browser', 'Impression navigateur'),
            ('epson', 'Epson ESC/POS'),
            ('star', 'Star Micronics'),
        ],
        string='Imprimante ticket',
        default='browser',
        help="Type d'imprimante pour les tickets de caisse"
    )
    receipt_header = fields.Text(
        string='En-tête ticket',
        help="Texte affiché en haut du ticket"
    )
    receipt_footer = fields.Text(
        string='Pied de ticket',
        default="Merci de votre visite !",
        help="Texte affiché en bas du ticket"
    )
    barcode_scanner = fields.Boolean(
        string='Scanner codes-barres',
        default=True,
        help="Activer le support scanner codes-barres"
    )
    cash_drawer = fields.Boolean(
        string='Tiroir-caisse',
        default=True,
        help="Terminal équipé d'un tiroir-caisse"
    )
    customer_display = fields.Boolean(
        string='Afficheur client',
        default=False,
        help="Afficheur LCD côté client"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # SESSIONS
    # ═══════════════════════════════════════════════════════════════════════════

    session_ids = fields.One2many(
        'quelyos.pos.session',
        'config_id',
        string='Sessions'
    )
    current_session_id = fields.Many2one(
        'quelyos.pos.session',
        string='Session en cours',
        compute='_compute_current_session',
        store=False
    )
    current_session_state = fields.Selection(
        related='current_session_id.state',
        string='État session',
        readonly=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ÉTAT
    # ═══════════════════════════════════════════════════════════════════════════

    active = fields.Boolean(
        string='Actif',
        default=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('code_tenant_unique', 'UNIQUE(code, tenant_id)',
         'Le code du terminal doit être unique par tenant'),
    ]

    @api.constrains('max_discount_percent')
    def _check_max_discount(self):
        for config in self:
            if config.max_discount_percent < 0 or config.max_discount_percent > 100:
                raise ValidationError(
                    "La remise maximum doit être entre 0 et 100%"
                )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('warehouse_id')
    def _compute_picking_type(self):
        """Détermine le type d'opération de sortie pour l'entrepôt"""
        for config in self:
            if config.warehouse_id:
                # Chercher le type de sortie (out_type_id) de l'entrepôt
                config.picking_type_id = config.warehouse_id.out_type_id
            else:
                config.picking_type_id = False

    def _compute_current_session(self):
        """Trouve la session ouverte pour ce terminal"""
        for config in self:
            session = self.env['quelyos.pos.session'].search([
                ('config_id', '=', config.id),
                ('state', 'in', ['opening', 'opened']),
            ], limit=1, order='id desc')
            config.current_session_id = session

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES PUBLIQUES
    # ═══════════════════════════════════════════════════════════════════════════

    def can_user_access(self, user=None):
        """Vérifie si l'utilisateur peut accéder au terminal"""
        self.ensure_one()
        if user is None:
            user = self.env.user

        # Si pas de restriction, tous les utilisateurs de la company ont accès
        if not self.restrict_users:
            return user.company_id == self.company_id

        # Sinon vérifier si dans la liste
        return user in self.user_ids

    def to_frontend_dict(self):
        """Convertit pour le frontend (anonymisation Odoo)"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'isKiosk': self.is_kiosk,
            'currency': {
                'id': self.currency_id.id,
                'symbol': self.currency_id.symbol,
                'code': self.currency_id.name,
                'decimalPlaces': self.currency_id.decimal_places,
            } if self.currency_id else None,
            'warehouse': {
                'id': self.warehouse_id.id,
                'name': self.warehouse_id.name,
            } if self.warehouse_id else None,
            'paymentMethods': [
                pm.to_frontend_dict() for pm in self.payment_method_ids
            ],
            'options': {
                'allowManualDiscount': self.allow_manual_discount,
                'maxDiscountPercent': self.max_discount_percent,
                'requireCustomer': self.require_customer,
                'allowOrderNotes': self.allow_order_notes,
                'barcodeScanner': self.barcode_scanner,
                'cashDrawer': self.cash_drawer,
            },
            'receipt': {
                'printer': self.receipt_printer,
                'header': self.receipt_header or '',
                'footer': self.receipt_footer or '',
            },
            'hasOpenSession': bool(self.current_session_id),
            'currentSessionId': self.current_session_id.id if self.current_session_id else None,
        }

    # ═══════════════════════════════════════════════════════════════════════════
    # ACTIONS
    # ═══════════════════════════════════════════════════════════════════════════

    def action_open_session(self):
        """Ouvre une nouvelle session pour ce terminal"""
        self.ensure_one()

        if self.current_session_id:
            raise ValidationError(
                "Une session est déjà ouverte pour ce terminal. "
                "Veuillez la fermer avant d'en ouvrir une nouvelle."
            )

        return {
            'type': 'ir.actions.act_window',
            'name': 'Ouvrir Session',
            'res_model': 'quelyos.pos.session',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_config_id': self.id,
                'default_user_id': self.env.user.id,
            },
        }

    def action_view_sessions(self):
        """Voir toutes les sessions de ce terminal"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Sessions - {self.name}',
            'res_model': 'quelyos.pos.session',
            'view_mode': 'list,form',
            'domain': [('config_id', '=', self.id)],
            'context': {'default_config_id': self.id},
        }
