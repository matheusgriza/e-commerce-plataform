import { NotificationResponse } from '../dto/notification/create-notification.dto';
import { IGetNotificationsUseCase } from '../ports/input/get-notifications.port';
import { INotificationRepository } from '../ports/output/notification.repository';

export class GetNotifications implements IGetNotificationsUseCase {
    constructor(
        private readonly notificationRepository: INotificationRepository,
    ) {}

    public async execute(customerId: string): Promise<NotificationResponse[]> {
        const notifications =
            await this.notificationRepository.findByCustomerId(customerId);

        return notifications.map((notification) => ({
            id: notification.id,
            customerId: notification.customerId,
            type: notification.type,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt.toISOString(),
        }));
    }
}
