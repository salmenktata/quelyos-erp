from odoo import models, fields, api


class ResPartnerExtension(models.Model):
    _inherit = 'res.partner'

    # Champs pour les fournisseurs (Supplier)
    x_supplier_category = fields.Selection([
        ('strategic', 'Stratégique'),
        ('regular', 'Régulier'),
        ('occasional', 'Occasionnel'),
    ], string='Catégorie fournisseur')
    x_supplier_importance = fields.Selection([
        ('critical', 'Critique'),
        ('high', 'Haute'),
        ('normal', 'Normale'),
        ('low', 'Basse'),
    ], string='Importance fournisseur', default='normal')
    x_payment_delay = fields.Integer(string='Délai de paiement (jours)', default=30)
    x_default_payment_terms = fields.Char(string='Conditions de paiement par défaut')
    x_iban = fields.Char(string='IBAN')
    x_bic = fields.Char(string='BIC')

    # Champs pour les clients (Customer)
    x_credit_limit = fields.Monetary(string='Limite de crédit', currency_field='currency_id')
    x_risk_score = fields.Float(string='Score de risque', help='Score de 0 à 100')
    x_payment_terms_days = fields.Integer(string='Délai de paiement client (jours)', default=30)
    x_customer_status = fields.Selection([
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('blocked', 'Bloqué'),
    ], string='Statut client', default='active')

    def _to_supplier_dict(self):
        """Convertit le record en dictionnaire fournisseur pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email or '',
            'phone': self.phone or '',
            'website': self.website or '',
            'iban': self.x_iban or '',
            'bic': self.x_bic or '',
            'category': self.x_supplier_category or 'regular',
            'importance': self.x_supplier_importance or 'normal',
            'paymentDelay': self.x_payment_delay or 30,
            'defaultPaymentTerms': self.x_default_payment_terms or '',
            'address': self._format_address(),
        }

    def _to_customer_dict(self):
        """Convertit le record en dictionnaire client pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email or '',
            'phone': self.phone or '',
            'legalId': self.vat or '',
            'address': self._format_address(),
            'status': self.x_customer_status or 'active',
            'paymentTerms': self.x_payment_terms_days or 30,
            'creditLimit': self.x_credit_limit or 0,
            'riskScore': self.x_risk_score or 50,
        }

    def _format_address(self):
        """Formate l'adresse complète"""
        parts = filter(None, [
            self.street,
            self.street2,
            f"{self.zip or ''} {self.city or ''}".strip(),
            self.country_id.name if self.country_id else None
        ])
        return ', '.join(parts)
