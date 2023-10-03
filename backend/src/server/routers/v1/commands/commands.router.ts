import { createCustomRouter } from '#server/routers/v1/commands/custom/custom.router';
import { createTimersRouter } from '#server/routers/v1/commands/timers/timers.router';
import { Router } from 'express';


export const createCommandsRouter = (): Router => {
  const commandsRouter = Router();

  commandsRouter.use('/custom', createCustomRouter());

  commandsRouter.use('/timers', createTimersRouter());

  return commandsRouter;
};
