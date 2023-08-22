import { getChantingView, postChantingView } from '#server/routers/v1/channel/settings/settings.views';
import { Router as expressRouter } from 'express';


export const settingsRouter = expressRouter();

settingsRouter.get('/chanting', getChantingView.unwrap());

settingsRouter.post('/chanting', postChantingView.unwrap());
