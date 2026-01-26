from odoo import models, fields, api
from odoo.models import Constraint


class QuelyosCategory(models.Model):
    _name = 'quelyos.category'
    _description = 'Catégorie Finance Quelyos'
    _order = 'name'

    name = fields.Char(string='Nom', required=True, index=True)
    kind = fields.Selection([
        ('income', 'Revenu'),
        ('expense', 'Dépense'),
    ], string='Type', required=True, default='expense')
    color = fields.Char(string='Couleur', help='Code couleur hex (ex: #3B82F6)')
    icon = fields.Char(string='Icône', help='Nom de l\'icône (ex: wallet, shopping-cart)')
    parent_id = fields.Many2one('quelyos.category', string='Catégorie parente', ondelete='set null')
    child_ids = fields.One2many('quelyos.category', 'parent_id', string='Sous-catégories')
    company_id = fields.Many2one(
        'res.company', string='Société',
        default=lambda self: self.env.company,
        required=True
    )
    active = fields.Boolean(default=True)

    _name_company_uniq = Constraint(
        'unique(name, company_id)',
        'Le nom de la catégorie doit être unique par société.'
    )

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'kind': self.kind,
            'type': self.kind,  # Alias pour compatibilité frontend
            'color': self.color,
            'icon': self.icon,
            'parentId': self.parent_id.id if self.parent_id else None,
        }
