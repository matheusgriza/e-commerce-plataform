import { ReleaseStockDTO } from '../dto/catalog/release-stock.dto';
import { IReleaseStockUseCase } from '../ports/input/release-stock.port';
import { IProductRepository } from '../ports/output/product.repository';

export class ReleaseStock implements IReleaseStockUseCase {
    constructor(private readonly productRepository: IProductRepository) {}

    public async execute(dto: ReleaseStockDTO): Promise<void> {
        await this.productRepository.releaseStock(dto.items);
    }
}
