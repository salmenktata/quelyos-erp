# -*- coding: utf-8 -*-
"""
Migration 19.0.1.17.0 : Création template email satisfaction
Workaround pour problème validation XML RelaxNG
"""
import logging

_logger = logging.getLogger(__name__)


def migrate(cr, version):
    """
    Crée/met à jour le template email de satisfaction
    """
    _logger.info("=== Migration 19.0.1.17.0 : Template satisfaction ===")

    from odoo import api, SUPERUSER_ID
    env = api.Environment(cr, SUPERUSER_ID, {})

    # Importer la fonction depuis hooks.py
    from odoo.addons.quelyos_api.hooks import _create_satisfaction_email_template

    _create_satisfaction_email_template(env)

    _logger.info("=== Migration 19.0.1.17.0 terminée ===")
