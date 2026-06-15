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

    public toCurrency(): string {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return formatter.format(this.props.amount);
    }
}
