const CACHE_VERSION = 'v4.0';
const CACHE_NAME = 'Oliveira-Transportes-' + CACHE_VERSION;

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      ).then(() => self.clients.claim())
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(res => {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => cached || new Response('Offline'));

      return cached || networkFetch;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'UPDATE_NOW') {
    caches.delete(CACHE_NAME)
      .then(() => self.skipWaiting());
  }
});