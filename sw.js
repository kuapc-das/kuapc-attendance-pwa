const CACHE_NAME = 'kuapc-das-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png'
];
const FUTURE_ASSETS = [];

// Combined Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('KUAPC-DAS: Precaching all assets...');
      return cache.addAll([...ASSETS_TO_CACHE, ...FUTURE_ASSETS]);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, with dynamic caching for new assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        // Only cache successful GET requests
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return new Response('Offline and asset not cached.', { status: 503 });
      });
    })
  );

});


