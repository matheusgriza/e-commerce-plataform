export type CreateProductDTO = {
    name: string;
    stock: number;
    price: number;
};

export type ProductResponse = {
    id: string;
    name: string;
    stock: number;
    price: number;
};
