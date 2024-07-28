import { clonePickedKeys, zodSerializer } from '#lib/serializer';
import { messagesTable } from '#schema/schema';
import { MessageApi } from '#types/api/message';
import { Message } from '#types/database/tables';
import { createSelectSchema } from 'drizzle-zod';


const messagesSchemaOverrides = createSelectSchema(messagesTable, {
  timestamp: (schema) => schema.timestamp.transform((v) => v.getTime()),
}).pick({
  timestamp: true,
});

const messageSchema = MessageApi.omit(clonePickedKeys(messagesSchemaOverrides)).merge(messagesSchemaOverrides);

export const MessageSerializer = zodSerializer<typeof messageSchema, Message, MessageApi>(messageSchema);
