import { type } from 'arktype';

export const createOrderSchema = type({
    customerId: 'string',
    items: type({
        productId: 'string',
        quantity: 'number.integer > 0',
    }).array(),
});
