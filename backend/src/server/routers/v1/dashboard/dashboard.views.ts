import { Bot } from '#bot/Bot';
import { Config } from '#lib/Config';
import { logger } from '#lib/logger';
import { getModerators } from '#lib/twitch';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { authenticated, validateResponse } from '#server/stackMiddlewares';
import { GetBotConnectionStatusResponse } from '#types/api/dashboard';
import { HttpCodes } from '#shared/httpCodes';
import { ChannelController } from '#database/controllers/ChannelController';


export const getConnectionStatusView = new ExpressStack()
  .usePreflight(authenticated)
  .use(validateResponse(GetBotConnectionStatusResponse))
  .use(async (req, res) => {
    try {
      const moderatorLogins = (await getModerators(req.user.id))
        .map((mod) => mod.user_login);

      const botLogin = await Config.getOrFail('botLogin');
      const channel = await ChannelController.getByUserId(req.user.id);

      if (channel === null) {
        throw Error(`Failed to get channel for user ${req.user.id}`);
      }

      res.jsonValidated({
        data: {
          channel: req.user.login,
          joined: channel.joined ?? false,
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
      const channel = await ChannelController.getByUserId(req.user.id);

      if (channel === null) {
        throw Error(`Failed to get channel for user ${req.user.id}`);
      }

      channel.joined = !channel.joined;

      if (channel.joined) await Bot.joinChannel(channel.user.id);
      else await Bot.leaveChannel(channel.user.id);

      await ChannelController.updateByUserId(req.user.id, {
        joined: channel.joined,
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
