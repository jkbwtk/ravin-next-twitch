import { getChantingView, getOfflineChatSettingsView, postChantingView, postOfflineChatSettingsView } from '#server/routers/v1/channel/settings/settings.views';
import { Router } from 'express';


export const createSettingsRouter = (): Router => {
  const settingsRouter = Router();

  settingsRouter.get('/chanting', ...getChantingView.unwrap());

  settingsRouter.post('/chanting', ...postChantingView.unwrap());

  settingsRouter.get('/offline-chat-settings', getOfflineChatSettingsView.unwrap());

  settingsRouter.post('/offline-chat-settings', postOfflineChatSettingsView.unwrap());

  return settingsRouter;
};
