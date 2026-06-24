import { buildNotificationsModule } from './src/infra/notifications.module';
import { ApiExpress } from './src/infra/http/express/express.api';
import { AmqpEventConsumer } from './src/infra/messaging/amqp-event-consumer';
import { startDB } from './src/infra/persistence/sqlite/database';

async function main() {
    const db = startDB('notifications.db');
    const eventSubscriber = await AmqpEventConsumer.connect(
        process.env.AMQP_URL ?? 'amqp://localhost',
    );

    const api = ApiExpress.build();
    await buildNotificationsModule(api, db, eventSubscriber);

    api.start(3003);
}

main();
