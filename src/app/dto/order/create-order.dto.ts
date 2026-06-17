export type CreateOrderDTO = {
    customerId: string;
    items: { productId: string; quantity: number }[];
};

export type OrderResponse = {
    id: string;
    customerId: string;
    status: string;
    total: number;
    createdAt: string;
};
