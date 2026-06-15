import { Money, type MoneyProps } from './value-objects/money.js';

export type ProductPorps = {
    id: string;
    name: string;
    stock: number;
    price: Money;
};

export class Product {
    private constructor(private readonly props: ProductPorps) {}

    public static build(stock: number, name: string, price: number): Product {
        return new Product({
            id: crypto.randomUUID().toString(),
            name,
            stock,
            price: Money.create(price),
        });
    }

    public static with(id: string, name: string, price: Money, stock: number) {
        return new Product({
            id,
            name,
            stock,
            price,
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get stock(): number {
        return this.props.stock;
    }

    public get price(): Money {
        return this.props.price;
    }
}
