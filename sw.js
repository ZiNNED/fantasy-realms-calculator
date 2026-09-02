// Fantasy Realms Calculator — Service Worker
const CACHE_VERSION = 'v13';
const CACHE_NAME = 'fantasy-realms-' + CACHE_VERSION;

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/app.js?v=13',
    '/cards.js?v=13',
    '/style.css?v=13',
    '/manifest.json',
    '/favicon.ico',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});