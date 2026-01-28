# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class LoyaltyProgram(models.Model):
    _name = 'quelyos.loyalty.program'
    _description = 'Programme de Fidélité'

    name = fields.Char('Nom', required=True)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True
    )
    is_active = fields.Boolean('Actif', default=True)

    # Règles d'accumulation
    points_per_currency = fields.Float(
        'Points par unité monétaire',
        default=1.0,
        help="Ex: 1 point pour chaque 1 TND dépensé"
    )
    currency_per_point = fields.Float(
        'Unité monétaire par point',
        default=1.0,
        help="Ex: 1 TND de dépense = X points"
    )

    # Règles de rédemption
    points_value = fields.Float(
        'Valeur d\'un point (TND)',
        default=0.01,
        help="Ex: 100 points = 1 TND"
    )
    min_points_redeem = fields.Integer(
        'Points minimum pour utilisation',
        default=100
    )

    # Niveaux
    level_ids = fields.One2many(
        'quelyos.loyalty.level',
        'program_id',
        string='Niveaux'
    )

    # Statistiques
    member_count = fields.Integer('Nb membres', compute='_compute_stats')
    total_points_issued = fields.Integer('Points émis', compute='_compute_stats')

    @api.depends('company_id')
    def _compute_stats(self):
        for program in self:
            members = self.env['quelyos.loyalty.member'].search([
                ('program_id', '=', program.id)
            ])
            program.member_count = len(members)
            program.total_points_issued = sum(m.total_points_earned for m in members)

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'isActive': self.is_active,
            'pointsPerCurrency': self.points_per_currency,
            'pointsValue': self.points_value,
            'minPointsRedeem': self.min_points_redeem,
            'memberCount': self.member_count,
            'levels': [level.to_dict() for level in self.level_ids],
        }


class LoyaltyLevel(models.Model):
    _name = 'quelyos.loyalty.level'
    _description = 'Niveau Fidélité'
    _order = 'min_points'

    name = fields.Char('Nom', required=True, translate=True)
    program_id = fields.Many2one(
        'quelyos.loyalty.program',
        string='Programme',
        required=True,
        ondelete='cascade'
    )

    # Seuils
    min_points = fields.Integer('Points minimum', required=True)

    # Avantages
    points_multiplier = fields.Float('Multiplicateur points', default=1.0)
    discount_percent = fields.Float('% Réduction permanente', default=0)
    free_shipping = fields.Boolean('Livraison gratuite', default=False)
    early_access = fields.Boolean('Accès anticipé ventes', default=False)
    priority_support = fields.Boolean('Support prioritaire', default=False)

    # Visuel
    color = fields.Char('Couleur', default='#6b7280')
    icon = fields.Char('Icône', default='Star')
    badge_image = fields.Binary('Badge', attachment=True)

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'name': self.name,
            'minPoints': self.min_points,
            'pointsMultiplier': self.points_multiplier,
            'discountPercent': self.discount_percent,
            'freeShipping': self.free_shipping,
            'earlyAccess': self.early_access,
            'prioritySupport': self.priority_support,
            'color': self.color,
            'icon': self.icon,
        }


class LoyaltyMember(models.Model):
    _name = 'quelyos.loyalty.member'
    _description = 'Membre Fidélité'
    _order = 'current_points desc'

    partner_id = fields.Many2one(
        'res.partner',
        string='Client',
        required=True,
        index=True
    )
    program_id = fields.Many2one(
        'quelyos.loyalty.program',
        string='Programme',
        required=True,
        index=True
    )
    company_id = fields.Many2one(
        related='program_id.company_id',
        store=True,
        index=True
    )

    # Points
    current_points = fields.Integer('Points actuels', default=0)
    total_points_earned = fields.Integer('Total points gagnés', default=0)
    total_points_spent = fields.Integer('Total points dépensés', default=0)

    # Niveau
    level_id = fields.Many2one(
        'quelyos.loyalty.level',
        string='Niveau',
        compute='_compute_level',
        store=True
    )

    # Historique
    transaction_ids = fields.One2many(
        'quelyos.loyalty.transaction',
        'member_id',
        string='Transactions'
    )

    # Dates
    join_date = fields.Date('Date adhésion', default=fields.Date.today)

    _sql_constraints = [
        ('unique_member', 'UNIQUE(partner_id, program_id)',
         'Un client ne peut adhérer qu\'une fois au programme'),
    ]

    @api.depends('total_points_earned', 'program_id.level_ids')
    def _compute_level(self):
        for member in self:
            levels = member.program_id.level_ids.sorted('min_points', reverse=True)
            member.level_id = False
            for level in levels:
                if member.total_points_earned >= level.min_points:
                    member.level_id = level
                    break

    def add_points(self, points, description, order_id=None):
        """Ajouter des points"""
        self.ensure_one()
        if points <= 0:
            return

        self.env['quelyos.loyalty.transaction'].create({
            'member_id': self.id,
            'transaction_type': 'earn',
            'points': points,
            'description': description,
            'order_id': order_id,
        })

        self.write({
            'current_points': self.current_points + points,
            'total_points_earned': self.total_points_earned + points,
        })

    def use_points(self, points, description, order_id=None):
        """Utiliser des points"""
        self.ensure_one()
        if points <= 0:
            return
        if points > self.current_points:
            raise ValidationError(_('Points insuffisants'))

        self.env['quelyos.loyalty.transaction'].create({
            'member_id': self.id,
            'transaction_type': 'redeem',
            'points': points,
            'description': description,
            'order_id': order_id,
        })

        self.write({
            'current_points': self.current_points - points,
            'total_points_spent': self.total_points_spent + points,
        })

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'partnerId': self.partner_id.id,
            'partnerName': self.partner_id.name,
            'currentPoints': self.current_points,
            'totalPointsEarned': self.total_points_earned,
            'totalPointsSpent': self.total_points_spent,
            'levelId': self.level_id.id if self.level_id else None,
            'levelName': self.level_id.name if self.level_id else None,
            'joinDate': self.join_date.isoformat() if self.join_date else None,
        }


class LoyaltyTransaction(models.Model):
    _name = 'quelyos.loyalty.transaction'
    _description = 'Transaction Fidélité'
    _order = 'create_date desc'

    member_id = fields.Many2one(
        'quelyos.loyalty.member',
        string='Membre',
        required=True,
        ondelete='cascade'
    )
    transaction_type = fields.Selection([
        ('earn', 'Points gagnés'),
        ('redeem', 'Points utilisés'),
        ('expire', 'Points expirés'),
        ('adjust', 'Ajustement'),
    ], string='Type', required=True)
    points = fields.Integer('Points', required=True)
    description = fields.Char('Description')
    order_id = fields.Many2one('sale.order', string='Commande liée')

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'type': self.transaction_type,
            'points': self.points,
            'description': self.description,
            'orderId': self.order_id.id if self.order_id else None,
            'date': self.create_date.isoformat() if self.create_date else None,
        }
