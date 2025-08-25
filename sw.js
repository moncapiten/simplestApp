const CACHE_NAME = 'pdf-guide-v2'; // Updated version number
const urlsToCache = [

  'simplestApp/index.html',
  'simplestApp/styles.css',
  'simplestApp/script.js',
  'simplestApp/manifest.json',
  
  'simplestApp/icons/icon-192.png',
  'simplestApp/icons/icon-512.png',
  

  'simplestApp/specifics/spain.html',
  
  'simplestApp/specifics/pdfs/spain/20250826.pdf',
  'simplestApp/specifics/pdfs/spain/20250827.pdf',
  'simplestApp/specifics/pdfs/spain/20250828.pdf',
  'simplestApp/specifics/pdfs/spain/20250829.pdf',
  'simplestApp/specifics/pdfs/spain/20250830.pdf',
  'simplestApp/specifics/pdfs/spain/20250831.pdf',
  'simplestApp/specifics/pdfs/spain/20250901.pdf',
  'simplestApp/specifics/pdfs/spain/20250902.pdf',
  'simplestApp/specifics/pdfs/spain/glossary.pdf',
  'simplestApp/specifics/pdfs/spain/itinerary.pdf',
  
  
  'simplestApp/pdfs/sample1.pdf',
  'simplestApp/pdfs/long abstract v1.pdf',
  'simplestApp/pdfs/Documento (5).pdf'
];

// Install event - cache resources more aggressively
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache');
        
        // Cache files one by one to handle failures gracefully
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`Cached: ${url}`);
            } else {
              console.warn(`Failed to cache ${url}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('Caching completed');
      })
  );
  
  // Force the new service worker to take control immediately
  self.skipWaiting();
});

// Fetch event - serve from cache when offline, cache new requests
self.addEventListener('fetch', (event) => {
  // Only handle requests from your domain
  if (!event.request.url.includes('simplestApp')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we have a cached version, return it
        if (response) {
          console.log(`Serving from cache: ${event.request.url}`);
          return response;
        }

        // If not cached, fetch from network and cache it
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log(`Cached new request: ${event.request.url}`);
              });

            return response;
          })
          .catch((error) => {
            console.log(`Network request failed for ${event.request.url}:`, error);
            // You could return a custom offline page here
            throw error;
          });
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});