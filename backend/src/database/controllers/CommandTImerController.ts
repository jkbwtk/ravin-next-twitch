import { db } from '#database/database';
import { convertToControllerProxy, createSecurityMethods, createSharedMethods, SelectOptions } from '#database/utils';
import { commandTimersTable } from '#schema/schema';
import { CommandTimer } from '#types/database/tables';
import { and, count, eq, inArray, SQL } from 'drizzle-orm';


const commandTimerControllerMethods = {
  ...createSharedMethods(commandTimersTable),
  ...createSecurityMethods(commandTimersTable),

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<CommandTimer[]> {
    const filters: SQL[] = [
      eq(commandTimersTable.channelUserId, userId),
    ];

    if (options.idListFilter) {
      filters.push(inArray(commandTimersTable.id, options.idListFilter.id.in));
    }

    const query = db
      .query
      .commandTimersTable
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
      .from(commandTimersTable)
      .where(eq(commandTimersTable.channelUserId, userId));

    const result = await query;

    return result.length;
  },
};


export const CommandTimerController = convertToControllerProxy(
  'CommandTimerController',
  commandTimerControllerMethods,
);
