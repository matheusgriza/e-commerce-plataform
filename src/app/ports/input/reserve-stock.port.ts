import { ReserveStockDTO, ReserveStockResponse } from '../dto/catalog/reserve-stock.dto';

export interface IReserveStockUseCase {
    execute(dto: ReserveStockDTO): Promise<ReserveStockResponse>;
}
