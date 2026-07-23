/**
 * SPDX-License-Identifier: Apache-2.0
 * ÍrisClin Enterprise PWA Service Worker (V2)
 * Supports Cache-First assets, Stale-While-Revalidate APIs, Offline Fallback & Push Notifications.
 */

const CACHE_NAME = 'irisclin-enterprise-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/preview-banner.svg',
  '/irisclin-official-banner.svg'
];

// Install Event: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static layout assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Caching Strategies
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests and API calls to enable live connections
  if (req.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-First for static assets, falling back to network
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update for next visit (Stale-While-Revalidate)
        fetch(req).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {/* ignore background update errors */});
        
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        // Only cache successful requests of typical files
        if (networkResponse.status === 200 && !url.pathname.includes('/node_modules/')) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clonedResponse));
        }
        return networkResponse;
      }).catch(() => {
        // Safe offline fallback to main page
        if (req.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Push Event: Listen for server push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'ÍrisClin Notificação', body: 'Nova atualização disponível no sistema.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'ÍrisClin Notificação', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event: Focus or open client app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If window exists, focus it
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window, open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
