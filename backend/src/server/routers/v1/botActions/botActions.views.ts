import { BotActionController } from '#database/controllers/BotActionController';
import { BotActionSerializer } from '#database/serializers/BotActionSerializer';
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
      const botActions = await BotActionController.getByUserId(req.user.id, {
        pagination: req.pagination,
        orderBy: { createdAt: 'desc' },
      });

      if (req.pagination) {
        res.jsonValidated({
          data: BotActionSerializer(botActions),

          total: await BotActionController.countByUserId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        res.jsonValidated({
          data: BotActionSerializer(botActions),
        });
      }
    } catch (err) {
      logger.error('Failed to get bot actions', {
        error: err,
        label: ['APIv1', 'botActions', 'getBotActionsView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get bot actions');
    }
  });
