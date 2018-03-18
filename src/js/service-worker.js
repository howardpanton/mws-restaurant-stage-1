// "use strict";

// ToDO: Install ServiceWorker
const CACHE_VERSION = 'v11:restaurant-app';

const urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'https://fonts.googleapis.com/css?family=Roboto:300,400',
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
  'img/10.jpg',
  'https://normalize-css.googlecode.com/svn/trunk/normalize.css',
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyCHgJMUUZeJrW9cebfuJbVyc4rILoi8kOM&libraries=places&callback=initMap'
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

// Register for a foreign fetch
// ToDo
self.addEventListener('install', event => {
  event.registerForeignFetch({
    scopes: ['/'],
    origins: ['*']
  });
});

// Listen for foreign fetch event
// ToDo - Fix caching
self.addEventListener('foreignfetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => console.log('foreign', event.request))
      .then(response => {
        return fetch(event.origin);
      })
  );
});

// Check to see if we have a match request for event
// If match, return match from cache
self.addEventListener('fetch', function(event) {
  console.log('WORKER: fetch event in progress..');
  // Attempt to cache Google Map API
  new Response({
    headers: {
      'Link': '</service-worker.js>; rel="serviceworker"',
      'Access-Control-Allow-Origin': '*'
  }
  });
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
