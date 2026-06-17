import { GetProductReponse } from '../../dto/catalog/get-product.dto';

export interface IGetProductUseCase {
    execute(id: string): Promise<GetProductReponse | null>;
}
