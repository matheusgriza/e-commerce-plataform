import { type } from 'arktype';

export const updateStockSchema = type({
    quantity: 'number.integer >= 0',
});
