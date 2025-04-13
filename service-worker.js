const CACHE_VERSION = 'v4.8'; // Atualize sempre que fizer mudanças
const CACHE_NAME = 'Oliveira-Transportes-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
  '/404.html', // Adicione esta linha
  OFFLINE_URL
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Falha no cache inicial:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key.startsWith('Oliveira-Transportes-')) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Tratamento especial para navegação
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html')) // Sempre retorna index.html para rotas
    );
    return;
  }

  // Para outros recursos
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const networkFetch = fetch(event.request)
          .then(res => {
            // Atualiza cache em background
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, res.clone()));
            return res;
          })
          .catch(() => cached || caches.match(OFFLINE_URL));
        
        return cached || networkFetch;
      })
  );
});

// Mensagem para atualização forçada
self.addEventListener('message', event => {
  if (event.data === 'UPDATE_NOW') {
    caches.delete(CACHE_NAME)
      .then(() => self.skipWaiting());
  }
});
