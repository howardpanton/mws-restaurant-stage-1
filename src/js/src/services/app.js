import {
    RouteController
} from '../controllers/route.controller';

export class App {
    constructor() {
        this.init();
    };

    init() {
        RouteController.init(window.location.pathname);
    }
}
