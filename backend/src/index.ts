import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import chalk from 'chalk';

import { Bot } from './bot/Bot';
import { getConfig } from './config';
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
  process.exit(1);
};

process.on('SIGINT', () => {
  display.system.nextLine('Process', 'Shutting down gracefully...');
  process.exit(0);
});

const main = async () => {
  try {
    const config = getConfig();

    const server = new Server();
    const bot = new Bot(config);

    await server.start();
    await bot.init();
  } catch (err) {
    handleTopLevelError(err);
  }
};


void main();
