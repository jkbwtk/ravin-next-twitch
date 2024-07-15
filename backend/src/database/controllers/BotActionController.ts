import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD, SelectOptions } from '#database/utils';
import { botActionsTable } from '#schema/schema';
import { BotAction } from '#types/database/tables';
import { and, asc, count, desc, eq, getTableColumns, inArray, SQL } from 'drizzle-orm';
import { BotAction as BotActionApi, BotActionData, BotActionType, BotActionTypeParams } from '#types/api/botActions';
import { serializer } from '#lib/serializer';


const BotActionControllerMethods = {
  ...createBasicCRUD(botActionsTable),

  async createFromType<T extends BotActionType>(userId: string, type: T, ...data: Parameters<BotActionTypeParams[T]>): Promise<BotAction | null> {
    const query = await db
      .insert(botActionsTable)
      .values({
        channelUserId: userId,
        type,
        data: BotActionData.parse(data),
      })
      .returning(getTableColumns(botActionsTable));

    const result = await query;

    return result.at(0) ?? null;
  },

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<BotAction[]> {
    const filters: SQL[] = [
      eq(botActionsTable.channelUserId, userId),
    ];

    const orderBy: SQL[] = [];

    if (options.idListFilter) {
      filters.push(inArray(botActionsTable.id, options.idListFilter.id.in));
    }

    if (options.orderBy) {
      for (const [column, direction] of Object.entries(options.orderBy)) {
        const method = direction === 'asc' ? asc : desc;
        orderBy.push(method(botActionsTable[column as keyof BotAction]));
      }
    }

    const query = db
      .query.botActionsTable.findMany({
        where: and(...filters),
        orderBy,

        ...options.pagination,
      });

    const result = await query;

    return result;
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(botActionsTable)
      .where(eq(botActionsTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },
};

const BotActionControllerProperties = {
  $utils: {
    serialize: serializer<BotAction, BotActionApi>((action) => {
      return {
        id: action.id,
        type: action.type,
        data: action.data,
        timestamp: action.createdAt.getTime(),
      };
    }),
  },
};

export const BotActionController = convertToControllerProxy(
  'BotActionController',
  BotActionControllerMethods,
  BotActionControllerProperties,
);
