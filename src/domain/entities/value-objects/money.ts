export type MoneyProps = {
    amount: number;
};

export class Money {
    private constructor(readonly props: MoneyProps) {}

    public static create(amount: number): Money {
        if (!Number.isInteger(amount))
            throw new Error('amount must be an integer');

        return new Money({ amount: amount / 100 });
    }

    public get amount(): number {
        return this.props.amount;
    }

    public toCents(): number {
        return this.props.amount * 100;
    }

    public add(other: Money): Money {
        return Money.create(this.toCents() + other.toCents());
    }

    public multiply(factor: number): Money {
        return Money.create(Math.round(this.toCents() * factor));
    }

    public static sum(values: Money[]): Money {
        return values.reduce((total, value) => total.add(value), Money.create(0));
    }

    public toCurrency(): string {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return formatter.format(this.props.amount);
    }
}
