import { SystemNotification } from '#database/entities/SystemNotification';
import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { GetSystemNotificationsResponse } from '#shared/types/api/systemNotifications';


const serializeNotification = (notification: SystemNotification) => ({
  id: notification.id,
  userId: notification.user.id,
  title: notification.title,
  content: notification.content,
  read: notification.deletedAt !== null,
  createdAt: notification.createdAt,
});

export const systemNotificationsRouter = async (): Promise<expressRouter> => {
  const systemNotificationsRouter = expressRouter();

  systemNotificationsRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else next();
  });

  systemNotificationsRouter.get('/', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    const notifications = await SystemNotification.getNotificationsByUserId(req.user.id);

    console.log(notifications);

    const resp: GetSystemNotificationsResponse = {
      data: notifications.map(serializeNotification),
    };

    res.json(resp);
  });

  systemNotificationsRouter.post('/read', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    const body = req.body as unknown;
    console.log(req);
    console.log(body);

    if (
      typeof body !== 'object' || body === null ||
      !('id' in body) ||
      (typeof body.id !== 'number' && !Array.isArray(body.id))
    ) return res.sendStatus(400);

    if (
      Array.isArray(body.id) &&
      body.id.some((id) => typeof id !== 'number')
    ) return res.sendStatus(400);

    await SystemNotification.deleteNotificationById(body.id);

    res.sendStatus(200);
  });

  return systemNotificationsRouter;
};
