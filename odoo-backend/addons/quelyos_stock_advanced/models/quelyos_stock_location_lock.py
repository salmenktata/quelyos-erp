# -*- coding: utf-8 -*-
"""
Verrouillage d'emplacements - Quelyos Native

Permet de bloquer temporairement des emplacements (maintenance, réorganisation, etc.)
Remplace le module OCA stock_location_lockdown.
"""
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class QuelyosStockLocationLock(models.Model):
    _name = 'quelyos.stock.location.lock'
    _description = 'Verrouillage Emplacement Stock Quelyos'
    _order = 'date_start desc, id desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(
        string='Nom',
        compute='_compute_name',
        store=True
    )

    location_id = fields.Many2one(
        'stock.location',
        string='Emplacement',
        required=True,
        domain=[('usage', '=', 'internal')],
        tracking=True,
        index=True
    )

    reason = fields.Text(
        string='Raison',
        required=True,
        help="Motif du verrouillage (ex: Maintenance, Réorganisation, Inventaire en cours)"
    )

    date_start = fields.Datetime(
        string='Date Début',
        required=True,
        default=fields.Datetime.now,
        tracking=True
    )

    date_end = fields.Datetime(
        string='Date Fin',
        help="Laisser vide pour un verrouillage sans date de fin prévue",
        tracking=True
    )

    user_id = fields.Many2one(
        'res.users',
        string='Verrouillé par',
        required=True,
        default=lambda self: self.env.user,
        readonly=True
    )

    active = fields.Boolean(
        string='Actif',
        default=True,
        tracking=True,
        help="Décocher pour déverrouiller l'emplacement"
    )

    is_locked = fields.Boolean(
        string='Verrouillé',
        compute='_compute_is_locked',
        store=False,
        help="True si le verrouillage est actif actuellement"
    )

    @api.depends('location_id', 'date_start', 'date_end', 'active')
    def _compute_name(self):
        for lock in self:
            if lock.location_id:
                lock.name = _("Verrouillage %s") % lock.location_id.display_name
            else:
                lock.name = _("Verrouillage")

    @api.depends('active', 'date_start', 'date_end')
    def _compute_is_locked(self):
        now = fields.Datetime.now()
        for lock in self:
            if not lock.active:
                lock.is_locked = False
                continue

            # Vérifie si on est dans la période de verrouillage
            is_started = lock.date_start <= now
            is_not_ended = not lock.date_end or lock.date_end >= now

            lock.is_locked = is_started and is_not_ended

    @api.constrains('date_start', 'date_end')
    def _check_dates(self):
        for lock in self:
            if lock.date_end and lock.date_start > lock.date_end:
                raise ValidationError(_("La date de fin doit être postérieure à la date de début."))

    def action_unlock(self):
        """Déverrouiller manuellement l'emplacement"""
        self.ensure_one()
        self.active = False
        self.message_post(body=_("Emplacement déverrouillé manuellement."))

    def action_lock(self):
        """Reverrouiller l'emplacement"""
        self.ensure_one()
        self.active = True
        self.message_post(body=_("Emplacement verrouillé."))
