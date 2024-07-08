import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { channelsTable } from '#schema/schema';
import { Channel } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const ChannelControllerTarget = {
  ...createBasicCRUD(channelsTable),

  async getByUserId(userId: string): Promise<Channel | null> {
    const query = db
      .query.channelsTable.findFirst({
        where: eq(channelsTable.userId, userId),
      });

    const result = await query;

    return result ?? null;
  },

  async getOrCreate(userId: string): Promise<Channel | null> {
    return db.transaction(async (tx) => {
      const existingChannel = await tx
        .query.channelsTable.findFirst({
          where: eq(channelsTable.userId, userId),
        });

      if (existingChannel !== undefined) {
        return existingChannel;
      }

      const inserted = await tx
        .insert(channelsTable)
        .values({ userId })
        .returning(getTableColumns(channelsTable));

      return inserted.at(0) ?? null;
    });
  },
};

export const ChannelController = convertToControllerProxy('ChannelController', ChannelControllerTarget);
