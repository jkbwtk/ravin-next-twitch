import { Router } from 'express';
import { createV1Router } from '#routers/v1/v1Router';
import { catchErrors } from '#server/middlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';


export const createApiRouter = async (): Promise<Router> => {
  const apiRouter = Router();

  apiRouter.use('/v1', await createV1Router());

  apiRouter.all('*', () => {
    throw new ServerError(HttpCodes.NotFound, 'Invalid API route');
  });

  apiRouter.use(catchErrors);

  return apiRouter;
};
