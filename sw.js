const CACHE_NAME = 'kuapc-das-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
  'https://raw.githubusercontent.com/kuapc-das/kuapc-attendance-pwa/main/logo-login.png'
];

self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event=>{
  if(event.request.url.includes('script.google.com')) return event.respondWith(fetch(event.request));
  event.respondWith(caches.match(event.request).then(resp=>resp||fetch(event.request)));
});
