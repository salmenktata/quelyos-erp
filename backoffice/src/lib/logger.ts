/**
 * Logger sécurisé pour le backoffice
 *
 * CRITIQUE : Ne jamais exposer de détails techniques dans la console navigateur
 * En production, les logs error/warn/debug sont masqués pour éviter de révéler
 * des informations sensibles (structure DB, noms de tables, erreurs Odoo, etc.)
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Logs d'information (affichés en dev ET production)
   * Utiliser uniquement pour des messages non-sensibles destinés à l'utilisateur
   */
  info: (...args: any[]) => {
    console.log(...args);
  },

  /**
   * Logs d'erreur (affichés en dev seulement)
   * En production, utilisez getUserFriendlyErrorMessage() pour afficher à l'utilisateur
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En production, on pourrait envoyer à un service de monitoring (Sentry, LogRocket)
    // Sentry.captureException(args[0]);
  },

  /**
   * Logs d'avertissement (affichés en dev seulement)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Logs de débogage (affichés en dev seulement)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
};

/**
 * Retourne un message d'erreur user-friendly basé sur le type d'erreur
 * Masque les détails techniques en production
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return isDevelopment ? error : 'Une erreur est survenue';
  }

  if (error instanceof Error) {
    // En développement, montrer le message complet
    if (isDevelopment) {
      return error.message;
    }

    // En production, messages génériques
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'Erreur de connexion au serveur';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'Ressource non trouvée';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Session expirée. Veuillez vous reconnecter';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'Accès refusé';
    }
    if (message.includes('timeout')) {
      return 'Délai d\'attente dépassé';
    }

    return 'Une erreur est survenue';
  }

  return 'Une erreur inattendue est survenue';
}
