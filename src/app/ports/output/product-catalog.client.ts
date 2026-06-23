export type ProductSnapshot = {
    id: string;
    name: string;
    stock: number;
    price: number;
};

export interface IProductCatalogClient {
    findById(productId: string): Promise<ProductSnapshot | null>;
}
