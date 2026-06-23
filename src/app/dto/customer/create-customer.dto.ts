export type CreateCustomerDTO = {
    name: string;
};

export type CustomerResponse = {
    id: string;
    name: string;
    status: string;
    createdAt: string;
};
