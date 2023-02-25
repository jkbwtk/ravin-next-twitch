import { readFileSync } from 'fs';
import { BotOptions } from './Bot';

const configPath = './config.json';


interface Credentials {
  login: string;
  token: string;
}

interface Config {
  channels: string | string[];
}

const getCredentials = (): Credentials => {
  const login = process.env.LOGIN;
  if (login === undefined) throw new Error('Missing LOGIN environment variable');

  const token = process.env.TOKEN;
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
};

const loadConfig = (): Config => {
  const raw = readFileSync(configPath, 'utf-8');

  const object = JSON.parse(raw) as Config;
  validateConfig(object);

  return object;
};


export const getConfig = (): BotOptions => {
  loadConfig();

  return {
    ...getCredentials(),
    ...loadConfig(),
  };
};
