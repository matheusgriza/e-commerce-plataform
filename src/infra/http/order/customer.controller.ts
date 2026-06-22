import { type } from 'arktype';
import type { Request, Response } from 'express';
import { ICreateCustomerUseCase } from '../../../app/ports/input/create-customer.port';
import { createCustomerSchema } from './schemas/create-customer.schema';

export class CustomerController {
    constructor(
        private readonly createCustomerUseCase: ICreateCustomerUseCase,
    ) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        const dto = createCustomerSchema(req.body);

        if (dto instanceof type.errors) {
            res.status(400).json({ error: dto.summary });
            return;
        }

        const customer = await this.createCustomerUseCase.execute(dto);
        res.status(201).json(customer);
    };
}
