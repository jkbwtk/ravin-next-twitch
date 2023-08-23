import { getNotifications, postBroadcastNotification, postMarkAsRead } from '#server/routers/v1/systemNotifications/systemNotifications.views';
import { Router } from 'express';


export const systemNotificationsRouter = Router();

systemNotificationsRouter.get('/', ...getNotifications.unwrap());

systemNotificationsRouter.post('/read', ...postMarkAsRead.unwrap());

systemNotificationsRouter.post('/broadcast', ...postBroadcastNotification.unwrap());
