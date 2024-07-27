import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { authenticated } from '#server/stackMiddlewares';
import { GetMessagesResponse } from '#types/api/logs';
import { HttpCodes } from '#shared/httpCodes';
import { MessageController } from '#database/controllers/MessageController';


export const getMessagesView = new ExpressStack()
  .use(authenticated)
  .use(async (req, res) => {
    try {
      const messages = await MessageController.getByUserId(req.user.id);

      const response: GetMessagesResponse = {
        data: MessageController.$utils.serialize(messages),
      };

      res.json(response);
    } catch (err) {
      logger.warn('Failed to get messages', {
        error: err,
        label: ['APIv1', 'logs', 'getMessagesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get messages');
    }
  });
