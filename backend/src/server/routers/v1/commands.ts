import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { Command } from '#database/entities/Command';
import { CustomCommand, GetCustomCommandsResponse } from '#types/api/commands';
import { display } from '#lib/display';


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

      await Command.createFromApi(req.body);
      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[post]', err);
      res.sendStatus(400);
    }
  });

  commandsRouter.patch('/custom', async (req, res) => {
    try {
      if (!(req.user instanceof User)) return res.sendStatus(401);

      await Command.updateFromApi(req.body);
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
      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:commandsRouter:custom[delete]', err);
      res.sendStatus(404);
    }
  });

  return commandsRouter;
};
