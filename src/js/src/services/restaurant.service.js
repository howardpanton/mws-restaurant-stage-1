import {
    IDBService
} from './idb';

export class RestaurantService {

    idbService;
    DATABASE_URL;
    port;

    constructor() {
        this.port = 1337;
        this.idbService = new IDBService();
        this.DATABASE_URL = `http://localhost:${this.port}`;
    }

    /** http://localhost:1337/api/v1/restaurants
     * Fetch all restaurants.
     */
    fetchRestaurants(id, callback) {

        let url = id ?
            `${this.DATABASE_URL}/restaurants/${id}` :
            `${this.DATABASE_URL}/restaurants`;

        const request = new Request(url, {
            method: "GET",
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });

        // check if we have in database.
        // console.log(this.idbService.hasDatabase(), 'test');
        return new Promise((resolve, reject) => this.idbService.init()
            .then(db => {
                if (db) {
                    return db.transaction("restaurants", 'readonly')
                        .objectStore("restaurants")
                        .getAll();
                }

                return null;
            })
            .then(async restaurants => {
                if (!restaurants || restaurants.length === 0) {
                    const response = await fetch(request);
                    restaurants = await response.json();
                    const db = await this.idbService.init();
                    restaurants.forEach(
                        restaurant => db.transaction("restaurants", 'readwrite')
                        .objectStore("restaurants")
                        .put(restaurant)
                    );
                }

                return restaurants;
            })
            .then(restaurants => {
                return callback(null, restaurants);
            })
            .catch(error => reject(error)));
    }


    /**
     * Fetch a restaurant by its ID.
     */
    fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        this.fetchRestaurants(id, (error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) {
                    // Got the restaurant
                    callback(null, restaurant);
                } else {
                    // Restaurant does not exist in the database
                    callback("Restaurant does not exist", null);
                }
            }
        });
    }


    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    fetchRestaurantByCuisineAndNeighborhood(
        cuisine,
        neighborhood,
        callback
    ) {
        // Fetch all restaurants
        this.fetchRestaurants(null, (error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != "all") {
                    // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != "all") {
                    // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }


    /**
     * Fetch all neighborhoods with proper error handling.
     */
    fetchNeighborhoods(callback) {
        // Fetch all restaurants
        this.fetchRestaurants(null, (error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map(
                    (v, i) => restaurants[i].neighborhood
                );
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter(
                    (v, i) => neighborhoods.indexOf(v) == i
                );
                callback(null, uniqueNeighborhoods);
            }
        });
    }


    /**
     * Fetch all cuisines with proper error handling.
     */
    fetchCuisines(callback) {
        // Fetch all restaurants
        this.fetchRestaurants(null, (error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter(
                    (v, i) => cuisines.indexOf(v) == i
                );
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    urlForRestaurant(restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }


    /**
     * Restaurant image URL.
     */
    imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.id}.webp`;
    }

    /**
     * Map marker for a restaurant.
     */
    mapMarkerForRestaurant(restaurant, map) {
        if (google) {
            const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: this.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP
            });
            return marker;
        }
    }

    /**
     * Fetch a review by Restaurant name.
     */
    updateRestaurantFavourite = (restaurantID, isFave) => {
        // fetch all reviews with proper error handling.
        return fetch(`http://localhost:1337/restaurants/${restaurantID}/?is_favorite=${isFave}`, {
                method: "PUT",
                mode: "cors",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            })
            .then(response => {
                // const restaurant = response;
                this.idbService.init()
                    .then(db => {
                        console.log(db, 'db');
                        if (db) {
                            const tx = db.transaction("restaurants", 'readwrite');
                            const restaurantStore = tx.objectStore("restaurants");
                            restaurantStore.get(parseInt(restaurantID, 10))
                                .then(restaurant => {
                                    console.log(restaurant, 'rest');
                                    restaurant.is_favorite = isFave;
                                    restaurantStore.put(restaurant);
                                })

                        }
                    })
            }) // parses response to JSON
            .catch(error => console.error(`Fetch Error =\n`, error));

    }
}
