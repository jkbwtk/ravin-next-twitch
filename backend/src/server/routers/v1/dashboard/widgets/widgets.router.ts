import { getChatStatsView, getModeratorsView, getRecentActionsView, getTopStatsView } from '#server/routers/v1/dashboard/widgets/widgets.views';
import { Router } from 'express';


export const widgetsRouter = Router();

widgetsRouter.get('/moderators', ...getModeratorsView.unwrap());

widgetsRouter.get('/topStats', ...getTopStatsView.unwrap());

widgetsRouter.get('/recentActions', ...getRecentActionsView.unwrap());

widgetsRouter.get('/chatStats', ...getChatStatsView.unwrap());
