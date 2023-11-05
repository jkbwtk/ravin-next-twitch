import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { arrayFrom } from '#lib/utils';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { PostBroadcastNotificationSchema, PostReadNotificationsSchema } from '#server/routers/v1/systemNotifications/systemNotifications.schemas';
import { admin, authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetSystemNotificationsReadResponse } from '#shared/types/api/systemNotifications';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';


export const getNotifications = new ExpressStack()
  .use(authenticated)
  .use(validateResponse(GetSystemNotificationsReadResponse))
  .use(async (req, res) => {
    try {
      const notifications = await prisma.systemNotification.getByUserId(req.user.id);

      res.jsonValidated({
        data: notifications.map((notification) => notification.serialize()),
      });
    } catch (err) {
      logger.error('Failed to get notifications', {
        label: ['APIv1', 'systemNotifications', 'getNotifications'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get notifications');
    }
  });

export const postMarkAsRead = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostReadNotificationsSchema))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;

      await prisma.systemNotification.markAsReadById(body.id);
      SocketServer.emitToUser(req.user.id, 'RAD_SYSTEM_NOTIFICATION', arrayFrom(body.id));

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to mark notifications as read', {
        label: ['APIv1', 'systemNotifications', 'markAsRead'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to mark notifications as read');
    }
  });


export const postBroadcastNotification = new ExpressStack()
  .usePreflight(authenticated)
  .usePreflight(admin)
  .useNative(json())
  .use(validate(PostBroadcastNotificationSchema))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;
      await prisma.systemNotification.broadcastNotification(body.title, body.content);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to broadcast notification', {
        label: ['APIv1', 'systemNotifications', 'postBroadcastNotification'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to broadcast notification');
    }
  });
