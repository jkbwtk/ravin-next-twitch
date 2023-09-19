import { createCustomRouter } from '#server/routers/v1/commands/custom/custom.router';
import { Router } from 'express';


export const createCommandsRouter = (): Router => {
  const commandsRouter = Router();

  commandsRouter.use('/custom', createCustomRouter());

  return commandsRouter;
};
