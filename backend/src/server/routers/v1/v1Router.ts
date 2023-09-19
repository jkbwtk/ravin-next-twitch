import { Router } from 'express';
import bodyParser from 'body-parser';
import { createAdminRouter } from '#server/routers/v1/admin/admin.router';
import { createTestRouter } from '#server/routers/v1/test/test.router';
import { createLogsRouter } from '#server/routers/v1/logs/logs.router';
import { createSystemNotificationsRouter } from '#server/routers/v1/systemNotifications/systemNotifications.router';
import { createChannelRouter } from '#server/routers/v1/channel/channel.router';
import { createCommandsRouter } from '#server/routers/v1/commands/commands.router';
import { createDashboardRouter } from '#server/routers/v1/dashboard/dashboard.router';
import { createAuthRouter } from '#server/routers/v1/auth/auth.router';


export const createV1Router = async (): Promise<Router> => {
  const v1Router = Router();

  v1Router.use(bodyParser.json());

  v1Router.use('/test', createTestRouter());

  v1Router.use('/dashboard', createDashboardRouter());

  v1Router.use('/auth', createAuthRouter());

  v1Router.use('/notifications', createSystemNotificationsRouter());

  v1Router.use('/commands', createCommandsRouter());

  v1Router.use('/channel', createChannelRouter());

  v1Router.use('/logs', createLogsRouter());

  v1Router.use('/admin', createAdminRouter());

  return v1Router;
};
