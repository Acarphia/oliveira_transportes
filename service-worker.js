const CACHE_VERSION = 'v6.7';
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
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('RELOAD_PAGE');
        });
      });
    })
  );
});

// Busca sempre da rede primeiro; se falhar, usa o cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cached => cached || new Response('Você está offline e este conteúdo não está em cache.'));
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'UPDATE_NOW') {
    caches.delete(CACHE_NAME).then(() => {
      self.skipWaiting();
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('CACHE_UPDATED');
        });
      });
    });
  }
});
