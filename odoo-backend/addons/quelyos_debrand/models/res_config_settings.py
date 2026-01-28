from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    quelyos_system_name = fields.Char(
        string="Nom du système",
        config_parameter='quelyos.system_name',
        default="Quelyos Suite"
    )
    quelyos_company_url = fields.Char(
        string="URL Entreprise",
        config_parameter='quelyos.company_url',
        default="https://quelyos.com"
    )
    quelyos_support_url = fields.Char(
        string="URL Support",
        config_parameter='quelyos.support_url',
        default="https://quelyos.com/support"
    )
    quelyos_documentation_url = fields.Char(
        string="URL Documentation",
        config_parameter='quelyos.documentation_url',
        default="https://docs.quelyos.com"
    )
