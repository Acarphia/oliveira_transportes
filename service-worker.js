const CACHE_NAME = 'Oliveira-Transportes-v2'; // IMPORTANTE: altere a versão sempre que atualizar arquivos
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Instalação: adiciona arquivos ao cache
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cache aberto');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // ativa imediatamente
});

// Ativação: limpa caches antigos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando...');
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
  self.clients.claim(); // pega controle imediato
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // só lida com GET
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Atualiza cache com a nova versão da resposta
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
