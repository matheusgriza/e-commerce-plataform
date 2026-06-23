import { type } from 'arktype';

export const createProductSchema = type({
    name: 'string',
    stock: 'number.integer >= 0',
    price: 'number.integer > 0',
});
