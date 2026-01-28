/**
 * API Client pour le self-service onboarding
 *
 * Endpoints:
 * - checkSlugAvailability: Vérifie si un slug est disponible
 * - createTenant: Crée un nouveau tenant
 * - getPlans: Récupère les plans d'abonnement
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8069';

interface CheckSlugResponse {
  success: boolean;
  available?: boolean;
  slug?: string;
  suggestion?: string;
  error?: string;
}

interface CreateTenantRequest {
  name: string;
  slug: string;
  email: string;
  password: string;
  plan?: string;
  sector?: string;
  primary_color?: string;
  stripe_customer_id?: string;
}

interface CreateTenantResponse {
  success: boolean;
  tenant_id?: number;
  tenant_code?: string;
  store_url?: string;
  admin_url?: string;
  status?: string;
  message?: string;
  error?: string;
  error_code?: string;
}

interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_products: number;
  max_orders_per_year: number;
  features: string[];
  support_level: string;
  is_popular: boolean;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

interface GetPlansResponse {
  success: boolean;
  plans?: SubscriptionPlan[];
  error?: string;
}

/**
 * Vérifie si un slug est disponible pour un nouveau tenant
 */
export async function checkSlugAvailability(slug: string): Promise<CheckSlugResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/onboarding/check-slug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

/**
 * Crée un nouveau tenant via le wizard d'inscription
 */
export async function createTenant(request: CreateTenantRequest): Promise<CreateTenantResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/onboarding/create-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating tenant:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
      error_code: 'CONNECTION_ERROR',
    };
  }
}

/**
 * Récupère les plans d'abonnement disponibles
 */
export async function getSubscriptionPlans(): Promise<GetPlansResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/onboarding/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur',
    };
  }
}

// Types exports
export type {
  CheckSlugResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  SubscriptionPlan,
  GetPlansResponse,
};
