export type MoneyProps = {
    cents: number;
};

export class Money {
    // Cents are the canonical representation, stored and passed around as an
    // integer everywhere. Dollars only exist transiently for display, so float
    // drift from repeated add/multiply never has a chance to creep in.
    private constructor(readonly props: MoneyProps) {}

    public static create(cents: number): Money {
        if (!Number.isInteger(cents))
            throw new Error('amount must be an integer');

        return new Money({ cents });
    }

    public get amount(): number {
        return this.props.cents / 100;
    }

    public toCents(): number {
        return this.props.cents;
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

        return formatter.format(this.amount);
    }
}
