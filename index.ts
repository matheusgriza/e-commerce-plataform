import { ApiExpress } from './src/infra/http/express/express.api';

const api = ApiExpress.build();

api.start(8080);
