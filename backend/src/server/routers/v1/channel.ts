import { Router as expressRouter } from 'express';
import { json as jsonParser } from 'body-parser';
import { GetChantingSettingsResponse } from '#shared/types/api/channel';
import { display } from '#lib/display';
import { Database } from '#database/Prisma';


export const channelRouter = async (): Promise<expressRouter> => {
  const channelRouter = expressRouter();

  channelRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else next();
  });

  channelRouter.use(jsonParser());

  channelRouter.get('/settings/chanting', async (req, res) => {
    if (req.user === undefined) return res.sendStatus(401);

    const response: GetChantingSettingsResponse = {
      data: req.user.channel.chantingSettings,
    };

    return res.json(response);
  });

  channelRouter.post('/settings/chanting', async (req, res) => {
    if (req.user === undefined) return res.sendStatus(401);

    try {
      await Database.getPrismaClient().channel.updateChantingFromApi(req.user.id, req.body);

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:channel:settings:chanting[post]', err);
      res.sendStatus(400);
    }
  });

  return channelRouter;
};
