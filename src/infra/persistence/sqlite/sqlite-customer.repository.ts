import Database from 'better-sqlite3';
import { ICustomerRepository } from '../../../app/ports/output/customer.repository';
import {
    Customer,
    CustomerStatus,
} from '../../../domain/entities/customer.domain';

type CustomerRow = {
    id: string;
    name: string;
    status: CustomerStatus;
    created_at: string;
    updated_at: string;
};

export class SqliteCustomerRepository implements ICustomerRepository {
    constructor(readonly db: Database.Database) {}

    private toDomain(row: CustomerRow): Customer {
        return Customer.with(
            row.id,
            row.name,
            row.status,
            new Date(row.created_at),
            new Date(row.updated_at),
        );
    }

    public async findById(id: string): Promise<Customer | null> {
        const row = this.db
            .prepare('SELECT * FROM customers WHERE id = ?')
            .get(id) as CustomerRow | undefined;

        if (!row) return null;

        return this.toDomain(row);
    }

    public async findAll(): Promise<Customer[] | null> {
        const rows = this.db
            .prepare('SELECT * FROM customers')
            .all() as CustomerRow[];

        return rows.map((row) => this.toDomain(row));
    }

    public async save(customer: Customer): Promise<void> {
        this.db
            .prepare(
                'INSERT INTO customers (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            )
            .run(
                customer.id,
                customer.name,
                customer.status,
                customer.createdAt.toISOString(),
                customer.updatedAt.toISOString(),
            );
    }

    public async update(customer: Customer): Promise<void> {
        this.db
            .prepare(
                'UPDATE customers SET name = ?, status = ?, updated_at = ? WHERE id = ?',
            )
            .run(
                customer.name,
                customer.status,
                customer.updatedAt.toISOString(),
                customer.id,
            );
    }
}
