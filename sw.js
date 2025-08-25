const CACHE_NAME = 'pdf-guide-v1';
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

  // Add your PDF files here
  'simplestApp/pdfs/sample1.pdf',
  'simplestApp/pdfs/long abstract v1.pdf',
  'simplestApp/pdfs/Documento (5).pdf'
  // Add more PDFs as needed
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});