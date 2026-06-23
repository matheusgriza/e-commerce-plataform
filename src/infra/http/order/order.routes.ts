import { ApiExpress } from '../express/express.api';
import { OrderController } from './order.controller';

export function registerOrderRoutes(
    api: ApiExpress,
    controller: OrderController,
): void {
    api.addPostRoute('/orders', controller.create);
}
