import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { PostBroadcastNotificationSchema, PostReadNotificationsSchema } from '#server/routers/v1/systemNotifications/systemNotifications.schemas';
import { admin, authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetSystemNotificationsReadResponse } from '#types/api/systemNotifications';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { SystemNotificationController } from '#database/controllers/SystemNotificationController';


export const getNotifications = new ExpressStack()
  .use(authenticated)
  .use(validateResponse(GetSystemNotificationsReadResponse))
  .use(async (req, res) => {
    try {
      const notifications = await SystemNotificationController.getByUserId(req.user.id);

      res.jsonValidated({
        data: SystemNotificationController.$utils.serialize(notifications),
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

      await SystemNotificationController.markAsReadById(body.id);

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
      await SystemNotificationController.broadcast({
        title: body.title,
        content: body.content,
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to broadcast notification', {
        label: ['APIv1', 'systemNotifications', 'postBroadcastNotification'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to broadcast notification');
    }
  });
