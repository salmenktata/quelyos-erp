/**
 * Hook React pour gérer les campagnes marketing (mass_mailing natif)
 * 
 * Endpoints :
 * - list_campaigns() : Liste campagnes avec filtres
 * - get_campaign(id) : Détail campagne
 * - create_campaign() : Créer campagne
 * - send_campaign(id) : Envoyer campagne
 * - get_campaign_stats(id) : Statistiques campagne
 * - delete_campaign(id) : Supprimer campagne
 */

import { useState } from 'react';
import { jsonRpcRequest } from '@/lib/api';

export interface MarketingCampaign {
  id: number;
  subject: string;
  state: 'draft' | 'in_queue' | 'sending' | 'done';
  body_html: string;
  mailing_model_real: string;
  mailing_domain: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  create_date: string | null;
  schedule_date: string | null;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  open_rate: number;
  click_rate: number;
}

export function useMarketingCampaigns() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listCampaigns = async (params: {
    tenant_id?: number;
    state?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        campaigns: MarketingCampaign[];
        total_count: number;
        error?: string;
      }>('/api/ecommerce/marketing/campaigns', params);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des campagnes');
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

  const getCampaign = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        campaign: MarketingCampaign;
        error?: string;
      }>(`/api/ecommerce/marketing/campaigns/${campaignId}`, {});
      
      if (!result.success) {
        throw new Error(result.error || 'Campagne non trouvée');
      }
      
      return result.campaign;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (data: {
    subject: string;
    body_html: string;
    mailing_model?: string;
    mailing_domain?: string;
    tenant_id?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        campaign: MarketingCampaign;
        error?: string;
      }>('/api/ecommerce/marketing/campaigns/create', data);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création');
      }
      
      return result.campaign;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        state: string;
        error?: string;
      }>(`/api/ecommerce/marketing/campaigns/${campaignId}/send`, {});
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
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

  const getCampaignStats = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        stats: CampaignStats;
        error?: string;
      }>(`/api/ecommerce/marketing/campaigns/${campaignId}/stats`, {});
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du chargement des stats');
      }
      
      return result.stats;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await jsonRpcRequest<{
        success: boolean;
        error?: string;
      }>(`/api/ecommerce/marketing/campaigns/${campaignId}/delete`, {});
      
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
    listCampaigns,
    getCampaign,
    createCampaign,
    sendCampaign,
    getCampaignStats,
    deleteCampaign,
    loading,
    error,
  };
}
