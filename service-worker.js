self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v1').then(function(cache) {
        return cache.addAll([
        '/',
        '/index.html',
        '/interfaz1.html',
        '/style.css',
        '/main.css',
        '/main.js',
        '/NLMS.JS',
        '/assets/gps.png',
        '/assets/logo.png'
        ]);
    })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
    caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
    })
    );
});
