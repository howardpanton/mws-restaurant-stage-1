import {
    Helper
} from '../services/helpers';
import {
    RestaurantService
} from '../services/restaurant.service';


export class RestaurantDetailComponent {
    helper;
    map;
    restaurant;
    restaurantService;


    constructor() {
        this.helper = new Helper();
        this.helper.onWindowResize();
        document.body.classList.add('inside');
        this.restaurantService = new RestaurantService();

        // Listen for widow resize event
        window.addEventListener(
            "resize",
            event => {
                this.helper.onWindowResize();
                document.body.classList.add('inside');
            },
            false
        );

    };


    // Load the elements need for the Home Page.
    load() {
        this.init();
        this.lazyLoadImagesFromServer();

    }


    /**
     * Initialize Google map, called from HTML.
     */
    init = () => {
        window.initMap = () => {
            this.fetchRestaurantFromURL((error, restaurant) => {
                if (error) { // Got an error!
                    console.error(error);
                } else {
                    this.map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 16,
                        center: restaurant.latlng,
                        scrollwheel: false
                    });
                    this.fillBreadcrumb();
                    this.restaurantService.mapMarkerForRestaurant(this.restaurant, this.map);
                }
            });
        }
    }


    /**
     * Lazy Load Images after the page has loaded.
     */
    lazyLoadImagesFromServer = () => {
        window.addEventListener('loaded', (event) => {
            const restaurantItem = document.getElementById('restaurant-container');
            const gridInfo = document.querySelectorAll('.info-grid');

            // Image HTML is created in /img-helper-js
            // AL tag for Img Element is set in the lazyLoadImages function
            let img = this.helper.lazyLoadImages(event.detail);
            img = document.createRange().createContextualFragment(img);
            const loadingBall = restaurantItem.childNodes[1];

            restaurantItem.removeChild(restaurantItem.childNodes[3]);

            gridInfo[0].insertBefore(img, gridInfo[0].childNodes[1]);
        }, false);
    }


    /**
     * Get current restaurant from page URL.
     */
    fetchRestaurantFromURL = (callback) => {
        if (this.restaurant) { // restaurant already fetched!
            callback(null, this.restaurant)
            return;
        }
        const id = this.getParameterByName('id');
        if (!id) { // no id found in URL
            error = 'No restaurant id in URL'
            callback(error, null);
        } else {
            this.restaurantService.fetchRestaurantById(id, (error, restaurant) => {
                this.restaurant = restaurant;
                if (!restaurant) {
                    console.error(error);
                    return;
                }
                this.fillRestaurantHTML();
                callback(null, restaurant)
            });
        }
    }


    /**
     * Create restaurant HTML and add it to the webpage
     */
    fillRestaurantHTML = () => {
        const event = new CustomEvent('loaded', {
            detail: this.restaurant
        });
        const restaurantHTML = document.getElementById('restaurant-container');

        const restaurantInfo = `
      <h2 id="restaurant-name">${this.restaurant.name}</h2>
      <div class="loading-ball">
        <div></div>
      </div>
      <div class="info-grid">
        <p id="restaurant-cuisine">${this.restaurant.cuisine_type}</p>
      </div>
      <div class="details-grid">
        <p id="restaurant-address">${this.restaurant.address}</p>
      </div>
    `;

        restaurantHTML.innerHTML = restaurantInfo;

        // fill operating hours
        if (this.restaurant.operating_hours) {
            const gridDetail = document.querySelectorAll('.details-grid');
            gridDetail[0].insertBefore(this.fillRestaurantHoursHTML(), gridDetail[0].childNodes[2]);
        }
        // fill reviews
        this.fillReviewsHTML();

        window.setTimeout(() => {
            window.dispatchEvent(event);
        }, 3000);
    }


    /**
     * Create restaurant operating hours HTML table and add it to the webpage.
     */
    fillRestaurantHoursHTML = () => {
        const operatingHours = this.restaurant.operating_hours;
        const table = document.createElement('table');
        table.setAttribute("id", "restaurant-hours");

        let hours = '';

        // Loop through operating hours and build table rows
        Object.keys(operatingHours).forEach((key) => {
            hours += `<tr><td>${key}</td><td>${operatingHours[key]}</td></tr>`;
        });

        table.innerHTML = hours;

        return table;
    }


    /**
     * Create all reviews HTML and add them to the webpage.
     */
    fillReviewsHTML = () => {
        const reviews = this.restaurant.reviews;
        const container = document.getElementById('reviews-container');

        let review = `
            <h3>Reviews</h3>
        `;

        if (!reviews) {
            review += `<p>No reviews yet!'</p>`;
            container.innerHtml = review;
            return;
        }

        const ul = document.getElementById('reviews-list');
        reviews.forEach(review => {
            ul.insertAdjacentHTML('beforeend', this.createReviewHTML(review));
        });
        container.appendChild(ul);
    }


    /**
     * Create review HTML and add it to the webpage.
     */
    createReviewHTML = (review) => {
        const starRating = `&#11088;`;
        const li = `
            <li>
                <p>${review.name}</p>
                <p>${review.date}</p>
                <p>Rating:${Array(review.rating).join(0).split(0).map((item, i) => `
                ${starRating}
            `).join('')}</p>
                <p>${review.comments}</p>
            </li>
        `;

        return li;
    }


    /**
     * Add restaurant name to the breadcrumb navigation menu
     */
    fillBreadcrumb = () => {
        const breadcrumb = document.getElementById('breadcrumb');
        const li = document.createElement('li');
        li.setAttribute("aria-current", this.restaurant.name);
        li.innerHTML = this.restaurant.name;
        breadcrumb.appendChild(li);
    }


    /**
     * Get a parameter by name from page URL.
     */
    getParameterByName = (name, url) => {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
            results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
}
