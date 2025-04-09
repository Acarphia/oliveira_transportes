const CACHE_NAME = 'Oliveira-Transportes'; // Troque o número em cada nova versão
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalação: adiciona arquivos ao cache
self.addEventListener('install', event => {
  self.skipWaiting(); // força instalação imediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // ativa imediatamente sem precisar recarregar
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Atualiza o cache com a resposta mais nova
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se offline, tenta servir do cache
        return caches.match(event.request);
      })
  );
});
