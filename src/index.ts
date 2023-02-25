import chalk from 'chalk';
import 'dotenv/config';

import { Bot } from './Bot';
import { getConfig } from './config';


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
    const bot = new Bot(config);

    await bot.init();
  } catch (err) {
    handleTopLevelError(err);
  }
};


void main();
