import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { serializer } from '#lib/serializer';
import { phraseFiltersTable } from '#schema/schema';
import { PhraseFilter } from '#types/database/tables';
import { and, count, eq, inArray, SQL } from 'drizzle-orm';
import { PhraseFilter as PhraseFilterApi } from '#types/api/filters';

const PhraseFilterControllerMethods = {
  ...createBasicCRUD(phraseFiltersTable),

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<PhraseFilter[]> {
    const filters: SQL[] = [
      eq(phraseFiltersTable.channelUserId, userId),
    ];

    if (options.idListFilter) {
      filters.push(inArray(phraseFiltersTable.id, options.idListFilter.id.in));
    }

    const query = db
      .query.phraseFiltersTable.findMany({
        where: and(...filters),

        ...options.pagination,
      });

    const result = await query;

    return result;
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(phraseFiltersTable)
      .where(eq(phraseFiltersTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },
};

const PhraseFilterControllerProperties = {
  $utils: {
    serialize: serializer<PhraseFilter, PhraseFilterApi>((phraseFilter) => ({
      id: phraseFilter.id,
      phrase: phraseFilter.phrase,
      caseSensitive: phraseFilter.caseSensitive,
      ignoreWhitespace: phraseFilter.ignoreWhitespace,
      similarity: phraseFilter.similarity,
      action: phraseFilter.action,
      actionDuration: phraseFilter.actionDuration,
      reason: phraseFilter.reason,
      enabled: phraseFilter.enabled,
    })),
  },
};

export const PhraseFilterController = convertToControllerProxy(
  'PhraseFilterController',
  PhraseFilterControllerMethods,
  PhraseFilterControllerProperties,
);
