export type NotificationProps = {
    id: string;
    customerId: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date;
};

export class Notification {
    private constructor(private readonly props: NotificationProps) {}

    public static create(
        customerId: string,
        type: string,
        message: string,
    ): Notification {
        return new Notification({
            id: crypto.randomUUID().toString(),
            customerId,
            type,
            message,
            read: false,
            createdAt: new Date(),
        });
    }

    public static with(
        id: string,
        customerId: string,
        type: string,
        message: string,
        read: boolean,
        createdAt: Date,
    ): Notification {
        return new Notification({
            id,
            customerId,
            type,
            message,
            read,
            createdAt,
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get customerId(): string {
        return this.props.customerId;
    }

    public get type(): string {
        return this.props.type;
    }

    public get message(): string {
        return this.props.message;
    }

    public get read(): boolean {
        return this.props.read;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }
}
