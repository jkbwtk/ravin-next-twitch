import { settingsRouter } from '#server/routers/v1/channel/settings/settings.router';
import { Router as expressRouter } from 'express';


export const channelRouter = expressRouter();

channelRouter.use('/settings', settingsRouter);
