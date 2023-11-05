import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { Config } from '#lib/Config';
import { logger } from '#lib/logger';
import { getModerators } from '#lib/twitch';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { GetBotConnectionStatusResponse } from '#shared/types/api/dashboard';
import { HttpCodes } from '#shared/httpCodes';


export const getConnectionStatusView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBotConnectionStatusResponse))
  .use(async (req, res) => {
    try {
      const moderatorLogins = (await getModerators(req.user.id))
        .map((mod) => mod.user_login);

      const botLogin = await Config.getOrFail('botLogin');

      res.jsonValidated({
        data: {
          channel: req.user.login,
          joined: req.user.channel.joined ?? false,
          admin: moderatorLogins.includes(botLogin) || botLogin === req.user.login,
        },
      });
    } catch (err) {
      logger.error('Failed to get connection status', {
        label: ['APIv1', 'dashboard', 'getConnectionStatusView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get connection status');
    }
  });

export const postJoinChannelView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const channel = await prisma.channel.getByUserIdOrFail(req.user.id);

      channel.joined = !channel.joined;

      if (channel.joined) await Bot.joinChannel(channel.user.id);
      else await Bot.leaveChannel(channel.user.id);

      // TODO: Create dedicated model method for this
      await prisma.channel.update({
        where: { id: channel.id },
        data: { joined: channel.joined },
      });

      res.sendStatus(HttpCodes.OK);
    } catch (err) {
      logger.error('Failed to join channel', {
        label: ['APIv1', 'dashboard', 'postJoinChannelView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to join channel');
    }
  });
