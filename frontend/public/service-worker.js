const CACHE_NAME = 'accessible-form-assistant-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, then cache for static assets
// IMPORTANT: Do NOT cache API responses (privacy requirement)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Never cache API requests (privacy requirement)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For static assets, try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful GET requests
        if (response.status === 200 && request.method === 'GET') {
          // Clone the response before caching
          const responseClone = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            // Safely cache, ignoring errors
            cache.put(request, responseClone).catch(err => {
              console.log('Cache put failed:', err);
            });
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, return a basic offline page
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
