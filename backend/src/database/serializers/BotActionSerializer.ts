import { serializer } from '#lib/serializer';
import { BotActionApi } from '#types/api/botActions';
import { BotAction } from '#types/database/tables';


export const BotActionSerializer = serializer<BotAction, BotActionApi>((action) => ({
  id: action.id,
  data: action.data,
  type: action.type,
  timestamp: action.createdAt.getTime(),
}));
