import amqp, { type Channel, type ChannelModel } from 'amqplib';
import { randomUUID } from 'crypto';
import { IEventBus } from '../../app/ports/output/event-bus.port';

const EXCHANGE = 'e-commerce.events';
const DLX = 'e-commerce.dlx';

export class AmqpEventBus implements IEventBus {
    constructor(
        private readonly connection: ChannelModel,
        private readonly channel: Channel,
    ) {}

    public static async connect(url: string): Promise<AmqpEventBus> {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertExchange(DLX, 'topic', { durable: true });
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

        return new AmqpEventBus(connection, channel);
    }

    public async publish(routingKey: string, payload: unknown): Promise<void> {
        const envelope = {
            eventId: randomUUID(),
            routingKey,
            timestamp: new Date().toISOString(),
            payload,
        };

        this.channel.publish(
            EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(envelope)),
            { persistent: true, contentType: 'application/json' },
        );
    }

    public async close(): Promise<void> {
        await this.channel.close();
        await this.connection.close();
    }
}
