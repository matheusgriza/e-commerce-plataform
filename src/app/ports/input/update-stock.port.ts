import { UpdateStockDTO } from '../../dto/catalog/update-stock.dto';

export interface IUpdateStockUseCase {
    execute(dto: UpdateStockDTO): Promise<void>;
}
