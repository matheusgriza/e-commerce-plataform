import { GetProductReponse } from '../dto/catalog/get-product.dto';
import { IGetProductUseCase } from '../ports/input/get-product.port';
import { IProductRepository } from '../ports/output/product.repository';

export class GetProduct implements IGetProductUseCase {
    constructor(private readonly productRepository: IProductRepository) {}

    public async execute(id: string): Promise<GetProductReponse | null> {
        const product = await this.productRepository.findById(id);

        if (!product) return null;

        return {
            id: product.id,
            name: product.name,
            stock: product.stock,
            price: product.price.toCents(),
        };
    }
}
