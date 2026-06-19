import Database from 'better-sqlite3';

export function startDB(filename: string): Database.Database {
    const db = new Database(filename);
    db.pragma('journal_mode = WAL');

    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            stock INTEGER DEFAULT 0 NOT NULL,
            price INTEGER NOT NULL
        )    
    `);
    return db;
}
