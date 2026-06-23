import { type } from 'arktype';
import type { Request, Response } from 'express';
import { ICreateProductUseCase } from '../../../app/ports/input/create-product.port';
import { IGetProductUseCase } from '../../../app/ports/input/get-product.port';
import { IUpdateStockUseCase } from '../../../app/ports/input/update-stock.port';
import { IReserveStockUseCase } from '../../../app/ports/input/reserve-stock.port';
import { IReleaseStockUseCase } from '../../../app/ports/input/release-stock.port';
import { createProductSchema } from './schemas/create-product.schema';
import { updateStockSchema } from './schemas/update-stock.schema';
import { reserveStockSchema } from './schemas/reserve-stock.schema';
import { releaseStockSchema } from './schemas/release-stock.schema';

export class ProductController {
    constructor(
        private readonly createProductUseCase: ICreateProductUseCase,
        private readonly getProductUseCase: IGetProductUseCase,
        private readonly updateStockUseCase: IUpdateStockUseCase,
        private readonly reserveStockUseCase: IReserveStockUseCase,
        private readonly releaseStockUseCase: IReleaseStockUseCase,
    ) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        const dto = createProductSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        const product = await this.createProductUseCase.execute(dto);
        res.status(201).json(product);
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id as string;
        const product = await this.getProductUseCase.execute(id);

        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.status(200).json(product);
    };

    public updateStock = async (req: Request, res: Response): Promise<void> => {
        const dto = updateStockSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        await this.updateStockUseCase.execute({
            productId: req.params.id as string,
            quantity: dto.quantity,
        });

        res.status(204).send();
    };

    /** Internal, service-to-service endpoint: atomically reserves stock for an order. */
    public reserve = async (req: Request, res: Response): Promise<void> => {
        const dto = reserveStockSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        const result = await this.reserveStockUseCase.execute(dto);

        if (!result.success) {
            res.status(409).json({ failures: result.failures });
            return;
        }

        res.status(200).json({ products: result.products });
    };

    /** Internal, service-to-service endpoint: compensates a previously successful reservation. */
    public release = async (req: Request, res: Response): Promise<void> => {
        const dto = releaseStockSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        await this.releaseStockUseCase.execute(dto);
        res.status(204).send();
    };
}
