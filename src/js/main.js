let restaurants,
  neighborhoods,
  cuisines,
  map,
  markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.onWindowResize();
  fetchNeighborhoods();
  fetchCuisines();
  registerSW();
});

// Listen for widow resize event
window.addEventListener("resize", (event) => {
  DBHelper.onWindowResize();
}, false);

// Listen for the restaurant data to be loaded event.
window.addEventListener('loaded', function (event) {
  const restaurantsItems = document.querySelectorAll('.restaurant-item');

  let index = 0;
  // loaded image files
  for (const entry of restaurantsItems.entries()) {
    const img = ImageHelper.lazyLoadImages(event.detail[index]);
    const loadingBall = entry[1].childNodes[1];
    entry[1].removeChild(loadingBall);
    entry[1].insertAdjacentHTML('beforeend', img);
    index++;
  }
}, false);

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood,
      (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const event = new CustomEvent('loaded', { detail: restaurants});
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.insertAdjacentHTML('beforeend', createRestaurantHTML(restaurant));
  });
  addMarkersToMap();

  window.setTimeout(() => {
    window.dispatchEvent(event);
  }, 3000);
}

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = `
    <li class="restaurant-item">
      <div class="loading-ball">
        <div></div>
      </div>
      <h3>${restaurant.name}</h3>
      <p>${restaurant.neighborhood}</p>
      <p class="address">${restaurant.address}</p>
      <a href="${DBHelper.urlForRestaurant(restaurant)}">View Details</a>
    </li>
  `;

  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
  google.maps.event.addListener(map, 'tilesloaded', function(evt) {
    document.querySelectorAll('#map *').forEach(function(item){
      item.setAttribute('tabindex','-1');
    });
  }, false);

}

/**
 * Register Service Worker.
 */
const registerSW = () => {
  // ToDo: Add swervice worker to cache images, styles and js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function() {
            console.log('Registration complete.');
        }, function() {
            console.log('Registration failure.');
        });
  } else {
    console.log('Service worker not supported.');
  }
}
