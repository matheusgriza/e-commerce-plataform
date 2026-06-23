import {
    ReserveStockDTO,
    ReserveStockResponse,
} from '../dto/catalog/reserve-stock.dto';
import { IReserveStockUseCase } from '../ports/input/reserve-stock.port';
import { IProductRepository } from '../ports/output/product.repository';

export class ReserveStock implements IReserveStockUseCase {
    constructor(private readonly productRepository: IProductRepository) {}

    public async execute(dto: ReserveStockDTO): Promise<ReserveStockResponse> {
        const failures = await this.productRepository.reserveStock(dto.items);

        if (failures.length > 0) {
            return { success: false, failures };
        }

        const products = await Promise.all(
            dto.items.map((item) =>
                this.productRepository.findById(item.productId),
            ),
        );

        return {
            success: true,
            products: products.map((product) => ({
                id: product!.id,
                name: product!.name,
                stock: product!.stock,
                price: product!.price.toCents(),
            })),
        };
    }
}
