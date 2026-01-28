# -*- coding: utf-8 -*-
"""
Modèle Employé RH.

Gère toutes les informations relatives aux employés :
- Données personnelles et professionnelles
- Rattachement au département et poste
- Hiérarchie managériale
- Contrats et congés
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class HREmployee(models.Model):
    _name = 'quelyos.hr.employee'
    _description = 'Employé'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    # ═══════════════════════════════════════════════════════════════════════════
    # IDENTIFICATION
    # ═══════════════════════════════════════════════════════════════════════════

    name = fields.Char(
        string='Nom complet',
        compute='_compute_name',
        store=True,
        readonly=False,
        tracking=True
    )
    employee_number = fields.Char(
        string='Matricule',
        required=True,
        copy=False,
        readonly=True,
        default='Nouveau',
        index=True,
        tracking=True,
        help="Matricule unique de l'employé"
    )
    first_name = fields.Char(
        string='Prénom',
        required=True,
        tracking=True
    )
    last_name = fields.Char(
        string='Nom',
        required=True,
        tracking=True
    )
    active = fields.Boolean(
        string='Actif',
        default=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # PHOTO
    # ═══════════════════════════════════════════════════════════════════════════

    image_1920 = fields.Image(
        string='Photo',
        max_width=1920,
        max_height=1920
    )
    image_128 = fields.Image(
        string='Photo miniature',
        related='image_1920',
        max_width=128,
        max_height=128,
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTACT PROFESSIONNEL
    # ═══════════════════════════════════════════════════════════════════════════

    work_email = fields.Char(
        string='Email professionnel',
        tracking=True
    )
    work_phone = fields.Char(
        string='Téléphone professionnel'
    )
    mobile_phone = fields.Char(
        string='Mobile'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # POSTE & DÉPARTEMENT
    # ═══════════════════════════════════════════════════════════════════════════

    department_id = fields.Many2one(
        'quelyos.hr.department',
        string='Département',
        tracking=True,
        domain="[('tenant_id', '=', tenant_id)]",
        help="Département de rattachement"
    )
    job_id = fields.Many2one(
        'quelyos.hr.job',
        string='Poste',
        tracking=True,
        domain="[('tenant_id', '=', tenant_id)]",
        help="Poste occupé"
    )
    job_title = fields.Char(
        string='Titre du poste',
        help="Titre personnalisé si différent du poste standard"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # HIÉRARCHIE
    # ═══════════════════════════════════════════════════════════════════════════

    parent_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Manager',
        domain="[('tenant_id', '=', tenant_id)]",
        tracking=True,
        help="Supérieur hiérarchique direct"
    )
    coach_id = fields.Many2one(
        'quelyos.hr.employee',
        string='Coach/Mentor',
        domain="[('tenant_id', '=', tenant_id)]",
        help="Mentor ou coach assigné"
    )
    child_ids = fields.One2many(
        'quelyos.hr.employee',
        'parent_id',
        string='Subordonnés',
        help="Employés sous sa responsabilité"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # INFORMATIONS PERSONNELLES
    # ═══════════════════════════════════════════════════════════════════════════

    gender = fields.Selection([
        ('male', 'Homme'),
        ('female', 'Femme'),
        ('other', 'Autre'),
    ], string='Genre')

    birthday = fields.Date(
        string='Date de naissance'
    )
    place_of_birth = fields.Char(
        string='Lieu de naissance'
    )
    country_of_birth = fields.Many2one(
        'res.country',
        string='Pays de naissance'
    )
    country_id = fields.Many2one(
        'res.country',
        string='Nationalité'
    )
    identification_id = fields.Char(
        string='N° Pièce d\'identité',
        help="CIN, Passeport, Carte de séjour..."
    )
    passport_id = fields.Char(
        string='N° Passeport'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # SITUATION FAMILIALE
    # ═══════════════════════════════════════════════════════════════════════════

    marital = fields.Selection([
        ('single', 'Célibataire'),
        ('married', 'Marié(e)'),
        ('cohabitant', 'Concubin(e)'),
        ('widower', 'Veuf/Veuve'),
        ('divorced', 'Divorcé(e)'),
    ], string='Situation familiale', default='single')

    spouse_name = fields.Char(
        string='Nom conjoint(e)'
    )
    spouse_birthdate = fields.Date(
        string='Date naissance conjoint(e)'
    )
    children = fields.Integer(
        string='Nombre d\'enfants',
        default=0
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # ADRESSE PERSONNELLE
    # ═══════════════════════════════════════════════════════════════════════════

    address_home_street = fields.Char(
        string='Adresse'
    )
    address_home_street2 = fields.Char(
        string='Adresse (suite)'
    )
    address_home_city = fields.Char(
        string='Ville'
    )
    address_home_state_id = fields.Many2one(
        'res.country.state',
        string='Région/Gouvernorat'
    )
    address_home_zip = fields.Char(
        string='Code postal'
    )
    address_home_country_id = fields.Many2one(
        'res.country',
        string='Pays'
    )
    private_email = fields.Char(
        string='Email personnel'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTACT URGENCE
    # ═══════════════════════════════════════════════════════════════════════════

    emergency_contact = fields.Char(
        string='Contact d\'urgence'
    )
    emergency_phone = fields.Char(
        string='Tél. urgence'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # INFORMATIONS BANCAIRES
    # ═══════════════════════════════════════════════════════════════════════════

    bank_name = fields.Char(
        string='Banque'
    )
    bank_account_number = fields.Char(
        string='RIB/IBAN'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # EMPLOI
    # ═══════════════════════════════════════════════════════════════════════════

    hire_date = fields.Date(
        string='Date d\'embauche',
        tracking=True,
        help="Date de début dans l'entreprise"
    )
    seniority = fields.Char(
        string='Ancienneté',
        compute='_compute_seniority',
        help="Ancienneté dans l'entreprise"
    )

    state = fields.Selection([
        ('active', 'Actif'),
        ('suspended', 'Suspendu'),
        ('departed', 'Parti'),
    ], string='Statut', default='active', tracking=True, required=True)

    departure_date = fields.Date(
        string='Date de départ',
        tracking=True
    )
    departure_reason = fields.Selection([
        ('fired', 'Licenciement'),
        ('resigned', 'Démission'),
        ('retired', 'Retraite'),
        ('mutual', 'Rupture conventionnelle'),
        ('end_contract', 'Fin de contrat'),
        ('other', 'Autre'),
    ], string='Motif de départ')
    departure_description = fields.Text(
        string='Commentaire départ'
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRATS
    # ═══════════════════════════════════════════════════════════════════════════

    contract_ids = fields.One2many(
        'quelyos.hr.contract',
        'employee_id',
        string='Contrats',
        help="Historique des contrats"
    )
    contract_id = fields.Many2one(
        'quelyos.hr.contract',
        string='Contrat actif',
        compute='_compute_contract',
        store=True,
        help="Contrat actuellement en vigueur"
    )
    contract_type = fields.Selection(
        related='contract_id.contract_type',
        string='Type de contrat',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # CONGÉS
    # ═══════════════════════════════════════════════════════════════════════════

    leave_ids = fields.One2many(
        'quelyos.hr.leave',
        'employee_id',
        string='Demandes de congés'
    )
    allocation_ids = fields.One2many(
        'quelyos.hr.leave.allocation',
        'employee_id',
        string='Allocations de congés'
    )
    remaining_leaves = fields.Float(
        string='Solde congés',
        compute='_compute_remaining_leaves',
        help="Jours de congés restants"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # PRÉSENCES
    # ═══════════════════════════════════════════════════════════════════════════

    attendance_ids = fields.One2many(
        'quelyos.hr.attendance',
        'employee_id',
        string='Pointages'
    )
    last_attendance_id = fields.Many2one(
        'quelyos.hr.attendance',
        string='Dernier pointage',
        compute='_compute_last_attendance'
    )
    attendance_state = fields.Selection([
        ('checked_out', 'Absent'),
        ('checked_in', 'Présent'),
    ], string='Statut présence', compute='_compute_attendance_state')

    # ═══════════════════════════════════════════════════════════════════════════
    # UTILISATEUR ODOO
    # ═══════════════════════════════════════════════════════════════════════════

    user_id = fields.Many2one(
        'res.users',
        string='Utilisateur lié',
        help="Compte utilisateur Odoo associé"
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-TENANT
    # ═══════════════════════════════════════════════════════════════════════════

    tenant_id = fields.Many2one(
        'quelyos.tenant',
        string='Tenant',
        required=True,
        ondelete='cascade',
        index=True,
        help="Tenant propriétaire"
    )
    company_id = fields.Many2one(
        'res.company',
        string='Société',
        related='tenant_id.company_id',
        store=True
    )

    # ═══════════════════════════════════════════════════════════════════════════
    # COMPUTED FIELDS
    # ═══════════════════════════════════════════════════════════════════════════

    @api.depends('first_name', 'last_name')
    def _compute_name(self):
        for employee in self:
            parts = [employee.first_name or '', employee.last_name or '']
            employee.name = ' '.join(filter(None, parts))

    @api.depends('hire_date')
    def _compute_seniority(self):
        from dateutil.relativedelta import relativedelta
        today = fields.Date.today()
        for employee in self:
            if employee.hire_date:
                delta = relativedelta(today, employee.hire_date)
                parts = []
                if delta.years:
                    parts.append(f"{delta.years} an{'s' if delta.years > 1 else ''}")
                if delta.months:
                    parts.append(f"{delta.months} mois")
                employee.seniority = ' '.join(parts) if parts else 'Moins d\'un mois'
            else:
                employee.seniority = ''

    @api.depends('contract_ids', 'contract_ids.state', 'contract_ids.date_start', 'contract_ids.date_end')
    def _compute_contract(self):
        today = fields.Date.today()
        for employee in self:
            contracts = employee.contract_ids.filtered(
                lambda c: c.state == 'open' and c.date_start <= today and (not c.date_end or c.date_end >= today)
            )
            employee.contract_id = contracts[:1] if contracts else False

    @api.depends('allocation_ids', 'leave_ids')
    def _compute_remaining_leaves(self):
        for employee in self:
            allocated = sum(employee.allocation_ids.filtered(
                lambda a: a.state == 'validate'
            ).mapped('number_of_days'))
            taken = sum(employee.leave_ids.filtered(
                lambda l: l.state == 'validate'
            ).mapped('number_of_days'))
            employee.remaining_leaves = allocated - taken

    def _compute_last_attendance(self):
        for employee in self:
            attendance = self.env['quelyos.hr.attendance'].search([
                ('employee_id', '=', employee.id)
            ], limit=1, order='check_in desc')
            employee.last_attendance_id = attendance

    @api.depends('last_attendance_id', 'last_attendance_id.check_out')
    def _compute_attendance_state(self):
        for employee in self:
            if employee.last_attendance_id and not employee.last_attendance_id.check_out:
                employee.attendance_state = 'checked_in'
            else:
                employee.attendance_state = 'checked_out'

    # ═══════════════════════════════════════════════════════════════════════════
    # CONTRAINTES
    # ═══════════════════════════════════════════════════════════════════════════

    _sql_constraints = [
        ('employee_number_tenant_uniq', 'unique(employee_number, tenant_id)',
         'Le matricule doit être unique par tenant !'),
        ('work_email_tenant_uniq', 'unique(work_email, tenant_id)',
         'Cet email professionnel est déjà utilisé !'),
    ]

    @api.constrains('parent_id')
    def _check_parent_id(self):
        for employee in self:
            if employee.parent_id == employee:
                raise ValidationError(_("Un employé ne peut pas être son propre manager !"))

    # ═══════════════════════════════════════════════════════════════════════════
    # CRUD
    # ═══════════════════════════════════════════════════════════════════════════

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('employee_number', 'Nouveau') == 'Nouveau':
                tenant_id = vals.get('tenant_id')
                if tenant_id:
                    tenant = self.env['quelyos.tenant'].browse(tenant_id)
                    sequence = self.env['ir.sequence'].search([
                        ('code', '=', 'quelyos.hr.employee'),
                        ('company_id', '=', tenant.company_id.id)
                    ], limit=1)
                    if sequence:
                        vals['employee_number'] = sequence.next_by_id()
                    else:
                        vals['employee_number'] = self.env['ir.sequence'].next_by_code('quelyos.hr.employee') or 'EMP-0001'
        return super().create(vals_list)

    # ═══════════════════════════════════════════════════════════════════════════
    # MÉTHODES API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_employee_data(self, detailed=False):
        """Retourne les données de l'employé pour l'API."""
        self.ensure_one()
        data = {
            'id': self.id,
            'employee_number': self.employee_number,
            'name': self.name,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'work_email': self.work_email or '',
            'work_phone': self.work_phone or '',
            'mobile_phone': self.mobile_phone or '',
            'department_id': self.department_id.id if self.department_id else None,
            'department_name': self.department_id.name if self.department_id else None,
            'job_id': self.job_id.id if self.job_id else None,
            'job_title': self.job_title or (self.job_id.name if self.job_id else ''),
            'parent_id': self.parent_id.id if self.parent_id else None,
            'parent_name': self.parent_id.name if self.parent_id else None,
            'state': self.state,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'seniority': self.seniority,
            'attendance_state': self.attendance_state,
            'image_url': f"/web/image/quelyos.hr.employee/{self.id}/image_128" if self.image_128 else None,
        }

        if detailed:
            data.update({
                'gender': self.gender,
                'birthday': self.birthday.isoformat() if self.birthday else None,
                'place_of_birth': self.place_of_birth or '',
                'country_id': self.country_id.id if self.country_id else None,
                'country_name': self.country_id.name if self.country_id else None,
                'identification_id': self.identification_id or '',
                'marital': self.marital,
                'spouse_name': self.spouse_name or '',
                'children': self.children,
                'address': {
                    'street': self.address_home_street or '',
                    'street2': self.address_home_street2 or '',
                    'city': self.address_home_city or '',
                    'state': self.address_home_state_id.name if self.address_home_state_id else '',
                    'zip': self.address_home_zip or '',
                    'country': self.address_home_country_id.name if self.address_home_country_id else '',
                },
                'private_email': self.private_email or '',
                'emergency_contact': self.emergency_contact or '',
                'emergency_phone': self.emergency_phone or '',
                'bank_name': self.bank_name or '',
                'bank_account_number': self.bank_account_number or '',
                'contract': self.contract_id.get_contract_data() if self.contract_id else None,
                'remaining_leaves': self.remaining_leaves,
                'coach_id': self.coach_id.id if self.coach_id else None,
                'coach_name': self.coach_id.name if self.coach_id else None,
                'departure_date': self.departure_date.isoformat() if self.departure_date else None,
                'departure_reason': self.departure_reason,
            })

        return data

    def get_subordinates_data(self):
        """Retourne la liste des subordonnés."""
        self.ensure_one()
        return [emp.get_employee_data() for emp in self.child_ids.filtered(lambda e: e.state == 'active')]
