import { Notification } from '../../domain/entities/notification.domain';
import {
    CreateNotificationDTO,
    NotificationResponse,
} from '../dto/notification/create-notification.dto';
import { ICreateNotificationUseCase } from '../ports/input/create-notification.port';
import { INotificationRepository } from '../ports/output/notification.repository';

export class CreateNotification implements ICreateNotificationUseCase {
    constructor(
        private readonly notificationRepository: INotificationRepository,
    ) {}

    public async execute(
        dto: CreateNotificationDTO,
    ): Promise<NotificationResponse> {
        const notification = Notification.create(
            dto.customerId,
            dto.type,
            dto.message,
        );

        await this.notificationRepository.save(notification);

        return {
            id: notification.id,
            customerId: notification.customerId,
            type: notification.type,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt.toISOString(),
        };
    }
}
