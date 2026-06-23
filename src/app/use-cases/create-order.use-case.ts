import { Money } from '../../domain/entities/value-objects/money';
import { Order, OrderItem } from '../../domain/entities/order.domain';
import { CreateOrderDTO, OrderResponse } from '../dto/order/create-order.dto';
import { ICreateOrderUseCase } from '../ports/input/create-order.port';
import { ICustomerRepository } from '../ports/output/customer.repository';
import { IEventBus } from '../ports/output/event-bus.port';
import { IOrderRepository } from '../ports/output/order.repository';
import { IProductCatalogClient } from '../ports/output/product-catalog.client';

export class CreateOrder implements ICreateOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly customerRepository: ICustomerRepository,
        private readonly productCatalogClient: IProductCatalogClient,
        private readonly eventBus: IEventBus,
    ) {}

    public async execute(dto: CreateOrderDTO): Promise<OrderResponse> {
        const customer = await this.customerRepository.findById(
            dto.customerId,
        );
        if (!customer) throw new Error('Customer not found');
        if (customer.status !== 'active')
            throw new Error('Customer is not active');

        const reservation = await this.productCatalogClient.reserveStock(
            dto.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        );

        if (!reservation.success) {
            const reasons = reservation.failures
                .map((failure) => `${failure.productId} (${failure.reason})`)
                .join(', ');
            throw new Error(`Could not reserve stock for: ${reasons}`);
        }

        const priceByProductId = new Map(
            reservation.products.map((product) => [product.id, product.price]),
        );

        const items: OrderItem[] = dto.items.map((requestedItem) => ({
            productId: requestedItem.productId,
            quantity: requestedItem.quantity,
            unitPrice: Money.create(
                priceByProductId.get(requestedItem.productId)!,
            ),
        }));

        const order = Order.create(dto.customerId, items);

        try {
            await this.orderRepository.save(order);
        } catch (error) {
            await this.productCatalogClient.releaseStock(
                dto.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            );
            throw error;
        }

        await this.eventBus.publish('orders.order.created', {
            id: order.id,
            customerId: order.customerId,
            items: order.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toCents(),
            })),
            total: order.total.toCents(),
            createdAt: order.createdAt.toISOString(),
        });

        return {
            id: order.id,
            customerId: order.customerId,
            status: order.status,
            items: order.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toCents(),
            })),
            total: order.total.toCents(),
            createdAt: order.createdAt.toISOString(),
        };
    }
}
