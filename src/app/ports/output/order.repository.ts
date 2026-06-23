import { Order } from '../../../domain/entities/order.domain';

export interface IOrderRepository {
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[] | null>;
    save(order: Order): Promise<void>;
    update(order: Order): Promise<void>;
}
