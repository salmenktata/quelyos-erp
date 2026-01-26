from odoo import models, fields, api


class QuelyosCashAlert(models.Model):
    _name = 'quelyos.cash.alert'
    _description = 'Alerte de trésorerie'
    _order = 'name'

    name = fields.Char(string='Nom', required=True, index=True)
    alert_type = fields.Selection([
        ('threshold', 'Seuil minimum'),
        ('negative_forecast', 'Prévision négative'),
        ('variance', 'Variance'),
        ('budget_exceeded', 'Budget dépassé'),
    ], string='Type d\'alerte', required=True, default='threshold')
    is_active = fields.Boolean(string='Actif', default=True)
    threshold_amount = fields.Monetary(
        string='Montant seuil',
        currency_field='currency_id',
        help='Montant en dessous duquel l\'alerte se déclenche'
    )
    horizon_days = fields.Integer(
        string='Horizon (jours)',
        default=30,
        help='Nombre de jours pour la prévision'
    )
    cooldown_hours = fields.Integer(
        string='Délai entre alertes (heures)',
        default=24,
        help='Temps minimum entre deux alertes'
    )
    email_enabled = fields.Boolean(string='Notification email', default=True)
    email_recipients = fields.Char(
        string='Destinataires email',
        help='Adresses email séparées par des virgules'
    )
    account_id = fields.Many2one(
        'account.account',
        string='Compte surveillé',
        help='Laisser vide pour surveiller tous les comptes'
    )
    portfolio_id = fields.Many2one(
        'quelyos.portfolio',
        string='Portefeuille surveillé'
    )
    company_id = fields.Many2one(
        'res.company', string='Société',
        default=lambda self: self.env.company,
        required=True
    )
    currency_id = fields.Many2one(
        'res.currency',
        related='company_id.currency_id',
        string='Devise'
    )

    # Historique des déclenchements
    last_triggered = fields.Datetime(string='Dernier déclenchement')
    trigger_count = fields.Integer(string='Nombre de déclenchements', default=0)

    def _to_dict(self):
        """Convertit le record en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.alert_type,
            'isActive': self.is_active,
            'thresholdAmount': self.threshold_amount,
            'horizonDays': self.horizon_days,
            'cooldownHours': self.cooldown_hours,
            'emailEnabled': self.email_enabled,
            'emailRecipients': self.email_recipients.split(',') if self.email_recipients else [],
            'accountId': self.account_id.id if self.account_id else None,
            'portfolioId': self.portfolio_id.id if self.portfolio_id else None,
            'lastTriggered': self.last_triggered.isoformat() if self.last_triggered else None,
            'triggerCount': self.trigger_count,
        }

    def check_and_trigger(self):
        """Vérifie les conditions et déclenche l'alerte si nécessaire"""
        from datetime import datetime, timedelta

        for alert in self.search([('is_active', '=', True)]):
            # Vérifier le cooldown
            if alert.last_triggered:
                cooldown_end = alert.last_triggered + timedelta(hours=alert.cooldown_hours)
                if datetime.now() < cooldown_end:
                    continue

            should_trigger = False

            if alert.alert_type == 'threshold':
                # Calculer le solde actuel
                balance = alert._get_current_balance()
                should_trigger = balance < alert.threshold_amount

            elif alert.alert_type == 'negative_forecast':
                # Vérifier si le solde prévu est négatif
                forecast = alert._get_forecast_balance()
                should_trigger = forecast < 0

            if should_trigger:
                alert._trigger_alert()

    def _get_current_balance(self):
        """Calcule le solde actuel du compte ou portefeuille surveillé"""
        if self.account_id:
            return self.account_id.current_balance if hasattr(self.account_id, 'current_balance') else 0
        elif self.portfolio_id:
            return self.portfolio_id.total_balance
        return 0

    def _get_forecast_balance(self):
        """Calcule le solde prévisionnel"""
        # TODO: Implémenter le calcul de prévision
        return self._get_current_balance()

    def _trigger_alert(self):
        """Déclenche l'alerte"""
        from datetime import datetime
        self.write({
            'last_triggered': datetime.now(),
            'trigger_count': self.trigger_count + 1,
        })
        # TODO: Envoyer email si email_enabled
