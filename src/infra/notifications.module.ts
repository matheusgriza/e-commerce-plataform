import type Database from 'better-sqlite3';
import { CreateNotification } from '../app/use-cases/create-notification.use-case';
import { GetNotifications } from '../app/use-cases/get-notifications.use-case';
import type { IEventSubscriber } from '../app/ports/output/event-subscriber.port';
import { ApiExpress } from './http/express/express.api';
import { NotificationController } from './http/notification/notification.controller';
import { registerNotificationRoutes } from './http/notification/notification.routes';
import { migrateNotificationsSchema } from './persistence/sqlite/notifications.schema';
import { SqliteNotificationRepository } from './persistence/sqlite/sqlite-notification.repository';
import { OrderEventNotificationHandler } from './messaging/order-event-notification.handler';

const ORDER_EVENTS_QUEUE = 'notifications.order-events';
const ORDER_ROUTING_KEYS = [
    'orders.order.created',
    'orders.order.confirmed',
    'orders.order.cancelled',
];

export async function buildNotificationsModule(
    api: ApiExpress,
    db: Database.Database,
    eventSubscriber: IEventSubscriber,
): Promise<void> {
    migrateNotificationsSchema(db);

    const notificationRepository = new SqliteNotificationRepository(db);

    const createNotificationUseCase = new CreateNotification(
        notificationRepository,
    );
    const getNotificationsUseCase = new GetNotifications(
        notificationRepository,
    );

    const notificationController = new NotificationController(
        getNotificationsUseCase,
    );
    registerNotificationRoutes(api, notificationController);

    const orderEventHandler = new OrderEventNotificationHandler(
        createNotificationUseCase,
    );
    await eventSubscriber.subscribe(
        ORDER_EVENTS_QUEUE,
        ORDER_ROUTING_KEYS,
        orderEventHandler.handle,
    );
}
