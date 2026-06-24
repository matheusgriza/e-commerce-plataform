import { DomainEvent } from '../../app/ports/output/domain-event';
import { ICreateNotificationUseCase } from '../../app/ports/input/create-notification.port';

type OrderEventPayload = {
    id: string;
    customerId: string;
};

const MESSAGE_BY_ROUTING_KEY: Record<
    string,
    (payload: OrderEventPayload) => string
> = {
    'orders.order.created': (payload) =>
        `Your order ${payload.id} was placed successfully.`,
    'orders.order.confirmed': (payload) =>
        `Your order ${payload.id} has been confirmed.`,
    'orders.order.cancelled': (payload) =>
        `Your order ${payload.id} was cancelled.`,
};

/**
 * Driving adapter, analogous to an HTTP controller: translates an inbound
 * AMQP event into a call on the use-case's inbound port. Never touches the
 * domain or repositories directly.
 */
export class OrderEventNotificationHandler {
    constructor(
        private readonly createNotificationUseCase: ICreateNotificationUseCase,
    ) {}

    public handle = async (event: DomainEvent): Promise<void> => {
        const buildMessage = MESSAGE_BY_ROUTING_KEY[event.routingKey];
        if (!buildMessage) return;

        const payload = event.payload as OrderEventPayload;

        await this.createNotificationUseCase.execute({
            customerId: payload.customerId,
            type: event.routingKey,
            message: buildMessage(payload),
        });
    };
}
