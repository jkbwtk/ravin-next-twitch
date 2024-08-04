import { serializer } from '#lib/serializer';
import { MessageApi } from '#types/api/message';
import { Message } from '#types/database/tables';


export const MessageSerializer = serializer<Message, MessageApi>((message) => ({
  id: message.id,
  channelUserId: message.channelUserId,
  channelName: message.channelName,
  userId: message.userId,
  displayName: message.displayName,
  emotes: message.emotes,
  content: message.content,
  timestamp: message.timestamp.getTime(),
}));
