const CACHE_NAME = 'ciglog-v27';
const ASSETS = [
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './META-README.html',
  './META-CHANGELOG.html',
  './META-ROADMAP.html',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(asset => typeof asset === 'string' && asset.startsWith('./')))
        .then(() => {
          return Promise.allSettled(
            ['https://cdn.jsdelivr.net/npm/chart.js'].map(url => cache.add(url).catch(() => {}))
          );
        });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (event.request.method === 'GET' && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
