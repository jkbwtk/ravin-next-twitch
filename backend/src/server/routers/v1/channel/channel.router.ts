import { createSettingsRouter } from '#server/routers/v1/channel/settings/settings.router';
import { Router } from 'express';


export const createChannelRouter = (): Router => {
  const channelRouter = Router();

  channelRouter.use('/settings', createSettingsRouter());

  return channelRouter;
};
