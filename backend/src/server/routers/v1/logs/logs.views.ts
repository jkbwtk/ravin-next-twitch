import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { authenticated } from '#server/stackMiddlewares';
import { GetMessagesResponse } from '#shared/types/api/logs';


export const getMessagesView = new ExpressStack()
  .use(authenticated)
  .use(async (req, res, next) => {
    try {
      const messages = await prisma.message.getByChannelId(req.user.id);

      const response: GetMessagesResponse = {
        data: messages.map((message) => message.serialize()),
      };

      res.json(response);

      return [req, res, next];
    } catch (err) {
      logger.warn('Failed to get messages', {
        error: err,
        label: ['APIv1', 'logs', 'getMessagesView'],
      });

      throw new ServerError(500, 'Failed to get messages');
    }
  });
