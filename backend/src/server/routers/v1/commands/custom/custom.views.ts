import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { HttpCodes, ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { DeleteCustomCommandSchema, PatchCustomCommandSchema, PostCustomCommandSchema } from '#server/routers/v1/commands/custom/custom.schemas';
import { authenticated, validate } from '#server/stackMiddlewares';
import { GetCustomCommandsResponse, GetCustomCommandsStatusResponse } from '#shared/types/api/commands';
import { json } from 'body-parser';


export const getCustomCommandsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const commands = await prisma.command.getByChannelId(req.user.id);

      const resp: GetCustomCommandsResponse = {
        data: commands.map((c) => c.serialize()),
      };

      res.json(resp);
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

      res.sendStatus(200);
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

      res.sendStatus(200);
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

      res.sendStatus(200);
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
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.login);
      if (channelThread === undefined) {
        res.sendStatus(404);
        return;
      }

      const resp: GetCustomCommandsStatusResponse = {
        data: Array.from(channelThread.commandHandler.customCommands.values())
          .map((state) => state.getState()),
      };

      res.json(resp);
    } catch (err) {
      logger.warn('Failed to get custom command status', {
        error: err,
        label: ['APIv1', 'commands', 'getCustomCommandStatusView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get custom command status');
    }
  });
