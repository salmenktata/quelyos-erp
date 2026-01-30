# -*- coding: utf-8 -*-
from odoo import models, fields, api, _


class SupportTicket(models.Model):
    _name = 'quelyos.ticket'
    _description = 'Ticket Support/Réclamation'
    _order = 'create_date desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    # Identification
    name = fields.Char(
        'Référence',
        required=True,
        readonly=True,
        default=lambda self: _('New'),
        copy=False
    )
    subject = fields.Char('Sujet', required=True)

    # Client
    partner_id = fields.Many2one(
        'res.partner',
        string='Client',
        required=True,
        index=True
    )
    email = fields.Char(related='partner_id.email', string='Email')
    phone = fields.Char(related='partner_id.phone', string='Téléphone')

    # Commande liée (optionnel)
    order_id = fields.Many2one('sale.order', string='Commande')
    product_id = fields.Many2one('product.template', string='Produit concerné')

    # Contenu
    description = fields.Html('Description', required=True)
    category = fields.Selection([
        # Catégories Store (existantes - compatibilité)
        ('order', 'Problème commande'),
        ('product', 'Problème produit'),
        ('delivery', 'Problème livraison'),
        ('return', 'Demande retour'),
        ('refund', 'Demande remboursement'),
        ('payment', 'Problème paiement'),
        ('account', 'Problème compte'),
        # Nouvelles catégories génériques
        ('technical', 'Support technique'),
        ('billing', 'Facturation/Abonnement'),
        ('feature_request', 'Demande fonctionnalité'),
        ('bug', 'Signalement bug'),
        ('question', 'Question générale'),
        ('other', 'Autre'),
    ], string='Catégorie', required=True, default='other')

    priority = fields.Selection([
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('urgent', 'Urgente'),
    ], string='Priorité', default='medium', tracking=True)

    # Statut
    state = fields.Selection([
        ('new', 'Nouveau'),
        ('open', 'En cours'),
        ('pending', 'En attente client'),
        ('resolved', 'Résolu'),
        ('closed', 'Fermé'),
    ], string='Statut', default='new', tracking=True)

    # Assignation
    assigned_to = fields.Many2one('res.users', string='Assigné à', tracking=True)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True
    )

    # Résolution
    resolution = fields.Html('Résolution')
    resolution_date = fields.Datetime('Date résolution')

    # Pièces jointes
    attachment_ids = fields.Many2many(
        'ir.attachment',
        string='Pièces jointes'
    )

    # Messages/Réponses
    message_ids = fields.One2many(
        'quelyos.ticket.message',
        'ticket_id',
        string='Messages'
    )
    message_count = fields.Integer('Nb messages', compute='_compute_message_count')

    # Satisfaction
    satisfaction_rating = fields.Selection([
        ('1', 'Très insatisfait'),
        ('2', 'Insatisfait'),
        ('3', 'Neutre'),
        ('4', 'Satisfait'),
        ('5', 'Très satisfait'),
    ], string='Satisfaction')
    satisfaction_comment = fields.Text('Commentaire satisfaction')

    # Champs Super Admin
    internal_notes = fields.Html(
        'Notes internes',
        help='Notes visibles uniquement par les administrateurs'
    )
    is_visible_to_customer = fields.Boolean(
        'Visible client',
        default=True,
        help='Si False, ticket uniquement visible par Super Admin'
    )
    source = fields.Selection([
        ('dashboard', 'Dashboard Client'),
        ('ecommerce', 'Site E-commerce'),
        ('store', 'Module Boutique'),
        ('other', 'Autre'),
    ], string='Source', default='dashboard')

    # Délais
    response_time = fields.Float('Temps première réponse (h)', compute='_compute_times')
    resolution_time = fields.Float('Temps résolution (h)', compute='_compute_times')

    @api.model
    def create(self, vals):
        """Surcharge create pour générer séquence et publier événement WebSocket"""
        if vals.get('name', _('New')) == _('New'):
            vals['name'] = self.env['ir.sequence'].next_by_code('quelyos.ticket') or _('New')

        ticket = super().create(vals)

        # Publier événement WebSocket
        ticket._publish_ws_event('ticket.created', {
            'ticketId': ticket.id,
            'tenantId': ticket.company_id.id,
            'tenantName': ticket.company_id.name,
            'priority': ticket.priority,
            'subject': ticket.subject,
            'category': ticket.category,
        })

        return ticket

    @api.depends('message_ids')
    def _compute_message_count(self):
        for ticket in self:
            ticket.message_count = len(ticket.message_ids)

    @api.depends('create_date', 'message_ids', 'resolution_date')
    def _compute_times(self):
        for ticket in self:
            ticket.response_time = 0
            ticket.resolution_time = 0

            if ticket.create_date:
                # Temps première réponse (premier message staff)
                staff_messages = ticket.message_ids.filtered(lambda m: m.is_staff)
                if staff_messages:
                    first_response = min(staff_messages, key=lambda m: m.create_date)
                    delta = first_response.create_date - ticket.create_date
                    ticket.response_time = round(delta.total_seconds() / 3600, 2)

                # Temps résolution
                if ticket.resolution_date:
                    delta = ticket.resolution_date - ticket.create_date
                    ticket.resolution_time = round(delta.total_seconds() / 3600, 2)

    def action_open(self):
        self.write({'state': 'open'})

    def action_pending(self):
        self.write({'state': 'pending'})

    def action_resolve(self):
        self.write({
            'state': 'resolved',
            'resolution_date': fields.Datetime.now(),
        })

    def action_close(self):
        self.write({'state': 'closed'})

    def action_reopen(self):
        self.write({
            'state': 'open',
            'resolution_date': False,
        })

    def write(self, vals):
        """Surcharge write pour publier changements WebSocket"""
        result = super().write(vals)

        if 'state' in vals or 'priority' in vals:
            for ticket in self:
                ticket._publish_ws_event('ticket.updated', {
                    'ticketId': ticket.id,
                    'state': ticket.state,
                    'priority': ticket.priority,
                })

        return result

    def _publish_ws_event(self, event, data):
        """Publier événement WebSocket via bus.bus"""
        self.env['bus.bus']._sendone(
            'tickets',  # channel
            event,      # event type
            data        # payload
        )

    def to_dict(self):
        """Sérialisation pour API client"""
        self.ensure_one()
        return {
            'id': self.id,
            'reference': self.name,
            'subject': self.subject,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'state': self.state,
            'assignedTo': self.assigned_to.name if self.assigned_to else None,
            'messageCount': self.message_count,
            'createdAt': self.create_date.isoformat() if self.create_date else None,
            'updatedAt': self.write_date.isoformat() if self.write_date else None,
        }

    def to_dict_super_admin(self):
        """Sérialisation enrichie pour Super Admin"""
        self.ensure_one()
        data = self.to_dict()
        data.update({
            'tenantId': self.company_id.id,
            'tenantName': self.company_id.name,
            'customerId': self.partner_id.id,
            'customerName': self.partner_id.name,
            'customerEmail': self.email,
            'internalNotes': self.internal_notes,
            'isVisibleToCustomer': self.is_visible_to_customer,
            'orderId': self.order_id.id if self.order_id else None,
            'orderName': self.order_id.name if self.order_id else None,
            'productId': self.product_id.id if self.product_id else None,
            'productName': self.product_id.name if self.product_id else None,
            'satisfactionRating': self.satisfaction_rating,
            'satisfactionComment': self.satisfaction_comment,
            'resolution': self.resolution,
            'responseTime': self.response_time,
            'resolutionTime': self.resolution_time,
            'resolvedAt': self.resolution_date.isoformat() if self.resolution_date else None,
        })
        return data


class TicketMessage(models.Model):
    _name = 'quelyos.ticket.message'
    _description = 'Message Ticket'
    _order = 'create_date'

    ticket_id = fields.Many2one(
        'quelyos.ticket',
        string='Ticket',
        required=True,
        ondelete='cascade'
    )
    author_id = fields.Many2one(
        'res.partner',
        string='Auteur',
        required=True,
        default=lambda self: self.env.user.partner_id
    )
    content = fields.Html('Message', required=True)
    is_staff = fields.Boolean(
        'Message staff',
        compute='_compute_is_staff',
        store=True
    )
    attachment_ids = fields.Many2many('ir.attachment', string='Pièces jointes')

    @api.model
    def create(self, vals):
        """Surcharge create pour publier événement WebSocket"""
        message = super().create(vals)

        # Publier événement
        message.ticket_id._publish_ws_event('ticket.replied', {
            'ticketId': message.ticket_id.id,
            'messageId': message.id,
            'authorName': message.author_id.name,
            'isStaff': message.is_staff,
        })

        return message

    @api.depends('author_id')
    def _compute_is_staff(self):
        for msg in self:
            user = self.env['res.users'].search([
                ('partner_id', '=', msg.author_id.id)
            ], limit=1)
            msg.is_staff = bool(user) and not user._is_public()

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'authorId': self.author_id.id,
            'authorName': self.author_id.name,
            'content': self.content,
            'isStaff': self.is_staff,
            'createdAt': self.create_date.isoformat() if self.create_date else None,
        }
