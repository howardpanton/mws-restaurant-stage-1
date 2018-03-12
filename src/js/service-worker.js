// "use strict";

// ToDO: Install ServiceWorker
const CACHE_VERSION = 'v10';

const urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'data/restaurants.json',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg'
];


// Install the service worker and cache files
// ToDo add caching for Google map
self.addEventListener('install', function(event) {
  console.log('Service Worker: install');
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
    .then(function() {
      console.log('Service Worker: complete');
    })
    .catch(function(err) {
      console.log('Service Worker: errorr', err);
    })
  );
});


// Check to see if we have a match request for event
// If match, return match from cache
self.addEventListener('fetch', function(event) {
  console.log('WORKER: fetch event in progres..');
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('response', response);
          return response;
        }
        console.log('request', event.request);
        return fetch(event.request).then(function(response) {
          if (response.status == 404) {
            return new Response("Page not found");
          }
          return response;
        }).catch(function() {
          return new Response("Sorry we are having issues");
        })
      }
    )
  );
});
