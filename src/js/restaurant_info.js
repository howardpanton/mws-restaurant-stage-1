let restaurant;
var map;


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const restaurantHTML = document.getElementById('restaurant-container');
  // const name = document.getElementById('restaurant-name');
  // name.innerHTML = restaurant.name;

  // const address = document.getElementById('restaurant-address');
  // address.innerHTML = restaurant.address;

  // const image = document.getElementById('restaurant-img');
  // image.className = 'restaurant-img'
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);

  // const cuisine = document.getElementById('restaurant-cuisine');
  // cuisine.innerHTML = restaurant.cuisine_type;

  const restaurantInfo = `
    <h1 id="restaurant-name">${restaurant.name}</h1>
    <div class="loading-ball">
      <div></div>
    </div>
    <p id="restaurant-cuisine">${restaurant.cuisine_type}</p>
    <p id="restaurant-address">${restaurant.address}</p>
  `;

  // console.log(restaurantInfo);

  restaurantHTML.innerHTML = restaurantInfo;


  // fill operating hours
  if (restaurant.operating_hours) {
    restaurantHTML.insertAdjacentElement('beforeend', fillRestaurantHoursHTML());
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const table = document.createElement('table');
  table.setAttribute("id", "restaurant-hours");

  let hours = '';

  Object.keys(operatingHours).forEach((key) => {
    hours +=  `<tr><td>${key}</td><td>${operatingHours[key]}</td></tr>`;
    console.log(key, operatingHours[key]);

  });

  // let hours = `
  //     ${Object.keys(operatingHours).forEach((key) => {
  //       `<tr><td>${key}</td><td>${operatingHours[key]}</td></tr>`;
  //     )};

  table.innerHTML = hours;

  console.log(hours);

  return table;

}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
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
