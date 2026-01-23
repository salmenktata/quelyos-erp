# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class ProductReview(models.Model):
    _name = 'product.review'
    _description = 'Avis Produit'
    _order = 'create_date desc'

    product_id = fields.Many2one('product.product', 'Produit variant', required=True, ondelete='cascade', index=True)
    product_tmpl_id = fields.Many2one('product.template', 'Template Produit',
                                       related='product_id.product_tmpl_id', store=True, index=True)
    partner_id = fields.Many2one('res.partner', 'Client', required=True, ondelete='cascade', index=True)
    order_id = fields.Many2one('sale.order', 'Commande', ondelete='set null',
                                help='Commande d\'origine (optionnel, pour vérifier achat vérifié)')

    # Contenu avis
    rating = fields.Integer('Note', required=True, help='Note de 1 à 5 étoiles')
    title = fields.Char('Titre', required=True, size=100)
    comment = fields.Text('Commentaire', required=True)

    # Métadonnées
    state = fields.Selection([
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ], default='pending', required=True, string='Statut')

    is_verified_purchase = fields.Boolean('Achat vérifié', compute='_compute_verified_purchase', store=True)
    helpful_count = fields.Integer('Nombre de "Utile"', default=0)
    created_date = fields.Datetime('Date création', default=fields.Datetime.now, readonly=True)
    approved_date = fields.Datetime('Date approbation', readonly=True)
    approved_by = fields.Many2one('res.users', 'Approuvé par', readonly=True)

    # Réponse vendeur
    vendor_response = fields.Text('Réponse vendeur')
    vendor_response_date = fields.Datetime('Date réponse')

    _sql_constraints = [
        ('rating_check', 'CHECK(rating >= 1 AND rating <= 5)',
         'La note doit être entre 1 et 5'),
    ]

    @api.depends('order_id', 'partner_id', 'product_id')
    def _compute_verified_purchase(self):
        """Vérifie si l'avis provient d'un achat réel."""
        for review in self:
            if review.order_id:
                # Vérifier que la commande contient le produit et est confirmée
                has_product = any(
                    line.product_id == review.product_id
                    for line in review.order_id.order_line
                )
                review.is_verified_purchase = (
                    has_product and
                    review.order_id.state in ['sale', 'done']
                )
            else:
                # Chercher si le client a déjà acheté ce produit
                confirmed_orders = self.env['sale.order'].search([
                    ('partner_id', '=', review.partner_id.id),
                    ('state', 'in', ['sale', 'done']),
                ])

                has_bought = any(
                    line.product_id == review.product_id
                    for order in confirmed_orders
                    for line in order.order_line
                )

                review.is_verified_purchase = has_bought

    def get_api_data(self):
        """Retourne les données formatées pour l'API."""
        self.ensure_one()
        return {
            'id': self.id,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'author': {
                'name': self.partner_id.name,
                'id': self.partner_id.id,
            },
            'is_verified_purchase': self.is_verified_purchase,
            'helpful_count': self.helpful_count,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'vendor_response': self.vendor_response or None,
            'vendor_response_date': self.vendor_response_date.isoformat() if self.vendor_response_date else None,
        }

    def action_approve(self):
        """Approuve l'avis."""
        self.write({
            'state': 'approved',
            'approved_date': fields.Datetime.now(),
            'approved_by': self.env.user.id,
        })

    def action_reject(self):
        """Rejette l'avis."""
        self.write({
            'state': 'rejected',
        })

    def action_mark_helpful(self):
        """Incrémente le compteur "utile"."""
        self.helpful_count += 1

    @api.model
    def create_review(self, product_id, rating, title, comment, partner_id, order_id=None):
        """
        Crée un nouvel avis produit.

        Returns:
            dict: {'success': bool, 'review': dict, 'message': str}
        """
        # Vérifier que le client n'a pas déjà laissé un avis
        existing_review = self.search([
            ('product_id', '=', product_id),
            ('partner_id', '=', partner_id),
        ])

        if existing_review:
            return {
                'success': False,
                'message': _("Vous avez déjà laissé un avis pour ce produit"),
            }

        # Créer l'avis
        review = self.create({
            'product_id': product_id,
            'partner_id': partner_id,
            'order_id': order_id,
            'rating': rating,
            'title': title,
            'comment': comment,
            'state': 'pending',
        })

        return {
            'success': True,
            'message': _("Merci pour votre avis ! Il sera publié après modération."),
            'review': review.get_api_data(),
        }


# Extension product.template pour afficher les avis
class ProductTemplate(models.Model):
    _inherit = 'product.template'

    review_ids = fields.One2many('product.review', 'product_tmpl_id', 'Avis',
                                   domain=[('state', '=', 'approved')])
    review_count = fields.Integer('Nombre d\'avis', compute='_compute_review_stats')
    avg_rating = fields.Float('Note moyenne', compute='_compute_review_stats', digits=(3, 2))
    rating_distribution = fields.Char('Distribution notes', compute='_compute_review_stats')

    @api.depends('review_ids', 'review_ids.rating', 'review_ids.state')
    def _compute_review_stats(self):
        """Calcule les statistiques d'avis."""
        for product in self:
            approved_reviews = product.review_ids.filtered(lambda r: r.state == 'approved')

            product.review_count = len(approved_reviews)

            if approved_reviews:
                ratings = approved_reviews.mapped('rating')
                product.avg_rating = sum(ratings) / len(ratings)

                # Distribution (nombre par étoile)
                distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
                for rating in ratings:
                    distribution[rating] += 1

                # Format: "5:10,4:5,3:2,2:1,1:0"
                product.rating_distribution = ','.join(
                    f"{star}:{count}" for star, count in sorted(distribution.items(), reverse=True)
                )
            else:
                product.avg_rating = 0.0
                product.rating_distribution = '5:0,4:0,3:0,2:0,1:0'

    def get_reviews_data(self, limit=10, offset=0, rating_filter=None):
        """
        Récupère les avis du produit pour l'API.

        Args:
            limit: Nombre max d'avis
            offset: Décalage pagination
            rating_filter: Filtrer par note (1-5) ou None

        Returns:
            dict: {'reviews': [], 'total': int, 'avg_rating': float, 'distribution': {}}
        """
        self.ensure_one()

        domain = [
            ('product_tmpl_id', '=', self.id),
            ('state', '=', 'approved'),
        ]

        if rating_filter:
            domain.append(('rating', '=', rating_filter))

        total = self.env['product.review'].search_count(domain)
        reviews = self.env['product.review'].search(domain, limit=limit, offset=offset, order='create_date desc')

        # Parser distribution
        distribution = {}
        if self.rating_distribution:
            for item in self.rating_distribution.split(','):
                star, count = item.split(':')
                distribution[int(star)] = int(count)

        return {
            'reviews': [review.get_api_data() for review in reviews],
            'total': total,
            'avg_rating': self.avg_rating,
            'review_count': self.review_count,
            'distribution': distribution,
        }
