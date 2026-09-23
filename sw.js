// Service worker: guarda tu rutina en el teléfono para que abra sin internet
// y muestra las notificaciones que manda el servidor de avisos.
const CACHE = 'rutina-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './rutina.js',
  './app.js',
  './push-config.js',
  './avisos.js',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Red primero (para que los cambios se vean al instante),
// caché como respaldo cuando no hay internet.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() =>
      caches.match(req).then(c => c || caches.match('./index.html'))
    )
  );
});

/* ---------- notificaciones ---------- */
// iOS exige mostrar SIEMPRE una notificación por cada push recibido.
self.addEventListener('push', e => {
  let datos = {};
  try { datos = e.data ? e.data.json() : {}; }
  catch (err) { datos = { body: e.data ? e.data.text() : '' }; }
  const opciones = {
    body: datos.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    lang: 'es-MX',
    data: { url: datos.url || './' }
  };
  // misma etiqueta = reemplaza en lugar de duplicar
  if (datos.tag) opciones.tag = datos.tag;
  e.waitUntil(self.registration.showNotification(datos.title || 'Rutina', opciones));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const destino = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
      for (const c of lista) {
        if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow(destino) : null;
    })
  );
});
