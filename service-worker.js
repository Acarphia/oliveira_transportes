const CACHE_NAME = 'Oliveira-Transportes-v3.8'; // Atualize a versão sempre que atualizar

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Controle de mensagens
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || event.data.type === 'FORCE_UPDATE') {
    self.skipWaiting();
    clients.claim().then(() => {
      clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({type: 'FORCE_RELOAD'}));
      });
    });
  }
});

// Instalação
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Ativação
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request)
        .then(response => {
          // Atualiza cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => cached);
      
      return cached || fetched;
    })
  );
});

// Atualização forçada quando online
self.addEventListener('sync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => cache.put(url, response))
              .catch(() => {});
          })
        );
      })
    );
  }
});