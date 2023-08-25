import { display } from '#lib/display';
import { getOnboardingView, OnboardingContext, postSubmitOnboardingView } from '#server/routers/onboarding/onboarding.views';
import { quickSwitch } from '#shared/utils';
import chalk from 'chalk';
import { randomBytes } from 'crypto';
import { Router } from 'express';


export const createOnboardingRouter = (port: number): Router => {
  const context: OnboardingContext = {
    key: randomBytes(16).toString('hex'),
    port,
  };

  const url = quickSwitch(port, {
    80: `http://localhost/onboarding?key=${context.key}`,
    443: `https://localhost/onboarding?key=${context.key}`,
    default: `http://localhost:${port}/onboarding?key=${context.key}`,
  });

  display.info.nextLine(
    'Server',
    'Server is not configured.',
    `Please visit ${chalk.white.bold(url)}`,
    'to configure the server.',
  );

  const onboardingRouter = Router();

  onboardingRouter.get('/', ...getOnboardingView.unwrap(context));

  onboardingRouter.post('/submit', ...postSubmitOnboardingView.unwrap(context));


  return onboardingRouter;
};
