# -*- coding: utf-8 -*-
from odoo import models, fields, api


class ContactList(models.Model):
    _name = 'quelyos.contact.list'
    _description = 'Marketing Contact List'
    _order = 'create_date desc'

    name = fields.Char(string='Nom', required=True)
    description = fields.Text(string='Description')
    list_type = fields.Selection([
        ('static', 'Statique'),
        ('dynamic', 'Dynamique'),
    ], string='Type', default='static', required=True)

    # Contacts (Many2many avec res.partner)
    contact_ids = fields.Many2many(
        'res.partner',
        'quelyos_contact_list_partner_rel',
        'list_id',
        'partner_id',
        string='Contacts'
    )
    contact_count = fields.Integer(
        string='Nombre de contacts',
        compute='_compute_contact_count',
        store=True
    )

    # Filtres dynamiques
    filter_domain = fields.Char(
        string='Filtre dynamique',
        help='Domaine de recherche pour listes dynamiques'
    )

    # Métadonnées
    active = fields.Boolean(default=True)
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        default=lambda self: self.env.company
    )

    @api.depends('contact_ids')
    def _compute_contact_count(self):
        for record in self:
            if record.list_type == 'dynamic' and record.filter_domain:
                try:
                    domain = eval(record.filter_domain) if record.filter_domain else []
                    record.contact_count = self.env['res.partner'].search_count(domain)
                except Exception:
                    record.contact_count = 0
            else:
                record.contact_count = len(record.contact_ids)

    def get_contacts(self):
        """Retourne les contacts de la liste (statique ou dynamique)"""
        self.ensure_one()
        if self.list_type == 'dynamic' and self.filter_domain:
            try:
                domain = eval(self.filter_domain)
                return self.env['res.partner'].search(domain)
            except Exception:
                return self.env['res.partner']
        return self.contact_ids

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description or '',
            'list_type': self.list_type,
            'contact_count': self.contact_count,
            'filter_domain': self.filter_domain or '',
            'created_at': self.create_date.isoformat() if self.create_date else None,
            'updated_at': self.write_date.isoformat() if self.write_date else None,
        }
