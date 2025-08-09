const CACHE_NAME = 'quickreflex-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to external domains (except Google Fonts)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.hostname.includes('googleapis.com') && 
      !url.hostname.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for test data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-test-data') {
    event.waitUntil(syncTestData());
  }
});

// Sync test data when online
async function syncTestData() {
  try {
    // Open IndexedDB and get pending sync data
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const pendingData = await store.getAll();
    
    if (pendingData.length > 0) {
      console.log('Service Worker: Syncing', pendingData.length, 'items');
      
      // Attempt to sync each item
      for (const item of pendingData) {
        try {
          await syncItem(item);
          // Remove from sync queue on success
          const deleteTransaction = db.transaction(['syncQueue'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('syncQueue');
          await deleteStore.delete(item.id);
        } catch (error) {
          console.error('Service Worker: Failed to sync item', item.id, error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuickReflexDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Sync individual item
async function syncItem(item) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item.data),
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  
  return response.json();
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: 'Your test results are ready for review',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'quickreflex-notification',
    data: {
      url: '/results'
    },
    actions: [
      {
        action: 'view',
        title: 'View Results'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('QuickReflex', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_STRATEGY') {
    // Handle cache strategy updates
    console.log('Service Worker: Cache strategy updated');
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered', event.tag);
  
  if (event.tag === 'data-backup') {
    event.waitUntil(performDataBackup());
  }
});

// Perform data backup
async function performDataBackup() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['profiles', 'testSessions', 'trials'], 'readonly');
    
    const profiles = await transaction.objectStore('profiles').getAll();
    const sessions = await transaction.objectStore('testSessions').getAll();
    const trials = await transaction.objectStore('trials').getAll();
    
    const backupData = {
      profiles,
      sessions,
      trials,
      timestamp: new Date().toISOString()
    };
    
    // Store backup in cache for later sync
    const cache = await caches.open(CACHE_NAME);
    const backupResponse = new Response(JSON.stringify(backupData));
    await cache.put('/backup/latest', backupResponse);
    
    console.log('Service Worker: Data backup completed');
  } catch (error) {
    console.error('Service Worker: Data backup failed', error);
  }
}
