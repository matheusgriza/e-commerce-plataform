import { Money, type MoneyProps } from './value-objects/money.js';

export type ProductPorps = {
    id: string;
    stock: number;
    price: Money;
};

export class Product {
    private constructor(private readonly props: ProductPorps) {}

    public static build(stock: number, price: number): Product {
        return new Product({
            id: crypto.randomUUID().toString(),
            stock,
            price: Money.create(price),
        });
    }

    public with(id: string, price: Money, stock: number) {
        return new Product({
            id,
            stock,
            price,
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get stock(): number {
        return this.props.stock;
    }

    public get price(): Money {
        return this.props.price;
    }
}
