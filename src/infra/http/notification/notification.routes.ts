import { ApiExpress } from '../express/express.api';
import { NotificationController } from './notification.controller';

export function registerNotificationRoutes(
    api: ApiExpress,
    controller: NotificationController,
): void {
    api.addGetRoute(
        '/customers/:customerId/notifications',
        controller.listByCustomer,
    );
}
