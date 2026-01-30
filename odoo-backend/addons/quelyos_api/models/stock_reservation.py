# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class StockReservation(models.Model):
    """
    Réservation manuelle de stock.
    Permet de bloquer des quantités pour des commandes futures, événements spéciaux, etc.
    """
    _name = 'quelyos.stock.reservation'
    _description = 'Stock Reservation (Réservation manuelle)'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    name = fields.Char(
        string='Référence',
        required=True,
        copy=False,
        readonly=True,
        index=True,
        default=lambda self: self.env['ir.sequence'].next_by_code('quelyos.stock.reservation')
    )

    # Produit réservé
    product_id = fields.Many2one(
        'product.product',
        string='Produit',
        required=True,
        index=True,
        tracking=True,
        ondelete='restrict',
        help='Produit à réserver'
    )

    product_uom_id = fields.Many2one(
        'uom.uom',
        string='Unité de mesure',
        related='product_id.uom_id',
        store=True,
        readonly=True
    )

    # Quantité réservée
    reserved_qty = fields.Float(
        string='Quantité réservée',
        required=True,
        default=1.0,
        tracking=True,
        help='Quantité à bloquer pour cette réservation'
    )

    # Emplacement
    location_id = fields.Many2one(
        'stock.location',
        string='Emplacement',
        required=True,
        domain="[('usage', '=', 'internal')]",
        tracking=True,
        help='Emplacement de stock depuis lequel réserver'
    )

    # Dates
    reservation_date = fields.Datetime(
        string='Date de début',
        required=True,
        default=fields.Datetime.now,
        tracking=True,
        help='Date à partir de laquelle la réservation est active'
    )

    expiration_date = fields.Datetime(
        string='Date de fin',
        tracking=True,
        help='Date d\'expiration de la réservation (optionnel)'
    )

    # Raison de la réservation
    reason = fields.Selection([
        ('event', 'Événement spécial'),
        ('special_order', 'Commande spéciale'),
        ('vip_customer', 'Client VIP'),
        ('promotion', 'Promotion planifiée'),
        ('sample', 'Échantillons'),
        ('other', 'Autre'),
    ], string='Raison', required=True, default='other', tracking=True)

    # Notes
    notes = fields.Text(
        string='Notes',
        help='Détails supplémentaires sur la réservation'
    )

    # État
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('active', 'Active'),
        ('released', 'Libérée'),
        ('expired', 'Expirée'),
    ], string='État', default='draft', required=True, tracking=True, index=True)

    # Responsable
    user_id = fields.Many2one(
        'res.users',
        string='Créé par',
        default=lambda self: self.env.user,
        readonly=True,
        tracking=True
    )

    # Multi-tenant
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        default=lambda self: self.env.company,
        readonly=True
    )

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        index=True,
        help='Tenant propriétaire de cette réservation'
    )

    # Stock disponible au moment de la création
    stock_available_at_creation = fields.Float(
        string='Stock disponible (création)',
        readonly=True,
        help='Stock disponible au moment de la création de la réservation'
    )

    _sql_constraints = [
        ('reserved_qty_positive', 'CHECK(reserved_qty > 0)',
         'La quantité réservée doit être positive'),
    ]

    @api.constrains('reserved_qty', 'product_id', 'location_id')
    def _check_available_stock(self):
        """Vérifier que le stock disponible est suffisant"""
        for record in self:
            if record.state == 'active':
                # Récupérer stock disponible à cet emplacement
                quants = self.env['stock.quant'].search([
                    ('product_id', '=', record.product_id.id),
                    ('location_id', '=', record.location_id.id),
                ])
                available_qty = sum(quants.mapped('quantity'))

                # Soustraire autres réservations actives
                other_reservations = self.search([
                    ('id', '!=', record.id),
                    ('product_id', '=', record.product_id.id),
                    ('location_id', '=', record.location_id.id),
                    ('state', '=', 'active'),
                ])
                reserved_qty = sum(other_reservations.mapped('reserved_qty'))

                net_available = available_qty - reserved_qty

                if record.reserved_qty > net_available:
                    raise ValidationError(
                        f"Stock insuffisant pour {record.product_id.display_name} "
                        f"à l'emplacement {record.location_id.display_name}.\n"
                        f"Disponible : {net_available} {record.product_uom_id.name}\n"
                        f"Demandé : {record.reserved_qty} {record.product_uom_id.name}"
                    )

    @api.constrains('expiration_date', 'reservation_date')
    def _check_dates(self):
        """Vérifier que la date de fin est après la date de début"""
        for record in self:
            if record.expiration_date and record.reservation_date:
                if record.expiration_date <= record.reservation_date:
                    raise ValidationError(
                        "La date de fin doit être postérieure à la date de début"
                    )

    @api.model
    def create(self, vals):
        """Enregistrer le stock disponible à la création"""
        if 'product_id' in vals and 'location_id' in vals:
            product = self.env['product.product'].browse(vals['product_id'])
            location = self.env['stock.location'].browse(vals['location_id'])

            quants = self.env['stock.quant'].search([
                ('product_id', '=', product.id),
                ('location_id', '=', location.id),
            ])
            vals['stock_available_at_creation'] = sum(quants.mapped('quantity'))

        return super().create(vals)

    def action_activate(self):
        """Activer la réservation"""
        self.ensure_one()
        if self.state != 'draft':
            raise ValidationError("Seules les réservations en brouillon peuvent être activées")

        # Vérifier stock disponible
        self._check_available_stock()

        self.write({
            'state': 'active',
            'reservation_date': fields.Datetime.now(),
        })

        self.message_post(
            body=f"<p>Réservation activée : {self.reserved_qty} {self.product_uom_id.name} "
                 f"de {self.product_id.display_name}</p>",
            message_type='notification',
            subtype_xmlid='mail.mt_note',
        )

        return True

    def action_release(self):
        """Libérer la réservation manuellement"""
        self.ensure_one()
        if self.state != 'active':
            raise ValidationError("Seules les réservations actives peuvent être libérées")

        self.write({'state': 'released'})

        self.message_post(
            body=f"<p>Réservation libérée : {self.reserved_qty} {self.product_uom_id.name} "
                 f"de {self.product_id.display_name} maintenant disponible</p>",
            message_type='notification',
            subtype_xmlid='mail.mt_note',
        )

        return True

    @api.model
    def _cron_expire_reservations(self):
        """
        Cron job : Expirer automatiquement les réservations dépassées.
        S'exécute toutes les heures.
        """
        now = fields.Datetime.now()

        expired = self.search([
            ('state', '=', 'active'),
            ('expiration_date', '<=', now),
        ])

        if expired:
            expired.write({'state': 'expired'})

            for reservation in expired:
                reservation.message_post(
                    body=f"<p>⏰ Réservation expirée automatiquement</p>"
                         f"<p>{reservation.reserved_qty} {reservation.product_uom_id.name} "
                         f"de {reservation.product_id.display_name} libéré</p>",
                    message_type='notification',
                    subtype_xmlid='mail.mt_note',
                )

        return True

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'name': self.name,
            'product_id': self.product_id.id,
            'product_name': self.product_id.display_name,
            'product_sku': self.product_id.default_code or '',
            'reserved_qty': self.reserved_qty,
            'unit': self.product_uom_id.name,
            'location_id': self.location_id.id,
            'location_name': self.location_id.display_name,
            'reservation_date': self.reservation_date.isoformat() if self.reservation_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'reason': self.reason,
            'reason_label': dict(self._fields['reason'].selection).get(self.reason),
            'notes': self.notes or '',
            'state': self.state,
            'state_label': dict(self._fields['state'].selection).get(self.state),
            'user_id': self.user_id.id,
            'user_name': self.user_id.name,
            'stock_available_at_creation': self.stock_available_at_creation,
            'create_date': self.create_date.isoformat() if self.create_date else None,
            'write_date': self.write_date.isoformat() if self.write_date else None,
        }
