import { Bot } from '#bot/Bot';
import { prisma } from '#database/database';
import { FRAME_DURATION } from '#database/extensions/channelStats';
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
} from '#shared/types/api/dashboard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { HttpCodes } from '#shared/httpCodes';

dayjs.extend(utc);


export const getModeratorsView = new ExpressStack()
  .usePreflight(authenticated)
  .use(async (req, res) => {
    try {
      const channelThread = Bot.getChannelThread(req.user.login);
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
      const topChatterId = await prisma.message.getTopChatter(req.user.id);
      const topChatter = topChatterId ? await TwitchUserRepo.get(req.user.id, topChatterId ?? '') : null;

      const topCommand = await prisma.command.getTopCommand(req.user.id);

      const topEmote = await prisma.message.getTopEmote(req.user.id);

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
      const stats = await prisma.channelAction.getByUserId(req.user.id);

      const resp: GetRecentActionsResponse = {
        data: stats.map((stat) => stat.serialize()),
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
      const oldestFrameId = prisma.channelStats.frameIdFromDate(dayjs.utc().subtract(1, 'hour').toDate());
      const newestFrameId = prisma.channelStats.frameIdFromDate();

      const stats = await prisma.channelStats.getFramesBetween(req.user.id, oldestFrameId, newestFrameId);
      const mappedStats = prisma.channelStats.mapFrames(stats);

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
            timestamp: prisma.channelStats.dateFromFrameId(i).getTime(),
            frameDuration: FRAME_DURATION,

            messages: 0,
            timeouts: 0,
            bans: 0,
            deleted: 0,
            commands: 0,
          });
        } else {
          frames.push({
            timestamp: frame.getDate().getTime(),
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
          dateStart: prisma.channelStats.dateFromFrameId(oldestFrameId).getTime(),
          dateEnd: prisma.channelStats.dateFromFrameId(newestFrameId).getTime(),

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
