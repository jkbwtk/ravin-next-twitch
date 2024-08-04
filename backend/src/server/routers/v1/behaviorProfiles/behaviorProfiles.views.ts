import { Bot } from '#bot/Bot';
import { BehaviorProfileController } from '#database/controllers/BehaviorProfileController';
import { BehaviorProfileSerializer } from '#database/serializers/BehaviorProfileSerializer';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import { GetBehaviorProfilesPaginatedResponse, GetBehaviorProfilesResponse, GetBehaviorProfilesStatusResponse } from '#types/api/behaviorProfiles';


export const getBehaviorProfilesView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBehaviorProfilesPaginatedResponse.or(GetBehaviorProfilesResponse)))
  .use(limitOffsetPagination())
  .use(async (req, res) => {
    try {
      const profiles = await BehaviorProfileController.getByUserIdWithRelations(req.user.id, {
        pagination: req.pagination,
      });

      if (req.pagination) {
        res.jsonValidated({
          data: BehaviorProfileSerializer(profiles),

          total: await BehaviorProfileController.countByUserId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        res.jsonValidated({
          data: BehaviorProfileSerializer(profiles),
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

export const getBehaviorProfilesStatus = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBehaviorProfilesStatusResponse))
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.login);

      if (!channelThread) {
        throw new ServerError(HttpCodes.BadRequest, 'Channel thread not found');
      }

      if (channelThread.channelInformation === null) {
        await channelThread.syncChannelInformation();
      }

      res.jsonValidated({
        data: {
          channelInformation: channelThread.channelInformation,
          streamStatus: channelThread.streamStatus,
          activeProfiles: [],
        },
      });
    } catch (err) {
      logger.warn('Failed to get status of behavior profiles', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'getBehaviorProfilesStatus'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get status of behavior profiles');
    }
  });
