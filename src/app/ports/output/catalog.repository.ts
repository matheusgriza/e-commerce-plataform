import { Catalog } from '../../../domain/entities/catalog.domain';

export interface ICatalogRepository {
    findById(id: string): Promise<Catalog | null>;
    findAll(): Promise<Catalog[] | null>;
    save(catalog: Catalog): Promise<void>;
    update(catalog: Catalog): Promise<void>;
}
