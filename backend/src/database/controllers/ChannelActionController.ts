import { db } from '#database/database';
import { convertToControllerProxy, createBasicCRUD } from '#database/utils';
import { serializer } from '#lib/serializer';
import { channelActionsTable } from '#schema/schema';
import { Action } from '#types/api/dashboard';
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

const channelActionControllerProperties = {
  $utils: {
    serialize: serializer<ChannelAction, Action>((action) => {
      const type = action.type;
      const date = action.createdAt.getTime();
      const issuerDisplayName = action.issuerDisplayName;
      const targetDisplayName = action.targetDisplayName;

      switch (type) {
        case 'ban':
          return {
            date,
            issuerDisplayName,
            targetDisplayName,
            type,
            reason: action.data,
          };

        case 'timeout':
          return {
            date,
            issuerDisplayName,
            targetDisplayName,
            type,
            duration: parseInt(action.data, 10),
          };

        default:
          return {
            date,
            issuerDisplayName,
            targetDisplayName,
            type: 'delete',
            message: action.data,
          };
      }
    }),
  },
};

export const ChannelActionController = convertToControllerProxy(
  'ChannelActionController',
  channelActionControllerMethods,
  channelActionControllerProperties,
);
