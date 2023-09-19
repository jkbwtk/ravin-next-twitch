import { Router } from 'express';
import { createV1Router } from '#routers/v1/v1Router';
import { catchErrors } from '#server/middlewares';
import { ServerError } from '#server/ServerError';


export const createApiRouter = async (): Promise<Router> => {
  const apiRouter = Router();

  apiRouter.use('/v1', await createV1Router());

  apiRouter.all('*', () => {
    throw new ServerError(404, 'Invalid API route');
  });

  apiRouter.use(catchErrors);

  return apiRouter;
};
