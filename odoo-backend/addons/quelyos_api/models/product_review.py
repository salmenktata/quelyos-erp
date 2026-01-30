# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from odoo.tools.translate import _


class ProductReview(models.Model):
    _name = 'quelyos.product.review'
    _description = 'Avis Produit'
    _order = 'create_date desc'
    _inherit = ['mail.thread']

    # Identification
    name = fields.Char('Titre', required=True)
    product_id = fields.Many2one(
        'product.template',
        string='Produit',
        required=True,
        ondelete='cascade',
        index=True
    )
    partner_id = fields.Many2one(
        'res.partner',
        string='Client',
        required=True,
        index=True
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True
    )

    # Contenu
    rating = fields.Integer(
        'Note',
        required=True,
        default=5,
        help="Note de 1 à 5 étoiles"
    )
    comment = fields.Text('Commentaire', required=True)
    pros = fields.Text('Points positifs')
    cons = fields.Text('Points négatifs')

    # Images (optionnel)
    image_ids = fields.One2many(
        'quelyos.review.image',
        'review_id',
        string='Photos'
    )

    # Modération
    state = fields.Selection([
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ], string='Statut', default='pending', tracking=True)

    moderated_by = fields.Many2one('res.users', string='Modéré par')
    moderated_date = fields.Datetime('Date modération')
    rejection_reason = fields.Text('Raison du rejet')

    # Réponse vendeur
    seller_reply = fields.Text('Réponse vendeur')
    seller_reply_date = fields.Datetime('Date réponse')
    seller_reply_by = fields.Many2one('res.users', string='Répondu par')

    # Statistiques
    helpful_count = fields.Integer('Votes utiles', default=0)
    reported_count = fields.Integer('Signalements', default=0)
    is_verified_purchase = fields.Boolean(
        'Achat vérifié',
        compute='_compute_verified_purchase',
        store=True
    )

    @api.constrains('product_id', 'partner_id', 'company_id')
    def _check_unique_review(self):
        """Contrainte: Un client ne peut laisser qu'un seul avis par produit"""
        for record in self:
            # Chercher un doublon
            duplicate = self.search([
                ('product_id', '=', record.product_id.id),
                ('partner_id', '=', record.partner_id.id),
                ('company_id', '=', record.company_id.id),
                ('id', '!=', record.id)
            ], limit=1)

            if duplicate:
                raise ValidationError(_('Un client ne peut laisser qu\'un seul avis par produit'))

    @api.depends('partner_id', 'product_id')

    @api.constrains('rating')
    def _check_rating_range(self):
        """Contrainte: La note doit être entre 1 et 5"""
        for record in self:
            if not (record.rating >= 1 and record.rating <= 5):
                raise ValidationError(_('La note doit être entre 1 et 5'))


    def _compute_verified_purchase(self):
        """Vérifie si le client a acheté le produit"""
        for review in self:
            if review.partner_id and review.product_id:
                order_line = self.env['sale.order.line'].sudo().search([
                    ('order_id.partner_id', '=', review.partner_id.id),
                    ('product_id.product_tmpl_id', '=', review.product_id.id),
                    ('order_id.state', 'in', ['sale', 'done'])
                ], limit=1)
                review.is_verified_purchase = bool(order_line)
            else:
                review.is_verified_purchase = False

    def action_approve(self):
        """Approuver l'avis"""
        self.write({
            'state': 'approved',
            'moderated_by': self.env.user.id,
            'moderated_date': fields.Datetime.now(),
        })

    def action_reject(self):
        """Rejeter l'avis"""
        self.write({
            'state': 'rejected',
            'moderated_by': self.env.user.id,
            'moderated_date': fields.Datetime.now(),
        })

    def action_reply(self, reply_text):
        """Ajouter une réponse vendeur"""
        self.write({
            'seller_reply': reply_text,
            'seller_reply_date': fields.Datetime.now(),
            'seller_reply_by': self.env.user.id,
        })

    def to_dict(self):
        """Convertit en dictionnaire pour l'API"""
        self.ensure_one()
        return {
            'id': self.id,
            'title': self.name,
            'productId': self.product_id.id,
            'productName': self.product_id.name,
            'customerId': self.partner_id.id,
            'customerName': self.partner_id.name,
            'rating': self.rating,
            'comment': self.comment,
            'pros': self.pros,
            'cons': self.cons,
            'state': self.state,
            'isVerifiedPurchase': self.is_verified_purchase,
            'helpfulCount': self.helpful_count,
            'sellerReply': self.seller_reply,
            'sellerReplyDate': self.seller_reply_date.isoformat() if self.seller_reply_date else None,
            'createdAt': self.create_date.isoformat() if self.create_date else None,
            'images': [{'id': img.id, 'url': img.image_url} for img in self.image_ids],
        }


class ReviewImage(models.Model):
    _name = 'quelyos.review.image'
    _description = 'Image Avis'

    review_id = fields.Many2one(
        'quelyos.product.review',
        string='Avis',
        required=True,
        ondelete='cascade'
    )
    image = fields.Binary('Image', required=True, attachment=True)
    image_url = fields.Char('URL Image', compute='_compute_image_url')

    @api.depends('image')
    def _compute_image_url(self):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        for img in self:
            if img.image:
                img.image_url = f'{base_url}/web/image/quelyos.review.image/{img.id}/image'
            else:
                img.image_url = False
