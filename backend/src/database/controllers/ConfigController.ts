import { db } from '#database/database';
import { InsertResultError } from '#database/errors';
import { trackQueryPerformance } from '#database/utils';
import { configTable } from '#schema/schema';
import { Config, ConfigInsert } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const ConfigControllerTarget = {
  async getByKey(key: string): Promise<Config | null> {
    const query = db
      .query
      .configTable
      .findFirst({
        where: eq(configTable.key, key),
      });

    const result = await query;

    return result ?? null;
  },

  async getAll(): Promise<Config[]> {
    const query = db
      .query
      .configTable
      .findMany();

    return await query;
  },

  async upsert(config: ConfigInsert): Promise<Config> {
    const query = db
      .insert(configTable)
      .values(config)
      .onConflictDoUpdate({
        target: configTable.key,
        set: {
          value: config.value,
        },
      })
      .returning(getTableColumns(configTable));


    const result = (await query).at(0) ?? null;

    if (result === null) {
      throw new InsertResultError('Failed to upsert config');
    }

    return result;
  },

  async bulkUpsert(configs: ConfigInsert[]): Promise<Config[]> {
    return db.transaction(async (tx) => {
      const results: Config[] = [];

      for (const config of configs) {
        const result = await tx
          .insert(configTable)
          .values(config)
          .onConflictDoUpdate({
            target: configTable.key,
            set: {
              value: config.value,
            },
          })
          .returning(getTableColumns(configTable));

        results.concat(result);
      }

      return results;
    });
  },

  async deleteByKey(key: string): Promise<boolean> {
    const query = db
      .delete(configTable)
      .where(eq(configTable.key, key))
      .returning({ key: configTable.key });

    const result = await query;

    return result.length > 0;
  },
};

export const ConfigController = trackQueryPerformance('ConfigController', ConfigControllerTarget);
