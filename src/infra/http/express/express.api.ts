import express, { Express, Request, Response } from 'express';
import type { IApi } from '../api.js';

export class ApiExpress implements IApi {
    private constructor(readonly app: Express) {}

    public static build(): ApiExpress {
        const app = express();
        app.use(express.json());
        return new ApiExpress(app);
    }

    public addGetRoute(
        path: string,
        handler: (req: Request, res: Response) => Promise<void>,
    ): void {
        this.app.get(path, handler);
    }

    public addPostRoute(
        path: string,
        handler: (req: Request, res: Response) => Promise<void>,
    ): void {
        this.app.post(path, handler);
    }

    public start(port: Number) {
        this.app.listen(port, () => {
            console.info('server running on port: ', port);
            this.listRoutes();
        });
    }

    private listRoutes() {
        const routes = this.app.router.stack
            .filter((route: any) => route.route)
            .map((route: any) => {
                return {
                    path: route.route.path,
                    method: route.route.stack[0].method,
                };
            });

        console.info(routes);
    }
}
