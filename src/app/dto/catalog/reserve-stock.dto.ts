export type ReserveStockDTO = {
    items: { productId: string; quantity: number }[];
};

export type ReserveStockFailureResponse = {
    productId: string;
    reason: 'not_found' | 'insufficient_stock';
};

export type ReservedProduct = {
    id: string;
    name: string;
    stock: number;
    price: number;
};

export type ReserveStockResponse =
    | { success: true; products: ReservedProduct[] }
    | { success: false; failures: ReserveStockFailureResponse[] };
