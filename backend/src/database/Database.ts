import 'reflect-metadata';

import { databaseLogging, isDevMode } from '#shared/constants';
import { DataSource, DataSourceOptions, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { Config } from '#database/entities/Config';
import { User } from '#database/entities/User';
import { Token } from '#database/entities/Token';
import { Redis, RedisOptions } from 'ioredis';
import { SystemNotification } from '#database/entities/SystemNotification';
import { Channel } from '#database/entities/Channel';
import { Message } from '#database/entities/Message';
import { ChannelStats } from '#database/entities/ChannelStats';
import { ChannelAction } from '#database/entities/ChannelAction';


export class Database {
  private static instance: Database;
  private dataSource: DataSource;
  private redisClient: Redis;

  private constructor() {
    this.dataSource = new DataSource(Database.databaseOptions);
    this.redisClient = new Redis(Database.redisOptions);
  }

  private static get redisOptions(): RedisOptions {
    return {
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      host: process.env.REDIS_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
    };
  }

  private static get databaseOptions(): DataSourceOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER ?? 'DEV_USR',
      password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
      database: isDevMode ? 'DEV_DB' : (process.env.DB_NAME ?? 'PROD_DB'),
      synchronize: true,
      logging: databaseLogging,
      cache: {
        type: 'ioredis',
        ignoreErrors: false,
        options: { db: 1, ...Database.redisOptions },
        alwaysEnabled: false,
      },
      entities: Database.databaseEntities,
    };
  }

  private static get databaseEntities(): DataSourceOptions['entities'] {
    return [
      Config,
      // Session,
      User,
      Token,
      SystemNotification,
      Channel,
      Message,
      ChannelStats,
      ChannelAction,
    ];
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  public static async getDataSource(): Promise<DataSource> {
    const database = Database.getInstance();

    if (!database.dataSource.isInitialized) {
      await database.dataSource.initialize();
    }

    return database.dataSource;
  }

  public static async getManager(): Promise<EntityManager> {
    const dataSource = await Database.getDataSource();

    return dataSource.manager;
  }

  public static async getRepository<T extends ObjectLiteral>(entity: new () => T): Promise<Repository<T>> {
    const manager = await Database.getManager();

    return manager.getRepository(entity);
  }

  public static async invalidateCache(identifiers: string[]): Promise<void> {
    const dataSource = await Database.getDataSource();

    await dataSource.queryResultCache?.remove(identifiers);
  }

  public static async clearCache(): Promise<void> {
    const dataSource = await Database.getDataSource();

    await dataSource.queryResultCache?.clear();
  }

  public static async getRedisClient(): Promise<Redis> {
    const database = Database.getInstance();

    return database.redisClient;
  }
}
