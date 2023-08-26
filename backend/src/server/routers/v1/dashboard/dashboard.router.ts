import { getConnectionStatusView } from '#server/routers/v1/dashboard/dashboard.views';
import { widgetsRouter } from '#server/routers/v1/dashboard/widgets/widgets.router';
import { Router } from 'express';


export const dashboardRouter = Router();

dashboardRouter.get('/connection-status', ...getConnectionStatusView.unwrap());

dashboardRouter.get('/join-channel', ...getConnectionStatusView.unwrap());

dashboardRouter.use('/widgets', widgetsRouter);
