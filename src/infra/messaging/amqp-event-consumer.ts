import amqp, { type Channel, type ChannelModel } from 'amqplib';
import {
    EventHandler,
    IEventSubscriber,
} from '../../app/ports/output/event-subscriber.port';
import { DomainEvent } from '../../app/ports/output/domain-event';

const EXCHANGE = 'e-commerce.events';
const DLX = 'e-commerce.dlx';
const DEAD_LETTER_QUEUE = 'e-commerce.dlq';

export class AmqpEventConsumer implements IEventSubscriber {
    constructor(
        private readonly connection: ChannelModel,
        private readonly channel: Channel,
    ) {}

    public static async connect(url: string): Promise<AmqpEventConsumer> {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertExchange(DLX, 'topic', { durable: true });
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

        // Without a queue bound to the DLX, dead-lettered messages are dropped
        // silently — give them somewhere to land so failures stay inspectable.
        await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
        await channel.bindQueue(DEAD_LETTER_QUEUE, DLX, '#');

        await channel.prefetch(10);

        return new AmqpEventConsumer(connection, channel);
    }

    public async subscribe(
        queueName: string,
        routingKeys: string[],
        handler: EventHandler,
    ): Promise<void> {
        await this.channel.assertQueue(queueName, {
            durable: true,
            deadLetterExchange: DLX,
        });

        for (const routingKey of routingKeys) {
            await this.channel.bindQueue(queueName, EXCHANGE, routingKey);
        }

        await this.channel.consume(queueName, async (msg) => {
            if (!msg) return;

            try {
                const event = JSON.parse(msg.content.toString()) as DomainEvent;
                await handler(event);
                this.channel.ack(msg);
            } catch (error) {
                console.error(
                    `failed to process message with routing key "${msg.fields.routingKey}"`,
                    error,
                );
                // requeue=false: send straight to the DLX instead of retrying forever.
                this.channel.nack(msg, false, false);
            }
        });
    }

    public async close(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
    }
}
