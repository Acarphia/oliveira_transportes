const CACHE_VERSION = 'v6.2';
const CACHE_NAME = 'Oliveira-Transportes-' + CACHE_VERSION;

self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Instalando nova versão:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html?sw=' + CACHE_VERSION,
        '/style.css?sw=' + CACHE_VERSION,
        '/script.js?sw=' + CACHE_VERSION,
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/manifest.json'
      ]))
  );
});

self.addEventListener('activate', event => {
  console.log('Ativando nova versão:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('Oliveira-Transportes-') && 
              cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
