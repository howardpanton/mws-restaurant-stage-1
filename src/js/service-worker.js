// ToDO: Install ServiceWorker
const version = 'v1';

self.addEventListener("install", (event) => {
    console.log('Service Worker: install');
    event.waitUntil(
      caches.open(version)
        .then((cache) => {
          return cache.addAll([
            '/',
            '/css/style.css',
            '/data/restaurant.json',
            '/js/dbhelper.js',
            '/js/main.js',
            '/js/restaurant_info.js',
            '/img/1.jpg',
            '/img/2.jpg',
            '/img/3.jpg',
            '/img/4.jpg',
            '/img/5.jpg',
            '/img/6.jpg',
            '/img/7.jpg',
            '/img/8.jpg',
            '/img/9.jpg',
            '/img/10.jpg',
            'index.html',
            'restaurant.html'
          ]);
        })
        .then(() => {
          console.log('Service Worker: complete');
        })
    );
  });
