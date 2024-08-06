import { redis } from '#database/database';
import { Config } from '#lib/Config';
import { logger } from '#lib/logger';
import { randomAlphanumeric } from '#lib/utils';
import RedisStore from 'connect-redis';
import session from 'express-session';


type SessionMiddleware = ReturnType<typeof session>;

let sessionMiddleware: SessionMiddleware | null = null;

const generateSessionSecret = async () => {
  const secret = randomAlphanumeric(12);

  try {
    await Config.set('sessionSecret', secret);
  } catch (err) {
    logger.error('Failed to set session secret', { error: err, label: ['sessionMiddleware', 'generateSessionSecret'] });
  }

  return secret;
};

const generateSessionMiddleware = async (): Promise<SessionMiddleware> => {
  const secret = await Config.get('sessionSecret') ?? await generateSessionSecret();

  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    name: 'ravin-auth',
    rolling: true,
    cookie: {
      signed: true,
      httpOnly: true,
      // maxAge: 30 * 60 * 1000,
      sameSite: 'strict',
    },
    store: new RedisStore({
      client: redis,
      prefix: 'session_store:',
    }),
  });
};

export const getSessionMiddleware = async (): Promise<SessionMiddleware> => {
  if (sessionMiddleware === null) {
    sessionMiddleware = await generateSessionMiddleware();
  }

  return sessionMiddleware;
};
