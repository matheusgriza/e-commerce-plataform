import {
    IProductCatalogClient,
    ProductSnapshot,
    StockReservationFailure,
    StockReservationRequestItem,
    StockReservationResult,
} from '../../app/ports/output/product-catalog.client';

export class HttpProductCatalogClient implements IProductCatalogClient {
    constructor(private readonly baseUrl: string) {}

    public async findById(productId: string): Promise<ProductSnapshot | null> {
        const response = await fetch(`${this.baseUrl}/products/${productId}`, {
            signal: AbortSignal.timeout(3000),
        });

        if (response.status === 404) return null;

        if (!response.ok) {
            throw new Error(
                `catalog service responded with status ${response.status}`,
            );
        }

        return (await response.json()) as ProductSnapshot;
    }

    public async reserveStock(
        items: StockReservationRequestItem[],
    ): Promise<StockReservationResult> {
        const response = await fetch(`${this.baseUrl}/products/reserve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
            signal: AbortSignal.timeout(3000),
        });

        if (response.status === 409) {
            const body = (await response.json()) as {
                failures: StockReservationFailure[];
            };
            return { success: false, failures: body.failures };
        }

        if (!response.ok) {
            throw new Error(
                `catalog service responded with status ${response.status}`,
            );
        }

        const body = (await response.json()) as { products: ProductSnapshot[] };
        return { success: true, products: body.products };
    }

    public async releaseStock(
        items: StockReservationRequestItem[],
    ): Promise<void> {
        const response = await fetch(`${this.baseUrl}/products/release`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
            signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) {
            throw new Error(
                `catalog service responded with status ${response.status}`,
            );
        }
    }
}
