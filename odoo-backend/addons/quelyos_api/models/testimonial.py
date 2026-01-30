# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import ValidationError
from odoo.tools.translate import _


class Testimonial(models.Model):
    _name = 'quelyos.testimonial'
    _description = 'Témoignage Client'
    _order = 'sequence, create_date desc'

    # Client
    customer_name = fields.Char('Nom client', required=True)
    customer_title = fields.Char('Titre/Fonction', help="Ex: CEO de XYZ, Client fidèle")
    customer_avatar = fields.Binary('Photo', attachment=True)
    customer_company = fields.Char('Entreprise')

    # Témoignage
    content = fields.Text('Témoignage', required=True, translate=True)
    rating = fields.Integer('Note', default=5)

    # Configuration
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        required=True,
        default=lambda self: self.env.company,
        index=True
    )
    sequence = fields.Integer('Ordre', default=10)
    is_published = fields.Boolean('Publié', default=False)
    is_featured = fields.Boolean('Mise en avant', default=False)

    # Placement
    display_on = fields.Selection([
        ('homepage', 'Page d\'accueil'),
        ('product', 'Pages produit'),
        ('checkout', 'Checkout'),
        ('all', 'Partout'),
    ], string='Afficher sur', default='homepage')

    @api.constrains('rating')
    def _check_rating_range(self):
        """Contrainte: La note doit être entre 1 et 5"""
        for record in self:
            if not (rating >= 1 and rating <= 5):
                raise ValidationError(_('La note doit être entre 1 et 5'))


    def get_avatar_url(self):
        self.ensure_one()
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        if self.customer_avatar:
            return f'{base_url}/web/image/quelyos.testimonial/{self.id}/customer_avatar'
        return None

    def to_dict(self):
        self.ensure_one()
        return {
            'id': self.id,
            'authorName': self.customer_name,
            'authorTitle': self.customer_title,
            'authorCompany': self.customer_company,
            'authorPhoto': self.get_avatar_url(),
            'content': self.content,
            'rating': self.rating,
            'isPublished': self.is_published,
            'isFeatured': self.is_featured,
            'displayOn': self.display_on,
        }
