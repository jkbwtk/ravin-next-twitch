import {
  deleteCommandTimersView,
  getCommandTimersStatusView,
  getCommandTimersView,
  patchCommandTimersView,
  postCommandTimersView,
} from '#server/routers/v1/commands/timers/timers.views';
import { Router } from 'express';


export const createTimersRouter = (): Router => {
  const timersRouter = Router();

  timersRouter.get('/', ...getCommandTimersView.unwrap());

  timersRouter.post('/', ...postCommandTimersView.unwrap());

  timersRouter.patch('/', ...patchCommandTimersView.unwrap());

  timersRouter.delete('/', ...deleteCommandTimersView.unwrap());

  timersRouter.get('/status', ...getCommandTimersStatusView.unwrap());

  return timersRouter;
};
