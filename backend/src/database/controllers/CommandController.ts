import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { commandsTable } from '#schema/schema';
import { Command } from '#types/database/tables';
import { and, count, eq, inArray, SQL, sql } from 'drizzle-orm';

const commandControllerMethods = {
  ...createBasicCRUD(commandsTable),

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<Command[]> {
    const filters: SQL[] = [
      eq(commandsTable.channelUserId, userId),
    ];

    if (options.idListFilter) {
      filters.push(inArray(commandsTable.id, options.idListFilter.id.in));
    }

    const query = db
      .query
      .commandsTable
      .findMany({
        where: and(...filters),

        ...options.pagination,
      });

    const result = await query;

    return result ?? [];
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(commandsTable)
      .where(eq(commandsTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },

  async incrementUsage(id: number): Promise<number> {
    const query = db
      .update(commandsTable)
      .set({
        usage: sql`${commandsTable.usage} + 1`,
      })
      .where(eq(commandsTable.id, id)).returning({ usage: commandsTable.usage });

    const result = await query;

    return result.at(0)?.usage ?? 0;
  },

  async getTopCommand(userId: string): Promise<Command | null> {
    const query = db
      .query
      .commandsTable
      .findFirst({
        where: eq(commandsTable.channelUserId, userId),

        orderBy: (table, { desc }) => [desc(table.usage)],
      });

    const result = await query;

    return result ?? null;
  },
};

export const CommandController = convertToControllerProxy(
  'CommandController',
  commandControllerMethods,
);
