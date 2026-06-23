import type Database from 'better-sqlite3';
import { CreateOrder } from '../app/use-cases/create-order.use-case';
import { CreateCustomer } from '../app/use-cases/create-customer.use-case';
import type { IEventBus } from '../app/ports/output/event-bus.port';
import type { IProductCatalogClient } from '../app/ports/output/product-catalog.client';
import { ApiExpress } from './http/express/express.api';
import { OrderController } from './http/order/order.controller';
import { registerOrderRoutes } from './http/order/order.routes';
import { CustomerController } from './http/order/customer.controller';
import { registerCustomerRoutes } from './http/order/customer.routes';
import { migrateOrdersSchema } from './persistence/sqlite/orders.schema';
import { SqliteOrderRepository } from './persistence/sqlite/sqlite-order.repository';
import { SqliteCustomerRepository } from './persistence/sqlite/sqlite-customer.repository';

export function buildOrdersModule(
    api: ApiExpress,
    db: Database.Database,
    eventBus: IEventBus,
    productCatalogClient: IProductCatalogClient,
): void {
    migrateOrdersSchema(db);

    const orderRepository = new SqliteOrderRepository(db);
    const customerRepository = new SqliteCustomerRepository(db);

    const createOrderUseCase = new CreateOrder(
        orderRepository,
        customerRepository,
        productCatalogClient,
        eventBus,
    );
    const createCustomerUseCase = new CreateCustomer(customerRepository);

    const orderController = new OrderController(createOrderUseCase);
    const customerController = new CustomerController(createCustomerUseCase);

    registerOrderRoutes(api, orderController);
    registerCustomerRoutes(api, customerController);
}
