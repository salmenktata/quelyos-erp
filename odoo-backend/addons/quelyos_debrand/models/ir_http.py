from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _get_error_html(cls, env, code, values):
        """Override error pages to replace Odoo references."""
        result = super()._get_error_html(env, code, values)
        if result and isinstance(result, tuple) and len(result) == 2:
            # result is (code, html) tuple
            error_code, html = result
            if html:
                html = html.replace('Odoo', 'Quelyos')
                html = html.replace('odoo', 'quelyos')
            return (error_code, html)
        elif result and isinstance(result, str):
            # Fallback for string result
            result = result.replace('Odoo', 'Quelyos')
            result = result.replace('odoo', 'quelyos')
        return result
