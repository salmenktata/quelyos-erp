from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re


class QuelyosTenant(models.Model):
    _name = 'quelyos.tenant'
    _description = 'Quelyos Tenant'
    _order = 'name'

    name = fields.Char(string='Tenant Name', required=True)
    code = fields.Char(string='Tenant Code', required=True, index=True)
    domain = fields.Char(string='Domain', compute='_compute_domain', store=True)

    # Company link
    company_id = fields.Many2one('res.company', string='Company', required=True)

    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('provisioning', 'Provisioning'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ], string='Status', default='draft', required=True)

    # Configuration
    country_id = fields.Many2one('res.country', string='Country', required=True)
    currency_id = fields.Many2one('res.currency', string='Currency', required=True)
    timezone = fields.Selection('_tz_get', string='Timezone', default='Africa/Tunis')

    # Contact
    admin_email = fields.Char(string='Admin Email', required=True)
    admin_phone = fields.Char(string='Admin Phone')

    # Subscription
    subscription_plan = fields.Selection([
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ], string='Plan', default='starter')
    subscription_start = fields.Date(string='Subscription Start')
    subscription_end = fields.Date(string='Subscription End')

    # Features
    pos_enabled = fields.Boolean(string='POS Enabled', default=True)
    ecommerce_enabled = fields.Boolean(string='E-commerce Enabled', default=True)
    mobile_app_enabled = fields.Boolean(string='Mobile App Enabled', default=False)

    # Timestamps
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    activated_at = fields.Datetime(string='Activated At')

    _sql_constraints = [
        ('code_unique', 'UNIQUE(code)', 'Tenant code must be unique!'),
    ]

    @api.model
    def _tz_get(self):
        return [(tz, tz) for tz in ['Africa/Tunis', 'Africa/Casablanca', 'Europe/Paris', 'UTC']]

    @api.depends('code')
    def _compute_domain(self):
        base_domain = self.env['ir.config_parameter'].sudo().get_param(
            'quelyos.base_domain', 'saasretail.tn'
        )
        for record in self:
            if record.code:
                record.domain = f"{record.code}.{base_domain}"
            else:
                record.domain = False

    @api.constrains('code')
    def _check_code(self):
        for record in self:
            if not re.match(r'^[a-z0-9-]+$', record.code):
                raise ValidationError(
                    "Tenant code must contain only lowercase letters, numbers, and hyphens."
                )

    def action_provision(self):
        """Start tenant provisioning process."""
        self.ensure_one()
        self.write({'state': 'provisioning'})
        # TODO: Trigger async provisioning (DB, S3, DNS)
        return True

    def action_activate(self):
        """Activate tenant after provisioning."""
        self.ensure_one()
        self.write({
            'state': 'active',
            'activated_at': fields.Datetime.now(),
        })
        return True

    def action_suspend(self):
        """Suspend tenant."""
        self.ensure_one()
        self.write({'state': 'suspended'})
        return True
