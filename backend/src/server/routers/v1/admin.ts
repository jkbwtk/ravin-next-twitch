import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { json as jsonParser } from 'body-parser';
import { display } from '#lib/display';
import { Config } from '#lib/Config';


export const adminRouter = async (): Promise<expressRouter> => {
  const adminRouter = expressRouter();

  adminRouter.use(async (req, res, next) => {
    if (req.isUnauthenticated()) res.sendStatus(401);
    else if (req.user === undefined) res.sendStatus(401);
    else if (!req.user.admin) res.sendStatus(403);
    else next();
  });

  adminRouter.use(jsonParser());

  adminRouter.post('/settings/config', async (req, res) => {
    if (!(req.user instanceof User)) return res.sendStatus(401);

    try {
      const changes: [string, string][] = [];

      if (
        req.body.adminUsername !== undefined &&
        typeof req.body.adminUsername === 'string' &&
        req.body.adminUsername.length > 0 &&
        req.body.adminUsername.length <= 64
      ) {
        changes.push(['adminUsername', req.body.adminUsername]);
      }

      if (
        req.body.botLogin !== undefined &&
        typeof req.body.botLogin === 'string' &&
        req.body.botLogin.length > 0 &&
        req.body.botLogin.length <= 64
      ) {
        changes.push(['botLogin', req.body.botLogin]);
      }

      if (
        req.body.botToken !== undefined &&
        typeof req.body.botToken === 'string' &&
        req.body.botToken.length > 0 &&
        req.body.botToken.length <= 64
      ) {
        changes.push(['botToken', req.body.botToken]);
      }

      if (
        req.body.twitchClientId !== undefined &&
        typeof req.body.twitchClientId === 'string' &&
        req.body.twitchClientId.length > 0 &&
        req.body.twitchClientId.length <= 64
      ) {
        changes.push(['twitchClientId', req.body.twitchClientId]);
      }

      if (
        req.body.twitchClientSecret !== undefined &&
        typeof req.body.twitchClientSecret === 'string' &&
        req.body.twitchClientSecret.length > 0 &&
        req.body.twitchClientSecret.length <= 64
      ) {
        changes.push(['twitchClientSecret', req.body.twitchClientSecret]);
      }

      await Config.batchSet(changes);

      res.sendStatus(200);
    } catch (err) {
      display.error.nextLine('APIv1:channel:settings:chanting[post]', err);
      res.sendStatus(400);
    }
  });

  return adminRouter;
};
