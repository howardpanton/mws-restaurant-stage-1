import {
    IDBService
} from './idb';

export class ReviewService {

    idbService;
    DATABASE_URL;
    port;

    constructor() {
        this.port = 1337;
        this.idbService = new IDBService();
        this.DATABASE_URL = `http://localhost:${this.port}`;
    }

    /** http://localhost:1337/api/v1/reviews
     * Fetch all reviews.
     */
    fetchReviews = (id, callback) => {

        let url =
            `${this.DATABASE_URL}/reviews/?restaurant_id=${id}`;

        const request = new Request(url, {
            method: "GET",
            headers: new Headers({
                "Content-Type": "application/json"
            }) 
        });

        // check if we have in database.
        return new Promise((resolve, reject) => this.idbService.init()
            .then(db => {
                // Need to check whether it is in store
                if (db) {
                    // Get the reviews for the restaurant
                    return db.transaction("reviews", 'readonly')
                        .objectStore("reviews").index("restaurants").getAll(parseInt(id, 10));
                }
                return null;
            })
            .then(async reviews => {
                // If no reviews got to API
                if (!reviews || reviews.length === 0) {
                    const response = await fetch(request);
                    reviews = await response.json();
                    const db = await this.idbService.init();
                    reviews.forEach(
                        restaurant => {
                            db.transaction("reviews", 'readwrite')
                                .objectStore("reviews")
                                .put(restaurant);
                        }
                    );
                }

                return reviews;
            })
            .then(reviews => {
                return callback(null, reviews);
            })
            .catch(error => reject(error)));
    }


    /**
     * Fetch a review by its ID.
     */
    fetchReviewsById = (id, callback) => {
        // fetch all reviews with proper error handling.
        this.fetchReviews(id, (error, reviews) => {
            if (error) {
                callback(error, null);
            } else {
                const review = reviews.find(r => r.id == id);
                if (review) {
                    // Got the review
                    callback(null, review);
                } else {
                    // Restaurant does not exist in the database
                    callback("Restaurant does not exist", null);
                }
            }
        });
    }

    /**
     * Fetch a review by Restaurant name.
     */
    fetchReviewsByRestaurantId = (id, callback) => {
        // fetch all reviews with proper error handling.
        this.fetchReviews(id, (error, reviews) => {
            if (error) {
                callback(error, null);
            } else {
                // const review = reviews.find(r => r.restaurant_id == id);
                if (reviews) {
                    // Got the review
                    callback(null, reviews);
                } else {
                    // Restaurant does not exist in the database
                    callback("Restaurant does not exist", null);
                }
            }
        });
    }

    /**
     * Fetch a review by Restaurant name.
     */
    createReview = (review) => {
        // fetch all reviews with proper error handling.
        return fetch('http://localhost:1337/reviews/', {
                method: "POST",
                mode: "cors",
                credentials: "same-origin", // include, same-origin, *omit
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    // "Content-Type": "application/x-www-form-urlencoded",
                },
                body: JSON.stringify(review), // body data type must match "Content-Type" header
            })
            .then(response => response.json()) // parses response to JSON
            .catch(error => console.error(`Fetch Error =\n`, error));

    }

    /**
     * Fetch a review by Restaurant name.
     */
    updateReview = (restaurantID) => {
        // fetch all reviews with proper error handling.
    }

    /**
     * Fetch a review by Restaurant name.
     */
    deleteReview = (restaurantID) => {
        // fetch all reviews with proper error handling.
        return new Promise((resolve, reject) => this.idbService.init()
            .then(db => {
                // Need to check whether it is in store
                if (db) {
                    const tx = db.transaction("reviews", "readwrite");
                    const reviews = tx.objectStore("reviews");
                    tx.objectStore("reviews").iterateCursor(cursor => {
                        if (!cursor) return;
                        if (cursor.value.restaurant_id === parseInt(restaurantID, 10)) {
                            var request = cursor.delete();
                            request.onsuccess = () => {
                                console.log('Deleted');
                            };
                        }
                        cursor.continue();
                    });
                    tx.complete.then(() => console.log('done'));
                    return tx.complete;
                }
            }));

    }
}
