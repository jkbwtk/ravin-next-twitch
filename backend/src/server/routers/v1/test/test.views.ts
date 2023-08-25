import { logger } from '#lib/logger';
import { sleep } from '#lib/utils';
import { ExpressStack } from '#server/ExpressStack';
import { requireDevMode, waitUntilReady } from '#server/stackMiddlewares';
import { basicSignal } from '#shared/utils';


export const getTestView = new ExpressStack()
  .use(requireDevMode)
  .use((req, res) => {
    res.json({
      message: 'Test!',
      time: new Date(),
    });
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
  .use((req, res) => {
    res.json({
      message: 'Lazy!',
      time: new Date(),
    });
  });

export const getPortView = new ExpressStack<number>()
  .use(requireDevMode)
  .use((req, res, port) => {
    res.json({
      message: 'Port!',
      localPort: req.socket.localPort,
      remotePort: req.socket.remotePort,
      configPort: port,
      time: new Date(),
    });
  });
