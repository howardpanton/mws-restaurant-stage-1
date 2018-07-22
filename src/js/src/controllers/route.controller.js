import {
    HomeComponent
} from '../components/home.component';
import {
    RestaurantDetailComponent
} from '../components/restaurant-detail.component';

export class RouteController {
    constructor(path) {
        this.init(path);
    };

    static init(path) {
        switch (path) {
            case '/':
                const home = new HomeComponent();
                home.load();
                break;
            case '/restaurant.html':
                const restaurantDetail = new RestaurantDetailComponent();
                restaurantDetail.load();
                break;
            default:
                console.log('Sorry', path);
        }
    }
}
