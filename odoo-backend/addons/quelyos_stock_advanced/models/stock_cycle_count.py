# -*- coding: utf-8 -*-
"""
Stock Cycle Count - Comptage cyclique automatique
Permet de planifier des inventaires partiels réguliers au lieu d'un inventaire annuel complet
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class StockCycleCountRule(models.Model):
    _name = 'stock.cycle.count.rule'
    _description = 'Règle de Comptage Cyclique'
    _order = 'priority desc, name'

    name = fields.Char(string='Nom', required=True)
    active = fields.Boolean(string='Actif', default=True)
    priority = fields.Integer(string='Priorité', default=10, help="Plus la priorité est élevée, plus la règle sera traitée en premier")
    
    # Critères de sélection
    location_id = fields.Many2one('stock.location', string='Emplacement', required=True,
                                   domain=[('usage', '=', 'internal')])
    category_ids = fields.Many2many('product.category', string='Catégories Produits',
                                     help="Si vide, toutes les catégories")
    product_ids = fields.Many2many('product.product', string='Produits Spécifiques',
                                    help="Si rempli, seuls ces produits seront comptés")
    
    # Fréquence
    frequency = fields.Selection([
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
        ('quarterly', 'Trimestriel'),
    ], string='Fréquence', required=True, default='monthly')
    
    day_of_week = fields.Selection([
        ('0', 'Lundi'),
        ('1', 'Mardi'),
        ('2', 'Mercredi'),
        ('3', 'Jeudi'),
        ('4', 'Vendredi'),
        ('5', 'Samedi'),
        ('6', 'Dimanche'),
    ], string='Jour de la semaine', help="Pour fréquence hebdomadaire")
    
    day_of_month = fields.Integer(string='Jour du mois', default=1,
                                    help="Pour fréquence mensuelle/trimestrielle (1-28)")
    
    # Dates
    next_execution_date = fields.Date(string='Prochaine Exécution', compute='_compute_next_execution', store=True)
    last_execution_date = fields.Datetime(string='Dernière Exécution')
    
    # Stats
    execution_count = fields.Integer(string='Nombre d\'exécutions', default=0)
    execution_ids = fields.One2many('stock.cycle.count.execution', 'rule_id', string='Exécutions')
    
    @api.depends('frequency', 'day_of_week', 'day_of_month', 'last_execution_date')
    def _compute_next_execution(self):
        """Calcule la prochaine date d'exécution selon la fréquence"""
        for rule in self:
            if not rule.last_execution_date:
                rule.next_execution_date = fields.Date.today()
                continue
            
            last_date = rule.last_execution_date.date() if isinstance(rule.last_execution_date, datetime) else rule.last_execution_date
            
            if rule.frequency == 'daily':
                rule.next_execution_date = last_date + timedelta(days=1)
            elif rule.frequency == 'weekly':
                # Trouver le prochain jour de la semaine configuré
                days_ahead = int(rule.day_of_week or 0) - last_date.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                rule.next_execution_date = last_date + timedelta(days=days_ahead)
            elif rule.frequency == 'monthly':
                # Prochain mois, même jour
                next_month = last_date.month + 1 if last_date.month < 12 else 1
                next_year = last_date.year if last_date.month < 12 else last_date.year + 1
                day = min(int(rule.day_of_month or 1), 28)
                rule.next_execution_date = last_date.replace(year=next_year, month=next_month, day=day)
            elif rule.frequency == 'quarterly':
                # +3 mois
                next_month = last_date.month + 3
                next_year = last_date.year
                while next_month > 12:
                    next_month -= 12
                    next_year += 1
                day = min(int(rule.day_of_month or 1), 28)
                rule.next_execution_date = last_date.replace(year=next_year, month=next_month, day=day)
            else:
                rule.next_execution_date = last_date

    @api.constrains('day_of_month')
    def _check_day_of_month(self):
        """Valide le jour du mois (1-28 pour éviter problèmes février)"""
        for rule in self:
            if rule.day_of_month and (rule.day_of_month < 1 or rule.day_of_month > 28):
                raise ValidationError(_("Le jour du mois doit être entre 1 et 28"))

    def execute_cycle_count(self):
        """Exécute le comptage cyclique pour cette règle"""
        self.ensure_one()
        
        # Créer une exécution
        execution = self.env['stock.cycle.count.execution'].create({
            'rule_id': self.id,
            'location_id': self.location_id.id,
            'state': 'draft',
        })
        
        # Rechercher les produits à compter
        domain = [
            ('location_id', '=', self.location_id.id),
            ('quantity', '>', 0),
        ]
        
        if self.product_ids:
            domain.append(('product_id', 'in', self.product_ids.ids))
        elif self.category_ids:
            domain.append(('product_id.categ_id', 'in', self.category_ids.ids))
        
        quants = self.env['stock.quant'].search(domain)
        
        # Créer les lignes de comptage
        lines = []
        for quant in quants:
            lines.append((0, 0, {
                'product_id': quant.product_id.id,
                'theoretical_qty': quant.quantity,
                'counted_qty': 0.0,
                'location_id': self.location_id.id,
            }))
        
        execution.write({'line_ids': lines})
        
        # Mettre à jour la règle
        self.write({
            'last_execution_date': fields.Datetime.now(),
            'execution_count': self.execution_count + 1,
        })
        
        return execution

    def cron_execute_cycle_counts(self):
        """Cron pour exécuter automatiquement les comptages cycliques dus"""
        today = fields.Date.today()
        rules = self.search([
            ('active', '=', True),
            ('next_execution_date', '<=', today),
        ])
        
        for rule in rules:
            try:
                rule.execute_cycle_count()
            except Exception as e:
                # Log erreur mais continue avec les autres règles
                self.env['ir.logging'].create({
                    'name': 'stock.cycle.count.rule',
                    'type': 'server',
                    'level': 'error',
                    'message': f"Erreur exécution cycle count {rule.name}: {str(e)}",
                    'path': 'stock_cycle_count',
                    'func': 'cron_execute_cycle_counts',
                })


class StockCycleCountExecution(models.Model):
    _name = 'stock.cycle.count.execution'
    _description = 'Exécution Comptage Cyclique'
    _order = 'create_date desc'

    name = fields.Char(string='Référence', required=True, default='/', readonly=True, copy=False)
    rule_id = fields.Many2one('stock.cycle.count.rule', string='Règle', required=True, ondelete='cascade')
    location_id = fields.Many2one('stock.location', string='Emplacement', required=True)
    
    state = fields.Selection([
        ('draft', 'Brouillon'),
        ('in_progress', 'En Cours'),
        ('done', 'Terminé'),
        ('cancelled', 'Annulé'),
    ], string='État', default='draft', required=True)
    
    line_ids = fields.One2many('stock.cycle.count.line', 'execution_id', string='Lignes')
    
    counted_lines = fields.Integer(string='Lignes Comptées', compute='_compute_progress')
    total_lines = fields.Integer(string='Total Lignes', compute='_compute_progress')
    progress_percentage = fields.Float(string='Progression %', compute='_compute_progress')
    
    discrepancy_count = fields.Integer(string='Écarts Détectés', compute='_compute_discrepancies')
    total_discrepancy_value = fields.Float(string='Valeur Totale Écarts', compute='_compute_discrepancies')
    
    user_id = fields.Many2one('res.users', string='Responsable', default=lambda self: self.env.user)
    start_date = fields.Datetime(string='Date Début')
    end_date = fields.Datetime(string='Date Fin')

    @api.model
    def create(self, vals):
        """Génère une séquence pour la référence"""
        if vals.get('name', '/') == '/':
            vals['name'] = self.env['ir.sequence'].next_by_code('stock.cycle.count.execution') or '/'
        return super().create(vals)

    @api.depends('line_ids', 'line_ids.counted_qty')
    def _compute_progress(self):
        """Calcule la progression du comptage"""
        for execution in self:
            total = len(execution.line_ids)
            counted = len(execution.line_ids.filtered(lambda l: l.counted_qty > 0 or l.is_counted))
            execution.total_lines = total
            execution.counted_lines = counted
            execution.progress_percentage = (counted / total * 100) if total > 0 else 0.0

    @api.depends('line_ids', 'line_ids.discrepancy')
    def _compute_discrepancies(self):
        """Calcule les écarts"""
        for execution in self:
            lines_with_discrepancy = execution.line_ids.filtered(lambda l: abs(l.discrepancy) > 0.01)
            execution.discrepancy_count = len(lines_with_discrepancy)
            execution.total_discrepancy_value = sum(abs(l.discrepancy * l.product_id.standard_price) for l in lines_with_discrepancy)

    def action_start(self):
        """Démarre le comptage"""
        self.ensure_one()
        self.write({
            'state': 'in_progress',
            'start_date': fields.Datetime.now(),
        })

    def action_validate(self):
        """Valide le comptage et crée les ajustements stock"""
        self.ensure_one()
        
        # Créer ajustements pour les écarts
        for line in self.line_ids.filtered(lambda l: abs(l.discrepancy) > 0.01):
            # TODO: Créer stock.quant.adjustment ou stock.inventory.line
            pass
        
        self.write({
            'state': 'done',
            'end_date': fields.Datetime.now(),
        })

    def action_cancel(self):
        """Annule le comptage"""
        self.ensure_one()
        self.write({'state': 'cancelled'})


class StockCycleCountLine(models.Model):
    _name = 'stock.cycle.count.line'
    _description = 'Ligne Comptage Cyclique'

    execution_id = fields.Many2one('stock.cycle.count.execution', string='Exécution', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', string='Produit', required=True)
    location_id = fields.Many2one('stock.location', string='Emplacement', required=True)
    
    theoretical_qty = fields.Float(string='Quantité Théorique', digits='Product Unit of Measure')
    counted_qty = fields.Float(string='Quantité Comptée', digits='Product Unit of Measure')
    discrepancy = fields.Float(string='Écart', compute='_compute_discrepancy', store=True)
    
    is_counted = fields.Boolean(string='Compté', default=False)
    notes = fields.Text(string='Notes')

    @api.depends('theoretical_qty', 'counted_qty')
    def _compute_discrepancy(self):
        """Calcule l'écart entre théorique et compté"""
        for line in self:
            line.discrepancy = line.counted_qty - line.theoretical_qty
