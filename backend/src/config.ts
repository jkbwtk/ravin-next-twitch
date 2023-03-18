import { readFileSync } from 'fs';
import { BotOptions } from './bot/Bot';

const configPath = './config.json';


interface Credentials {
  login: string;
  token: string;
}

interface PublicConfig {
  channels: string | string[];
}

type Config = BotOptions;

const getCredentials = (): Credentials => {
  const login = process.env.BOT_LOGIN;
  if (login === undefined) throw new Error('Missing LOGIN environment variable');

  const token = process.env.BOT_TOKEN;
  if (token === undefined) throw new Error('Missing AUTH environment variable');

  return { login, token };
};

const validateConfig = (config: unknown): void => {
  if (typeof config !== 'object' || config === null) throw new Error('Config must be an object');

  if (!('channels' in config)) throw new Error('Config must contain a channels property');
  if (typeof config.channels !== 'string' && !Array.isArray(config.channels)) throw new Error('Channels must be a string or an array of strings');

  if (Array.isArray(config.channels)) {
    for (const channel of config.channels) {
      if (typeof channel !== 'string') throw new Error('Channels must be a string or an array of strings');
    }
  }

  if ('trainingDataPath' in config) {
    if (typeof config.trainingDataPath !== 'string') throw new Error('Training data path must be a string');
    if (config.trainingDataPath.length === 0) throw new Error('Training data path must be a non-empty string');
  }

  if ('ignoredUsers' in config) {
    if (!Array.isArray(config.ignoredUsers)) throw new Error('Ignored users must be an array of strings');
    for (const user of config.ignoredUsers) {
      if (typeof user !== 'string') throw new Error('Ignored users must be an array of strings');
    }
  }
};

const loadConfig = (): PublicConfig => {
  const raw = readFileSync(configPath, 'utf-8');

  const object = JSON.parse(raw) as PublicConfig;
  validateConfig(object);

  return object;
};


export const getConfig = (): Config => {
  loadConfig();

  return {
    ...getCredentials(),
    ...loadConfig(),
  };
};
