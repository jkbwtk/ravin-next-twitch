import { Database } from '#database/Database';
import { Config as ConfigEntity } from '#database/entities/Config';
import { ExtendedMap } from '#lib/ExtendedMap';
import { Repository } from 'typeorm';


export class Config {
  private static instance: Config;

  private repository: Repository<ConfigEntity>;
  public config: ExtendedMap<string, string>;
  public shadow: ExtendedMap<string, string>;

  private constructor() {
    this.config = new ExtendedMap<string, string>();
    this.shadow = new ExtendedMap<string, string>();
  }

  private async init(): Promise<void> {
    this.repository = await this.getRepository();
  }

  private async getRepository(): Promise<Repository<ConfigEntity>> {
    return Database.getRepository(ConfigEntity);
  }

  private static queryToMap(query: ConfigEntity[]): ExtendedMap<string, string> {
    const map = new ExtendedMap<string, string>();

    for (const entry of query) {
      map.set(entry.key, entry.value);
    }

    return map;
  }

  private static async getInstance(): Promise<Config> {
    if (!Config.instance) {
      Config.instance = new Config();
      await Config.instance.init();
    }

    return Config.instance;
  }

  public static async getConfig(): Promise<ExtendedMap<string, string>> {
    const instance = await Config.getInstance();
    const query = await instance.repository.find();

    return Config.queryToMap(query);
  }

  public static async get(key: string, shadowed = true): Promise<string | undefined> {
    const instance = await Config.getInstance();

    if (shadowed) {
      const shadowedValue = instance.shadow.get(key);
      if (shadowedValue !== undefined) return shadowedValue;
    }

    const value = instance.config.get(key);
    if (value !== undefined) return value;

    const query = await instance.repository.findOne({ where: { key } });
    if (query) {
      instance.config.set(query.key, query.value);
      return query.value;
    }
  }

  public static async getOrFail(key: string): Promise<string> {
    const value = await Config.get(key);

    if (value === undefined) {
      throw new Error(`Config key [${key}] does not exist`);
    }

    return value;
  }

  public static async set(key: string, value: string): Promise<ConfigEntity> {
    const instance = await Config.getInstance();
    const entry = instance.repository.create({ key, value });

    const savedEntry = await instance.repository.save(entry);
    instance.config.set(savedEntry.key, savedEntry.value);

    return savedEntry;
  }

  public static async batchSet(entries: [string, string][]): Promise<ConfigEntity[]> {
    const instance = await Config.getInstance();
    const entities = entries.map((entry) => instance.repository.create({ key: entry[0], value: entry[1] }));

    const savedEntries = await instance.repository.save(entities);
    for (const entry of savedEntries) {
      instance.config.set(entry.key, entry.value);
    }

    return savedEntries;
  }

  public static async shadowSet(key: string, value: string): Promise<void> {
    const instance = await Config.getInstance();
    instance.shadow.set(key, value);
  }

  public static async shadowBatchSet(entries: [string, string][]): Promise<void> {
    const instance = await Config.getInstance();

    for (const entry of entries) {
      instance.shadow.set(entry[0], entry[1]);
    }
  }

  public static async shadowRestore(key: string): Promise<void> {
    const instance = await Config.getInstance();

    instance.shadow.delete(key);
  }

  public static async shadowBulkRestore(keys: string[]): Promise<void> {
    const instance = await Config.getInstance();

    for (const key of keys) {
      instance.shadow.delete(key);
    }
  }

  public static async shadowRestoreAll(): Promise<void> {
    const instance = await Config.getInstance();

    instance.shadow.clear();
  }

  public static async isShadowed(key: string): Promise<boolean> {
    const instance = await Config.getInstance();

    return instance.shadow.has(key);
  }

  public static async delete(key: string): Promise<void> {
    const instance = await Config.getInstance();
    await instance.repository.delete({ key });
    instance.config.delete(key);
  }
}
