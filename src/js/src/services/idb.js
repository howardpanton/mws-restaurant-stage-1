import idb from 'idb';

export class IDBService {
    dbPromise;
    tx;
    store;
    idbStore;

    constructor() {
        this.idbStore = idb;
        this.init();
    }

    init() {
        return this.idbStore.open("udacity-restaurant-db", 1, upgradeDb => {
            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore("restaurants", {
                        keyPath: "id"
                    });
                case 1:
                    const reviews = upgradeDb.createObjectStore("reviews", {
                        keyPath: "id"
                    });
                    reviews.createIndex('restaurants', 'restaurant_id');
            }
        });
    }

    getRestaurantsFromDatabase() {
        return this.dbPromise
            .then(db => {
                this.tx = db.transaction("restaurants", "readwrite");
                this.store = this.tx.objectStore("restaurants");
                return this.tx.complete;
            })
            .catch(err => {
                return err;
            })

    }

    clearReviewsFromDatabaseByRestaurant(ID) {
        return this.dbPromise
            .then(db => {
                this.tx = db.transaction("restaurants", "readwrite");
                this.store = this.tx.objectStore("reviews").index("restaurants").get(ID);
                this.store.clear();
                return this.tx.complete;
            })
            .catch(err => {
                return err;
            })

    }
}
