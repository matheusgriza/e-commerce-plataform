import type Database from 'better-sqlite3';

export function migrateCatalogSchema(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            stock INTEGER DEFAULT 0 NOT NULL,
            price INTEGER NOT NULL
        )
    `);
}
