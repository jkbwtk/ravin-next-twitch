import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import chalk from 'chalk';

import { Server } from './server/Server';
import { display } from '#lib/display';


const handleTopLevelError = (err: unknown): void => {
  let errorMessage = 'Unknown error';

  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  }

  console.error(`Bot exited with error:\n${chalk.redBright.bold(errorMessage)}`);
  console.error(err);
  process.exit(1);
};

process.on('SIGINT', () => {
  display.system.nextLine('Process', 'Shutting down gracefully...');
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
