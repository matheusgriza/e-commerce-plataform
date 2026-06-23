export type ProductSnapshot = {
    id: string;
    name: string;
    stock: number;
    price: number;
};

export type StockReservationRequestItem = {
    productId: string;
    quantity: number;
};

export type StockReservationFailure = {
    productId: string;
    reason: 'not_found' | 'insufficient_stock';
};

export type StockReservationResult =
    | { success: true; products: ProductSnapshot[] }
    | { success: false; failures: StockReservationFailure[] };

export interface IProductCatalogClient {
    findById(productId: string): Promise<ProductSnapshot | null>;
    /** All-or-nothing: Catalog reserves every item atomically or none at all. */
    reserveStock(
        items: StockReservationRequestItem[],
    ): Promise<StockReservationResult>;
    /** Compensating action used when order persistence fails after a successful reservation. */
    releaseStock(items: StockReservationRequestItem[]): Promise<void>;
}
