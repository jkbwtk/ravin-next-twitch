import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { messagesTable } from '../../schema/schema';
import { Emote, EmotesUsed } from '../database/columns';


export { Emote, EmotesUsed };

export const MessageApi = createSelectSchema(messagesTable, {
  id: (schema) => schema.id.positive().int(),
  channelUserId: (schema) => schema.channelUserId.min(1),
  channelName: (schema) => schema.channelName.min(1),
  userId: (schema) => schema.userId.min(1),
  displayName: (schema) => schema.displayName.min(1),
  emotes: () => EmotesUsed.nullable(),
  content: (schema) => schema.content.min(1),
  timestamp: () => z.number().int().nonnegative(),
}).pick({
  id: true,
  channelUserId: true,
  channelName: true,
  color: true,
  userId: true,
  displayName: true,
  emotes: true,
  content: true,
  timestamp: true,
});

export type MessageApi = z.infer<typeof MessageApi>;


export const GetMessagesResponse = z.object({
  data: z.array(MessageApi),
});

export type GetMessagesResponse = z.infer<typeof GetMessagesResponse>;
