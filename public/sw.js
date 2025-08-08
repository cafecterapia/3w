// Service Worker for PWA functionality
const CACHE_NAME = '3w-app-v2';
// Only include URLs that are guaranteed to exist under /public
const urlsToCache = ['/'];

// Install event
self.addEventListener('install', (event) => {
  // Activate this SW immediately without waiting for old one to be terminated
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Cache known-good URLs; ignore individual failures
        await Promise.all(
          urlsToCache.map((url) => cache.add(url).catch(() => undefined))
        );
      } catch (e) {
        // Do not fail install due to cache errors
        console.warn('SW install cache step failed:', e);
      }
    })()
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients as soon as activation completes
  event.waitUntil(
    (async () => {
      // Optionally, clean up old caches when version changes
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests and same-origin
  if (
    req.method !== 'GET' ||
    new URL(req.url).origin !== self.location.origin
  ) {
    return; // Let the browser handle it
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req)
          .then((res) => {
            // Optionally cache successful responses
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  let payload = null;
  try {
    if (event.data) {
      // Try to parse JSON payload sent by server
      payload = event.data.json();
    }
  } catch (e) {
    // Fallback to text if not JSON
    payload = { body: event.data ? event.data.text() : 'New notification' };
  }

  const title =
    (payload && (payload.title || payload.notificationTitle)) || '3W App';
  const options = {
    body: (payload && (payload.body || payload.message)) || 'New notification',
    icon: (payload && payload.icon) || '/icons/icon-192x192.png',
    badge: (payload && payload.badge) || '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: (payload && payload.data) || {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
