import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetBehaviorProfilesPaginatedResponse, GetBehaviorProfilesResponse } from '#shared/types/api/behaviorProfiles';


export const getBehaviorProfilesView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBehaviorProfilesPaginatedResponse.or(GetBehaviorProfilesResponse)))
  .use(limitOffsetPagination())
  .use(async (req, res) => {
    try {
      if (req.pagination) {
        const profiles = await prisma.behaviorProfile.getByChannelId(req.user.id, req.pagination);

        res.jsonValidated({
          data: profiles.map((c) => c.serialize()),

          total: await prisma.behaviorProfile.countByChannelId(req.user.id),
          limit: req.pagination.take,
          offset: req.pagination.skip,
        });
      } else {
        const profiles = await prisma.behaviorProfile.getByChannelId(req.user.id);

        res.jsonValidated({
          data: profiles.map((c) => c.serialize()),
        });
      }
    } catch (err) {
      logger.warn('Failed to get behavior profiles', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'getBehaviorProfilesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get behavior profiles');
    }
  });
