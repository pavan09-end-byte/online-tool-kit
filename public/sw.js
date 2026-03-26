const CACHE_NAME = 'toolkit-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/tools-registry.js',
  '/js/loader.js',
  '/js/search.js',
  '/js/theme.js',
  '/js/popular.js',
  '/js/tools/pdf-tools.js',
  '/js/tools/image-tools.js',
  '/js/tools/text-tools.js',
  '/js/tools/calc-tools.js',
  '/js/tools/gen-tools.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
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
