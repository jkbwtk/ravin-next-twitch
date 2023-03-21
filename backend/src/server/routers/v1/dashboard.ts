import { faker } from '@faker-js/faker';
import { randomInt } from 'crypto';
import { Router as expressRouter } from 'express';
import { invalidRoute } from '../../middlewares';
import { GetBotConnectionStatusResponse, GetModeratorsResponse, Moderator } from '#types/api/dashboard';

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


dashboardRouter.use('*', invalidRoute);
