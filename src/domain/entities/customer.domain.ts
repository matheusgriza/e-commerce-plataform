export type CustomerStatus = 'active' | 'inactive';

export type CustomerProps = {
    id: string;
    name: string;
    status: CustomerStatus;
    createdAt: Date;
    updatedAt: Date;
};

export class Customer {
    private constructor(private readonly props: CustomerProps) {}

    public static build(name: string, status: CustomerStatus) {
        return new Customer({
            id: crypto.randomUUID().toString(),
            name,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    public static with(
        id: string,
        name: string,
        status: CustomerStatus,
        createdAt: Date,
        updatedAt: Date,
    ) {
        return new Customer({
            id,
            name,
            status,
            createdAt,
            updatedAt,
        });
    }

    public get id(): string {
        return this.props.id;
    }
    public get name(): string {
        return this.props.name;
    }
    public get status(): CustomerStatus {
        return this.props.status;
    }
    public get createdAt(): Date {
        return this.props.createdAt;
    }
    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
