import { Redis, RedisOptions } from 'ioredis';
import { Prisma, PrismaClient } from '@prisma/client';
import { channelActionExtension } from '#database/extensions/channelAction';
import { databaseDebug, databaseLogging } from '#shared/constants';
import { messageExtension } from '#database/extensions/message';
import { channelStatsExtension } from '#database/extensions/channelStats';
import { mapOptionsToArray } from '#lib/utils';
import { utilsExtension } from '#database/extensions/utils';
import { commandTimerExtension } from '#database/extensions/commandTimer';
import { behaviorProfileExtension } from '#database/extensions/behaviorProfile';
import { Client as PostgresClient, ClientConfig as PostgresConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '#schema/schema';
import * as relations from '#schema/relations';
import { logger } from '#lib/logger';


export const redisOptions: RedisOptions = {
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
};

export const prismaOptions: Prisma.PrismaClientOptions = {
  log: mapOptionsToArray({
    query: databaseDebug,
    info: databaseLogging || databaseDebug,
    warn: true,
    error: true,
  }),
  errorFormat: 'pretty',
};

export const postgresOptions: PostgresConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};


export const redis = new Redis(redisOptions);
export const prismaBase = new PrismaClient(prismaOptions);

const prismaExtended = prismaBase
  .$extends(utilsExtension)
  .$extends(channelActionExtension)
  .$extends(messageExtension)
  .$extends(channelStatsExtension)
  .$extends(commandTimerExtension)
  .$extends(behaviorProfileExtension);

export type ExtendedPrismaClient = typeof prismaExtended;

export const prisma = prismaExtended;

export const postgresClient = new PostgresClient(postgresOptions);

export const db = drizzle(postgresClient, { schema: { ...schema, ...relations }, logger: logger });
