import { Notification } from '../../../domain/entities/notification.domain';

export interface INotificationRepository {
    save(notification: Notification): Promise<void>;
    findByCustomerId(customerId: string): Promise<Notification[]>;
}
