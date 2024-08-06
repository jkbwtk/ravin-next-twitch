import { db } from '#database/database';
import { convertToControllerProxy, createSharedMethods, SelectOptions } from '#database/utils';
import { templatesTable, tokensTable } from '#schema/schema';
import { Template } from '#types/database/tables';
import { count, eq } from 'drizzle-orm';


const TemplateControllerTarget = {
  ...createSharedMethods(templatesTable),

  async getByUserId(userId: string, options: SelectOptions = {}): Promise<Template[]> {
    const query = db
      .query.templatesTable.findMany({
        where: eq(tokensTable.channelUserId, userId),

        ...options.pagination,
      });

    const result = await query;

    return result;
  },

  async countByUserId(userId: string): Promise<number> {
    const query = db
      .select({ count: count() })
      .from(templatesTable)
      .where(eq(tokensTable.channelUserId, userId));

    const result = await query;

    return result.at(0)?.count ?? 0;
  },
};


export const TemplateController = convertToControllerProxy('TemplateController', TemplateControllerTarget);
