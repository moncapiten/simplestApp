const CACHE_NAME = 'pdf-guide-v1';
const urlsToCache = [
  
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',

  '/icons/icon-192.png',
  '/icons/icon-512.png',

  '/specifics/spain.html',
  '/specifics/pdfs/spain/20250826.pdf',
  '/specifics/pdfs/spain/20250827.pdf',
  '/specifics/pdfs/spain/20250828.pdf',
  '/specifics/pdfs/spain/20250829.pdf',
  '/specifics/pdfs/spain/20250830.pdf',
  '/specifics/pdfs/spain/20250831.pdf',
  '/specifics/pdfs/spain/20250901.pdf',
  '/specifics/pdfs/spain/20250902.pdf',
  '/specifics/pdfs/spain/glossary.pdf',
  '/specifics/pdfs/spain/itinerary.pdf',

  // Add your PDF files here
  '/pdfs/sample1.pdf',
  '/pdfs/long abstract v1.pdf',
  '/pdfs/Documento (5).pdf'
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