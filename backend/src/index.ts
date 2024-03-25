import 'reflect-metadata';
import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import { Server } from '#server/Server';
import { logger } from '#lib/logger';
import { runJobs } from '#jobs/job';


process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...', { label: 'Process' });

  await runJobs('shutdown');

  process.exit(0);
});

const main = async () => {
  try {
    runJobs('startup');

    const server = new Server();
    await server.start();
  } catch (err) {
    logger.error('Bot exited with unrecoverable error', { error: err, label: 'Process' });
    process.exit(1);
  }
};

void main();
