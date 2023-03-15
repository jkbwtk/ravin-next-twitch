import { Router as expressRouter } from 'express';
import { invalidRoute } from '../middlewares';

export const apiRouter = expressRouter();


apiRouter.use('/test', (req, res) => res.json({
  message: 'Test',
  time: new Date(),
}));

apiRouter.use('*', invalidRoute);
