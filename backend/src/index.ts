import registerAliases from 'module-alias';

if (process.env.DEV !== 'true') {
  registerAliases();
}

import chalk from 'chalk';

import { Bot } from './bot/Bot';
import { getConfig } from './config';
import { isDevMode, serverPort } from '#shared/constants';
import { Server } from './server/Server';


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

const main = async () => {
  try {
    const config = getConfig();

    const server = new Server(serverPort, isDevMode);
    const bot = new Bot(config);

    await server.start();
    await bot.init();
  } catch (err) {
    handleTopLevelError(err);
  }
};


void main();
