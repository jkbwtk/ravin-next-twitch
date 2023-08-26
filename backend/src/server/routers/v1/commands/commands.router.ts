import { customRouter } from '#server/routers/v1/commands/custom/custom.router';
import { Router } from 'express';


export const commandsRouter = Router();

commandsRouter.use('/custom', customRouter);
