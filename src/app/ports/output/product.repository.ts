import { Product } from '../../../domain/entities/product.domain';

export type StockReservationItem = {
    productId: string;
    quantity: number;
};

export type StockReservationFailure = {
    productId: string;
    reason: 'not_found' | 'insufficient_stock';
};

export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[] | null>;
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    /**
     * Atomically decrements stock for every item in a single DB transaction.
     * All-or-nothing: if any item lacks stock, the whole batch is rolled back.
     * Returns the list of failures; an empty array means the reservation succeeded.
     */
    reserveStock(
        items: StockReservationItem[],
    ): Promise<StockReservationFailure[]>;
    /** Compensating action: gives stock back (e.g. order persistence failed after reservation). */
    releaseStock(items: StockReservationItem[]): Promise<void>;
}
