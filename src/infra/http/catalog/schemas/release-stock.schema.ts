import { type } from 'arktype';

export const releaseStockSchema = type({
    items: type({
        productId: 'string',
        quantity: 'number.integer > 0',
    }).array(),
});
