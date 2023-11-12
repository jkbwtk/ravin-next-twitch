import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { DeleteCustomCommandSchema, PatchCustomCommandSchema, PostCustomCommandSchema } from '#server/routers/v1/commands/custom/custom.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetCustomCommandsResponse, GetCustomCommandsStatusResponse } from '#shared/types/api/commands';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';


export const getCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCustomCommandsResponse))
  .use(async (req, res) => {
    try {
      const commands = await prisma.command.getByChannelId(req.user.id);

      res.jsonValidated({
        data: commands.map((c) => c.serialize()),
      });
    } catch (err) {
      logger.warn('Failed to get custom commands', {
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
  .use(async (req, res) => {
    try {
      const command = await prisma.command.createFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'NEW_CUSTOM_COMMAND', command.serialize());

      res.sendStatus(HttpCodes.Created);
    } catch (err) {
      logger.warn('Failed to create custom command', {
        error: err,
        label: ['APIv1', 'commands', 'postCustomCommandView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create custom command');
    }
  });

export const patchCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchCustomCommandSchema))
  .use(async (req, res) => {
    try {
      const command = await prisma.command.updateFromApi(req.validated.body);
      SocketServer.emitToUser(req.user.id, 'UPD_CUSTOM_COMMAND', command.serialize());

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to update custom command', {
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
  .use(async (req, res) => {
    try {
      console.log(req.validated);

      await prisma.command.deleteFromApi(req.validated.body);
      await Bot.reloadChannelCommands(req.user.id);
      SocketServer.emitToUser(req.user.id, 'DEL_CUSTOM_COMMAND', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete custom command', {
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
      logger.warn('Failed to get custom commands status', {
        error: err,
        label: ['APIv1', 'commands', 'getCustomCommandsStatusView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get custom commands status');
    }
  });
