from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _get_error_html(cls, env, code, values):
        """Override error pages to replace Odoo references."""
        result = super()._get_error_html(env, code, values)
        if result:
            result = result.replace('Odoo', 'Quelyos')
            result = result.replace('odoo', 'quelyos')
        return result
