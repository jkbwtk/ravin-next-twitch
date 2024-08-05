import { Redis, RedisOptions } from 'ioredis';
import { databaseDebug } from '#shared/constants';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '#schema/schema';
import * as relations from '#schema/relations';
import { logger } from '#lib/logger';
import postgres, { Options as PostgresOptions } from 'postgres';


export const redisOptions: RedisOptions = {
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
};

export const postgresOptions: PostgresOptions<{}> = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  onnotice(notice) {
    if (databaseDebug) {
      logger.debug('Postgres notice %o', { notice, label: 'Postgres' });
    }
  },
};


export const redis = new Redis(redisOptions);

export const postgresClient = postgres(postgresOptions);

export const db = drizzle(postgresClient, { schema: { ...schema, ...relations }, logger: databaseDebug ? logger : false });

export type DrizzleDatabase = typeof db;
