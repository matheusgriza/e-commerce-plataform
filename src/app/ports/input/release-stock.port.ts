import { ReleaseStockDTO } from '../../dto/catalog/release-stock.dto';

export interface IReleaseStockUseCase {
    execute(dto: ReleaseStockDTO): Promise<void>;
}
