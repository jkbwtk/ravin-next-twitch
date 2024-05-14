import { getBotActionsView } from '#server/routers/v1/botActions/botActions.views';
import { Router } from 'express';


export const createBotActionsRouter = (): Router => {
  const botActionsRouter = Router();

  botActionsRouter.get('/', ...getBotActionsView.unwrap());

  return botActionsRouter;
};
