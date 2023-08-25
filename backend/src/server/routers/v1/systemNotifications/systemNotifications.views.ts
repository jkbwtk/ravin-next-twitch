import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { arrayFrom } from '#lib/utils';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { SocketServer } from '#server/SocketServer';
import { PostBroadcastNotificationSchema, PostReadNotificationsSchema } from '#server/routers/v1/systemNotifications/systemNotifications.schemas';
import { admin, authenticated, validate } from '#server/stackMiddlewares';
import { GetSystemNotificationsReadResponse } from '#shared/types/api/systemNotifications';
import { json } from 'body-parser';


export const getNotifications = new ExpressStack()
  .use(authenticated)
  .use(async (req, res) => {
    try {
      const notifications = await prisma.systemNotification.getByUserId(req.user.id);

      const resp: GetSystemNotificationsReadResponse = {
        data: notifications.map((notification) => notification.serialize()),
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get notifications', {
        label: ['APIv1', 'systemNotifications', 'getNotifications'],
        error: err,
      });

      throw new ServerError(500, 'Failed to get notifications');
    }
  });

export const postMarkAsRead = new ExpressStack()
  .useNative(json())
  .use(authenticated)
  .use(validate(PostReadNotificationsSchema))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;

      await prisma.systemNotification.markAsReadById(body.id);
      SocketServer.emitToUser(req.user.id, 'RAD_SYSTEM_NOTIFICATION', arrayFrom(body.id));

      res.sendStatus(200);
    } catch (err) {
      logger.error('Failed to mark notifications as read', {
        label: ['APIv1', 'systemNotifications', 'markAsRead'],
        error: err,
      });

      throw new ServerError(500, 'Failed to mark notifications as read');
    }
  });


export const postBroadcastNotification = new ExpressStack()
  .useNative(json())
  .use(authenticated)
  .use(admin)
  .use(validate(PostBroadcastNotificationSchema))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;
      await prisma.systemNotification.broadcastNotification(body.title, body.content);

      res.sendStatus(200);
    } catch (err) {
      logger.error('Failed to broadcast notification', {
        label: ['APIv1', 'systemNotifications', 'postBroadcastNotification'],
        error: err,
      });

      throw new ServerError(500, 'Failed to broadcast notification');
    }
  });
