import { Bot } from '#bot/Bot';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { idListFilter } from '#server/middlewares/idListFilter';
import { DeleteCommandTimerSchema, PatchCommandTimerSchema, PostCommandTimerSchema } from '#server/routers/v1/commands/timers/timers.schemas';
import { authenticated, checkRelationOwnership, checkResourceOwnership, queryResource, validate, validateResponse } from '#server/stackMiddlewares';
import { CommandTimerApi, GetCommandTimersPaginatedResponse, GetCommandTimersResponse, GetCommandTimersStatusResponse } from '#types/api/commands';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { CommandTimerController } from '#database/controllers/CommandTImerController';
import { CommandTimerSerializer } from '#database/serializers/CommandTImerSerializer';
import { TemplateController } from '#database/controllers/TemplateController';


export const getCommandTimersView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCommandTimersPaginatedResponse.or(GetCommandTimersResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      const timers = await CommandTimerController.getByUserId(req.user.id, {
        pagination: req.pagination,
        idListFilter: req.idListFilter,
      });

      const paginationMetadata = req.pagination ? {
        total: await CommandTimerController.countByUserId(req.user.id),
        limit: req.pagination.limit,
        offset: req.pagination.offset,
      } : null;


      res.jsonValidated({
        data: CommandTimerSerializer(timers),

        ...paginationMetadata,
      });
    } catch (err) {
      logger.error('Failed to get command timers', {
        error: err,
        label: ['APIv1', 'timers', 'getCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get command timers');
    }
  });

export const postCommandTimersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostCommandTimerSchema))
  .use(checkRelationOwnership([
    [TemplateController, 'templateId'],
  ]))
  .use(validateResponse(CommandTimerApi))
  .use(async (req, res) => {
    try {
      const timer = await CommandTimerController.create({
        ...req.validated.body,
        channelUserId: req.user.id,
      });

      if (timer === null) {
        throw new Error('Create command timer returned null');
      }


      res.jsonValidated(CommandTimerSerializer(timer));
    } catch (err) {
      logger.error('Failed to create command timer', {
        error: err,
        label: ['APIv1', 'timers', 'postCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create command timer');
    }
  });

export const patchCommandTimersView = new ExpressStack('/:id')
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchCommandTimerSchema))
  .use(queryResource(CommandTimerController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(checkRelationOwnership([
    [TemplateController, 'templateId'],
  ]))
  .use(validateResponse(CommandTimerApi))
  .use(async (req, res) => {
    try {
      const timer = await CommandTimerController.update({
        ...req.validated.body,

        id: req.resource.id,
      });

      if (timer === null) {
        throw new Error('Update command timer returned null');
      }

      res.jsonValidated(CommandTimerSerializer(timer));
    } catch (err) {
      logger.error('Failed to update command timer', {
        error: err,
        label: ['APIv1', 'timers', 'patchCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update command timer');
    }
  });

export const deleteCommandTimersView = new ExpressStack('/:id')
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(DeleteCommandTimerSchema))
  .use(queryResource(CommandTimerController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(async (req, res) => {
    try {
      const timer = await CommandTimerController.delete({
        id: req.resource.id,
      });

      if (timer === null) {
        throw new Error('Delete command timer returned null');
      }

      res.sendStatus(HttpCodes.NoContent);
    } catch (err) {
      logger.error('Failed to delete command timer', {
        error: err,
        label: ['APIv1', 'timers', 'deleteCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete command timer');
    }
  });

export const getCommandTimersStatusView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCommandTimersStatusResponse))
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.id);

      if (channelThread === undefined) {
        throw new Error(`Failed to get command timer status for user ${req.user.login}`);
      }

      res.jsonValidated({
        data: Array.from(channelThread.commandTimerHandler.commandTimers.values())
          .map((state) => state.getState()),
      });
    } catch (err) {
      logger.error('Failed to get command timer status', {
        error: err,
        label: ['APIv1', 'commands', 'getCommandTimersStatusView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get command timer status');
    }
  });
