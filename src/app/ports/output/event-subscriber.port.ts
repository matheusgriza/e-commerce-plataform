import { DomainEvent } from './domain-event';

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface IEventSubscriber {
    /**
     * Binds a durable queue to the given routing keys and consumes from it.
     * Acks on handler success; nacks (no requeue) on failure so the broker
     * routes the message to the dead-letter exchange instead of retrying forever.
     */
    subscribe(
        queueName: string,
        routingKeys: string[],
        handler: EventHandler,
    ): Promise<void>;
}
