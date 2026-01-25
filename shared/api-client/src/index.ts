/**
 * Client API Odoo unifié
 * Compatible Next.js (SSR + Client) et Vite (Client-only)
 *
 * Gère les appels JSON-RPC vers le backend Odoo
 */

import type {
  APIResponse,
  Product,
  ProductListResponse,
  ProductFilters,
  Cart,
  Order,
  User,
  Address,
  WishlistItem,
  Category,
  Currency,
  Coupon,
  Pricelist,
  Warehouse,
  CustomerCategory,
} from '@quelyos/types';
import { logger } from '@quelyos/logger';

// Détection environnement
const isNextJS = typeof window !== 'undefined' && (window as any).__NEXT_DATA__;
const isBrowser = typeof window !== 'undefined';

/**
 * Configuration de l'URL de base selon l'environnement
 */
function getApiBaseUrl(): string {
  // Next.js SSR - utiliser l'URL complète
  if (!isBrowser && typeof process !== 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/odoo`;
  }

  // Next.js Client - utiliser le proxy relatif
  if (isNextJS) {
    return '/api/odoo';
  }

  // Vite - utiliser VITE_API_URL ou proxy
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || '';
  }

  // Fallback
  return '';
}

interface OdooRpcOptions {
  throwOn404?: boolean;
}

/**
 * Client API Odoo universel
 */
export class OdooClient {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
    this.loadSession();
  }

  /**
   * Appel JSON-RPC générique vers Odoo
   */
  private async jsonrpc<T = any>(
    endpoint: string,
    params: Record<string, any> = {},
    options: OdooRpcOptions = {}
  ): Promise<T> {
    const { throwOn404 = false } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Ajouter session_id si disponible
    if (this.sessionId) {
      headers['X-Session-Id'] = this.sessionId;
    }

    try {
      // Next.js utilise le proxy qui wrap automatiquement en JSON-RPC
      // Vite envoie directement le JSON-RPC
      const body = isNextJS
        ? params // Next.js proxy ajoute le wrapper
        : {
            jsonrpc: '2.0',
            method: 'call',
            params: params || {},
            id: Math.random(),
          };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'omit',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Gestion erreur 404
        if (response.status === 404 && !throwOn404) {
          logger.warn(`Endpoint non implémenté: ${endpoint}`);
          return { success: false, error: 'Not implemented' } as T;
        }

        // Gestion erreur 401 (session expirée)
        if (response.status === 401) {
          this.clearSession();
          if (!import.meta.env?.DEV && isBrowser) {
            window.location.href = '/login';
          }
          throw new Error('Session expirée');
        }

        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        } as T;
      }

      const json = await response.json();

      // Vite: extraire result du JSON-RPC response
      if (json.error) {
        const errorMessage =
          json.error.data?.message || json.error.message || 'API Error';
        logger.error(`API Error [${endpoint}]:`, errorMessage);
        return { success: false, error: errorMessage } as T;
      }

      // Next.js renvoie directement le result, Vite enveloppe dans json.result
      return isNextJS ? json : json.result;
    } catch (error: any) {
      logger.error(`Erreur API [${endpoint}]:`, error);
      throw new Error(error.message || 'Unknown error');
    }
  }

  // ========================================
  // SESSION MANAGEMENT
  // ========================================

  setSession(sessionId: string) {
    this.sessionId = sessionId;
    if (isBrowser) {
      localStorage.setItem('odoo_session_id', sessionId);
    }
  }

  loadSession() {
    if (isBrowser) {
      const sessionId = localStorage.getItem('odoo_session_id');
      if (sessionId && sessionId !== 'null' && sessionId !== 'undefined') {
        this.sessionId = sessionId;
      }
    }
  }

  clearSession() {
    this.sessionId = null;
    if (isBrowser) {
      localStorage.removeItem('odoo_session_id');
      localStorage.removeItem('user');
    }
  }

  // ========================================
  // AUTHENTIFICATION
  // ========================================

  async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    session_id?: string;
    user?: User;
    error?: string;
  }> {
    try {
      const result = await this.jsonrpc('/auth/login', { email, password });
      if (result.success && result.session_id) {
        this.setSession(result.session_id);
      }
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async logout(): Promise<APIResponse> {
    try {
      await this.jsonrpc('/auth/logout');
      this.clearSession();
      return { success: true };
    } catch (error) {
      this.clearSession();
      return { success: false };
    }
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<APIResponse> {
    return this.jsonrpc('/auth/register', data);
  }

  async getSession(): Promise<{
    authenticated: boolean;
    user?: User;
  }> {
    try {
      return await this.jsonrpc('/auth/session');
    } catch (error) {
      return { authenticated: false };
    }
  }

  // ========================================
  // PRODUITS
  // ========================================

  async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    return this.jsonrpc('/products', filters);
  }

  async getProduct(
    id: number
  ): Promise<APIResponse & { product?: Product }> {
    return this.jsonrpc(`/products/${id}`);
  }

  async getProductBySlug(
    slug: string
  ): Promise<APIResponse & { product?: Product }> {
    return this.jsonrpc(`/products/slug/${slug}`);
  }

  async getProductVariants(productId: number): Promise<any> {
    return this.jsonrpc(`/products/${productId}/variants`);
  }

  // ========================================
  // CATÉGORIES
  // ========================================

  async getCategories(
    filters: {
      limit?: number;
      offset?: number;
      include_featured_products?: boolean;
      featured_limit?: number;
    } = {}
  ): Promise<APIResponse & { categories?: Category[] }> {
    const result = await this.jsonrpc('/categories', filters);
    // Support both response formats
    if (result.data?.categories) {
      return { ...result, categories: result.data.categories };
    }
    return result;
  }

  async getCategory(
    id: number
  ): Promise<APIResponse & { category?: Category }> {
    return this.jsonrpc(`/categories/${id}`);
  }

  // ========================================
  // PANIER
  // ========================================

  async getCart(): Promise<APIResponse & { cart?: Cart }> {
    return this.jsonrpc('/cart');
  }

  async addToCart(
    product_id: number,
    quantity: number = 1
  ): Promise<APIResponse & { cart?: Cart }> {
    return this.jsonrpc('/cart/add', { product_id, quantity });
  }

  async updateCartLine(
    line_id: number,
    quantity: number
  ): Promise<APIResponse & { cart?: Cart }> {
    return this.jsonrpc(`/cart/update/${line_id}`, { quantity });
  }

  async removeCartLine(line_id: number): Promise<APIResponse & { cart?: Cart }> {
    return this.jsonrpc(`/cart/remove/${line_id}`);
  }

  async clearCart(): Promise<APIResponse> {
    return this.jsonrpc('/cart/clear');
  }

  // ========================================
  // CHECKOUT & PAYMENT
  // ========================================

  async validateCart(): Promise<APIResponse> {
    return this.jsonrpc('/checkout/validate');
  }

  async calculateShipping(
    delivery_method_id: number
  ): Promise<APIResponse & { shipping_cost?: number }> {
    return this.jsonrpc('/checkout/shipping', { delivery_method_id });
  }

  async confirmOrder(data: {
    shipping_address_id?: number;
    billing_address_id?: number;
    delivery_method_id: number;
    payment_method_id: number;
    notes?: string;
  }): Promise<APIResponse & { order?: Order }> {
    return this.jsonrpc('/checkout/confirm', data);
  }

  async createStripePaymentIntent(
    orderId: number,
    returnUrl?: string
  ): Promise<
    APIResponse & {
      client_secret?: string;
      payment_intent_id?: string;
      amount?: number;
      currency?: string;
    }
  > {
    return this.jsonrpc('/payment/stripe/create-intent', {
      order_id: orderId,
      return_url: returnUrl,
    });
  }

  async confirmStripePayment(
    paymentIntentId: string,
    orderId: number
  ): Promise<APIResponse & { status?: string; order?: Order }> {
    return this.jsonrpc('/payment/stripe/confirm', {
      payment_intent_id: paymentIntentId,
      order_id: orderId,
    });
  }

  // ========================================
  // CLIENT
  // ========================================

  async getProfile(): Promise<APIResponse & { profile?: User }> {
    return this.jsonrpc('/customer/profile');
  }

  async updateProfile(data: Partial<User>): Promise<APIResponse> {
    return this.jsonrpc('/customer/profile/update', data);
  }

  async getOrders(
    filters?: { limit?: number; offset?: number }
  ): Promise<APIResponse & { orders?: Order[] }> {
    return this.jsonrpc('/customer/orders', filters);
  }

  async getOrder(id: number): Promise<APIResponse & { order?: Order }> {
    return this.jsonrpc(`/orders/${id}`);
  }

  async getAddresses(): Promise<APIResponse & { addresses?: Address[] }> {
    return this.jsonrpc('/customer/addresses');
  }

  async addAddress(address: Address): Promise<APIResponse> {
    return this.jsonrpc('/customer/addresses/create', address);
  }

  async updateAddress(
    id: number,
    address: Partial<Address>
  ): Promise<APIResponse> {
    return this.jsonrpc(`/customer/addresses/${id}/update`, address);
  }

  async deleteAddress(id: number): Promise<APIResponse> {
    return this.jsonrpc(`/customer/addresses/${id}/delete`);
  }

  // ========================================
  // WISHLIST
  // ========================================

  async getWishlist(): Promise<APIResponse & { wishlist?: WishlistItem[] }> {
    return this.jsonrpc('/wishlist');
  }

  async addToWishlist(product_id: number): Promise<APIResponse> {
    return this.jsonrpc('/wishlist/add', { product_id });
  }

  async removeFromWishlist(product_id: number): Promise<APIResponse> {
    return this.jsonrpc(`/wishlist/remove/${product_id}`);
  }

  // ========================================
  // CONFIGURATION
  // ========================================

  async getSiteConfig(): Promise<APIResponse & { data?: { config: any } }> {
    const response = await this.jsonrpc<APIResponse & { data?: { config: any } }>(
      '/site-config',
      {},
      { throwOn404: false }
    );
    if (!response.success) {
      return { success: true, data: { config: {} } };
    }
    return response;
  }

  // Ajouter d'autres méthodes selon besoins...
}

// Instance singleton exportée
export const odooClient = new OdooClient();

// Charger la session au démarrage (côté client uniquement)
if (isBrowser) {
  odooClient.loadSession();
}
