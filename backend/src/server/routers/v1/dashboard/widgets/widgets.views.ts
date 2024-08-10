import { Bot } from '#bot/Bot';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { logger } from '#lib/logger';
import { getModerators } from '#lib/twitch';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#shared/ServerError';
import { authenticated } from '#server/stackMiddlewares';
import {
  ChatStatFrame,
  GetChatStatsResponse,
  GetModeratorsResponse,
  GetRecentActionsResponse,
  GetTopStatsResponse,
} from '#types/api/dashboard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { HttpCodes } from '#shared/httpCodes';
import { CommandController } from '#database/controllers/CommandController';
import { ChannelActionController } from '#database/controllers/ChannelActionController';
import { ChannelStatsController, FRAME_DURATION } from '#database/controllers/ChannelStatsController';
import { MessageController } from '#database/controllers/MessageController';
import { ChannelActionSerializer } from '#database/serializers/ChannelActionSerializer';

dayjs.extend(utc);


export const getModeratorsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.id);
      if (channelThread === undefined) {
        res.json({ data: [] });
        return;
      }

      const moderatorIds = (await getModerators(req.user.id))
        .map((mod) => mod.user_id);

      const profiles = await TwitchUserRepo.getAll(req.user.id, moderatorIds);

      const resp: GetModeratorsResponse = {
        data: profiles.map((profile) => ({
          avatarUrl: profile.profile_image_url,
          displayName: profile.display_name,
          status: channelThread.chatMembers.has(profile.id),
        })),
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get moderators', {
        label: ['APIv1', 'dashboard', 'getModeratorsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get moderators');
    }
  });

export const getTopStatsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const topChatterId = await MessageController.getTopChatter(req.user.id);
      const topChatter = topChatterId ? await TwitchUserRepo.get(req.user.id, topChatterId ?? '') : null;

      const topCommand = await CommandController.getTopCommand(req.user.id);

      const topEmote = await MessageController.getTopEmote(req.user.id);

      const resp: GetTopStatsResponse = {
        data: {
          chatter: {
            avatarUrl: topChatter?.profile_image_url ?? '',
            displayName: topChatter?.display_name ?? '',
          },
          command: topCommand?.command ?? '',
          emote: {
            url: topEmote ? `https://static-cdn.jtvnw.net/emoticons/v2/${topEmote.id}/default/dark/3.0` : '',
            name: topEmote?.name ?? '',
          },
        },
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get top stats', {
        label: ['APIv1', 'dashboard', 'getTopStatsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get top stats');
    }
  });

export const getRecentActionsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const stats = await ChannelActionController.getByUserId(req.user.id);

      const resp: GetRecentActionsResponse = {
        data: ChannelActionSerializer(stats),
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get recent actions', {
        label: ['APIv1', 'dashboard', 'getRecentActionsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get recent actions');
    }
  });

export const getChatStatsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const oldestFrameId = ChannelStatsController.$utils.frameIdFromDate(dayjs.utc().subtract(1, 'hour').toDate());
      const newestFrameId = ChannelStatsController.$utils.frameIdFromDate();

      const stats = await ChannelStatsController.getFramesBetween(req.user.id, oldestFrameId, newestFrameId);
      const mappedStats = ChannelStatsController.$utils.mapFrames(stats);

      let messagesTotal = 0;
      let timeoutsTotal = 0;
      let bansTotal = 0;
      let deletedTotal = 0;
      let commandsTotal = 0;
      const frames: ChatStatFrame[] = [];

      for (let i = oldestFrameId; i <= newestFrameId; i += 1) {
        const frame = mappedStats.get(i);

        if (frame === undefined) {
          frames.push({
            timestamp: ChannelStatsController.$utils.dateFromFrameId(i).getTime(),
            frameDuration: FRAME_DURATION,

            messages: 0,
            timeouts: 0,
            bans: 0,
            deleted: 0,
            commands: 0,
          });
        } else {
          frames.push({
            timestamp: ChannelStatsController.$utils.getDate(frame).getTime(),
            frameDuration: FRAME_DURATION,

            messages: frame.messages,
            timeouts: frame.timeouts,
            bans: frame.bans,
            deleted: frame.deleted,
            commands: frame.commands,
          });

          messagesTotal += frame.messages;
          timeoutsTotal += frame.timeouts;
          bansTotal += frame.bans;
          deletedTotal += frame.deleted;
          commandsTotal += frame.commands;
        }
      }

      const resp: GetChatStatsResponse = {
        data: {
          dateStart: ChannelStatsController.$utils.dateFromFrameId(oldestFrameId).getTime(),
          dateEnd: ChannelStatsController.$utils.dateFromFrameId(newestFrameId).getTime(),

          messagesTotal,
          timeoutsTotal,
          bansTotal,
          deletedTotal,
          commandsTotal,

          frames,
        },
      };

      res.json(resp);
    } catch (err) {
      logger.error('Failed to get chat stats', {
        label: ['APIv1', 'dashboard', 'getChatStatsView'],
        error: err,
      });

      throw new ServerError(HttpCodes.InternalServerError, 'Failed to get chat stats');
    }
  });
