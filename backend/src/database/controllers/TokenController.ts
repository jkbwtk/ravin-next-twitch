import { db } from '#database/database';
import { trackQueryPerformance } from '#database/utils';
import { tokensTable } from '#schema/schema';
import { Token, TokenInsert } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const TokenControllerTarget = {
  async getByUserId(userId: string): Promise<Token | null> {
    const query = db
      .query.tokensTable.findFirst({
        where: eq(tokensTable.userId, userId),
      });

    const result = await query;

    return result ?? null;
  },

  async update(token: Token): Promise<Token | null> {
    const query = db
      .update(tokensTable)
      .set({
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      })
      .where(eq(tokensTable.id, token.id))
      .returning(getTableColumns(tokensTable));

    const result = await query;

    return result.at(0) ?? null;
  },

  async upsert(token: TokenInsert): Promise<Token | null> {
    const query = db
      .insert(tokensTable)
      .values(token)
      .onConflictDoUpdate({
        target: tokensTable.userId,
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

export const TokenController = trackQueryPerformance('TokenController', TokenControllerTarget);
