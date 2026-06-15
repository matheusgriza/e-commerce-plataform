import type { Product } from './product.domain.js';
import type { Money } from './value-objects/money.js';

export type OrderStatus = 'closed' | 'open' | 'canceled' | 'deleted';

export type OrderProps = {
    id: string;
    customerId: string;
    items: Product[];
    status: OrderStatus;
    total: Money;
    createdAt: Date;
    updatedAt: Date;
};

export class Order {
    private constructor(private readonly props: OrderProps) {}

    public static build(
        customerId: string,
        items: Product[],
        status: OrderStatus,
        total: Money,
    ): Order {
        return new Order({
            id: crypto.randomUUID().toString(),
            customerId,
            items,
            status,
            total,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public static with(
        id: string,
        customerId: string,
        items: Product[],
        status: OrderStatus,
        total: Money,
    ): Order {
        return new Order({
            id,
            customerId,
            items,
            status,
            total,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get customerId(): string {
        return this.props.customerId;
    }

    public get items(): Product[] {
        return this.props.items;
    }

    public get status(): OrderStatus {
        return this.props.status;
    }

    public get total(): Money {
        return this.props.total;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }
    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
