import type Database from 'better-sqlite3';
import { CreateProduct } from '../app/use-cases/create-product.use-case';
import { GetProduct } from '../app/use-cases/get-product.use-case';
import { UpdateStock } from '../app/use-cases/update-stock.use-case';
import { ReserveStock } from '../app/use-cases/reserve-stock.use-case';
import { ReleaseStock } from '../app/use-cases/release-stock.use-case';
import type { IEventBus } from '../app/ports/output/event-bus.port';
import { ApiExpress } from './http/express/express.api';
import { ProductController } from './http/catalog/product.controller';
import { registerProductRoutes } from './http/catalog/product.routes';
import { migrateCatalogSchema } from './persistence/sqlite/catalog.schema';
import { SqliteProductRepository } from './persistence/sqlite/sqlite-product.repository';

export function buildCatalogModule(
    api: ApiExpress,
    db: Database.Database,
    eventBus: IEventBus,
): void {
    migrateCatalogSchema(db);

    const productRepository = new SqliteProductRepository(db);

    const createProductUseCase = new CreateProduct(productRepository, eventBus);
    const getProductUseCase = new GetProduct(productRepository);
    const updateStockUseCase = new UpdateStock(productRepository, eventBus);
    const reserveStockUseCase = new ReserveStock(productRepository);
    const releaseStockUseCase = new ReleaseStock(productRepository);

    const productController = new ProductController(
        createProductUseCase,
        getProductUseCase,
        updateStockUseCase,
        reserveStockUseCase,
        releaseStockUseCase,
    );

    registerProductRoutes(api, productController);
}
