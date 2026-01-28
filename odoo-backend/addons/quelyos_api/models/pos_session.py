# -*- coding: utf-8 -*-
"""
Sessions de caisse Point de Vente.

Une session représente une période de travail sur un terminal :
- Ouverture avec fond de caisse
- Enregistrement des ventes
- Fermeture avec comptage et rapprochement
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import datetime


class POSSession(models.Model):
    _name = 'quelyos.pos.session'
    _description = 'Session Caisse POS'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'id desc'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Référence',
        required=True,
        readonly=True,
        copy=False,
        default='/',
        help="Référence unique de la session (auto-générée)"
    )
    config_id = fields.Many2one(
        'quelyos.pos.config',
        string='Terminal',
        required=True,
        ondelete='restrict',
        tracking=True,
        help="Terminal POS de cette session"
    )
    user_id = fields.Many2one(
        'res.users',
        string='Caissier',
        required=True,
        default=lambda self: self.env.user,
        tracking=True,
        help="Utilisateur responsable de la session"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # LIENS TENANT / COMPANY
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        related='config_id.tenant_id',
        store=True,
        readonly=True
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='config_id.company_id',
        store=True,
        readonly=True
    )
    currency_id = fields.Many2one(
        'res.currency',
        string='Devise',
        related='config_id.currency_id',
        store=True,
        readonly=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ÉTAT DE LA SESSION
    # ═══════════════════════════════════════════════════════════════════════════

    state = fields.Selection(
        selection=[
            ('opening', 'Ouverture'),
            ('opened', 'Ouverte'),
            ('closing', 'Fermeture'),
            ('closed', 'Fermée'),
        ],
        string='État',
        required=True,
        default='opening',
        tracking=True,
        help="État actuel de la session"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPTAGE CAISSE
    # ═══════════════════════════════════════════════════════════════════════════

    opening_cash = fields.Float(
        string='Fond de caisse initial',
        default=0.0,
        tracking=True,
        help="Montant en espèces au début de la session"
    )
    closing_cash = fields.Float(
        string='Encaisse finale',
        tracking=True,
        help="Montant en espèces compté à la fermeture"
    )
    cash_difference = fields.Float(
        string='Écart de caisse',
        compute='_compute_cash_difference',
        store=True,
        help="Différence entre l'encaisse théorique et réelle"
    )
    theoretical_closing_cash = fields.Float(
        string='Encaisse théorique',
        compute='_compute_totals',
        store=True,
        help="Fond initial + paiements espèces - rendus"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # TOTAUX (COMPUTED)
    # ═══════════════════════════════════════════════════════════════════════════

    order_count = fields.Integer(
        string='Nombre de commandes',
        compute='_compute_totals',
        store=True
    )
    total_amount = fields.Float(
        string='Total des ventes',
        compute='_compute_totals',
        store=True
    )
    total_cash = fields.Float(
        string='Total espèces',
        compute='_compute_totals',
        store=True
    )
    total_card = fields.Float(
        string='Total carte',
        compute='_compute_totals',
        store=True
    )
    total_digital = fields.Float(
        string='Total digital',
        compute='_compute_totals',
        store=True
    )
    total_other = fields.Float(
        string='Total autres',
        compute='_compute_totals',
        store=True
    )
    total_returns = fields.Float(
        string='Total rendus monnaie',
        compute='_compute_totals',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # TIMESTAMPS
    # ═══════════════════════════════════════════════════════════════════════════

    opened_at = fields.Datetime(
        string='Ouvert le',
        tracking=True,
        help="Date/heure d'ouverture effective"
    )
    closed_at = fields.Datetime(
        string='Fermé le',
        tracking=True,
        help="Date/heure de fermeture"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMMANDES
    # ═══════════════════════════════════════════════════════════════════════════

    order_ids = fields.One2many(
        'quelyos.pos.order',
        'session_id',
        string='Commandes',
        readonly=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # NOTES
    # ═══════════════════════════════════════════════════════════════════════════

    opening_notes = fields.Text(
        string='Notes ouverture',
        help="Notes lors de l'ouverture de la session"
    )
    closing_notes = fields.Text(
        string='Notes fermeture',
        help="Notes lors de la fermeture (écarts, incidents)"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('order_ids', 'order_ids.state', 'order_ids.amount_total',
                 'order_ids.payment_ids', 'order_ids.amount_return', 'opening_cash')
    def _compute_totals(self):
        """Calcule tous les totaux de la session"""
        for session in self:
            # Filtrer les commandes payées/terminées
            paid_orders = session.order_ids.filtered(
                lambda o: o.state in ['paid', 'done', 'invoiced']
            )

            session.order_count = len(paid_orders)
            session.total_amount = sum(paid_orders.mapped('amount_total'))
            session.total_returns = sum(paid_orders.mapped('amount_return'))

            # Totaux par type de paiement
            total_cash = 0.0
            total_card = 0.0
            total_digital = 0.0
            total_other = 0.0

            for order in paid_orders:
                for payment in order.payment_ids:
                    amount = payment.amount
                    payment_type = payment.payment_method_id.type

                    if payment_type == 'cash':
                        total_cash += amount
                    elif payment_type == 'card':
                        total_card += amount
                    elif payment_type == 'digital':
                        total_digital += amount
                    else:
                        total_other += amount

            session.total_cash = total_cash
            session.total_card = total_card
            session.total_digital = total_digital
            session.total_other = total_other

            # Encaisse théorique = Fond initial + espèces reçues - rendus
            session.theoretical_closing_cash = (
                session.opening_cash + total_cash - session.total_returns
            )

    @api.depends('closing_cash', 'theoretical_closing_cash')
    def _compute_cash_difference(self):
        """Calcule l'écart de caisse"""
        for session in self:
            if session.state in ['closing', 'closed'] and session.closing_cash:
                session.cash_difference = (
                    session.closing_cash - session.theoretical_closing_cash
                )
            else:
                session.cash_difference = 0.0

    # ═══════════════════════════════════════════════════════════════════════════
    # SÉQUENCE
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', '/') == '/':
                config = self.env['quelyos.pos.config'].browse(vals.get('config_id'))
                prefix = config.code or 'POS'
                date_str = datetime.now().strftime('%y%m%d')
                # Trouver le numéro suivant pour aujourd'hui
                today_sessions = self.search_count([
                    ('config_id', '=', vals.get('config_id')),
                    ('create_date', '>=', datetime.now().replace(hour=0, minute=0, second=0)),
                ])
                vals['name'] = f"{prefix}-{date_str}-{str(today_sessions + 1).zfill(3)}"
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # WORKFLOW
    # ═══════════════════════════════════════════════════════════════════════════

    def action_open(self):
        """Ouvre la session (valide le fond de caisse)"""
        for session in self:
            if session.state != 'opening':
                raise UserError(_("Cette session ne peut pas être ouverte."))

            # Vérifier qu'il n'y a pas d'autre session ouverte sur ce terminal
            existing = self.search([
                ('config_id', '=', session.config_id.id),
                ('state', '=', 'opened'),
                ('id', '!=', session.id),
            ], limit=1)
            if existing:
                raise ValidationError(
                    _("Une session est déjà ouverte sur ce terminal : %s") % existing.name
                )

            # Vérifier permissions utilisateur
            if session.config_id.restrict_users:
                if session.user_id not in session.config_id.user_ids:
                    raise ValidationError(
                        _("Vous n'êtes pas autorisé à ouvrir une session sur ce terminal.")
                    )

            session.write({
                'state': 'opened',
                'opened_at': fields.Datetime.now(),
            })

            session.message_post(
                body=_("Session ouverte avec un fond de caisse de %s %s") % (
                    session.opening_cash, session.currency_id.symbol
                ),
                message_type='notification',
            )

    def action_start_closing(self):
        """Démarre le processus de fermeture"""
        for session in self:
            if session.state != 'opened':
                raise UserError(_("Cette session ne peut pas être fermée."))

            # Vérifier qu'il n'y a pas de commandes en cours
            draft_orders = session.order_ids.filtered(lambda o: o.state == 'draft')
            if draft_orders:
                raise ValidationError(
                    _("Il y a %d commande(s) en cours. Veuillez les finaliser ou les annuler.") %
                    len(draft_orders)
                )

            session.write({'state': 'closing'})

    def action_close(self):
        """Ferme définitivement la session après comptage"""
        for session in self:
            if session.state != 'closing':
                raise UserError(_("Cette session ne peut pas être fermée."))

            session.write({
                'state': 'closed',
                'closed_at': fields.Datetime.now(),
            })

            # Message avec récapitulatif
            session.message_post(
                body=_(
                    "<p><strong>Session fermée</strong></p>"
                    "<ul>"
                    "<li>Commandes : %d</li>"
                    "<li>Total ventes : %s %s</li>"
                    "<li>Encaisse théorique : %s %s</li>"
                    "<li>Encaisse réelle : %s %s</li>"
                    "<li>Écart : %s %s</li>"
                    "</ul>"
                ) % (
                    session.order_count,
                    session.total_amount, session.currency_id.symbol,
                    session.theoretical_closing_cash, session.currency_id.symbol,
                    session.closing_cash or 0, session.currency_id.symbol,
                    session.cash_difference, session.currency_id.symbol,
                ),
                message_type='notification',
            )

    def action_reopen(self):
        """Réouvre une session fermée (pour corrections)"""
        for session in self:
            if session.state != 'closed':
                raise UserError(_("Seule une session fermée peut être réouverte."))

            session.write({
                'state': 'opened',
                'closed_at': False,
                'closing_cash': False,
            })

            session.message_post(
                body=_("Session réouverte pour corrections"),
                message_type='notification',
            )

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES FRONTEND
    # ═══════════════════════════════════════════════════════════════════════════

    def to_frontend_dict(self):
        """Convertit pour le frontend (anonymisation Odoo)"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'state': self.state,
            'configId': self.config_id.id,
            'configName': self.config_id.name,
            'userId': self.user_id.id,
            'userName': self.user_id.name,
            'currency': {
                'symbol': self.currency_id.symbol,
                'code': self.currency_id.name,
            } if self.currency_id else None,
            'openingCash': self.opening_cash,
            'closingCash': self.closing_cash,
            'theoreticalClosingCash': self.theoretical_closing_cash,
            'cashDifference': self.cash_difference,
            'orderCount': self.order_count,
            'totalAmount': self.total_amount,
            'totalCash': self.total_cash,
            'totalCard': self.total_card,
            'totalDigital': self.total_digital,
            'totalReturns': self.total_returns,
            'openedAt': self.opened_at.isoformat() if self.opened_at else None,
            'closedAt': self.closed_at.isoformat() if self.closed_at else None,
        }

    def to_frontend_summary(self):
        """Version résumée pour les listes"""
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'state': self.state,
            'userName': self.user_id.name,
            'orderCount': self.order_count,
            'totalAmount': self.total_amount,
            'openedAt': self.opened_at.isoformat() if self.opened_at else None,
        }

    # ═══════════════════════════════════════════════════════════════════════════
    # RAPPORT Z
    # ═══════════════════════════════════════════════════════════════════════════

    def get_z_report_data(self):
        """Génère les données pour le rapport Z de clôture"""
        self.ensure_one()

        # Totaux par méthode de paiement
        payments_by_method = {}
        for order in self.order_ids.filtered(lambda o: o.state in ['paid', 'done', 'invoiced']):
            for payment in order.payment_ids:
                method_name = payment.payment_method_id.name
                if method_name not in payments_by_method:
                    payments_by_method[method_name] = {
                        'count': 0,
                        'amount': 0.0,
                    }
                payments_by_method[method_name]['count'] += 1
                payments_by_method[method_name]['amount'] += payment.amount

        # Top produits vendus
        product_sales = {}
        for order in self.order_ids.filtered(lambda o: o.state in ['paid', 'done', 'invoiced']):
            for line in order.line_ids:
                product_id = line.product_id.id
                if product_id not in product_sales:
                    product_sales[product_id] = {
                        'name': line.product_id.name,
                        'quantity': 0,
                        'amount': 0.0,
                    }
                product_sales[product_id]['quantity'] += line.quantity
                product_sales[product_id]['amount'] += line.price_subtotal

        # Trier par montant décroissant
        top_products = sorted(
            product_sales.values(),
            key=lambda x: x['amount'],
            reverse=True
        )[:10]

        return {
            'session': self.to_frontend_dict(),
            'paymentsByMethod': [
                {'method': name, **data}
                for name, data in payments_by_method.items()
            ],
            'topProducts': top_products,
            'generatedAt': datetime.now().isoformat(),
        }
