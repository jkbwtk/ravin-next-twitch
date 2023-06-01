import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { Command } from '#database/entities/Command';
import { CustomCommand, GetCustomCommandsResponse } from '#types/api/commands';
import { display } from '#lib/display';
import { json as jsonParser } from 'body-parser';
import { SocketServer } from '#server/SocketServer';


const serializeCustomCommand = (command: Command): CustomCommand => ({
  id: command.id,
  channelId: command.channelUser.id,
  command: command.command,
  response: command.response,
  userLevel: command.userLevel,
  cooldown: command.cooldown,
  enabled: command.enabled,
});

export const commandsRouter = async (): Promise<expressRouter> => {
  const commandsRouter = expressRouter();

  commandsRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else next();
  });

  commandsRouter.use(jsonParser());

  commandsRouter.get('/custom', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    const commands = await Command.getByChannelId(req.user.id);

    const resp: GetCustomCommandsResponse = {
      data: commands.map(serializeCustomCommand),
    };

    res.json(resp);
  });

  commandsRouter.post('/custom', async (req, res) => {
    try {
      if (!(req.user instanceof User)) return res.sendStatus(401);

      const command = await Command.createFromApi(req.user.id, req.body);
      SocketServer.emitToUser(req.user.id, 'NEW_CUSTOM_COMMAND', serializeCustomCommand(command));

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[post]', err);
      res.sendStatus(400);
    }
  });

  commandsRouter.patch('/custom', async (req, res) => {
    try {
      if (!(req.user instanceof User)) return res.sendStatus(401);

      const command = await Command.updateFromApi(req.body);
      SocketServer.emitToUser(req.user.id, 'UPD_CUSTOM_COMMAND', serializeCustomCommand(command));

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[patch]', err);
      res.sendStatus(400);
    }
  });

  commandsRouter.delete('/custom', async (req, res) => {
    try {
      if (!(req.user instanceof User)) return res.sendStatus(401);

      await Command.deleteFromApi(req.body);
      SocketServer.emitToUser(req.user.id, 'DEL_CUSTOM_COMMAND', req.body.id);

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[delete]', err);
      res.sendStatus(404);
    }
  });

  return commandsRouter;
};
