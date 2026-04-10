const CACHE_NAME = 'toolkit-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/js/tools-registry.js',
  '/js/tools/pdf-tools.js',
  '/js/tools/image-tools.js',
  '/js/tools/text-tools.js',
  '/js/tools/calc-tools.js',
  '/js/tools/gen-tools.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
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
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
