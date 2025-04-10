const CACHE_NAME = 'Oliveira-Transportes-' + new Date().getTime(); // Cache único
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

let updateInterval = setInterval(() => {
  if (navigator.onLine) {
    caches.open(CACHE_NAME).then(cache => {
      urlsToCache.forEach(url => {
        fetch(url + '?v=' + Date.now()) // Bypass cache
          .then(res => res.status === 200 && cache.put(url, res.clone()))
          .catch(() => {});
      });
    });
  }
}, 60000);

self.addEventListener('install', event => {
  self.skipWaiting(); // Ativação imediata
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  clearInterval(updateInterval); // Limpa timer antigo
  updateInterval = setInterval(() => { /*...*/ }, 60000); // Novo timer
  
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(res => {
          // Atualiza cache em segundo plano
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