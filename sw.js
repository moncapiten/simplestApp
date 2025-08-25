const CACHE_NAME = 'simplest-app-v1';

// Cache everything in the simplestApp directory
const urlsToCache = [
  // Main app files
  './index.html',
  './styles.css', 
  './script.js',
  './manifest.json',
  
  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',
  
  // All specifics content
  './specifics/spain.html',
  
  // All Spain PDFs
  './specifics/pdfs/spain/20250826.pdf',
  './specifics/pdfs/spain/20250827.pdf',
  './specifics/pdfs/spain/20250828.pdf',
  './specifics/pdfs/spain/20250829.pdf',
  './specifics/pdfs/spain/20250830.pdf',
  './specifics/pdfs/spain/20250831.pdf',
  './specifics/pdfs/spain/20250901.pdf',
  './specifics/pdfs/spain/20250902.pdf',
  './specifics/pdfs/spain/glossary.pdf',
  './specifics/pdfs/spain/itinerary.pdf',
  
  // Other PDFs in main pdfs folder
  './pdfs/sample1.pdf',
  './pdfs/long abstract v1.pdf',
  './pdfs/Documento (5).pdf'
  
  // Add any other files you want cached here
  // './specifics/italy.html',
  // './specifics/pdfs/italy/...',
  // etc.
];

self.addEventListener('install', (event) => {
  console.log('SimplestApp SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('SimplestApp SW: Cache opened');
        
        // Cache files one by one with detailed logging
        const cacheResults = [];
        for (const url of urlsToCache) {
          try {
            console.log(`SimplestApp SW: Caching ${url}...`);
            await cache.add(url);
            console.log(`✓ SimplestApp SW: Successfully cached ${url}`);
            cacheResults.push({ url, success: true });
          } catch (error) {
            console.warn(`✗ SimplestApp SW: Failed to cache ${url}:`, error);
            cacheResults.push({ url, success: false, error });
          }
        }
        
        const successful = cacheResults.filter(r => r.success).length;
        const failed = cacheResults.filter(r => !r.success).length;
        console.log(`SimplestApp SW: Caching summary - ${successful} successful, ${failed} failed`);
        
        // Log failed files for debugging
        const failedFiles = cacheResults.filter(r => !r.success);
        if (failedFiles.length > 0) {
          console.warn('SimplestApp SW: Failed files:', failedFiles.map(f => f.url));
        }
      })
  );
  
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Only handle requests within the simplestApp scope
  const url = new URL(event.request.url);
  if (!url.pathname.includes('/simplestApp/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`SimplestApp SW: Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }

        console.log(`SimplestApp SW: Fetching from network: ${event.request.url}`);
        return fetch(event.request)
          .then((response) => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
                console.log(`SimplestApp SW: Cached new resource: ${event.request.url}`);
              });
            }
            return response;
          })
          .catch((error) => {
            console.error(`SimplestApp SW: Network request failed for ${event.request.url}:`, error);
            
            // You could return a custom offline page here if needed
            // return caches.match('./offline.html');
            
            throw error;
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SimplestApp SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any caches that don't match the current version
          if (cacheName.startsWith('simplest-app-') && cacheName !== CACHE_NAME) {
            console.log('SimplestApp SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SimplestApp SW: Taking control of all clients');
      return self.clients.claim();
    })
  );
});