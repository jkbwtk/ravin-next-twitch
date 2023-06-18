import { Router as expressRouter } from 'express';
import { GetCustomCommandsResponse, GetCustomCommandsStatusResponse } from '#types/api/commands';
import { display } from '#lib/display';
import { json as jsonParser } from 'body-parser';
import { SocketServer } from '#server/SocketServer';
import { Bot } from '#bot/Bot';
import { Database } from '#database/Prisma';


export const commandsRouter = async (): Promise<expressRouter> => {
  const commandsRouter = expressRouter();

  commandsRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else next();
  });

  commandsRouter.use(jsonParser());

  commandsRouter.get('/custom', async (req, res) => {
    if (req.user === undefined) return res.sendStatus(401);

    const commands = await Database.getPrismaClient().command.getByChannelId(req.user.id);

    const resp: GetCustomCommandsResponse = {
      data: commands.map((c) => c.serialize()),
    };

    res.json(resp);
  });

  commandsRouter.post('/custom', async (req, res) => {
    try {
      if (req.user === undefined) return res.sendStatus(401);

      const command = await Database.getPrismaClient().command.createFromApi(req.user.id, req.body);
      SocketServer.emitToUser(req.user.id, 'NEW_CUSTOM_COMMAND', command.serialize());

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[post]', err);
      res.sendStatus(400);
    }
  });

  commandsRouter.patch('/custom', async (req, res) => {
    try {
      if (req.user === undefined) return res.sendStatus(401);

      const command = await Database.getPrismaClient().command.updateFromApi(req.body);
      SocketServer.emitToUser(req.user.id, 'UPD_CUSTOM_COMMAND', command.serialize());

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[patch]', err);
      res.sendStatus(400);
    }
  });

  commandsRouter.delete('/custom', async (req, res) => {
    try {
      if (req.user === undefined) return res.sendStatus(401);

      await Database.getPrismaClient().command.deleteFromApi(req.body);
      SocketServer.emitToUser(req.user.id, 'DEL_CUSTOM_COMMAND', req.body.id);

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[delete]', err);
      res.sendStatus(404);
    }
  });

  commandsRouter.get('/custom/status', async (req, res) => {
    try {
      if (req.user === undefined) return res.sendStatus(401);

      const channelThread = Bot.getChannelThread(req.user.login);
      if (channelThread === undefined) return res.sendStatus(404);

      const resp: GetCustomCommandsStatusResponse = {
        data: Array.from(channelThread.customCommands.values()).map((state) => ({
          lastUsed: state.lastUsed,
          lastUsedBy: state.lastUsedBy,
          command: state.command.serialize(),
        })),
      };

      res.json(resp);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:customStatus', err);
      res.sendStatus(404);
    }
  });

  return commandsRouter;
};
