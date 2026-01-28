from odoo import http
from odoo.addons.web.controllers.home import Home


class QuelyosHome(Home):
    """Override Home controller to customize login page."""

    @http.route()
    def web_login(self, redirect=None, **kw):
        response = super().web_login(redirect=redirect, **kw)
        if hasattr(response, 'qcontext'):
            response.qcontext['disable_footer'] = True
            response.qcontext['disable_database_manager'] = True
        return response
