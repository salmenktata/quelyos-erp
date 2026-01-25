/**
 * Utilitaire de logging sécurisé
 * Masque les détails techniques en production
 */

// Détection d'environnement compatible avec Next.js (client & server)
const isDevelopment = typeof process !== 'undefined'
  ? process.env.NODE_ENV === 'development'
  : false;

/**
 * Log uniquement en développement
 * En production, les erreurs sont silencieuses côté client
 */
export const logger = {
  /**
   * Log d'erreur - détails complets en dev, silencieux en prod
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En production, vous pouvez envoyer à un service de monitoring (Sentry, etc.)
    // Example: Sentry.captureException(args[0]);
  },

  /**
   * Log d'avertissement - détails complets en dev, silencieux en prod
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log d'information - toujours visible (utilisé pour messages non-sensibles)
   */
  info: (...args: any[]) => {
    console.info(...args);
  },

  /**
   * Log de debug - uniquement en développement
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

/**
 * Formatte un message d'erreur pour l'utilisateur final
 * Retourne un message générique sans détails techniques
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (isDevelopment) {
    // En développement, afficher le vrai message
    return error?.response?.data?.error || error?.message || 'Une erreur est survenue';
  }

  // En production, message générique
  if (error?.response?.status === 404) {
    return 'Ressource non trouvée';
  }
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Accès non autorisé';
  }
  if (error?.response?.status >= 500) {
    return 'Erreur du serveur. Veuillez réessayer ultérieurement.';
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
