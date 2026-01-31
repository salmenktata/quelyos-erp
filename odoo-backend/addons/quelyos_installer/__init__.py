# -*- coding: utf-8 -*-
"""Quelyos Suite - Module d'installation automatique"""

from . import hooks

# Exposer les hooks pour le manifest
from .hooks import pre_init_hook, post_init_hook, uninstall_hook
