/**
 * Logger sécurisé pour le frontend
 * Masque les détails techniques en production
 *
 * Compatible Next.js (SSR + Client)
 */

// Détection d'environnement Next.js
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger avec masquage automatique en production
 */
export const logger = {
  /**
   * Log d'erreur - détails complets en dev, silencieux en prod
   */
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(args[0]);
  },

  /**
   * Log d'avertissement - détails complets en dev, silencieux en prod
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log d'information - toujours visible (utilisé pour messages non-sensibles)
   */
  info: (...args: unknown[]) => {
    console.info(...args);
  },

  /**
   * Log de debug - uniquement en développement
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
};

/**
 * Type guard pour les erreurs HTTP
 */
interface HttpError {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
  message?: string;
}

/**
 * Type guard pour vérifier si une valeur est une HttpError
 */
function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  );
}

/**
 * Formatte un message d'erreur pour l'utilisateur final
 * Retourne un message générique sans détails techniques en production
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isDevelopment) {
    // En développement, afficher le vrai message
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (isHttpError(error)) {
      return error.response?.data?.error || error.message || 'Une erreur est survenue';
    }
    return 'Une erreur est survenue';
  }

  // En production, messages génériques basés sur le type d'erreur
  if (isHttpError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return 'Ressource non trouvée';
    }
    if (status === 401 || status === 403) {
      return 'Accès non autorisé. Veuillez vous reconnecter.';
    }
    if (status && status >= 500) {
      return 'Erreur du serveur. Veuillez réessayer ultérieurement.';
    }

    // Détection par message d'erreur
    const message = error.message?.toLowerCase() || '';
    if (message.includes('network') || message.includes('fetch')) {
      return 'Erreur de connexion au serveur';
    }
    if (message.includes('timeout')) {
      return "Délai d'attente dépassé";
    }
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}
