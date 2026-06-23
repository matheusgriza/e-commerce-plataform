import {
    IProductCatalogClient,
    ProductSnapshot,
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
}
