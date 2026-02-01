const CACHE_NAME = 'kuapc-das-v4';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/html5-qrcode',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/new-icon-pwa.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled so one failed asset doesn't break the whole install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          cache.add(new Request(url, { mode: 'no-cors' })).catch(err => console.warn('PWA: Failed to cache:', url))
        )
      );
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Don't cache API or Proxy requests
  const url = event.request.url;
  if (url.includes('script.google.com') || url.includes('workers.dev')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        // Return cached version if we have it
        if (response) {
          return response;
        }

        // Otherwise fetch from network and try to cache for next time
        return fetch(event.request).then((networkResponse) => {
          if (
            networkResponse && 
            networkResponse.status === 200 && 
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Silent fail for network errors if no cache
          return response;
        });
      });
    })
  );
});