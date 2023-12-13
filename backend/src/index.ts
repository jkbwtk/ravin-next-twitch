import 'reflect-metadata';
import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import { Server } from '#server/Server';
import { logger } from '#lib/logger';


process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...', { label: 'Process' });
  process.exit(0);
});

const main = async () => {
  try {
    const server = new Server();
    await server.start();
  } catch (err) {
    logger.error('Bot exited with unrecoverable error', { error: err, label: 'Process' });
    process.exit(1);
  }
};

void main();
