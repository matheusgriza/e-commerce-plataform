import type { Request, Response } from 'express';
import { IGetNotificationsUseCase } from '../../../app/ports/input/get-notifications.port';

export class NotificationController {
    constructor(
        private readonly getNotificationsUseCase: IGetNotificationsUseCase,
    ) {}

    public listByCustomer = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const customerId = req.params.customerId as string;
        const notifications =
            await this.getNotificationsUseCase.execute(customerId);

        res.status(200).json(notifications);
    };
}
