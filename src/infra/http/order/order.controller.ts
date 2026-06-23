import { type } from 'arktype';
import type { Request, Response } from 'express';
import { ICreateOrderUseCase } from '../../../app/ports/input/create-order.port';
import { createOrderSchema } from './schemas/create-order.schema';

export class OrderController {
    constructor(private readonly createOrderUseCase: ICreateOrderUseCase) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        const dto = createOrderSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        try {
            const order = await this.createOrderUseCase.execute(dto);
            res.status(201).json(order);
        } catch (error) {
            res.status(422).json({ error: (error as Error).message });
        }
    };
}
