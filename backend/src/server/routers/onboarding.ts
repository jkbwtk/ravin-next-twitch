import { display } from '#lib/display';
import { quickSwitch } from '#shared/utils';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import { Router as expressRouter } from 'express';
import qs from 'qs';
import path from 'path';
import { frontendPath } from '#shared/constants';
import { json as jsonParser } from 'body-parser';
import { OnboardingForm } from '#types/api/onboarding';
import { Config } from '#lib/Config';


export const createOnboardingRouter = (port: number): expressRouter => {
  const onboardingKey = faker.random.alphaNumeric(12);
  const onboardingRouter = expressRouter();

  const url = quickSwitch(port, {
    80: `http://localhost/onboarding?key=${onboardingKey}`,
    443: `https://localhost/onboarding?key=${onboardingKey}`,
    default: `http://localhost:${port}/onboarding?key=${onboardingKey}`,
  });

  const validateQuery = (query: qs.ParsedQs): query is { key: string } => {
    return (
      'key' in query &&
        typeof query.key === 'string' &&
        query.key === onboardingKey
    );
  };

  const validateForm = (form: unknown): form is OnboardingForm => {
    return (
      form !== null && typeof form === 'object' &&
        'key' in form && typeof form.key === 'string' && form.key === onboardingKey &&
        'adminUsername' in form && typeof form.adminUsername === 'string' &&
        'botLogin' in form && typeof form.botLogin === 'string' &&
        'botToken' in form && typeof form.botToken === 'string' &&
        'twitchClientId' in form && typeof form.twitchClientId === 'string' &&
        'twitchClientSecret' in form && typeof form.twitchClientSecret === 'string'
    );
  };

  display.info.nextLine(
    'Server',
    'Server is not configured.',
    `Please visit ${chalk.white.bold(url)}`,
    'to configure the server.',
  );

  onboardingRouter.use(jsonParser());

  onboardingRouter.get('/', (req, res) => {
    if (!validateQuery(req.query)) return res.redirect('/');
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  onboardingRouter.post('/submit', async (req, res) => {
    if (!validateForm(req.body)) return res.status(400).type('text/plain').send('Invalid form');
    else if (!validateQuery(req.body)) return res.status(401).type('text/plain').send('Invalid key');
    else {
      await Config.batchSet([
        ['adminUsername', req.body.adminUsername],
        ['botLogin', req.body.botLogin],
        ['botToken', req.body.botToken],
        ['twitchClientId', req.body.twitchClientId],
        ['twitchClientSecret', req.body.twitchClientSecret],
        ['sessionSecret', faker.random.alphaNumeric(32)],
      ]);

      display.info.nextLine(
        'Onboarding',
        'Server has been configured.',
        'To repeat this process, start the server with the RECONFIGURE_SERVER environment variable set to "TRUE".',
      );

      display.warning.nextLine(
        'Onboarding',
        'Server will shut down in 15 seconds.',
      );

      setTimeout(() => process.emit('SIGINT'), 15000);
      res.sendStatus(200);
    }
  });

  return onboardingRouter;
};
