import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { GetMessagesResponse } from '#types/api/message';
import { HttpCodes } from '#shared/httpCodes';
import { MessageController } from '#database/controllers/MessageController';
import { MessageSerializer } from '#database/serializers/MessageSerializer';


export const getMessagesView = new ExpressStack()
  .use(authenticated)
  .use(validateResponse(GetMessagesResponse))
  .use(async (req, res) => {
    try {
      const messages = await MessageController.getByUserId(req.user.id);

      res.jsonValidated({
        data: MessageSerializer(messages),
      });
    } catch (err) {
      logger.error('Failed to get messages', {
        error: err,
        label: ['APIv1', 'logs', 'getMessagesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get messages');
    }
  });
