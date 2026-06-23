import { buildOrdersModule } from './src/infra/orders.module';
import { ApiExpress } from './src/infra/http/express/express.api';
import { AmqpEventBus } from './src/infra/messaging/amqp-event-bus';
import { HttpProductCatalogClient } from './src/infra/clients/http-product-catalog.client';
import { startDB } from './src/infra/persistence/sqlite/database';

async function main() {
    const db = startDB('orders.db');
    const eventBus = await AmqpEventBus.connect(
        process.env.AMQP_URL ?? 'amqp://localhost',
    );
    const productCatalogClient = new HttpProductCatalogClient(
        process.env.CATALOG_BASE_URL ?? 'http://localhost:3001',
    );

    const api = ApiExpress.build();
    buildOrdersModule(api, db, eventBus, productCatalogClient);

    api.start(3002);
}

main();
