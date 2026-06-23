import {
    CreateProductDTO,
    ProductResponse,
} from '../../dto/catalog/create-product.dto';

export interface ICreateProductUseCase {
    execute(dto: CreateProductDTO): Promise<ProductResponse>;
}
