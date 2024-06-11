import { db } from '#database/database';
import { trackQueryPerformance } from '#database/utils';
import { channelsTable } from '#schema/schema';
import { Channel } from '#types/database/tables';
import { eq, getTableColumns } from 'drizzle-orm';


const ChannelControllerTarget = {
  async create(userId: string): Promise<Channel | null> {
    const query = db
      .insert(channelsTable)
      .values({ userId })
      .returning(getTableColumns(channelsTable))
      .onConflictDoNothing();

    const result = await query;

    return result.at(0) ?? null;
  },

  async getById(id: number): Promise<Channel | null> {
    const query = db
      .query.channelsTable.findFirst({
        where: eq(channelsTable.id, id),
      });

    const result = await query;

    return result ?? null;
  },

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

export const ChannelController = trackQueryPerformance('ChannelController', ChannelControllerTarget);
