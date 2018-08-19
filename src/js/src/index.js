'use strict';
import '@babel/polyfill';
import {
    Helper
} from './services/helpers';
import {
    RestaurantService
} from './services/restaurant.service';
import {
    ServiceWorker
} from './services/serviceworker';

export class HomeComponent {
    helper;
    restaurants;
    neighborhoods;
    cuisines;
    map;
    newMap;
    dbPromise;
    markers = [];
    restaurantService;
    serviceWorker;
    faveRestaurant = [];

    constructor() {
        this.helper = new Helper();
        this.helper.onWindowResize();
        this.restaurantService = new RestaurantService();
        this.serviceWorker = new ServiceWorker();

        if (!navigator.onLine) {
            const status = document.getElementById("status");
            this.helper.updateOfflineStatusHTML('offline', status);
        }

        if (navigator.onLine) {
            this.checkForOfflineData();
        }

        // Listen for widow resize event
        window.addEventListener(
            "resize",
            event => {
                this.helper.onWindowResize();
            },
            false
        );

        document.getElementById("neighborhoods-select")
            .addEventListener("change", event => {
                this.updateRestaurants();
            }, false);

        document.getElementById("cuisines-select")
            .addEventListener("change", event => {
                this.updateRestaurants();
            }, false);

        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);

    };

    checkForOfflineData() {
        const offlineData = JSON.parse(window.localStorage.getItem('faves'));
        if (offlineData) {
            offlineData.forEach((data) => {
                this.restaurantService.updateRestaurantFavourite(data.ID, data.is_fave);
                this.faveRestaurant = [];
                window.localStorage.removeItem('faves');
            });
        }
    }

    // Load the elements need for the Home Page.
    load() {
        this.updateRestaurants();
        this.fetchNeighborhoods();
        this.fetchCuisines();
        this.serviceWorker.register();
        this.lazyLoadImagesFromServer();
    }

    updateOnlineStatus = () => {
        this.checkForOfflineData();
    }



    /**
     * Fetch all neighborhoods and set their HTML.
     */
    fetchNeighborhoods = () => {
        this.restaurantService.fetchNeighborhoods((error, neighborhoods) => {
            if (error) {
                // Got an error
                console.error(error);
            } else {
                this.neighborhoods = neighborhoods;
                this.fillNeighborhoodsHTML();
            }
        });
    };


    /**
     * Set neighborhoods HTML.
     */
    fillNeighborhoodsHTML = () => {
        const select = document.getElementById("neighborhoods-select");
        this.neighborhoods.forEach(neighborhood => {
            const option = document.createElement("option");
            option.innerHTML = neighborhood;
            option.value = neighborhood;
            select.append(option);
        });
    };


    /**
     * Fetch all cuisines and set their HTML.
     */
    fetchCuisines = () => {
        this.restaurantService.fetchCuisines((error, cuisines) => {
            if (error) {
                // Got an error!
                console.error(error);
            } else {
                this.cuisines = cuisines;
                this.fillCuisinesHTML();
            }
        });
    };


    /**
     * Set cuisines HTML.
     */
    fillCuisinesHTML = () => {
        const select = document.getElementById("cuisines-select");

        this.cuisines.forEach(cuisine => {
            const option = document.createElement("option");
            option.innerHTML = cuisine;
            option.value = cuisine;
            select.append(option);
        });
    };


    /**
     *
     * Update page and map for current restaurants.
     */
    updateRestaurants = () => {
        this.cSelect = document.getElementById("cuisines-select");
        this.nSelect = document.getElementById("neighborhoods-select");

        this.cIndex = this.cSelect.selectedIndex;
        this.nIndex = this.nSelect.selectedIndex;
        this.cuisine = this.cSelect[this.cIndex].value;
        this.neighborhood = this.nSelect[this.nIndex].value;
        this.restaurantService.fetchRestaurantByCuisineAndNeighborhood(
            this.cuisine,
            this.neighborhood,
            (error, restaurants) => {
                if (error) {
                    // Got an error!
                    console.log(error, "error");
                } else {
                    this.resetRestaurants(restaurants);
                    this.fillRestaurantsHTML(restaurants);
                }
            }
        );
    };


    /**
     * Clear current restaurants, their HTML and remove their map markers.
     */
    resetRestaurants = restaurants => {
        // Remove all restaurants
        this.restaurants = [];
        const ul = document.getElementById("restaurants-list");
        ul.innerHTML = "";

        // Remove all map markers
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
        this.restaurants = restaurants;
    };


    /**
     * Create all restaurants HTML and add them to the webpage.
     */
    fillRestaurantsHTML = (restaurants) => {
        const event = new CustomEvent("loaded", {
            detail: restaurants
        });
        const ul = document.getElementById("restaurants-list");
        restaurants.forEach(restaurant => {
            ul.insertAdjacentHTML("beforeend", this.createRestaurantHTML(restaurant));
        });
        this.addMarkersToMap(restaurants);

        window.setTimeout(() => {
            window.dispatchEvent(event);
        }, 3000);
    };


    /**
     * Create restaurant HTML.
     */
    createRestaurantHTML = restaurant => {
        let style = restaurant.name.replace(/\s+/g, "-").toLowerCase();
        const li = `
      <li class="restaurant-item"
        data-id="${restaurant.id}">
        <div class="loading-ball">
          <div></div>
        </div>
        <h3 id="name-${style}">${restaurant.name}</h3>
        <p id="neighborhood-${style}">${restaurant.neighborhood}</p>
        <p id="address-${style}">${restaurant.address}</p>
        <a aria-labelledby="name-${style} neighborhood-${style} address-${style}"
          href="${this.restaurantService.urlForRestaurant(restaurant)}">View Details</a>
        <button class="fav_btn ${restaurant.is_favorite ? ` active` : ``} ">&hearts;</button>
      </li>
    `;
        return li;
    };


    /**
     * Add markers for current restaurants to the map.
     */
    addMarkersToMap = restaurants => {
        restaurants.forEach(restaurant => {
            // Add marker to the map
            const marker = this.restaurantService.mapMarkerForRestaurant(restaurant, map);
            google.maps.event.addListener(marker, "click", () => {
                window.location.href = marker.url;
            });
            this.markers.push(marker);
        });

        google.maps.event.addListener(
            map,
            "tilesloaded",
            function (evt) {
                // MWS Slack/restaurant-project hack to add tabindex -1
                document.querySelectorAll("#map *").forEach((item) => {
                    item.setAttribute("tabindex", "-1");
                });
            },
            false
        );
    };


    /**
     * Lazy Load Images after the page has loaded.
     */
    lazyLoadImagesFromServer = () => {
        // Listen for the restaurant data to be loaded event.
        window.addEventListener(
            "loaded",
            (event) => {
                const restaurantsItems = document.querySelectorAll(".restaurant-item");

                let index = 0;
                // loaded image files
                for (const entry of restaurantsItems.entries()) {
                    // Image HTML is created in /img-helper-js
                    // AL tag for Img Element is set in the lazyLoadImages function
                    const img = this.helper.lazyLoadImages(event.detail[index]);
                    const loadingBall = entry[1].childNodes[1];
                    entry[1].removeChild(loadingBall);
                    entry[1].insertAdjacentHTML("beforeend", img);
                    // entry[1].insertAdjacentHTML("beforeend", favButton);
                    index++;
                }

                this.addClickEventToBtn();
            },
            false
        );
    }


    addClickEventToBtn = () => {
        const favBtns = document.getElementsByClassName('fav_btn');
        Array.from(favBtns).forEach((btn) => {
            btn.onclick = (event) => {
                const ID = event.target.parentElement.dataset.id;
                // toggle class
                if (btn.classList.contains('active')) {
                    // remove active
                    btn.classList.remove('active');
                    // remove from DB
                    if (navigator.onLine) {
                        this.restaurantService.updateRestaurantFavourite(ID, false);
                    } else {
                        this.faveRestaurant.push({
                            ID: ID,
                            is_fave: false,
                        })
                        window.localStorage.setItem('faves', (JSON.stringify(this.faveRestaurant)));
                        // Add to Localstore until back online
                    }
                } else {
                    btn.classList.add('active');
                    // Add to DB

                    if (navigator.onLine) {
                        this.restaurantService.updateRestaurantFavourite(ID, true);
                    } else {
                        this.faveRestaurant.push({
                            ID: ID,
                            is_fave: true,
                        })
                        window.localStorage.setItem('faves', (JSON.stringify(this.faveRestaurant)));
                        // Add to Localstore until back online
                    }
                }
            }
        })
    }
}

const home = new HomeComponent();
home.load();
