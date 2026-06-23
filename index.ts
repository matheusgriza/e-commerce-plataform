import { buildCatalogModule } from './src/infra/catalog.module';
import { ApiExpress } from './src/infra/http/express/express.api';
import { AmqpEventBus } from './src/infra/messaging/amqp-event-bus';
import { startDB } from './src/infra/persistence/sqlite/database';

async function main() {
    const db = startDB('catalog.db');
    const eventBus = await AmqpEventBus.connect(
        process.env.AMQP_URL ?? 'amqp://localhost',
    );

    const api = ApiExpress.build();
    buildCatalogModule(api, db, eventBus);

    api.start(3001);
}

main();
