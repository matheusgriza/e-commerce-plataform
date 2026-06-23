export type CreateOrderDTO = {
    customerId: string;
    items: { productId: string; quantity: number }[];
};

export type OrderItemResponse = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export type OrderResponse = {
    id: string;
    customerId: string;
    status: string;
    items: OrderItemResponse[];
    total: number;
    createdAt: string;
};
