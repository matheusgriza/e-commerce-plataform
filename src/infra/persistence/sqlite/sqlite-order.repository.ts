import Database from 'better-sqlite3';
import { IOrderRepository } from '../../../app/ports/output/order.repository';
import {
    Order,
    OrderItem,
    OrderStatus,
} from '../../../domain/entities/order.domain';
import { Money } from '../../../domain/entities/value-objects/money';

type OrderRow = {
    id: string;
    customer_id: string;
    status: OrderStatus;
    total: number;
    created_at: string;
    updated_at: string;
};

type OrderItemRow = {
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
};

export class SqliteOrderRepository implements IOrderRepository {
    constructor(readonly db: Database.Database) {}

    private toDomain(row: OrderRow, itemRows: OrderItemRow[]): Order {
        const items: OrderItem[] = itemRows.map((itemRow) => ({
            productId: itemRow.product_id,
            quantity: itemRow.quantity,
            unitPrice: Money.create(itemRow.unit_price),
        }));

        return Order.with(
            row.id,
            row.customer_id,
            items,
            row.status,
            Money.create(row.total),
            new Date(row.created_at),
            new Date(row.updated_at),
        );
    }

    public async findById(id: string): Promise<Order | null> {
        const row = this.db
            .prepare('SELECT * FROM orders WHERE id = ?')
            .get(id) as OrderRow | undefined;

        if (!row) return null;

        const itemRows = this.db
            .prepare('SELECT * FROM order_items WHERE order_id = ?')
            .all(id) as OrderItemRow[];

        return this.toDomain(row, itemRows);
    }

    public async findAll(): Promise<Order[] | null> {
        const rows = this.db.prepare('SELECT * FROM orders').all() as OrderRow[];

        return rows.map((row) => {
            const itemRows = this.db
                .prepare('SELECT * FROM order_items WHERE order_id = ?')
                .all(row.id) as OrderItemRow[];

            return this.toDomain(row, itemRows);
        });
    }

    public async save(order: Order): Promise<void> {
        const insertOrder = this.db.prepare(
            'INSERT INTO orders (id, customer_id, status, total, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        );
        const insertItem = this.db.prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        );

        const transaction = this.db.transaction(() => {
            insertOrder.run(
                order.id,
                order.customerId,
                order.status,
                order.total.toCents(),
                order.createdAt.toISOString(),
                order.updatedAt.toISOString(),
            );

            for (const item of order.items) {
                insertItem.run(
                    order.id,
                    item.productId,
                    item.quantity,
                    item.unitPrice.toCents(),
                );
            }
        });

        transaction();
    }

    public async update(order: Order): Promise<void> {
        this.db
            .prepare(
                'UPDATE orders SET status = ?, total = ?, updated_at = ? WHERE id = ?',
            )
            .run(
                order.status,
                order.total.toCents(),
                order.updatedAt.toISOString(),
                order.id,
            );
    }
}
