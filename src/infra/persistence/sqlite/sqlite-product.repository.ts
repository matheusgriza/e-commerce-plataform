import Database from 'better-sqlite3';
import { IProductRepository } from '../../../app/ports/output/product.repository';
import { Product } from '../../../domain/entities/product.domain';
import { Money } from '../../../domain/entities/value-objects/money';

type ProductRow = {
    id: string;
    name: string;
    stock: number;
    price: number;
};

export class SqliteProductRepository implements IProductRepository {
    private constructor(readonly db: Database.Database) {}

    private toDomain(row: ProductRow): Product {
        return Product.with(
            row.id,
            row.name,
            Money.create(row.price),
            row.stock,
        );
    }

    public async findById(id: string): Promise<Product | null> {
        const row = this.db.prepare('SELECT * FROM products').get(id) as
            | ProductRow
            | undefined;

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
}
