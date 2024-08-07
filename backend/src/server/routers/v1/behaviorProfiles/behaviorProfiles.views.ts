import { Bot } from '#bot/Bot';
import { BehaviorProfileController } from '#database/controllers/BehaviorProfileController';
import { CommandController } from '#database/controllers/CommandController';
import { PhraseFilterController } from '#database/controllers/PhraseFilterController';
import { RegexFilterController } from '#database/controllers/RegexFilterController';
import { BehaviorProfileSerializer } from '#database/serializers/BehaviorProfileSerializer';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import {
  DeleteBehaviorProfileSchema,
  PatchBehaviorProfileSchema,
  PostBehaviorProfileSchema,
} from '#server/routers/v1/behaviorProfiles/behaviorProfiles.schemas';
import { authenticated, checkResourceOwnership, queryResource, validate, validateResponse } from '#server/stackMiddlewares';
import { ServerError } from '#shared/ServerError';
import { HttpCodes } from '#shared/httpCodes';
import {
  BehaviorProfileApi,
  GetBehaviorProfilesPaginatedResponse,
  GetBehaviorProfilesResponse,
  GetBehaviorProfilesStatusResponse,
} from '#types/api/behaviorProfiles';
import { json } from 'body-parser';


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
      logger.error('Failed to get status of behavior profiles', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'getBehaviorProfilesStatus'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get status of behavior profiles');
    }
  });


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
      logger.error('Failed to get behavior profiles', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'getBehaviorProfilesView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get behavior profiles');
    }
  });


export const postBehaviorProfileView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostBehaviorProfileSchema))
  .use(validateResponse(BehaviorProfileApi))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;

      const profile = await BehaviorProfileController.createWithRelations({
        ...req.validated.body,

        channelUserId: req.user.id,

        commands: body.commands.length > 0 ?
          await CommandController.filterOwnedList(req.user.id, body.commands) : [],
        phraseFilters: body.phraseFilters.length > 0 ?
          await PhraseFilterController.filterOwnedList(req.user.id, body.phraseFilters) : [],
        regexFilters: body.regexFilters.length > 0 ?
          await RegexFilterController.filterOwnedList(req.user.id, body.regexFilters) : [],
        commandTimers: body.commandTimers.length > 0 ?
          await CommandController.filterOwnedList(req.user.id, body.commandTimers) : [],
      });

      if (!profile) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to create behavior profile');
      }

      res.jsonValidated(BehaviorProfileSerializer(profile));
    } catch (err) {
      logger.error('Failed to create behavior profile', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'postBehaviorProfileView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create behavior profile');
    }
  });


export const patchBehaviorProfileView = new ExpressStack('/:id')
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchBehaviorProfileSchema))
  .use(queryResource(BehaviorProfileController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(validateResponse(BehaviorProfileApi))
  .use(async (req, res) => {
    try {
      const body = req.validated.body;

      const profile = await BehaviorProfileController.updateWithRelations({
        ...req.validated.body,

        id: req.resource.id,

        commands: body.commands && body.commands.length > 0 ?
          await CommandController.filterOwnedList(req.user.id, body.commands) : body.commands,
        phraseFilters: body.phraseFilters && body.phraseFilters.length > 0 ?
          await PhraseFilterController.filterOwnedList(req.user.id, body.phraseFilters) : body.phraseFilters,
        regexFilters: body.regexFilters && body.regexFilters.length > 0 ?
          await RegexFilterController.filterOwnedList(req.user.id, body.regexFilters) : body.regexFilters,
        commandTimers: body.commandTimers && body.commandTimers.length > 0 ?
          await CommandController.filterOwnedList(req.user.id, body.commandTimers) : body.commandTimers,
      });

      if (!profile) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to update behavior profile');
      }

      res.jsonValidated(BehaviorProfileSerializer(profile));
    } catch (err) {
      logger.error('Failed to update behavior profile', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'patchBehaviorProfileView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update behavior profile');
    }
  });


export const deleteBehaviorProfileView = new ExpressStack('/:id')
  .usePreflight(authenticated)
  .use(validate(DeleteBehaviorProfileSchema))
  .use(queryResource(BehaviorProfileController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(async (req, res) => {
    try {
      const profile = await BehaviorProfileController.delete({
        id: req.resource.id,
      });

      if (!profile) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete behavior profile');
      }

      res.sendStatus(HttpCodes.NoContent);
    } catch (err) {
      logger.error('Failed to delete behavior profile', {
        error: err,
        label: ['APIv1', 'behaviorProfiles', 'deleteBehaviorProfileView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete behavior profile');
    }
  });
