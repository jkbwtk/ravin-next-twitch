import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { channelsTable } from '#schema/schema';
import { Channel, ChannelUpdate, ChannelWithUser } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const ChannelControllerTarget = {
  ...createBasicCRUD(channelsTable),

  async updateByUserId(userId: string, channel: Omit<ChannelUpdate, 'id' | 'userId'>): Promise<Channel | null> {
    const query = db
      .update(channelsTable)
      .set(channel)
      .where(eq(channelsTable.userId, userId))
      .returning(getTableColumns(channelsTable));

    const result = await query;

    return result.at(0) ?? null;
  },

  async getByUserId(userId: string): Promise<ChannelWithUser | null> {
    const query = db
      .query.channelsTable.findFirst({
        where: eq(channelsTable.userId, userId),

        with: {
          user: true,
        },
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
