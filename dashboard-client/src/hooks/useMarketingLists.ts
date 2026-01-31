/**
 * Hook React pour gérer les listes de diffusion marketing (mailing.list natif Odoo 19)
 * 
 * Endpoints :
 * - list_mailing_lists() : Liste listes de diffusion
 * - get_mailing_list(id) : Détail liste avec contacts
 * - create_mailing_list() : Créer liste
 * - add_contacts_to_list() : Ajouter contacts à liste
 * - delete_mailing_list(id) : Supprimer liste
 */

import { useState } from 'react';
import { jsonRpcRequest } from '@/lib/api';

export interface MailingContact {
  id: number;
  email: string;
  name: string;
  subscription_list_ids: number[];
}

export interface MailingList {
  id: number;
  name: string;
  active: boolean;
  contact_count: number;
  create_date: string | null;
  contacts?: MailingContact[];
}

export function useMarketingLists() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listMailingLists = async (params: {
    tenant_id?: number;
    limit?: number;
    offset?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        mailing_lists: MailingList[];
        total_count: number;
        error?: string;
      }>('/api/ecommerce/marketing/lists', params);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des listes');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMailingList = async (listId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        mailing_list: MailingList;
        error?: string;
      }>(`/api/ecommerce/marketing/lists/${listId}`, {});
      
      if (!result.success) {
        throw new Error(result.error || 'Liste non trouvée');
      }
      
      return result.mailing_list;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMailingList = async (data: {
    name: string;
    tenant_id?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        mailing_list: MailingList;
        error?: string;
      }>('/api/ecommerce/marketing/lists/create', data);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création');
      }
      
      return result.mailing_list;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addContactsToList = async (listId: number, contacts: Array<{ email: string; name?: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        added_count: number;
        error?: string;
      }>(`/api/ecommerce/marketing/lists/${listId}/contacts`, { contacts });
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'ajout des contacts');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMailingList = async (listId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        error?: string;
      }>(`/api/ecommerce/marketing/lists/${listId}/delete`, {});
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    listMailingLists,
    getMailingList,
    createMailingList,
    addContactsToList,
    deleteMailingList,
    loading,
    error,
  };
}
