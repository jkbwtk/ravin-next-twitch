import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { channelActionsTable } from '#schema/schema';
import { ChannelAction } from '#types/database/tables';
import { eq } from 'drizzle-orm';


const channelActionControllerMethods = {
  ...createBasicCRUD(channelActionsTable),

  async getByUserId(userId: string): Promise<ChannelAction[]> {
    const query = db
      .query
      .channelActionsTable
      .findMany({
        where: eq(channelActionsTable.channelUserId, userId),
      });

    const result = await query;

    return result;
  },
};


export const ChannelActionController = convertToControllerProxy(
  'ChannelActionController',
  channelActionControllerMethods,
);
