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
  const resp: GetModeratorsResponse = {
    data: Array.from({ length: randomInt(1, 10) }, createRandomAdmin),
  };

  res.json(resp);
});

dashboardRouter.get('/connectionStatus', async (req, res) => {
  const resp: GetBotConnectionStatusResponse = {
    data: {
      channel: faker.internet.userName().toLowerCase().replace('.', '_'),
      joined: !!randomInt(0, 2),
      admin: !!randomInt(0, 2),
    },
  };

  res.json(resp);
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
