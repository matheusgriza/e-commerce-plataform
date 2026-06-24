export type DomainEvent<TPayload = unknown> = {
    eventId: string;
    routingKey: string;
    timestamp: string;
    payload: TPayload;
};
