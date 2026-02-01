/**
 * Types pour le Backoffice
 * Réexporte tous les types partagés + types spécifiques backoffice
 */

// Réexporter tous les types partagés
export * from '@quelyos/types';

// Types spécifiques au backoffice (Stock, Analytics, Invoices, etc.)
// Note: Certains types (Invoice, OrderHistoryItem, PaginatedResponse) sont déjà dans @quelyos/types
// On réexporte quand même backoffice.ts qui peut avoir des types étendus
export * from './backoffice';
