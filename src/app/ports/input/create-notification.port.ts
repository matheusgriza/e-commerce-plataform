import {
    CreateNotificationDTO,
    NotificationResponse,
} from '../../dto/notification/create-notification.dto';

export interface ICreateNotificationUseCase {
    execute(dto: CreateNotificationDTO): Promise<NotificationResponse>;
}
