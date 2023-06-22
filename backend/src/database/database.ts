import { Redis, RedisOptions } from 'ioredis';
import { Prisma, PrismaClient } from '@prisma/client';
import { channelActionExtension } from '#database/extensions/channelAction';
import { databaseDebug, databaseLogging } from '#shared/constants';
import { configExtension } from '#database/extensions/config';
import { userExtension } from '#database/extensions/user';
import { systemNotificationExtension } from '#database/extensions/systemNotification';
import { tokenExtension } from '#database/extensions/token';
import { channelExtension } from '#database/extensions/channel';
import { messageExtension } from '#database/extensions/message';
import { commandExtension } from '#database/extensions/command';
import { channelStatsExtension } from '#database/extensions/channelStats';
import { mapOptionsToArray } from '#lib/utils';
import { utilsExtension } from '#database/extensions/utils';


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


export const redis = new Redis(redisOptions);
export const prismaBase = new PrismaClient(prismaOptions);

const prismaExtended = prismaBase
  .$extends(utilsExtension)
  .$extends(channelActionExtension)
  .$extends(configExtension)
  .$extends(userExtension)
  .$extends(systemNotificationExtension)
  .$extends(tokenExtension)
  .$extends(channelExtension)
  .$extends(messageExtension)
  .$extends(commandExtension)
  .$extends(channelStatsExtension);

export type ExtendedPrismaClient = typeof prismaExtended;

export const prisma = prismaExtended;
