import { NotificationResponse } from '../../dto/notification/create-notification.dto';

export interface IGetNotificationsUseCase {
    execute(customerId: string): Promise<NotificationResponse[]>;
}
