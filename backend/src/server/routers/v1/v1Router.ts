import { Router as expressRouter } from 'express';
import { dashboardRouter } from './dashboard';
import { invalidRoute } from '../../middlewares';


export const v1Router = expressRouter();

v1Router.use('/test', (req, res) => res.json({
  message: 'Test',
  time: new Date(),
}));

v1Router.use('/dashboard', dashboardRouter);

v1Router.use('*', invalidRoute);
