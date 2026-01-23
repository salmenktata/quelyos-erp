# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.exceptions import ValidationError, AccessError, MissingError, UserError
import logging

_logger = logging.getLogger(__name__)


class BaseEcommerceController(http.Controller):
    """
    Controller de base pour l'API E-commerce avec error handling unifié.

    Toutes les méthodes retournent un format de réponse standardisé:
    {
        "success": bool,
        "data": {...},       // si success=True
        "error": str,        // si success=False
        "message": str       // message optionnel
    }
    """

    def _handle_error(self, exception, context="opération"):
        """
        Gestion centralisée des erreurs avec logging et messages utilisateur appropriés.

        Args:
            exception: L'exception levée
            context: Contexte de l'erreur (ex: "récupération des produits")

        Returns:
            dict: Réponse d'erreur standardisée
        """
        error_msg = str(exception)

        # Log avec contexte et stack trace
        _logger.error(
            f"Erreur lors de {context}: {error_msg}",
            exc_info=True
        )

        # Messages utilisateur vs erreurs techniques
        if isinstance(exception, ValidationError):
            user_message = error_msg
        elif isinstance(exception, AccessError):
            user_message = "Accès refusé. Vous n'avez pas les permissions nécessaires."
        elif isinstance(exception, MissingError):
            user_message = "Ressource non trouvée."
        elif isinstance(exception, UserError):
            user_message = error_msg
        else:
            # Ne pas exposer les détails techniques aux utilisateurs
            user_message = f"Une erreur est survenue lors de {context}."

        return {
            'success': False,
            'error': user_message,
        }

    def _success_response(self, data=None, message=None):
        """
        Réponse succès standardisée.

        Args:
            data: Dictionnaire de données à retourner (ou None)
            message: Message optionnel de succès

        Returns:
            dict: Réponse succès standardisée
        """
        response = {'success': True}

        if data is not None:
            if isinstance(data, dict):
                response.update(data)
            else:
                response['data'] = data

        if message:
            response['message'] = message

        return response

    def _get_current_user(self):
        """
        Récupère l'utilisateur actuel si authentifié.

        Returns:
            res.users record ou None
        """
        if request.session.uid:
            return request.env['res.users'].browse(request.session.uid)
        return None

    def _get_current_partner(self):
        """
        Récupère le partner de l'utilisateur actuel.

        Returns:
            res.partner record ou None
        """
        user = self._get_current_user()
        return user.partner_id if user else None

    def _validate_required_params(self, params, required_fields):
        """
        Valide que les paramètres requis sont présents.

        Args:
            params: Dictionnaire de paramètres
            required_fields: Liste des champs requis

        Raises:
            ValidationError: Si un champ requis est manquant
        """
        missing = [field for field in required_fields if not params.get(field)]

        if missing:
            raise ValidationError(
                f"Paramètres requis manquants: {', '.join(missing)}"
            )

    def _paginate_results(self, records, limit=None, offset=None, default_limit=24):
        """
        Applique la pagination sur un recordset.

        Args:
            records: Recordset Odoo
            limit: Nombre d'éléments par page
            offset: Offset de pagination
            default_limit: Limite par défaut

        Returns:
            tuple: (paginated_records, total_count)
        """
        total = len(records) if isinstance(records, list) else records.search_count([])
        limit = limit or default_limit
        offset = offset or 0

        if isinstance(records, list):
            paginated = records[offset:offset + limit]
        else:
            paginated = records[offset:offset + limit]

        return paginated, total
