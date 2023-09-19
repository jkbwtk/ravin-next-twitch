import { getMessagesView } from '#server/routers/v1/logs/logs.views';
import { Router } from 'express';


export const createLogsRouter = (): Router => {
  const logsRouter = Router();

  logsRouter.get('/messages', ...getMessagesView.unwrap());

  return logsRouter;
};
