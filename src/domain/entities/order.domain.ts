import { Money } from './value-objects/money.js';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type OrderItem = {
    productId: string;
    quantity: number;
    unitPrice: Money;
};
export type OrderProps = {
    id: string;
    customerId: string;
    items: OrderItem[];
    status: OrderStatus;
    total: Money;
    createdAt: Date;
    updatedAt: Date;
};

export class Order {
    private constructor(private readonly props: OrderProps) {}

    public static create(customerId: string, items: OrderItem[]): Order {
        const total = Money.sum(
            items.map((item) => item.unitPrice.multiply(item.quantity)),
        );

        return new Order({
            id: crypto.randomUUID().toString(),
            customerId,
            items,
            status: 'pending',
            total,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public static with(
        id: string,
        customerId: string,
        items: OrderItem[],
        status: OrderStatus,
        total: Money,
        createdAt: Date,
        updatedAt: Date,
    ): Order {
        return new Order({
            id,
            customerId,
            items,
            status,
            total,
            createdAt,
            updatedAt,
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get customerId(): string {
        return this.props.customerId;
    }

    public get items(): OrderItem[] {
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
