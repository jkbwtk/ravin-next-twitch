import {
  deleteCustomCommandsView,
  getCustomCommandsStatusView,
  getCustomCommandsView,
  patchCustomCommandsView,
  postCustomCommandsView,
} from '#server/routers/v1/commands/commands.views';
import { Router } from 'express';


export const commandsRouter = Router();

commandsRouter.get('/custom', ...getCustomCommandsView.unwrap());

commandsRouter.post('/custom', ...postCustomCommandsView.unwrap());

commandsRouter.patch('/custom', ...patchCustomCommandsView.unwrap());

commandsRouter.delete('/custom', ...deleteCustomCommandsView.unwrap());

commandsRouter.get('/custom/status', ...getCustomCommandsStatusView.unwrap());
