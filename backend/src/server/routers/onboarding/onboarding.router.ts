import { Config } from '#lib/Config';
import { display } from '#lib/display';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { GetOnboardingSchema, PostSubmitOnboardingSchema } from '#server/routers/onboarding/onboarding.schemas';
import { validate } from '#server/stackMiddlewares';
import { frontendPath } from '#shared/constants';
import { quickSwitch } from '#shared/utils';
import { json } from 'body-parser';
import chalk from 'chalk';
import { randomBytes } from 'crypto';
import { Router } from 'express';
import path from 'path';


export const createOnboardingRouter = (port: number): Router => {
  const onboardingKey = randomBytes(16).toString('hex');
  const onboardingRouter = Router();

  const url = quickSwitch(port, {
    80: `http://localhost/onboarding?key=${onboardingKey}`,
    443: `https://localhost/onboarding?key=${onboardingKey}`,
    default: `http://localhost:${port}/onboarding?key=${onboardingKey}`,
  });

  display.info.nextLine(
    'Server',
    'Server is not configured.',
    `Please visit ${chalk.white.bold(url)}`,
    'to configure the server.',
  );

  onboardingRouter.get('/', ...new ExpressStack()
    .use(validate(GetOnboardingSchema))
    .use((req, res) => {
      if (req.validated.query.key !== onboardingKey) {
        res.redirect('/');
      }

      res.sendFile(path.join(frontendPath, 'index.html'));
    }).unwrap());

  onboardingRouter.post('/submit', ...new ExpressStack()
    .useNative(json())
    .use(validate(PostSubmitOnboardingSchema))
    .use(async (req, res) => {
      if (req.validated.body.key !== onboardingKey) throw new ServerError(401, 'Invalid key');

      await Config.batchSet([
        ['adminUsername', req.validated.body.adminUsername],
        ['botLogin', req.validated.body.botLogin],
        ['botToken', req.validated.body.botToken],
        ['twitchClientId', req.validated.body.twitchClientId],
        ['twitchClientSecret', req.validated.body.twitchClientSecret],
        ['sessionSecret', randomBytes(16).toString('hex')],
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
    }).unwrap());


  return onboardingRouter;
};
