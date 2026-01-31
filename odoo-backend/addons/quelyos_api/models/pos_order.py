# -*- coding: utf-8 -*-
"""
Commandes Point de Vente.

Représente une transaction de vente en caisse :
- Lignes de produits
- Paiements (potentiellement multiples)
- Client optionnel
- Remises
- Support mode offline (sync)
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import datetime
import logging

_logger = logging.getLogger(__name__)


class POSOrder(models.Model):
    _name = 'quelyos.pos.order'
    _description = 'Commande Point de Vente'
    _inherit = ['mail.thread']
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
        index=True,
        help="Référence unique de la commande (auto-générée)"
    )
    session_id = fields.Many2one(
        'quelyos.pos.session',
        string='Session',
        required=True,
        ondelete='restrict',
        index=True,
        help="Session de caisse"
    )
    config_id = fields.Many2one(
        'quelyos.pos.config',
        string='Terminal',
        related='session_id.config_id',
        store=True,
        readonly=True
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
    pricelist_id = fields.Many2one(
        'product.pricelist',
        string='Liste de prix',
        related='config_id.pricelist_id',
        store=True,
        readonly=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CLIENT
    # ═══════════════════════════════════════════════════════════════════════════

    partner_id = fields.Many2one(
        'res.partner',
        string='Client',
        index=True,
        help="Client (optionnel sauf si requis par le terminal)"
    )
    user_id = fields.Many2one(
        'res.users',
        string='Vendeur',
        default=lambda self: self.env.user,
        help="Utilisateur ayant créé la commande"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ÉTAT
    # ═══════════════════════════════════════════════════════════════════════════

    state = fields.Selection(
        selection=[
            ('draft', 'Brouillon'),
            ('paid', 'Payée'),
            ('done', 'Terminée'),
            ('invoiced', 'Facturée'),
            ('cancelled', 'Annulée'),
            ('refunded', 'Remboursée'),
        ],
        string='État',
        required=True,
        default='draft',
        tracking=True,
        index=True,
        help="État de la commande"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # LIGNES ET TOTAUX
    # ═══════════════════════════════════════════════════════════════════════════

    line_ids = fields.One2many(
        'quelyos.pos.order.line',
        'order_id',
        string='Lignes',
        copy=True
    )
    amount_untaxed = fields.Float(
        string='HT',
        compute='_compute_amounts',
        store=True
    )
    amount_tax = fields.Float(
        string='Taxes',
        compute='_compute_amounts',
        store=True
    )
    amount_total = fields.Float(
        string='Total TTC',
        compute='_compute_amounts',
        store=True,
        index=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # REMISES GLOBALES
    # ═══════════════════════════════════════════════════════════════════════════

    discount_type = fields.Selection(
        selection=[
            ('percent', 'Pourcentage'),
            ('fixed', 'Montant fixe'),
        ],
        string='Type de remise'
    )
    discount_value = fields.Float(
        string='Valeur remise'
    )
    discount_amount = fields.Float(
        string='Montant remise',
        compute='_compute_amounts',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # PAIEMENTS
    # ═══════════════════════════════════════════════════════════════════════════

    payment_ids = fields.One2many(
        'quelyos.pos.payment',
        'order_id',
        string='Paiements'
    )
    amount_paid = fields.Float(
        string='Montant payé',
        compute='_compute_payment_amounts',
        store=True
    )
    amount_return = fields.Float(
        string='Rendu monnaie',
        default=0.0,
        help="Montant rendu au client"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # NOTES
    # ═══════════════════════════════════════════════════════════════════════════

    note = fields.Text(
        string='Note',
        help="Note interne sur la commande"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # SYNC OFFLINE
    # ═══════════════════════════════════════════════════════════════════════════

    offline_id = fields.Char(
        string='ID Offline',
        index=True,
        help="UUID généré côté client pour les commandes offline"
    )
    synced_at = fields.Datetime(
        string='Synchronisé le',
        help="Date de synchronisation depuis le mode offline"
    )
    is_offline_order = fields.Boolean(
        string='Commande offline',
        default=False,
        help="Commande créée en mode hors-ligne"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # TIMESTAMPS
    # ═══════════════════════════════════════════════════════════════════════════

    paid_at = fields.Datetime(
        string='Payée le',
        help="Date/heure du paiement"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # LIENS COMPTABLES
    # ═══════════════════════════════════════════════════════════════════════════

    sale_order_id = fields.Many2one(
        'sale.order',
        string='Commande de vente',
        help="Commande de vente Odoo liée (optionnel)"
    )
    invoice_id = fields.Many2one(
        'account.move',
        string='Facture',
        help="Facture générée"
    )
    picking_ids = fields.One2many(
        'stock.picking',
        'pos_order_id',
        string='Bons de sortie'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('line_ids.price_subtotal', 'line_ids.price_subtotal_untaxed',
                 'line_ids.price_tax', 'discount_type', 'discount_value')
    def _compute_amounts(self):
        """Calcule les totaux de la commande"""
        for order in self:
            lines = order.line_ids

            # Sous-total HT des lignes
            subtotal_untaxed = sum(lines.mapped('price_subtotal_untaxed'))
            subtotal_tax = sum(lines.mapped('price_tax'))
            subtotal_total = sum(lines.mapped('price_subtotal'))

            # Calcul de la remise globale
            discount_amount = 0.0
            if order.discount_type == 'percent' and order.discount_value:
                discount_amount = subtotal_total * (order.discount_value / 100)
            elif order.discount_type == 'fixed' and order.discount_value:
                discount_amount = min(order.discount_value, subtotal_total)

            order.amount_untaxed = subtotal_untaxed
            order.amount_tax = subtotal_tax
            order.discount_amount = discount_amount
            order.amount_total = subtotal_total - discount_amount

    @api.depends('payment_ids.amount')
    def _compute_payment_amounts(self):
        """Calcule le total payé"""
        for order in self:
            order.amount_paid = sum(order.payment_ids.mapped('amount'))

    # ═══════════════════════════════════════════════════════════════════════════
    # SÉQUENCE
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', '/') == '/':
                session = self.env['quelyos.pos.session'].browse(vals.get('session_id'))
                prefix = session.config_id.code or 'POS'
                date_str = datetime.now().strftime('%y%m%d')
                # Séquence basée sur le nombre de commandes de la session
                order_num = len(session.order_ids) + 1
                vals['name'] = f"{prefix}/{date_str}/{str(order_num).zfill(4)}"
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # VALIDATION
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('session_id')
    def _check_session_state(self):
        for order in self:
            if order.session_id.state not in ['opening', 'opened']:
                raise ValidationError(
                    _("Impossible de créer une commande sur une session fermée.")
                )

    @api.constrains('partner_id', 'config_id')
    def _check_partner_required(self):
        for order in self:
            if order.config_id.require_customer and not order.partner_id:
                raise ValidationError(
                    _("Un client est obligatoire pour ce terminal.")
                )

    # ═══════════════════════════════════════════════════════════════════════════
    # WORKFLOW
    # ═══════════════════════════════════════════════════════════════════════════

    def action_pay(self, payments):
        """
        Valide le paiement et finalise la commande.

        Args:
            payments: Liste de dicts {payment_method_id, amount}
        """
        self.ensure_one()

        if self.state != 'draft':
            raise UserError(_("Cette commande ne peut pas être payée."))

        if not self.line_ids:
            raise ValidationError(_("La commande doit contenir au moins un article."))

        # Créer les paiements
        Payment = self.env['quelyos.pos.payment']
        for payment_data in payments:
            Payment.create({
                'order_id': self.id,
                'payment_method_id': payment_data['payment_method_id'],
                'amount': payment_data['amount'],
            })

        # Vérifier que le montant payé est suffisant
        if self.amount_paid < self.amount_total:
            raise ValidationError(
                _("Le montant payé (%s) est insuffisant. Total: %s") % (
                    self.amount_paid, self.amount_total
                )
            )

        # Calculer le rendu
        amount_return = self.amount_paid - self.amount_total
        if amount_return < 0:
            amount_return = 0

        self.write({
            'state': 'paid',
            'paid_at': fields.Datetime.now(),
            'amount_return': amount_return,
        })

        # Créer les mouvements de stock
        self._create_stock_moves()

        # Créer les écritures comptables
        self._create_account_move()

        return True

    def action_done(self):
        """Marque la commande comme terminée (après impression ticket, etc.)"""
        for order in self:
            if order.state != 'paid':
                raise UserError(_("Seule une commande payée peut être marquée terminée."))
            order.write({'state': 'done'})

    def action_cancel(self, reason=None):
        """Annule la commande"""
        for order in self:
            if order.state not in ['draft', 'paid']:
                raise UserError(_("Cette commande ne peut pas être annulée."))

            # Si payée, il faudrait gérer les remboursements
            if order.state == 'paid':
                # Annuler les mouvements de stock
                order.picking_ids.action_cancel()

            order.write({
                'state': 'cancelled',
                'note': (order.note or '') + f"\nAnnulée: {reason or 'Sans raison'}"
            })

    def action_refund(self, lines_to_refund=None):
        """
        Crée une commande de remboursement.

        Args:
            lines_to_refund: Liste de dicts {line_id, quantity} ou None pour tout
        """
        self.ensure_one()

        if self.state not in ['paid', 'done', 'invoiced']:
            raise UserError(_("Seule une commande payée peut être remboursée."))

        # Créer la commande de remboursement
        refund_vals = {
            'session_id': self.env['quelyos.pos.session'].search([
                ('config_id', '=', self.config_id.id),
                ('state', '=', 'opened'),
            ], limit=1).id,
            'partner_id': self.partner_id.id,
            'note': _("Remboursement de %s") % self.name,
        }

        # Lignes de remboursement (quantités négatives)
        refund_lines = []
        source_lines = self.line_ids

        if lines_to_refund:
            for line_data in lines_to_refund:
                line = self.line_ids.browse(line_data['line_id'])
                qty = -abs(line_data.get('quantity', line.quantity))
                refund_lines.append((0, 0, {
                    'product_id': line.product_id.id,
                    'quantity': qty,
                    'price_unit': line.price_unit,
                    'discount': line.discount,
                }))
        else:
            for line in source_lines:
                refund_lines.append((0, 0, {
                    'product_id': line.product_id.id,
                    'quantity': -line.quantity,
                    'price_unit': line.price_unit,
                    'discount': line.discount,
                }))

        refund_vals['line_ids'] = refund_lines
        refund = self.create(refund_vals)

        self.write({'state': 'refunded'})

        return refund

    # ═══════════════════════════════════════════════════════════════════════════
    # STOCK
    # ═══════════════════════════════════════════════════════════════════════════

    def _create_stock_moves(self):
        """Crée les mouvements de sortie de stock"""
        self.ensure_one()

        if not self.config_id.warehouse_id or not self.config_id.picking_type_id:
            _logger.warning(f"POS Order {self.name}: No warehouse configured, skipping stock moves")
            return

        Picking = self.env['stock.picking'].sudo()
        StockMove = self.env['stock.move'].sudo()

        # Créer le bon de sortie
        picking_vals = {
            'partner_id': self.partner_id.id if self.partner_id else False,
            'picking_type_id': self.config_id.picking_type_id.id,
            'location_id': self.config_id.warehouse_id.lot_stock_id.id,
            'location_dest_id': self.env.ref('stock.stock_location_customers').id,
            'origin': self.name,
            'pos_order_id': self.id,
        }
        picking = Picking.create(picking_vals)

        # Créer les mouvements pour chaque ligne
        for line in self.line_ids:
            if line.product_id.type != 'service' and line.quantity > 0:
                move_vals = {
                    'name': f"POS/{self.name}/{line.product_id.name}",
                    'product_id': line.product_id.id,
                    'product_uom_qty': line.quantity,
                    'product_uom': line.product_id.uom_id.id,
                    'picking_id': picking.id,
                    'location_id': picking.location_id.id,
                    'location_dest_id': picking.location_dest_id.id,
                    'origin': self.name,
                }
                StockMove.create(move_vals)

        # Confirmer et valider le picking
        picking.action_confirm()
        picking.action_assign()

        # Essayer de valider immédiatement
        for move in picking.move_ids:
            move.quantity = move.product_uom_qty

        picking.button_validate()

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPTABILITÉ
    # ═══════════════════════════════════════════════════════════════════════════

    def _create_account_move(self):
        """
        Crée les écritures comptables pour la commande POS.

        Utilise les journaux natifs Odoo (account.move) pour :
        - Enregistrer les ventes (crédit compte produits)
        - Enregistrer les taxes (crédit compte TVA)
        - Enregistrer les paiements (débit compte caisse/banque)
        """
        self.ensure_one()

        # Vérifier la configuration comptable
        if not self.config_id.sale_journal_id:
            _logger.warning(f"POS Order {self.name}: No sale journal configured, skipping accounting")
            return

        journal = self.config_id.sale_journal_id
        move_lines = []

        # === LIGNES DE PRODUITS (Crédit) ===
        for line in self.line_ids:
            # Compte de produits (priorité: produit > catégorie > config > défaut)
            income_account = (
                line.product_id.property_account_income_id or
                line.product_id.categ_id.property_account_income_categ_id or
                self.config_id.income_account_id
            )

            if not income_account:
                _logger.warning(f"POS Order {self.name}: No income account for product {line.product_id.name}")
                continue

            # Ligne de vente HT (crédit)
            if line.price_subtotal_untaxed:
                move_lines.append((0, 0, {
                    'name': f"{self.name} - {line.product_id.name}",
                    'account_id': income_account.id,
                    'partner_id': self.partner_id.id if self.partner_id else False,
                    'debit': 0.0,
                    'credit': abs(line.price_subtotal_untaxed),
                    'product_id': line.product_id.id,
                    'quantity': line.quantity,
                }))

            # Lignes de taxes (crédit)
            for tax in line.tax_ids:
                tax_amount = line.price_tax / len(line.tax_ids) if line.tax_ids else 0
                if tax_amount:
                    # Compte de taxe
                    tax_account = tax.invoice_repartition_line_ids.filtered(
                        lambda r: r.repartition_type == 'tax'
                    ).account_id

                    if tax_account:
                        move_lines.append((0, 0, {
                            'name': f"{self.name} - TVA {tax.name}",
                            'account_id': tax_account.id,
                            'partner_id': self.partner_id.id if self.partner_id else False,
                            'debit': 0.0,
                            'credit': abs(tax_amount),
                            'tax_line_id': tax.id,
                        }))

        # === LIGNES DE PAIEMENT (Débit) ===
        for payment in self.payment_ids:
            # Journal de la méthode de paiement
            payment_journal = payment.payment_method_id.journal_id

            if not payment_journal:
                _logger.warning(
                    f"POS Order {self.name}: No journal for payment method "
                    f"{payment.payment_method_id.name}, using default"
                )
                # Utiliser le journal de vente par défaut
                payment_account = journal.default_account_id
            else:
                payment_account = payment_journal.default_account_id

            if payment_account and payment.amount:
                # Ajuster pour le rendu monnaie
                amount = payment.amount
                if payment == self.payment_ids[-1]:
                    # Dernier paiement : ajuster pour le rendu
                    amount = payment.amount - self.amount_return

                if amount > 0:
                    move_lines.append((0, 0, {
                        'name': f"{self.name} - {payment.payment_method_id.name}",
                        'account_id': payment_account.id,
                        'partner_id': self.partner_id.id if self.partner_id else False,
                        'debit': abs(amount),
                        'credit': 0.0,
                    }))

        # === REMISE GLOBALE (Débit - réduction des produits) ===
        if self.discount_amount > 0 and self.config_id.income_account_id:
            move_lines.append((0, 0, {
                'name': f"{self.name} - Remise globale",
                'account_id': self.config_id.income_account_id.id,
                'partner_id': self.partner_id.id if self.partner_id else False,
                'debit': abs(self.discount_amount),
                'credit': 0.0,
            }))

        # === CRÉER LA PIÈCE COMPTABLE ===
        if not move_lines:
            _logger.warning(f"POS Order {self.name}: No accounting lines to create")
            return

        try:
            AccountMove = self.env['account.move'].sudo()
            move_vals = {
                'journal_id': journal.id,
                'date': fields.Date.today(),
                'ref': self.name,
                'move_type': 'entry',
                'partner_id': self.partner_id.id if self.partner_id else False,
                'line_ids': move_lines,
            }

            account_move = AccountMove.create(move_vals)

            # Valider automatiquement l'écriture
            account_move.action_post()

            # Lier à la commande POS
            self.write({'invoice_id': account_move.id})

            _logger.info(f"POS Order {self.name}: Created account move {account_move.name}")

        except Exception as e:
            _logger.error(f"POS Order {self.name}: Error creating account move: {e}", exc_info=True)
            # Ne pas bloquer la vente si la compta échoue
            # L'erreur sera visible dans les logs

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES FRONTEND
    # ═══════════════════════════════════════════════════════════════════════════

    def to_frontend_dict(self):
        """Convertit pour le frontend (anonymisation Odoo)"""
        self.ensure_one()
        return {
            'id': self.id,
            'reference': self.name,
            'state': self.state,
            'sessionId': self.session_id.id,
            'customerId': self.partner_id.id if self.partner_id else None,
            'customerName': self.partner_id.name if self.partner_id else None,
            'lines': [line.to_frontend_dict() for line in self.line_ids],
            'payments': [payment.to_frontend_dict() for payment in self.payment_ids],
            'amountUntaxed': self.amount_untaxed,
            'amountTax': self.amount_tax,
            'amountTotal': self.amount_total,
            'discountType': self.discount_type,
            'discountValue': self.discount_value,
            'discountAmount': self.discount_amount,
            'amountPaid': self.amount_paid,
            'amountReturn': self.amount_return,
            'note': self.note,
            'offlineId': self.offline_id,
            'isOfflineOrder': self.is_offline_order,
            'createdAt': self.create_date.isoformat() if self.create_date else None,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None,
        }

    def to_frontend_summary(self):
        """Version résumée pour les listes"""
        self.ensure_one()
        return {
            'id': self.id,
            'reference': self.name,
            'state': self.state,
            'customerName': self.partner_id.name if self.partner_id else 'Client anonyme',
            'itemCount': len(self.line_ids),
            'amountTotal': self.amount_total,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None,
        }


class POSOrderLine(models.Model):
    _name = 'quelyos.pos.order.line'
    _description = 'Ligne Commande POS'
    _order = 'sequence, id'

    order_id = fields.Many2one(
        'quelyos.pos.order',
        string='Commande',
        required=True,
        ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(
        string='Séquence',
        default=10
    )

    # Produit
    product_id = fields.Many2one(
        'product.product',
        string='Produit',
        required=True,
        domain=[('sale_ok', '=', True)]
    )
    product_name = fields.Char(
        string='Nom',
        related='product_id.name',
        readonly=True
    )
    product_sku = fields.Char(
        string='SKU',
        related='product_id.default_code',
        readonly=True
    )

    # Quantité et prix
    quantity = fields.Float(
        string='Quantité',
        required=True,
        default=1.0
    )
    price_unit = fields.Float(
        string='Prix unitaire',
        required=True,
        digits='Product Price'
    )
    discount = fields.Float(
        string='Remise (%)',
        default=0.0,
        digits='Discount'
    )

    # Taxes
    tax_ids = fields.Many2many(
        'account.tax',
        string='Taxes',
        domain=[('type_tax_use', '=', 'sale')]
    )

    # Totaux calculés
    price_subtotal_untaxed = fields.Float(
        string='Sous-total HT',
        compute='_compute_amounts',
        store=True
    )
    price_tax = fields.Float(
        string='Taxes',
        compute='_compute_amounts',
        store=True
    )
    price_subtotal = fields.Float(
        string='Sous-total TTC',
        compute='_compute_amounts',
        store=True
    )

    # Note
    note = fields.Text(
        string='Note',
        help="Note spécifique à cette ligne (instructions, etc.)"
    )

    # Sync offline
    offline_line_id = fields.Char(
        string='ID Ligne Offline'
    )

    @api.depends('quantity', 'price_unit', 'discount', 'tax_ids')
    def _compute_amounts(self):
        """Calcule les montants de la ligne"""
        for line in self:
            # Prix après remise
            price_discount = line.price_unit * (1 - (line.discount / 100))
            subtotal_untaxed = price_discount * line.quantity

            # Calcul des taxes
            taxes = line.tax_ids.compute_all(
                price_discount,
                line.order_id.currency_id,
                line.quantity,
                product=line.product_id,
                partner=line.order_id.partner_id,
            )

            line.price_subtotal_untaxed = taxes['total_excluded']
            line.price_tax = taxes['total_included'] - taxes['total_excluded']
            line.price_subtotal = taxes['total_included']

    @api.onchange('product_id')
    def _onchange_product(self):
        """Met à jour le prix et les taxes lors du changement de produit"""
        if self.product_id:
            pricelist = self.order_id.pricelist_id
            if pricelist:
                self.price_unit = pricelist._get_product_price(
                    self.product_id, 1.0
                )
            else:
                self.price_unit = self.product_id.list_price

            # Taxes par défaut du produit
            self.tax_ids = self.product_id.taxes_id.filtered(
                lambda t: t.company_id == self.order_id.company_id
            )

    def to_frontend_dict(self):
        """Convertit pour le frontend"""
        self.ensure_one()
        return {
            'id': self.id,
            'productId': self.product_id.id,
            'productName': self.product_id.name,
            'sku': self.product_id.default_code or '',
            'quantity': self.quantity,
            'priceUnit': self.price_unit,
            'discount': self.discount,
            'priceSubtotal': self.price_subtotal,
            'note': self.note,
        }


class POSPayment(models.Model):
    _name = 'quelyos.pos.payment'
    _description = 'Paiement POS'
    _order = 'id'

    order_id = fields.Many2one(
        'quelyos.pos.order',
        string='Commande',
        required=True,
        ondelete='cascade',
        index=True
    )
    payment_method_id = fields.Many2one(
        'quelyos.pos.payment.method',
        string='Méthode',
        required=True
    )
    amount = fields.Float(
        string='Montant',
        required=True
    )

    # Référence externe (pour paiements digitaux)
    transaction_id = fields.Char(
        string='ID Transaction',
        help="Référence de la transaction externe"
    )
    payment_transaction_id = fields.Many2one(
        'payment.transaction',
        string='Transaction Odoo',
        help="Lien vers la transaction de paiement Odoo"
    )

    def to_frontend_dict(self):
        """Convertit pour le frontend"""
        self.ensure_one()
        return {
            'id': self.id,
            'methodId': self.payment_method_id.id,
            'methodCode': self.payment_method_id.code,
            'methodName': self.payment_method_id.name,
            'amount': self.amount,
            'transactionId': self.transaction_id,
        }


# Lien inverse sur stock.picking
class StockPicking(models.Model):
    _inherit = 'stock.picking'

    pos_order_id = fields.Many2one(
        'quelyos.pos.order',
        string='Commande POS',
        help="Commande POS source de ce bon de sortie"
    )
