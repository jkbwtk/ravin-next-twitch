import { getChantingView, postChantingView } from '#server/routers/v1/channel/settings/settings.views';
import { Router } from 'express';


export const createSettingsRouter = (): Router => {
  const settingsRouter = Router();

  settingsRouter.get('/chanting', ...getChantingView.unwrap());

  settingsRouter.post('/chanting', ...postChantingView.unwrap());

  return settingsRouter;
};
