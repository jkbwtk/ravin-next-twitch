import { getConnectionStatusView } from '#server/routers/v1/dashboard/dashboard.views';
import { widgetsRouter } from '#server/routers/v1/dashboard/widgets/widgets.router';
import { Router } from 'express';


export const dashboardRouter = Router();

dashboardRouter.get('/connectionStatus', ...getConnectionStatusView.unwrap());

dashboardRouter.get('/joinChannel', ...getConnectionStatusView.unwrap());

dashboardRouter.use('/widgets', widgetsRouter);
