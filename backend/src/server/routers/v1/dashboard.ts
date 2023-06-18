import { Router as expressRouter } from 'express';
import {
  ChatStatFrame,
  GetBotConnectionStatusResponse,
  GetChatStatsResponse,
  GetModeratorsResponse,
  GetRecentActionsResponse,
  GetTopStatsResponse,
} from '#types/api/dashboard';
import { getModerators } from '#lib/twitch';
import { Config } from '#lib/Config';
import { Bot } from '#bot/Bot';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';
import { ChannelStats } from '#database/entities/ChannelStats';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Database } from '#database/Prisma';

dayjs.extend(utc);


export const dashboardRouter = expressRouter();

dashboardRouter.get('/widgets/moderators', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  try {
    const channelThread = Bot.getChannelThread(req.user.login);
    if (channelThread === undefined) return res.json({ data: [] });

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
    console.error(err);
    res.sendStatus(500);
  }
});

dashboardRouter.get('/connectionStatus', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  try {
    const moderatorLogins = (await getModerators(req.user.id))
      .map((mod) => mod.user_login);

    const botLogin = await Config.getOrFail('botLogin');

    const resp: GetBotConnectionStatusResponse = {
      data: {
        channel: req.user.login,
        joined: req.user.channel.joined ?? false,
        admin: moderatorLogins.includes(botLogin) || botLogin === req.user.login,
      },
    };

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

dashboardRouter.post('/joinChannel', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  try {
    const channel = await Database.getPrismaClient().channel.getByUserIdOrFail(req.user.id);

    channel.joined = !channel.joined;

    if (channel.joined) await Bot.joinChannel(channel.user.id);
    else await Bot.leaveChannel(channel.user.id);

    await Database.getPrismaClient().channel.update({
      where: { id: channel.id },
      data: { joined: channel.joined },
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

dashboardRouter.get('/widgets/topStats', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  try {
    const topChatterId = await Database.getPrismaClient().message.getTopChatter(req.user.id);
    const topChatter = topChatterId ? await TwitchUserRepo.get(req.user.id, topChatterId ?? '') : null;

    const topCommand = await Database.getPrismaClient().command.getTopCommand(req.user.id);

    const topEmote = await Database.getPrismaClient().message.getTopEmote(req.user.id);

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
    console.error(err);
    res.sendStatus(500);
  }
});

dashboardRouter.get('/widgets/recentActions', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  const stats = await Database.getPrismaClient().channelAction.getByUserId(req.user.id);

  const resp: GetRecentActionsResponse = {
    data: stats.map((stat) => stat.serialize()),
  };

  res.json(resp);
});

dashboardRouter.get('/widgets/chatStats', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  const oldestFrameId = ChannelStats.frameIdFromDate(dayjs.utc().subtract(1, 'hour').toDate());
  const newestFrameId = ChannelStats.frameIdFromDate();

  const stats = await ChannelStats.getFramesBetween(req.user.id, oldestFrameId, newestFrameId);
  const mappedStats = ChannelStats.mapFrames(stats);

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
        timestamp: ChannelStats.dateFromFrameId(i).getTime(),
        frameDuration: ChannelStats.frameDuration,

        messages: 0,
        timeouts: 0,
        bans: 0,
        deleted: 0,
        commands: 0,
      });
    } else {
      frames.push({
        timestamp: frame.getDate().getTime(),
        frameDuration: ChannelStats.frameDuration,

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
      dateStart: ChannelStats.dateFromFrameId(oldestFrameId).getTime(),
      dateEnd: ChannelStats.dateFromFrameId(newestFrameId).getTime(),

      messagesTotal,
      timeoutsTotal,
      bansTotal,
      deletedTotal,
      commandsTotal,

      frames,
    },
  };

  res.json(resp);
});
