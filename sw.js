const CACHE_NAME = 'kuapc-das-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/html5-qrcode',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/icon-pwa.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests that aren't in our critical assets list to avoid opaque response issues
  if (!event.request.url.startsWith(self.location.origin) && !ASSETS_TO_CACHE.includes(event.request.url)) {
     return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache with new response
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
               cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return cached response if available
            return response;
          });

        // Return cached response immediately if available, otherwise wait for network
        return response || fetchPromise;
      });
    })
  );
});