import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { serializer } from '#lib/serializer';
import { commandTimersTable } from '#schema/schema';
import { CommandTimer as CommandTimerApi } from '#types/api/commands';
import { CommandTimer } from '#types/database/tables';
import { and, count, eq, inArray, SQL } from 'drizzle-orm';


const commandTimerControllerMethods = {
  ...createBasicCRUD(commandTimersTable),

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

const commandTimerControllerProperties = {
  $utils: {
    serialize: serializer<CommandTimer, CommandTimerApi>((timer) => ({
      id: timer.id,
      channelId: timer.channelUserId,
      name: timer.name,
      alias: timer.alias,
      cooldown: timer.cooldown,
      templateId: timer.templateId,
      cron: timer.cron,
      enabled: timer.enabled,
      lines: timer.lines,
    })),
  },
};


export const CommandTimerController = convertToControllerProxy(
  'CommandTimerController',
  commandTimerControllerMethods,
  commandTimerControllerProperties,
);
