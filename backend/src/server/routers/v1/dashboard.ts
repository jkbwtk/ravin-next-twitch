import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { Router as expressRouter } from 'express';
import { invalidRoute } from '../../middlewares';
import {
  Action,
  GetBotConnectionStatusResponse,
  GetModeratorsResponse,
  GetRecentActionsResponse,
  GetTopStatsResponse,
  Moderator,
} from '#types/api/dashboard';


export const dashboardRouter = expressRouter();

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

dashboardRouter.get('/widgets/recentActions', async (req, res) => {
  const resp: GetRecentActionsResponse = {
    data: Array.from({ length: randomInt(0, 100) }, createRandomAction),
  };

  res.json(resp);
});

dashboardRouter.use('*', invalidRoute);
