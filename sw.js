const CACHE_NAME = 'parla-cat-rpg-v39';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './manifest.json',
  './data/items.json',
  './data/capitols.json',
  './data/capitol1_bcn_born.json',
  './data/capitol_02_girona.json',
  './data/capitol_03_fires_valencia.json',
  './data/ruta_rave_port_olympic.json',
  './data/ruta_girona_muralla_viva.json',
  './data/ruta_valencia_ciutat_vella.json',
  './camisa_cenguera.png',
  './ram_roses_girona.png',
  './fuet_fires.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
