# -*- coding: utf-8 -*-
import logging
from odoo import api, SUPERUSER_ID

_logger = logging.getLogger(__name__)


def post_init_hook(cr, registry):
    """
    Hook exécuté après l'installation de quelyos_core.
    Installe automatiquement les modules Quelyos selon la configuration par défaut.

    Ordre d'installation :
    1. quelyos_api (TOUJOURS - critique pour infrastructure multi-tenant)
    2. quelyos_stock_advanced (optionnel - par défaut OUI)
    3. quelyos_finance (optionnel - par défaut OUI)
    4. quelyos_sms_tn (optionnel - par défaut OUI)

    Les modules optionnels peuvent être désactivés via ir.config_parameter :
    - quelyos.install_stock_advanced
    - quelyos.install_finance
    - quelyos.install_sms_tn
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    _logger.info("="*80)
    _logger.info("QUELYOS SUITE ORCHESTRATOR - Starting automatic installation")
    _logger.info("="*80)

    # 1. Lire paramètres de configuration
    IrConfigParam = env['ir.config_parameter'].sudo()
    install_stock_advanced = IrConfigParam.get_param('quelyos.install_stock_advanced', 'True') == 'True'
    install_finance = IrConfigParam.get_param('quelyos.install_finance', 'True') == 'True'
    install_sms_tn = IrConfigParam.get_param('quelyos.install_sms_tn', 'True') == 'True'

    _logger.info(f"Configuration détectée :")
    _logger.info(f"  - quelyos_api: TOUJOURS (critique)")
    _logger.info(f"  - quelyos_stock_advanced: {'OUI' if install_stock_advanced else 'NON'}")
    _logger.info(f"  - quelyos_finance: {'OUI' if install_finance else 'NON'}")
    _logger.info(f"  - quelyos_sms_tn: {'OUI' if install_sms_tn else 'NON'}")

    # 2. Préparer liste des modules à installer
    # Format: (module_name, is_critical, description)
    modules_to_install = [
        ('quelyos_api', True, 'Infrastructure multi-tenant et API REST'),
    ]

    if install_stock_advanced:
        modules_to_install.append(('quelyos_stock_advanced', False, 'Inventaire avancé'))
    if install_finance:
        modules_to_install.append(('quelyos_finance', False, 'Gestion trésorerie et budgets'))
    if install_sms_tn:
        modules_to_install.append(('quelyos_sms_tn', False, 'Notifications SMS Tunisie'))

    # 3. Installer les modules séquentiellement
    ModuleObj = env['ir.module.module'].sudo()

    for module_name, is_critical, description in modules_to_install:
        _logger.info("-"*80)
        _logger.info(f"Vérification du module : {module_name}")

        # Rechercher le module
        module = ModuleObj.search([('name', '=', module_name)], limit=1)

        if not module:
            msg = f"Module {module_name} NOT FOUND dans addons_path"
            if is_critical:
                _logger.error(msg)
                raise Exception(msg)
            else:
                _logger.warning(f"{msg} - Optionnel, on continue")
                continue

        # Vérifier si déjà installé
        if module.state == 'installed':
            _logger.info(f"Module {module_name} déjà installé - Skip")
            continue

        # Installer le module
        _logger.info(f"Installation de {description}...")
        try:
            module.button_immediate_install()
            _logger.info(f"✓ Module {module_name} installé avec succès")
        except Exception as e:
            msg = f"Erreur installation {module_name}: {str(e)}"
            if is_critical:
                _logger.error(msg)
                raise
            else:
                _logger.warning(f"{msg} - Optionnel, on continue")

    _logger.info("="*80)
    _logger.info("QUELYOS SUITE ORCHESTRATOR - Installation terminée avec succès")
    _logger.info("="*80)
    _logger.info("IMPORTANT: Redémarrer le serveur Odoo pour activer tous les modules")
    _logger.info("="*80)
