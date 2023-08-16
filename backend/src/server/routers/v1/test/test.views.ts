import { logger } from '#lib/logger';
import { sleep } from '#lib/utils';
import { ExpressStack } from '#server/ExpressStack';
import { requireDevMode, waitUntilReady } from '#server/stackMiddlewares';
import { basicSignal } from '#shared/utils';


export const getTestView = new ExpressStack()
  .use(requireDevMode)
  .use((req, res, next) => {
    res.json({
      message: 'Test!',
      time: new Date(),
    });

    return [req, res, next];
  });

const lazySignal = basicSignal(false);

sleep(20000).then(() => {
  lazySignal.set(true);

  logger.debug({
    message: 'LazyView signal is set to true',
    label: ['DEV', 'lazySignal'],
  });
});

export const getLazyView = new ExpressStack()
  .use(requireDevMode)
  .use(waitUntilReady(lazySignal))
  .use((req, res, next) => {
    res.json({
      message: 'Lazy!',
      time: new Date(),
    });

    return [req, res, next];
  });
