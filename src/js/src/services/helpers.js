import {
    RestaurantService
} from './restaurant.service';


export class Helper {
    restaurantService;

    constructor() {
        this.restaurantService = new RestaurantService();
        window.addEventListener('online', this.updateStatus);
        window.addEventListener('offline', this.updateStatus);
    }

    /**
     * Update the User when the website is offline.
     *  https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/Online_and_offline_events
     */
    updateStatus = (event) => {
        const status = document.getElementById("status");
        const condition = navigator.onLine ? "online" : "offline";

        if (condition === "offline") {
            status.className = condition;
            status.insertAdjacentHTML("beforeend", "Status: Website " + condition);
            status.setAttribute("aria-live", "assertive");
        } else if (condition === "online") {
            status.className = '';
            status.innerHTML = '';
            status.removeAttribute("aria-live");
        }
    }


    onWindowResize() {
        let width = document.body.clientWidth;
        let mediaWidth = "";

        if (width >= 1024) {
            mediaWidth = "lrg-desktop";
        } else if (width >= 768) {
            mediaWidth = "desktop";
        } else if (width >= 425) {
            mediaWidth = "mobile-l";
        } else if (width >= 375) {
            mediaWidth = "mobile-m";
        } else if (width >= 320) {
            mediaWidth = "mobile-s";
        }

        document.body.className = "";
        document.body.classList.add(mediaWidth);

        return mediaWidth;
    }


    /**
     * Lazy Load Images
     */
    lazyLoadImages(restaurant) {
        const img = `
      <figure>
        ​<picture>
          <source srcset="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-lrg-desktop.webp")}"
            media="(min-width: 1024px)">
          <source srcset="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-desktop.webp")}"
            media="(min-width: 768px)">
          <source srcset="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-mobile-l.webp")}"
            media="(min-width: 425px)">
          <source srcset="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-mobile-m.webp")}"
            media="(min-width: 375px)">
          <source srcset="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-mobile-s.webp")}"
            media="(min-width: 320px)">
          <img class="restaurant-img fade-in" alt="Image of ${restaurant.name} Restaurant"
          src="${this.restaurantService.imageUrlForRestaurant(restaurant)
            .replace(/\.webp$/, "-lrg-desktop.webp")}" >
        </picture>
      </figure>
    `;
        return img;
    }
}
