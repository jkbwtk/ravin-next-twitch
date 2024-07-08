import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetBotActionsPaginatedResponse, GetBotActionsResponse } from '#types/api/botActions';


export const getBotActionsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBotActionsPaginatedResponse.or(GetBotActionsResponse)))
  .use(limitOffsetPagination())
  .use(async (req, res) => {
    try {
      if (req.pagination) {
        const botActions = await prisma.botAction.getByChannelId(req.user.id, req.pagination);

        res.jsonValidated({
          data: botActions.map((c) => c.serialize()),

          total: await prisma.botAction.countByChannelId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        const botActions = await prisma.botAction.getByChannelId(req.user.id);

        res.jsonValidated({
          data: botActions.map((c) => c.serialize()),
        });
      }
    } catch (err) {
      logger.warn('Failed to get bot actions', {
        error: err,
        label: ['APIv1', 'botActions', 'getBotActionsView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get bot actions');
    }
  });
