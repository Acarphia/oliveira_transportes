const CACHE_VERSION = 'v5.4'; // Forçar atualização
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
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.error('Falha ao buscar:', error);
          return cachedResponse || new Response('Você está offline e este conteúdo não está em cache.');
        });
      
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'UPDATE_NOW') {
    caches.delete(CACHE_NAME)
      .then(() => {
        self.skipWaiting();
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage('CACHE_UPDATED');
          });
        });
      });
  }
});
