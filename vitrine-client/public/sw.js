/**
 * Service Worker pour PWA E-commerce
 * Gère le cache et le mode offline
 */

const CACHE_NAME = 'ecommerce-v1';
const OFFLINE_URL = '/offline';

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First pour les assets statiques
  cacheFirst: [
    /\/_next\/static\/.*/,
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\.(?:woff|woff2|ttf|otf)$/,
  ],
  // Network First pour le contenu dynamique
  networkFirst: [
    /\/api\/.*/,
    /\/products.*/,
    /\/categories.*/,
  ],
  // Stale While Revalidate pour le reste
  staleWhileRevalidate: [
    /\/_next\/data\/.*/,
  ],
};

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activer immédiatement sans attendre
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prendre le contrôle immédiatement
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requêtes vers d'autres domaines (sauf images CDN)
  if (url.origin !== self.location.origin && !url.hostname.includes('unsplash')) {
    return;
  }

  // Déterminer la stratégie
  const strategy = getStrategy(url.pathname);

  event.respondWith(handleFetch(request, strategy));
});

function getStrategy(pathname) {
  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (pattern.test(pathname)) return 'cacheFirst';
  }
  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (pattern.test(pathname)) return 'networkFirst';
  }
  for (const pattern of CACHE_STRATEGIES.staleWhileRevalidate) {
    if (pattern.test(pathname)) return 'staleWhileRevalidate';
  }
  return 'networkFirst'; // Par défaut
}

async function handleFetch(request, strategy) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

// Cache First : Idéal pour les assets statiques
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(OFFLINE_URL);
  }
}

// Network First : Idéal pour le contenu dynamique
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Page de navigation ? Afficher page offline
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate : Retourner le cache, mettre à jour en arrière-plan
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || caches.match(OFFLINE_URL);
}

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ==================== PUSH NOTIFICATIONS ====================

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Nouvelle notification',
    body: 'Vous avez recu une nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'default',
    data: { url: '/' }
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'notification',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: data.actions || [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion du clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la mettre au premier plan
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Fermeture de notification
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});
