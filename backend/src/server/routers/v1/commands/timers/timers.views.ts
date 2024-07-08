import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { logger } from '#lib/logger';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { SocketServer } from '#server/SocketServer';
import { idListFilter } from '#server/middlewares/idListFilter';
import { DeleteCommandTimerSchema, PatchCommandTimerSchema, PostCommandTimerSchema } from '#server/routers/v1/commands/timers/timers.schemas';
import { authenticated, validate, validateResponse } from '#server/stackMiddlewares';
import { GetCommandTimersPaginatedResponse, GetCommandTimersResponse, GetCommandTimersStatusResponse } from '#types/api/commands';
import { json } from 'body-parser';
import { HttpCodes } from '#shared/httpCodes';
import { limitOffsetPagination } from '#server/middlewares/pagination';


export const getCommandTimersView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetCommandTimersPaginatedResponse.or(GetCommandTimersResponse)))
  .use(limitOffsetPagination())
  .use(idListFilter())
  .use(async (req, res) => {
    try {
      if (req.pagination) {
        const timers = await prisma.commandTimer.getByChannelId(req.user.id, req.pagination);

        res.jsonValidated({
          data: timers.map((c) => c.serialize()),

          total: await prisma.commandTimer.countByChannelId(req.user.id),
          limit: req.pagination.limit,
          offset: req.pagination.offset,
        });
      } else {
        const commandTimers = await prisma.commandTimer.getByChannelId(req.user.id);

        res.jsonValidated({
          data: commandTimers.map((c) => c.serialize()),
        });
      }
    } catch (err) {
      logger.warn('Failed to get command timers', {
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
  .use(async (req, res) => {
    try {
      const commandTimer = await prisma.commandTimer.createFromApi(req.user.id, req.validated.body);
      SocketServer.emitToUser(req.user.id, 'NEW_COMMAND_TIMER', commandTimer.serialize());

      res.sendStatus(HttpCodes.Created);
    } catch (err) {
      logger.warn('Failed to create command timer', {
        error: err,
        label: ['APIv1', 'timers', 'postCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to create command timer');
    }
  });

export const patchCommandTimersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(PatchCommandTimerSchema))
  .use(async (req, res) => {
    try {
      const commandTimer = await prisma.commandTimer.updateFromApi(req.validated.body);
      SocketServer.emitToUser(req.user.id, 'UPD_COMMAND_TIMER', commandTimer.serialize());

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to update command timer', {
        error: err,
        label: ['APIv1', 'timers', 'patchCommandTimersView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to update command timer');
    }
  });

export const deleteCommandTimersView = new ExpressStack()
  .usePreflight(authenticated)
  .useNative(json())
  .use(validate(DeleteCommandTimerSchema))
  .use(async (req, res) => {
    try {
      await prisma.commandTimer.deleteFromApi(req.validated.body);
      await Bot.reloadChannelCommands(req.user.id);
      SocketServer.emitToUser(req.user.id, 'DEL_COMMAND_TIMER', req.validated.body.id);

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.warn('Failed to delete command timer', {
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
      const channelThread = Bot.getChannelThread(req.user.login);
      if (channelThread === undefined) {
        throw new ServerError(HttpCodes.InternalServerError, `Failed to get command timer status for user ${req.user.login}`);
      }

      res.jsonValidated({
        data: Array.from(channelThread.commandTimerHandler.commandTimers.values())
          .map((state) => state.getState()),
      });
    } catch (err) {
      logger.warn('Failed to get command timer status', {
        error: err,
        label: ['APIv1', 'commands', 'getCommandTimersStatusView'],
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get command timer status');
    }
  });
