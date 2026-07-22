/* ============================================
   Librapp - Service Worker (PWA)
   ============================================ */

const CACHE = 'librapp-v2';
const ASSETS = [
  '/libras/',
  '/libras/index.html',
  '/libras/game/',
  '/libras/game/index.html',
  '/libras/game/game.js',
  '/libras/game/game.css',
  '/libras/cards/editor.html',
  '/libras/cards/editor.js',
  '/libras/cards/editor.css',
  '/libras/assets/style.css',
  '/libras/data/cards.json',
  '/libras/manifest.json',
  '/libras/assets/icons/icon-192.png',
  '/libras/assets/icons/icon-512.png',
  '/libras/assets/icons/icon-144.png',
  '/libras/assets/icons/icon-96.png'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log('[SW] Cacheando assets...');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Erro ao cachear alguns assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (e) => {
  // Only handle GET requests within our scope
  if (e.request.method !== 'GET') return;
  if (!e.request.url.includes('/libras/')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      // Return cached if available, otherwise fetch and cache
      if (cached) return cached;

      return fetch(e.request).then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback — show cached landing page
        if (e.request.mode === 'navigate') {
          return caches.match('/libras/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
