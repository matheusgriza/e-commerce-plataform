import { type } from 'arktype';

export const reserveStockSchema = type({
    items: type({
        productId: 'string',
        quantity: 'number.integer > 0',
    }).array(),
});
