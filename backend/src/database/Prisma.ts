import { Redis, RedisOptions } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { channelActionExtension } from '#database/extensions/channelAction';
import { databaseLogging } from '#shared/constants';


export class Database {
  private static instance: Database;

  public prismaClient: ReturnType<typeof Database.getExtendedPrisma>;
  public redisClient: Redis;

  private constructor() {
    this.prismaClient = Database.getExtendedPrisma();
    this.redisClient = new Redis(Database.redisOptions);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  private static get prismaOptions(): ConstructorParameters<typeof PrismaClient>[0] {
    return {
      log: databaseLogging ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
      errorFormat: 'pretty',
    };
  }

  private static getExtendedPrisma() {
    const prisma = new PrismaClient(Database.prismaOptions);

    return prisma
      .$extends(channelActionExtension);
  }

  private static get redisOptions(): RedisOptions {
    return {
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      host: process.env.REDIS_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
    };
  }

  public static getRedisClient(): Redis {
    const instance = Database.getInstance();

    return instance.redisClient;
  }

  public static getPrismaClient(): ReturnType<typeof Database.getExtendedPrisma> {
    const instance = Database.getInstance();

    return instance.prismaClient;
  }
}