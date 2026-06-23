import Database from 'better-sqlite3';
import {
    IProductRepository,
    StockReservationFailure,
    StockReservationItem,
} from '../../../app/ports/output/product.repository';
import { Product } from '../../../domain/entities/product.domain';
import { Money } from '../../../domain/entities/value-objects/money';

type ProductRow = {
    id: string;
    name: string;
    stock: number;
    price: number;
};

class StockReservationRollback extends Error {
    constructor(public readonly failures: StockReservationFailure[]) {
        super('stock reservation rolled back');
    }
}

export class SqliteProductRepository implements IProductRepository {
    constructor(readonly db: Database.Database) {}

    private toDomain(row: ProductRow): Product {
        return Product.with(
            row.id,
            row.name,
            Money.create(row.price),
            row.stock,
        );
    }

    public async findById(id: string): Promise<Product | null> {
        const row = this.db
            .prepare('SELECT * FROM products WHERE id = ?')
            .get(id) as ProductRow | undefined;

        if (!row) return null;

        return this.toDomain(row);
    }

    public async findAll(): Promise<Product[] | null> {
        const row = this.db
            .prepare('SELECT * FROM products')
            .all() as ProductRow[];
        return row.map(this.toDomain);
    }

    public async save(product: Product): Promise<void> {
        this.db
            .prepare(
                'INSERT INTO products (id,name,stock,price) VALUES (?,?,?,?)',
            )
            .run(
                product.id,
                product.name,
                product.stock,
                product.price.toCents(),
            );
    }

    public async update(product: Product): Promise<void> {
        this.db
            .prepare(
                'UPDATE products SET name = ?, stock = ?, price = ? WHERE id = ?',
            )
            .run(
                product.name,
                product.stock,
                product.price.toCents(),
                product.id,
            );
    }

    public async reserveStock(
        items: StockReservationItem[],
    ): Promise<StockReservationFailure[]> {
        const decrement = this.db.prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        );
        const exists = this.db.prepare('SELECT 1 FROM products WHERE id = ?');

        const reserveAll = this.db.transaction(
            (items: StockReservationItem[]) => {
                const failures: StockReservationFailure[] = [];

                for (const item of items) {
                    const result = decrement.run(
                        item.quantity,
                        item.productId,
                        item.quantity,
                    );

                    if (result.changes === 0) {
                        failures.push({
                            productId: item.productId,
                            reason: exists.get(item.productId)
                                ? 'insufficient_stock'
                                : 'not_found',
                        });
                    }
                }

                if (failures.length > 0) throw new StockReservationRollback(failures);
            },
        );

        try {
            reserveAll(items);
            return [];
        } catch (error) {
            if (error instanceof StockReservationRollback) return error.failures;
            throw error;
        }
    }

    public async releaseStock(items: StockReservationItem[]): Promise<void> {
        const increment = this.db.prepare(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
        );

        const releaseAll = this.db.transaction(
            (items: StockReservationItem[]) => {
                for (const item of items) {
                    increment.run(item.quantity, item.productId);
                }
            },
        );

        releaseAll(items);
    }
}
