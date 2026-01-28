const CACHE_NAME = 'kuapc-das-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png'
];

self.addEventListener('install', event=>{
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache=>{
            console.log('KUAPC-DAS: Caching system assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event=>{
    event.waitUntil(
        caches.keys().then(keys=>Promise.all(
            keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event=>{
    if(event.request.url.includes('script.google.com')){
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cachedResp=>cachedResp||fetch(event.request))
    );
});
