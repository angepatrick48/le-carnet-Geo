/* Le Carnet Géo — service worker : fonctionnement hors connexion */
const CACHE = 'carnetgeo-v77';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./','./index.html','./app.html'])).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit || fetch(req).then(resp => {
        try { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } catch (_) {}
        return resp;
      }).catch(() => caches.match('./app.html'))
    )
  );
});
