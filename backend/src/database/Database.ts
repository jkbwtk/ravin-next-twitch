import 'reflect-metadata';

import { isDevMode } from '../constants';
import { DataSource, DataSourceOptions, EntityManager } from 'typeorm';


export class Database {
  private static instance: Database;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource(Database.databaseOptions);
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
      logging: false,
      entities: Database.databaseEntities,
    };
  }

  private static get databaseEntities(): DataSourceOptions['entities'] {
    return [
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
}
