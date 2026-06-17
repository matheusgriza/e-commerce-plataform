import { UpdateStockDTO } from '../dto/catalog/update-stock.dto';
import { IUpdateStockUseCase } from '../ports/input/update-stock.port';
import { IEventBus } from '../ports/output/event-bus.port';
import { IProductRepository } from '../ports/output/product.repository';

export class UpdateStock implements IUpdateStockUseCase {
    private constructor(
        private readonly productRepository: IProductRepository,
        private readonly eventBus: IEventBus,
    ) {}

    public async execute(dto: UpdateStockDTO): Promise<void> {
        const product = await this.productRepository.findById(dto.productId);
        if (!product) throw new Error('Product not found');

        const updated = product.updateStock(dto.quantity);
        await this.productRepository.update(updated);

        await this.eventBus.publish('catalog.stock.updated', {
            id: updated.id,
            stock: updated.stock,
        });
    }
}
