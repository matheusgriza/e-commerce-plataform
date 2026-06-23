import { Product } from '../../../domain/entities/product.domain';

export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[] | null>;
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
}
