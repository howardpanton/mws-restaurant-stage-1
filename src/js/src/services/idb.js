import idb from 'idb';

export class IDBService {
    dbPromise;
    tx;
    store;

    constructor() {
        this.init();
    }

    init() {
        return idb.open("udacity-restaurant-db", 1, upgradeDb => {
            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore("restaurants", {
                        keyPath: "id"
                    });
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
}
