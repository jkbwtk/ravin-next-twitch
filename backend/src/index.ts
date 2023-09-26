import 'reflect-metadata';
import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import chalk from 'chalk';

import { Server } from '#server/Server';
import { logger } from '#lib/logger';


const handleTopLevelError = (err: unknown): void => {
  let errorMessage = 'Unknown error';

  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  }

  logger.error(`Bot exited with error:\n${chalk.redBright.bold(errorMessage)}`);
  console.error(err);
  process.exit(1);
};

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...', { label: 'Process' });
  process.exit(0);
});

const main = async () => {
  try {
    const server = new Server();
    await server.start();
  } catch (err) {
    handleTopLevelError(err);
  }
};

void main();
