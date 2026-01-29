# -*- coding: utf-8 -*-
"""
SMS Template Model - Fonctionnalité Premium Enterprise

Équivalent Odoo Enterprise (payant) mais gratuit dans Quelyos Suite.

Permet de créer des templates SMS réutilisables avec :
- Variables dynamiques ({{partner.name}}, {{order.total}}, etc.)
- Prévisualisation avant envoi
- Catégorisation (transactionnel, marketing, notification)
- Compteur caractères avec limite
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import re


class SmsTemplate(models.Model):
    _name = 'quelyos.sms.template'
    _description = 'SMS Template (Premium)'
    _order = 'name'

    name = fields.Char(
        string='Nom Template',
        required=True,
        help='Nom descriptif du template SMS'
    )

    category = fields.Selection([
        ('transactional', 'Transactionnel'),
        ('marketing', 'Marketing'),
        ('notification', 'Notification'),
        ('reminder', 'Relance'),
        ('confirmation', 'Confirmation'),
        ('custom', 'Personnalisé'),
    ], string='Catégorie', default='marketing', required=True)

    message = fields.Text(
        string='Message SMS',
        required=True,
        help='Contenu du SMS. Variables disponibles: {{partner.name}}, {{partner.mobile}}, '
             '{{order.name}}, {{order.total}}, {{company.name}}, etc.'
    )

    char_count = fields.Integer(
        string='Nombre Caractères',
        compute='_compute_char_count',
        help='Nombre de caractères du message (max 160 pour 1 SMS standard)'
    )

    sms_count = fields.Integer(
        string='Nombre SMS',
        compute='_compute_sms_count',
        help='Nombre de SMS nécessaires pour envoyer ce message (1 SMS = 160 caractères)'
    )

    variables_found = fields.Char(
        string='Variables Détectées',
        compute='_compute_variables_found',
        help='Liste des variables dynamiques trouvées dans le message'
    )

    preview_text = fields.Text(
        string='Aperçu',
        compute='_compute_preview_text',
        help='Prévisualisation du message avec valeurs d\'exemple'
    )

    usage_count = fields.Integer(
        string='Utilisations',
        default=0,
        help='Nombre de fois que ce template a été utilisé'
    )

    active = fields.Boolean(
        string='Actif',
        default=True
    )

    company_id = fields.Many2one(
        'res.company',
        string='Société',
        default=lambda self: self.env.company
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('message')
    def _compute_char_count(self):
        """Calcul du nombre de caractères (sans les variables)"""
        for template in self:
            if template.message:
                # Remplacer variables par valeurs moyennes pour estimation
                message = template.message
                # {{partner.name}} → ~15 chars, {{order.total}} → ~10 chars
                message = re.sub(r'\{\{partner\.name\}\}', 'X' * 15, message)
                message = re.sub(r'\{\{partner\.mobile\}\}', 'X' * 12, message)
                message = re.sub(r'\{\{order\.name\}\}', 'X' * 10, message)
                message = re.sub(r'\{\{order\.total\}\}', 'X' * 8, message)
                message = re.sub(r'\{\{company\.name\}\}', 'X' * 20, message)
                message = re.sub(r'\{\{[^}]+\}\}', 'X' * 10, message)  # Autres variables
                template.char_count = len(message)
            else:
                template.char_count = 0

    @api.depends('char_count')
    def _compute_sms_count(self):
        """Calcul du nombre de SMS nécessaires (160 chars/SMS)"""
        for template in self:
            if template.char_count > 0:
                # 1 SMS = 160 caractères, 2 SMS = 306 caractères, etc.
                if template.char_count <= 160:
                    template.sms_count = 1
                else:
                    # Messages concaténés : 153 chars par segment
                    template.sms_count = 1 + ((template.char_count - 160 + 152) // 153)
            else:
                template.sms_count = 0

    @api.depends('message')
    def _compute_variables_found(self):
        """Détecte les variables dynamiques dans le message"""
        for template in self:
            if template.message:
                variables = re.findall(r'\{\{([^}]+)\}\}', template.message)
                template.variables_found = ', '.join(variables) if variables else ''
            else:
                template.variables_found = ''

    @api.depends('message')
    def _compute_preview_text(self):
        """Génère un aperçu avec valeurs d'exemple"""
        for template in self:
            if template.message:
                preview = template.message
                # Remplacer par valeurs d'exemple
                replacements = {
                    r'\{\{partner\.name\}\}': 'Jean Dupont',
                    r'\{\{partner\.mobile\}\}': '+33612345678',
                    r'\{\{order\.name\}\}': 'SO001',
                    r'\{\{order\.total\}\}': '149.90€',
                    r'\{\{company\.name\}\}': self.env.company.name or 'Quelyos',
                    r'\{\{product\.name\}\}': 'Produit Exemple',
                }
                for pattern, value in replacements.items():
                    preview = re.sub(pattern, value, preview)
                template.preview_text = preview
            else:
                template.preview_text = ''

    # ═══════════════════════════════════════════════════════════════════════════
    # VALIDATION
    # ═══════════════════════════════════════════════════════════════════════════

    @api.constrains('message')
    def _check_message_length(self):
        """Validation : message ne doit pas être trop long (max 5 SMS)"""
        for template in self:
            if template.char_count > 765:  # 5 SMS × 153 chars
                raise ValidationError(_(
                    "Le message est trop long (%d caractères, %d SMS). "
                    "Maximum recommandé : 765 caractères (5 SMS)."
                ) % (template.char_count, template.sms_count))

    @api.constrains('message')
    def _check_variables_valid(self):
        """Validation : vérifier que les variables sont valides"""
        valid_variables = [
            'partner.name', 'partner.mobile', 'partner.email',
            'order.name', 'order.total', 'order.date',
            'company.name', 'company.phone',
            'product.name', 'product.price',
        ]

        for template in self:
            if template.message:
                variables = re.findall(r'\{\{([^}]+)\}\}', template.message)
                invalid = [v for v in variables if v not in valid_variables]
                if invalid:
                    raise ValidationError(_(
                        "Variables invalides détectées : %s\n\n"
                        "Variables disponibles :\n%s"
                    ) % (', '.join(invalid), '\n'.join(f"  • {{{{{v}}}}}" for v in valid_variables)))

    # ═══════════════════════════════════════════════════════════════════════════
    # BUSINESS METHODS
    # ═══════════════════════════════════════════════════════════════════════════

    def render_message(self, partner=None, order=None, product=None, custom_vars=None):
        """
        Génère le message SMS avec les variables remplacées.

        Args:
            partner: res.partner (optionnel)
            order: sale.order (optionnel)
            product: product.product (optionnel)
            custom_vars: dict de variables supplémentaires (optionnel)

        Returns:
            str: Message SMS final avec variables remplacées
        """
        self.ensure_one()

        message = self.message

        # Variables partner
        if partner:
            message = message.replace('{{partner.name}}', partner.name or '')
            message = message.replace('{{partner.mobile}}', partner.mobile or '')
            message = message.replace('{{partner.email}}', partner.email or '')

        # Variables order
        if order:
            message = message.replace('{{order.name}}', order.name or '')
            message = message.replace('{{order.total}}', f"{order.amount_total:.2f}€" if order.amount_total else '0€')
            message = message.replace('{{order.date}}', order.date_order.strftime('%d/%m/%Y') if order.date_order else '')

        # Variables product
        if product:
            message = message.replace('{{product.name}}', product.name or '')
            message = message.replace('{{product.price}}', f"{product.list_price:.2f}€" if product.list_price else '0€')

        # Variables company
        message = message.replace('{{company.name}}', self.env.company.name or '')
        message = message.replace('{{company.phone}}', self.env.company.phone or '')

        # Variables custom
        if custom_vars:
            for key, value in custom_vars.items():
                message = message.replace(f'{{{{{key}}}}}', str(value))

        return message

    def increment_usage(self):
        """Incrémenter compteur d'utilisation"""
        for template in self:
            template.usage_count += 1

    def to_dict(self):
        """Sérialisation pour API"""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'message': self.message,
            'char_count': self.char_count,
            'sms_count': self.sms_count,
            'variables_found': self.variables_found or '',
            'preview_text': self.preview_text or '',
            'usage_count': self.usage_count,
            'created_at': self.create_date.isoformat() if self.create_date else None,
        }
