/**
 * Service Worker pour Quelyos POS
 * Gestion du cache et mode offline
 */

const CACHE_NAME = 'quelyos-pos-v1'
const PRODUCTS_CACHE = 'quelyos-pos-products-v1'
const API_CACHE = 'quelyos-pos-api-v1'

// Assets statiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/pos',
  '/pos/terminal',
  '/pos/kiosk',
]

// Patterns d'URL à cacher
const CACHE_PATTERNS = {
  // Assets statiques (JS, CSS, images) - Cache First
  static: /\.(js|css|png|jpg|jpeg|svg|gif|woff2?|ttf|eot)$/,
  // API produits - Stale While Revalidate
  products: /\/api\/pos\/products/,
  // API configs - Stale While Revalidate
  configs: /\/api\/pos\/configs/,
  // API sessions - Network First (données critiques)
  sessions: /\/api\/pos\/session/,
  // API commandes - Network Only (ne pas cacher)
  orders: /\/api\/pos\/order/,
}

// ============================================================================
// INSTALLATION
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Install complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error)
      })
  )
})

// ============================================================================
// ACTIVATION
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Supprimer anciens caches
              return name.startsWith('quelyos-pos-') &&
                     name !== CACHE_NAME &&
                     name !== PRODUCTS_CACHE &&
                     name !== API_CACHE
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

// ============================================================================
// FETCH STRATEGIES
// ============================================================================

/**
 * Cache First - Pour assets statiques
 * Retourne le cache si disponible, sinon fetch et cache
 */
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Cache First failed:', error)
    throw error
  }
}

/**
 * Network First - Pour données critiques
 * Essaie le réseau d'abord, fallback sur cache
 */
async function networkFirst(request, cacheName = API_CACHE) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[SW] Network failed, trying cache...')
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

/**
 * Stale While Revalidate - Pour données fréquentes
 * Retourne le cache immédiatement, met à jour en arrière-plan
 */
async function staleWhileRevalidate(request, cacheName = PRODUCTS_CACHE) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // Fetch en arrière-plan
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error)
      return null
    })

  // Retourner cache si disponible, sinon attendre fetch
  return cached || fetchPromise
}

/**
 * Network Only - Pour actions critiques
 * Pas de cache, échec si offline
 */
async function networkOnly(request) {
  return fetch(request)
}

// ============================================================================
// FETCH HANDLER
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorer les requêtes vers d'autres origines (sauf API)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api')) {
    return
  }

  // Déterminer la stratégie selon le pattern
  let responsePromise

  if (CACHE_PATTERNS.static.test(url.pathname)) {
    // Assets statiques - Cache First
    responsePromise = cacheFirst(request)
  } else if (CACHE_PATTERNS.products.test(url.pathname)) {
    // Produits - Stale While Revalidate
    responsePromise = staleWhileRevalidate(request, PRODUCTS_CACHE)
  } else if (CACHE_PATTERNS.configs.test(url.pathname)) {
    // Configs - Stale While Revalidate
    responsePromise = staleWhileRevalidate(request, API_CACHE)
  } else if (CACHE_PATTERNS.sessions.test(url.pathname)) {
    // Sessions - Network First
    responsePromise = networkFirst(request)
  } else if (CACHE_PATTERNS.orders.test(url.pathname)) {
    // Commandes - Network Only (pas de cache pour les mutations)
    responsePromise = networkOnly(request)
  } else if (url.pathname.startsWith('/pos')) {
    // Pages POS - Cache First
    responsePromise = cacheFirst(request)
  } else {
    // Défaut - Network First
    responsePromise = networkFirst(request)
  }

  event.respondWith(
    responsePromise.catch((error) => {
      console.error('[SW] Fetch failed:', error)

      // Page offline de fallback
      if (request.destination === 'document') {
        return caches.match('/pos')
      }

      // Réponse JSON d'erreur pour API
      if (url.pathname.startsWith('/api')) {
        return new Response(
          JSON.stringify({
            error: 'offline',
            message: 'Vous êtes hors ligne. Cette action nécessite une connexion.'
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      throw error
    })
  )
})

// ============================================================================
// SYNC - Background Sync pour commandes offline
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag)

  if (event.tag === 'sync-pos-orders') {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  console.log('[SW] Syncing offline orders...')

  // Notifier les clients de commencer la sync
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_ORDERS_START',
    })
  })
}

// ============================================================================
// MESSAGES - Communication avec le client
// ============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'CACHE_PRODUCTS':
      // Cacher les produits reçus du client
      cacheProducts(payload)
      break

    case 'CLEAR_CACHE':
      clearAllCaches()
      break

    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.source.postMessage({
          type: 'CACHE_STATUS',
          payload: status,
        })
      })
      break
  }
})

async function cacheProducts(products) {
  if (!products || !Array.isArray(products)) return

  const cache = await caches.open(PRODUCTS_CACHE)
  const response = new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json' },
  })
  await cache.put('/api/pos/products/cached', response)
  console.log('[SW] Cached', products.length, 'products')
}

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('quelyos-pos-'))
      .map((name) => caches.delete(name))
  )
  console.log('[SW] All caches cleared')
}

async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}

  for (const name of cacheNames) {
    if (name.startsWith('quelyos-pos-')) {
      const cache = await caches.open(name)
      const keys = await cache.keys()
      status[name] = keys.length
    }
  }

  return status
}

// ============================================================================
// PERIODIC SYNC - Mise à jour périodique des produits
// ============================================================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-products') {
    event.waitUntil(updateProductsCache())
  }
})

async function updateProductsCache() {
  console.log('[SW] Updating products cache...')

  try {
    const response = await fetch('/api/pos/products')
    if (response.ok) {
      const cache = await caches.open(PRODUCTS_CACHE)
      await cache.put('/api/pos/products', response)
      console.log('[SW] Products cache updated')
    }
  } catch (error) {
    console.error('[SW] Failed to update products cache:', error)
  }
}

console.log('[SW] Service Worker loaded')
