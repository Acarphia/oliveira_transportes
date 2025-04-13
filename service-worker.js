const CACHE_VERSION = 'v5.7'; // Incremente uma nova versão para forçar atualização
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

const BUILD_TIMESTAMP = '2024-01-01T12:00:00'; 

self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Adicionando URLs ao cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .then(() => {
        console.log('Cache completo. BUILD_TIMESTAMP:', BUILD_TIMESTAMP);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('Oliveira-Transportes-') && cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Claiming clients e limpando caches antigos');
      return self.clients.matchAll({type: 'window'}).then(windowClients => {
        windowClients.forEach(windowClient => {
          windowClient.navigate(windowClient.url);
        });
      });
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            console.log('Atualizando cache para:', event.request.url);
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(error => {
        console.log('Falha na rede, usando cache:', error);
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Você está offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'CHECK_UPDATE') {
    const versionCheck = fetch('/version.json?t=' + Date.now())
      .then(response => response.json())
      .then(data => {
        if (data.version !== CACHE_VERSION) {
          caches.delete(CACHE_NAME)
            .then(() => self.skipWaiting())
            .then(() => {
              return self.clients.matchAll();
            })
            .then(clients => {
              clients.forEach(client => {
                client.postMessage('RELOAD_PAGE');
              });
            });
        }
      });
    
    event.waitUntil(versionCheck);
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-updates') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match('/version.json').then(response => {
          if (!response) return;
          return response.json().then(data => {
            if (data.version !== CACHE_VERSION) {
              return self.registration.update();
            }
          });
        });
      })
    );
  }
});
