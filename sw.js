// ═══════════════════════════════════════════
// sw.js — Service Worker (Cache tài nguyên)
// ═══════════════════════════════════════════

const CACHE_NAME = 'music-app-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './week.html',
  './library.html',
  './css/style.css',
  './css/auth.css',
  './css/player-controls.css',
  './css/library.css',
  './css/responsive.css',
  './js/supabase.js',
  './js/auth.js',
  './js/playlist.js',
  './js/player.js',
  './js/ui.js',
  './js/search.js',
  './js/app.js',
  './js/mobile-menu.js',
  './js/pwa.js',
  './img/logo_web.png',
  './img/0.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase API: always network (data phải mới)
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/')) {
    return;
  }

  // Audio files: network first, cache for offline
  if (url.pathname.includes('/audio/') || url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache first, fallback network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});