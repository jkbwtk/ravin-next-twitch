import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { serializer } from '#lib/serializer';
import { regexFiltersTable } from '#schema/schema';
import { RegexFilter } from '#types/database/tables';
import { and, count, eq, inArray, SQL } from 'drizzle-orm';
import { RegexFilter as RegexFilterApi } from '#types/api/filters';


const RegexFilterControllerMethods = {
  ...createBasicCRUD(regexFiltersTable),

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<RegexFilter[]> {
    const filters: SQL[] = [
      eq(regexFiltersTable.channelUserId, userId),
    ];

    if (options.idListFilter) {
      filters.push(inArray(regexFiltersTable.id, options.idListFilter.id.in));
    }

    const query = db
      .query.regexFiltersTable.findMany({
        where: and(...filters),

        ...options.pagination,
      });

    const result = await query;

    return result;
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(regexFiltersTable)
      .where(eq(regexFiltersTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },
};

const RegexFilterControllerProperties = {
  $utils: {
    serialize: serializer<RegexFilter, RegexFilterApi>((regexFilter) => ({
      id: regexFilter.id,
      regex: regexFilter.regex,
      action: regexFilter.action,
      actionDuration: regexFilter.actionDuration,
      reason: regexFilter.reason,
      enabled: regexFilter.enabled,
    })),
  },
};

export const RegexFilterController = convertToControllerProxy(
  'RegexFilterController',
  RegexFilterControllerMethods,
  RegexFilterControllerProperties,
);
