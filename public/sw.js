const VERSION = 'field-log-polish-4';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/error-page.css',
  '/manifest.webmanifest',
  '/assets/icon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/field-guide-hero-768.webp',
  '/assets/field-guide-hero-1536.webp',
  '/assets/field-guide-hero-768.avif',
  '/assets/field-guide-hero-1536.avif',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(APP_SHELL);
    const indexResponse = await fetch('/index.html');
    const markup = await indexResponse.clone().text();
    await cache.put('/index.html', indexResponse);
    const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) client.postMessage({ type: 'APP_UPDATED', version: VERSION });
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (url.pathname.includes('/verify')) event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const cache = await caches.open(RUNTIME);
          cache.put('/index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('/index.html')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(?:js|css|webp|png|svg)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Offline and no cached response is available.');
  }
}
