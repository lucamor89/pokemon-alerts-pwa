// VERSION: Change this number when you update the app!
const VERSION = '1.0.2';
const CACHE_NAME = `pokemon-alerts-${VERSION}`;

// Files to cache for offline use
const urlsToCache = [
  '/pokemon-alerts-pwa/',
  '/pokemon-alerts-pwa/index.html',
  '/pokemon-alerts-pwa/style.css',
  '/pokemon-alerts-pwa/app.js',
  '/pokemon-alerts-pwa/manifest.json',
  '/pokemon-alerts-pwa/icon-192.png',
  '/pokemon-alerts-pwa/icon-512.png'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  console.log('[SW] Installing version:', VERSION);
  
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[SW] Cache failed:', err))
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating version:', VERSION);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch strategy: Network first, cache fallback (for app files)
// Always network for API calls (JSONBin)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // ALWAYS use network for JSONBin API calls (don't cache data!)
  if (url.hostname === 'api.jsonbin.io') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For app files: Try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If network succeeds, update cache with fresh copy
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // No cache either - return error
          return new Response('Offline and no cache available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Listen for messages from the app to force update
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
