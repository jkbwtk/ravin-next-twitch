import { SystemNotification } from '#database/entities/SystemNotification';
import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { GetSystemNotificationsResponse } from '#shared/types/api/systemNotifications';
import { SocketServer } from '#server/SocketServer';
import { arrayFrom } from '#lib/utils';
import { display } from '#lib/display';


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

    const resp: GetSystemNotificationsResponse = {
      data: notifications.map((notification) => notification.serialize()),
    };

    res.json(resp);
  });

  systemNotificationsRouter.post('/read', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    const body = req.body as unknown;

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

    SocketServer.emitToUser(req.user.id, 'RAD_SYSTEM_NOTIFICATION', arrayFrom(body.id));

    res.sendStatus(200);
  });

  systemNotificationsRouter.post('/broadcast', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    try {
      if (!req.user.admin) return res.sendStatus(403);

      const body = req.body as unknown;

      if (
        typeof body !== 'object' || body === null ||
        !('title' in body) || typeof body.title !== 'string' ||
        !('content' in body) || typeof body.content !== 'string'
      ) return res.sendStatus(400);

      await SystemNotification.broadcastNotification(body.title, body.content);

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:systemNotificationsRouter:broadcast[post]', err);
      res.sendStatus(500);
    }
  });

  return systemNotificationsRouter;
};
