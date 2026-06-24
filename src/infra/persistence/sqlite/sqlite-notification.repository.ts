import Database from 'better-sqlite3';
import { INotificationRepository } from '../../../app/ports/output/notification.repository';
import { Notification } from '../../../domain/entities/notification.domain';

type NotificationRow = {
    id: string;
    customer_id: string;
    type: string;
    message: string;
    read: number;
    created_at: string;
};

export class SqliteNotificationRepository implements INotificationRepository {
    constructor(readonly db: Database.Database) {}

    private toDomain(row: NotificationRow): Notification {
        return Notification.with(
            row.id,
            row.customer_id,
            row.type,
            row.message,
            row.read === 1,
            new Date(row.created_at),
        );
    }

    public async save(notification: Notification): Promise<void> {
        this.db
            .prepare(
                'INSERT INTO notifications (id, customer_id, type, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            )
            .run(
                notification.id,
                notification.customerId,
                notification.type,
                notification.message,
                notification.read ? 1 : 0,
                notification.createdAt.toISOString(),
            );
    }

    public async findByCustomerId(customerId: string): Promise<Notification[]> {
        const rows = this.db
            .prepare(
                'SELECT * FROM notifications WHERE customer_id = ? ORDER BY created_at DESC',
            )
            .all(customerId) as NotificationRow[];

        return rows.map((row) => this.toDomain(row));
    }
}
