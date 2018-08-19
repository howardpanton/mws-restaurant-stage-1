import '@babel/polyfill';
import {
    Helper
} from './services/helpers';
import {
    RestaurantService
} from './services/restaurant.service';
import {
    MessageService
} from './services/message.service';
import {
    ReviewService
} from './services/review.service';
import {
    ServiceWorker
} from './services/serviceworker';



export class RestaurantDetailComponent {
    helper;
    newMap;
    restaurant;
    restaurantService;
    reviewService;
    messageService;
    serviceWorker;
    reviews = [];

    constructor() {
        this.helper = new Helper();
        this.helper.onWindowResize();
        document.body.classList.add('inside');
        this.restaurantService = new RestaurantService();
        this.reviewService = new ReviewService();
        this.messageService = new MessageService();
        this.serviceWorker = new ServiceWorker();

        if (!navigator.onLine) {
            const status = document.getElementById("status");
            this.helper.updateOfflineStatusHTML('offline', status);
        }

        if (navigator.onLine) {
            this.checkForOfflineData();
            this.checkForStoredOfflineData();
        }

        // Listen for widow resize event
        window.addEventListener(
            "resize",
            event => {
                this.helper.onWindowResize();
                document.body.classList.add('inside');
            },
            false
        );

        // Handle form submission on User click
        const submitButton = document.getElementsByClassName('submit-review');
        submitButton[0].addEventListener('click', this.formHandler, {
            passive: false
        });

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
        this.init();
        this.lazyLoadImagesFromServer();
    }


    updateOnlineStatus = () => {
        console.log('update online');
        this.checkForStoredOfflineData();
        this.checkForOfflineData();
    }

    /**
     * Initialize leaflet map
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
        // Listen to form field changes
        document.querySelector('select[name="rating"]')
            .onchange = this.changeEventHandler;
        document.querySelector('input[name="name"]')
            .onchange = this.changeEventHandler;
        document.querySelector('textarea[name="comments"]')
            .onchange = this.changeEventHandler;

        // Check if we have any offline data to input
        window.addEventListener('online', this.checkForStoredOfflineData);
    }


    // Handle form
    formHandler = (event) => {
        event.preventDefault();
        const form = new FormData(document.getElementById('review'));
        this.validateForm(form)
    }


    validateForm = (form) => {
        const ID = this.getParameterByName('id');
        const validatedFields = {
            'restaurant_id': parseInt(ID, 10),
            'name': null,
            'rating': null,
            'comments': null,
            'createdAt': new Date
        };

        for (const entry of form) {
            if (entry[1] === '') {
                this.addFormError(entry[0]);
            } else {
                validatedFields[entry[0]] = entry[1];
            }
        }
        if (validatedFields['name'] &&
            validatedFields['rating'] && validatedFields['comments']) {
            // Check if online
            // Store in SessionStorage
            // Add review to page
            const ul = document.getElementById('reviews-list');
            ul.insertAdjacentHTML('beforeend', this.createReviewHTML(validatedFields));

            document.getElementById('review').reset();

            if (!navigator.onLine) { // true|false
                this.storeUntilOnline(validatedFields);
            } else {
                this.postReviewToApi(validatedFields);
            }

        }

    }

    checkForStoredOfflineData = () => {
        const offlineData = JSON.parse(window.localStorage.getItem('reviews'));
        if (offlineData) {
            offlineData.forEach((data) => {
                this.postReviewToApi(data);
            })
        }
        window.localStorage.removeItem('reviews');
    }



    storeUntilOnline = (validatedFields) => {
        reviews.push(validatedFields)
        window.localStorage.setItem('reviews', JSON.stringify(reviews));
        this.showToasterMessage('Thanks for the review, we will post to site as soon as you are back online');
    }

    showToasterMessage = (message) => {
        // Update the UI with a feedback message
        // window.localStorage.setItem('message', message);
        this.messageService.post(message);
    }

    changeEventHandler = (event) => {
        // You can use “this” to refer to the selected element.
        if (!event.target.value) this.addFormError(event.target.name);
        else this.removeFormError(event.target.name);
    }

    addFormError = (field) => {
        const showError = document.querySelectorAll(`.${field}-error`);
        showError[0].classList.add('has-error');
    }

    removeFormError = (field) => {
        const hideError = document.querySelectorAll(`.${field}-error`);
        hideError[0].classList.remove('has-error');
    }

    postReviewToApi = (validatedFields) => {
        this.reviewService.createReview(validatedFields);
        this.reviewService.deleteReview(validatedFields.restaurant_id)
            .then(result => {
                console.log('done');
            });
        this.showToasterMessage(`Thanks for the review, ${validatedFields['name']}`);
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
        <button class="fav_btn ${this.restaurant.is_favorite ? ` active` : ``} ">&hearts;</button>
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

        this.addClickEventToBtn();

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
        const id = this.getParameterByName('id');
        if (!id) { // no id found in URL
            error = 'No restaurant id in URL'
        } else {
            this.reviewService.fetchReviewsByRestaurantId(id, (error, reviews) => {

                if (!reviews) {
                    review += `<p>No reviews yet!'</p>`;
                    container.innerHtml = review;
                    return;
                }

                const container = document.getElementById('reviews-container');

                let review = `
                <h3>Reviews</h3>
            `;

                const ul = document.getElementById('reviews-list');
                reviews.forEach(review => {
                    ul.insertAdjacentHTML('beforeend', this.createReviewHTML(review));
                });
                container.appendChild(ul);
            });
        }
    }


    /**
     * Create review HTML and add it to the webpage.
     */
    createReviewHTML = (review) => {
        const starRating = `&#11088;`;
        let rating = null;

        if (typeof review.rating === 'string') {
            rating = parseInt(review.rating, 10);
        } else {
            rating = review.rating;
        }
        const li = `
            <li>
                <p>${review.name}</p>
                <p>Rating:${Array(rating).join(0).split(0).map((item, i) => `
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

const restaurantDetail = new RestaurantDetailComponent();
restaurantDetail.load();
