import type Database from 'better-sqlite3';

export function migrateNotificationsSchema(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_notifications_customer_id
            ON notifications(customer_id);
    `);
}
