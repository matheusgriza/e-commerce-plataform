import { ApiExpress } from '../express/express.api';
import { CustomerController } from './customer.controller';

export function registerCustomerRoutes(
    api: ApiExpress,
    controller: CustomerController,
): void {
    api.addPostRoute('/customers', controller.create);
}
