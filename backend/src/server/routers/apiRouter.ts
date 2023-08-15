import { Router as expressRouter } from 'express';
import { v1Router } from '#routers/v1/v1Router';
import { catchErrors } from '#server/middlewares';
import { ServerError } from '#server/ServerError';


export const apiRouter = async (): Promise<expressRouter> => {
  const apiRouter = expressRouter();

  apiRouter.use('/v1', await v1Router());

  apiRouter.all('*', () => {
    throw new ServerError(404, 'Invalid API route');
  });

  apiRouter.use(catchErrors);

  return apiRouter;
};
