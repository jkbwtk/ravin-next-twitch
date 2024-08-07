import { Bot } from '#bot/Bot';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { idListFilter } from '#server/middlewares/idListFilter';
import { DeleteCustomCommandSchema, PatchCustomCommandSchema, PostCustomCommandSchema } from '#server/routers/v1/commands/custom/custom.schemas';
import { authenticated, checkResourceOwnership, queryResource, validate, validateResponse } from '#server/stackMiddlewares';
import { CustomCommandApi, GetCustomCommandsPaginatedResponse, GetCustomCommandsResponse, GetCustomCommandsStatusResponse } from '#types/api/commands';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { limitOffsetPagination } from '#server/middlewares/pagination';
import { CommandController } from '#database/controllers/CommandController';
import { CustomCommandSerializer } from '#database/serializers/CommandSerializer';


export const getCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCustomCommandsPaginatedResponse.or(GetCustomCommandsResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      const commands = await CommandController.getByUserId(req.user.id, {
        pagination: req.pagination,
        idListFilter: req.idListFilter,
      });

      if (req.pagination) {
        res.jsonValidated({
          data: CustomCommandSerializer(commands),

          total: await CommandController.countByUserId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        res.jsonValidated({
          data: CustomCommandSerializer(commands),
        });
      }
    } catch (err) {
      logger.error('Failed to get custom commands', {
        error: err,
        label: ['APIv1', 'commands', 'getCustomCommandView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get custom commands');
    }
  });

export const postCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PostCustomCommandSchema))
  .use(validateResponse(CustomCommandApi))
  .use(async (req, res) => {
    try {
      const command = await CommandController.create({
        ...req.validated.body,

        channelUserId: req.user.id,
      });

      if (!command) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to create custom command');
      }

      res.jsonValidated(CustomCommandSerializer(command));
    } catch (err) {
      logger.error('Failed to create custom command', {
        error: err,
        label: ['APIv1', 'commands', 'postCustomCommandView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create custom command');
    }
  });

export const patchCustomCommandsView = new ExpressStack('/:id')
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchCustomCommandSchema))
  .use(queryResource(CommandController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(validateResponse(CustomCommandApi))
  .use(async (req, res) => {
    try {
      const command = await CommandController.update({
        ...req.validated.body,

        id: req.resource.id,
      });

      if (!command) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to update custom command');
      }

      res.jsonValidated(CustomCommandSerializer(command));
    } catch (err) {
      logger.error('Failed to update custom command', {
        error: err,
        label: ['APIv1', 'commands', 'patchCustomCommandView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update custom command');
    }
  });

export const deleteCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(DeleteCustomCommandSchema))
  .use(queryResource(CommandController, 'id'))
  .use(checkResourceOwnership('channelUserId'))
  .use(async (req, res) => {
    try {
      const command = await CommandController.delete({
        id: req.resource.id,
      });

      if (!command) {
        throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete custom command');
      }

      res.sendStatus(HttpCodes.NoContent);
    } catch (err) {
      logger.error('Failed to delete custom command', {
        error: err,
        label: ['APIv1', 'commands', 'deleteCustomCommandView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to delete custom command');
    }
  });

export const getCustomCommandsStatusView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCustomCommandsStatusResponse))
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.login);
      if (channelThread === undefined) {
        throw new ServerError(HttpCodes.InternalServerError, `Channel thread for user ${req.user.login} not found`);
      }

      res.jsonValidated({
        data: Array.from(channelThread.commandHandler.customCommands.values())
          .map((state) => state.getState()),
      });
    } catch (err) {
      logger.error('Failed to get custom commands status', {
        error: err,
        label: ['APIv1', 'commands', 'getCustomCommandsStatusView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get custom commands status');
    }
  });
