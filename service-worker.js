const CACHE_NAME = 'Oliveira-Transportes-v3.4'; // ATUALIZE A VERSAO
const UPDATE_INTERVAL = 3600000;

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

self.addEventListener('message', (event) => {
  if (event.data.type === 'FORCE_UPDATE') {
    self.skipWaiting();
    clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({type: 'FORCE_RELOAD'}));
    });
  }
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
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
      )
    ).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchAndCache = () => {
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse;
          });
      };

      if (navigator.onLine) {
        return fetchAndCache();
      }
      return cachedResponse || fetchAndCache();
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (response.status === 200) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {});
          })
        );
      })
    );
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-cache-update') {
    event.waitUntil(updateCache());
  }
});

function updateCache() {
  return caches.open(CACHE_NAME).then(cache => {
    return Promise.all(
      urlsToCache.map(url => {
        return fetch(url)
          .then(response => {
            if (response.status === 200) {
              return cache.put(url, response);
            }
          })
          .catch(() => {});
      })
    );
  });
}