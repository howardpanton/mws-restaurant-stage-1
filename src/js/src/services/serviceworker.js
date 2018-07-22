export class ServiceWorker {
    constructor() {
        this.register();
    }

    /**
     * Register Service Worker.
     */
    register = () => {
        // ToDo: Add service worker to cache images, styles and js
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service-worker.js").then(
                function () {
                    console.log("Registration complete.");
                },
                function () {
                    console.log("Registration failure.");
                }
            );
        } else {
            console.log("Service worker not supported.");
        }
    };

}
