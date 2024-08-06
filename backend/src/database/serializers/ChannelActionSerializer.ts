import { serializer } from '#lib/serializer';
import { ChannelActionApi } from '#types/api/dashboard';
import { ChannelAction } from '#types/database/tables';


export const ChannelActionSerializer = serializer<ChannelAction, ChannelActionApi>((action) => {
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
});
