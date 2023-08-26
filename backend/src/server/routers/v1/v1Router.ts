import { Router as expressRouter } from 'express';
import { authRouter } from '#server/routers/v1/auth';
import bodyParser from 'body-parser';
import { adminRouter } from '#server/routers/v1/admin/admin.router';
import { testRouter } from '#server/routers/v1/test/test.router';
import { logsRouter } from '#server/routers/v1/logs/logs.router';
import { systemNotificationsRouter } from '#server/routers/v1/systemNotifications/systemNotifications.router';
import { channelRouter } from '#server/routers/v1/channel/channel.router';
import { commandsRouter } from '#server/routers/v1/commands/commands.router';
import { dashboardRouter } from '#server/routers/v1/dashboard/dashboard.router';


export const v1Router = async (): Promise<expressRouter> => {
  const v1Router = expressRouter();

  v1Router.use(bodyParser.json());

  v1Router.use('/test', testRouter);

  v1Router.use('/dashboard', dashboardRouter);

  v1Router.use('/auth', await authRouter());

  v1Router.use('/notifications', systemNotificationsRouter);

  v1Router.use('/commands', commandsRouter);

  v1Router.use('/channel', channelRouter);

  v1Router.use('/logs', logsRouter);

  v1Router.use('/admin', adminRouter);

  return v1Router;
};
