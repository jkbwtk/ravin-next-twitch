import { db } from '#database/database';
import { trackQueryPerformance } from '#database/utils';
import { Channel, channelsTable } from '#shared/schema/schema';
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

  async getOrCreateChannel(userId: string): Promise<Channel | null> {
    const createdChannel = await this.create(userId);

    if (createdChannel === null) {
      return this.getByUserId(userId);
    }

    return createdChannel;
  },
};

export const ChannelController = trackQueryPerformance('ChannelController', ChannelControllerTarget);
