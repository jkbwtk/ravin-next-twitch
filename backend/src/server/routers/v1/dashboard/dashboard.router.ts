import { getConnectionStatusView, postJoinChannelView } from '#server/routers/v1/dashboard/dashboard.views';
import { widgetsRouter } from '#server/routers/v1/dashboard/widgets/widgets.router';
import { Router } from 'express';


export const dashboardRouter = Router();

dashboardRouter.get('/connection-status', ...getConnectionStatusView.unwrap());

dashboardRouter.post('/join-channel', ...postJoinChannelView.unwrap());

dashboardRouter.use('/widgets', widgetsRouter);
