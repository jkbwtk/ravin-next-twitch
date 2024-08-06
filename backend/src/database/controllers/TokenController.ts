import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { tokensTable } from '#schema/schema';
import { Token, TokenInsert } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const TokenControllerTarget = {
  ...createBasicCRUD(tokensTable),

  async getByUserId(userId: string): Promise<Token | null> {
    const query = db
      .query.tokensTable.findFirst({
        where: eq(tokensTable.channelUserId, userId),
      });

    const result = await query;

    return result ?? null;
  },

  async upsert(token: TokenInsert): Promise<Token | null> {
    const query = db
      .insert(tokensTable)
      .values(token)
      .onConflictDoUpdate({
        target: tokensTable.channelUserId,
        set: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
      })
      .returning(getTableColumns(tokensTable));

    const result = await query;

    return result.at(0) ?? null;
  },
};

export const TokenController = convertToControllerProxy('TokenController', TokenControllerTarget);
