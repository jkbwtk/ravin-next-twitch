import { Config } from '#lib/Config';
import { display } from '#lib/display';
import { ExpressStack } from '#server/ExpressStack';
import { ServerError } from '#server/ServerError';
import { GetOnboardingSchema, PostOnboardingSchema } from '#server/routers/onboarding/onboarding.schemas';
import { validate } from '#server/stackMiddlewares';
import { frontendPath } from '#shared/constants';
import { json } from 'body-parser';
import { randomBytes } from 'crypto';
import path from 'path';

export type OnboardingContext = {
  key: string;
  port: number;
};

export const getOnboardingView = new ExpressStack<OnboardingContext>()
  .use(validate(GetOnboardingSchema))
  .use((req, res, ctx) => {
    if (req.validated.query.key !== ctx.key) {
      res.redirect('/');
    }

    res.sendFile(path.join(frontendPath, 'index.html'));
  });

export const postSubmitOnboardingView = new ExpressStack<OnboardingContext>()
  .useNative(json())
  .use(validate(PostOnboardingSchema))
  .use(async (req, res, ctx) => {
    if (req.validated.body.key !== ctx.key) throw new ServerError(401, 'Invalid key');

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
  });
