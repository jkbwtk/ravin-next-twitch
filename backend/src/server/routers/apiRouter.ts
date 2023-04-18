import { Router as expressRouter } from 'express';
import { v1Router } from '#routers/v1/v1Router';
import { invalidRoute } from '#server/middlewares';


export const apiRouter = async (): Promise<expressRouter> => {
  const apiRouter = expressRouter();

  apiRouter.use('/v1', await v1Router());

  apiRouter.use('*', invalidRoute);

  return apiRouter;
};
