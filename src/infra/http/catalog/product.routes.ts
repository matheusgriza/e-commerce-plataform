import { ApiExpress } from '../express/express.api';
import { ProductController } from './product.controller';

export function registerProductRoutes(
    api: ApiExpress,
    controller: ProductController,
): void {
    api.addPostRoute('/products', controller.create);
    api.addGetRoute('/products/:id', controller.getById);
    api.addPutRoute('/products/:id/stock', controller.updateStock);
    api.addPostRoute('/products/reserve', controller.reserve);
    api.addPostRoute('/products/release', controller.release);
}
