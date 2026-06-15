export type CatalogStatus = 'active' | 'inactive';

export type CatalogProps = {
    id: string;
    name: string;
    description: string;
    status: CatalogStatus;
    createdAt: Date;
    updatedAt: Date;
};

export class Catalog {
    private constructor(private readonly props: CatalogProps) {}

    public static build(name: string, description: string): Catalog {
        return new Catalog({
            id: crypto.randomUUID().toString(),
            name,
            description,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public static with(
        id: string,
        name: string,
        description: string,
        status: CatalogStatus,
        createdAt: Date,
        updatedAt: Date,
    ): Catalog {
        return new Catalog({ id, name, description, status, createdAt, updatedAt });
    }

    public get id(): string {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get description(): string {
        return this.props.description;
    }

    public get status(): CatalogStatus {
        return this.props.status;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public activate(): Catalog {
        return new Catalog({ ...this.props, status: 'active', updatedAt: new Date() });
    }

    public deactivate(): Catalog {
        return new Catalog({ ...this.props, status: 'inactive', updatedAt: new Date() });
    }
}
