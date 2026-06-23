import { Product } from '../../domain/entities/product.domain';
import {
    CreateProductDTO,
    ProductResponse,
} from '../dto/catalog/create-product.dto';
import { ICreateProductUseCase } from '../ports/input/create-product.port';
import { IEventBus } from '../ports/output/event-bus.port';
import { IProductRepository } from '../ports/output/product.repository';

export class CreateProduct implements ICreateProductUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly eventBus: IEventBus,
    ) {}

    public async execute(dto: CreateProductDTO): Promise<ProductResponse> {
        const product = Product.build(dto.stock, dto.name, dto.price);

        await this.productRepository.save(product);
        await this.eventBus.publish('catalog.product.created', {
            id: product.id,
            name: product.name,
            stock: product.stock,
            price: product.price.toCents(),
        });

        return {
            id: product.id,
            name: product.name,
            stock: product.stock,
            price: product.price.toCents(),
        };
    }
}
