import {
    CreateOrderDTO,
    OrderResponse,
} from '../../dto/order/create-order.dto';

export interface ICreateOrderUseCase {
    execute(dto: CreateOrderDTO): Promise<OrderResponse>;
}
