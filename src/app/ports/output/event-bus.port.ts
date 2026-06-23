export interface IEventBus {
    publish(routingKey: string, payload: unknown): Promise<void>;
}
