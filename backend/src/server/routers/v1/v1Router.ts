import { Router as expressRouter } from 'express';
import { dashboardRouter } from '#routers/v1/dashboard';
import { authRouter } from '#server/routers/v1/auth';
import { systemNotificationsRouter } from '#server/routers/v1/systemNotifications';
import bodyParser from 'body-parser';


export const v1Router = async (): Promise<expressRouter> => {
  const v1Router = expressRouter();

  v1Router.use(bodyParser.json());

  v1Router.use('/test', (req, res) => res.json({
    message: 'Test',
    time: new Date(),
  }));

  v1Router.use('/dashboard', dashboardRouter);

  v1Router.use('/auth', await authRouter());

  v1Router.use('/notifications', await systemNotificationsRouter());

  return v1Router;
};
