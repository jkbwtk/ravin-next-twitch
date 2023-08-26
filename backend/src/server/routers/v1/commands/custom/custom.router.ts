import {
  deleteCustomCommandsView,
  getCustomCommandsStatusView,
  getCustomCommandsView,
  patchCustomCommandsView,
  postCustomCommandsView,
} from '#server/routers/v1/commands/custom/custom.views';
import { Router } from 'express';


export const customRouter = Router();

customRouter.get('/', ...getCustomCommandsView.unwrap());

customRouter.post('/', ...postCustomCommandsView.unwrap());

customRouter.patch('/', ...patchCustomCommandsView.unwrap());

customRouter.delete('/', ...deleteCustomCommandsView.unwrap());

customRouter.get('/status', ...getCustomCommandsStatusView.unwrap());
