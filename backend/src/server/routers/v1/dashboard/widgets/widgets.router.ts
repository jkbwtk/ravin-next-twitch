import { getChatStatsView, getModeratorsView, getRecentActionsView, getTopStatsView } from '#server/routers/v1/dashboard/widgets/widgets.views';
import { Router } from 'express';


export const createWidgetsRouter = (): Router => {
  const widgetsRouter = Router();

  widgetsRouter.get('/moderators', ...getModeratorsView.unwrap());

  widgetsRouter.get('/top-stats', ...getTopStatsView.unwrap());

  widgetsRouter.get('/recent-actions', ...getRecentActionsView.unwrap());

  widgetsRouter.get('/chat-stats', ...getChatStatsView.unwrap());

  return widgetsRouter;
};
