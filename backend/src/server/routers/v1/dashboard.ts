import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { Router as expressRouter } from 'express';
import {
  Action,
  GetBotConnectionStatusResponse,
  GetChatStatsResponse,
  GetModeratorsResponse,
  GetRecentActionsResponse,
  GetTopStatsResponse,
  Moderator,
} from '#types/api/dashboard';
import { Database } from '#database/Database';
import { Token } from '#database/entities/Token';
import { getModerators, getUsers } from '#lib/twitch';
import { Channel } from '#database/entities/Channel';
import { Config } from '#lib/Config';
import { Bot } from '#bot/Bot';
import { TwitchUserRepo } from '#lib/TwitchUserRepo';


export const dashboardRouter = expressRouter();

// artificial delay generator
dashboardRouter.use(async (req, res, next) => {
  await new Promise((resolve) => setTimeout(resolve, randomInt(10, 100)));
  next();
});

const createRandomAdmin = (): Moderator => ({
  avatarUrl: faker.internet.avatar(),
  displayName: faker.internet.userName(),
  status: !!randomInt(0, 2),
});

dashboardRouter.get('/widgets/moderators', async (req, res) => {
  if (req.isUnauthenticated() || req.user === undefined) return res.sendStatus(401);

  try {
    const tokenRepo = await Database.getRepository(Token);
    const userToken = await tokenRepo.findOneOrFail({ where: { userId: req.user.id } });

    const moderatorIds = (await getModerators(userToken))
      .map((mod) => mod.user_id);

    const profiles = await TwitchUserRepo.getAll(userToken, moderatorIds);

    const resp: GetModeratorsResponse = {
      data: profiles.map((profile) => ({
        avatarUrl: profile.profile_image_url,
        displayName: profile.display_name,
        status: false,
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
    const tokenRepo = await Database.getRepository(Token);
    const userToken = await tokenRepo.findOneOrFail({ where: { userId: req.user.id } });
    const channel = await Channel.getChannelByUserId(req.user.id);

    const moderatorLogins = (await getModerators(userToken))
      .map((mod) => mod.user_login);

    const botLogin = await Config.getOrFail('botLogin');

    const resp: GetBotConnectionStatusResponse = {
      data: {
        channel: req.user.login,
        joined: channel?.joined ?? false,
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
    const channel = await Channel.getChannelByUserId(req.user.id);
    const channelRepo = await Database.getRepository(Channel);

    if (channel === null) throw new Error('Channel not found');

    channel.joined = !channel.joined;

    await channelRepo.save(channel);
    await Channel.invalidateCache(req.user.id);

    if (channel.joined) Bot.joinChannel(req.user.login);
    else Bot.leaveChannel(req.user.login);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

dashboardRouter.get('/widgets/topStats', async (req, res) => {
  const resp: GetTopStatsResponse = {
    data: {
      chatter: {
        avatarUrl: faker.internet.avatar(),
        displayName: faker.internet.userName(),
      },
      command: faker.lorem.word(),
      emote: {
        url: faker.image.imageUrl(96, 96),
        name: faker.lorem.word(),
      },
    },
  };

  res.json(resp);
});

const createRandomAction = (): Action => {
  const date = faker.date.recent().getTime();
  const issuerDisplayName = faker.internet.userName();
  const targetDisplayName = faker.internet.userName();

  const type = ['ban', 'timeout', 'delete'][randomInt(0, 3)] as Action['type'];

  switch (type) {
    case 'ban':
      return {
        date,
        issuerDisplayName,
        targetDisplayName,
        type,
        reason: faker.lorem.sentence(),
      };

    case 'timeout':
      return {
        date,
        issuerDisplayName,
        targetDisplayName,
        type,
        duration: randomInt(1, 960) * 5,
      };

    default:
      return {
        date,
        issuerDisplayName,
        targetDisplayName,
        type,
        message: faker.lorem.sentence(),
      };
  }
};

dashboardRouter.get('/widgets/recentActions', (req, res) => {
  const resp: GetRecentActionsResponse = {
    data: Array.from({ length: randomInt(0, 100) }, createRandomAction),
  };

  res.json(resp);
});


const createRandomChatStat = (startDate: number, endDate: number, max: number): [number, number, number][] => {
  const data: [number, number, number][] = [];

  let duration = endDate - startDate;

  while (duration > 0) {
    const time = 5 * 60 * 1000;
    const count = randomInt(0, max);

    data.push([endDate - duration, time, count]);
    duration -= time;
  }

  return data;
};

dashboardRouter.get('/widgets/chatStats', (req, res) => {
  const date = faker.date.recent().getDate();
  const month = faker.date.recent().getMonth();

  const startDate = new Date(new Date().getFullYear(), month, date, new Date().getHours(), new Date().getMinutes()).getTime() - (5 * 60 * 60 * 1000);
  const endDate = new Date(new Date().getFullYear(), month, date, new Date().getHours(), new Date().getMinutes()).getTime();

  const messages = createRandomChatStat(startDate, endDate, 100);
  const timeouts = createRandomChatStat(startDate, endDate, 10);
  const bans = createRandomChatStat(startDate, endDate, 5);
  const deleted = createRandomChatStat(startDate, endDate, 10);
  const commands = createRandomChatStat(startDate, endDate, 20);

  const resp: GetChatStatsResponse = {
    data: {
      dateStart: startDate,
      dateEnd: endDate,

      messagesTotal: messages.reduce((acc, [_, __, count]) => acc + count, 0),
      timeoutsTotal: timeouts.reduce((acc, [_, __, count]) => acc + count, 0),
      bansTotal: bans.reduce((acc, [_, __, count]) => acc + count, 0),
      deletedTotal: deleted.reduce((acc, [_, __, count]) => acc + count, 0),
      commandsTotal: commands.reduce((acc, [_, __, count]) => acc + count, 0),

      messages,
    },
  };

  res.json(resp);
});
