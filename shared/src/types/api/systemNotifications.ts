import { createSelectSchema } from 'drizzle-zod';
import { systemNotificationsTable } from '../../schema/schema';
import { z } from 'zod';


export const SystemNotificationApi = createSelectSchema(systemNotificationsTable, {
  id: (schema) => schema.id.int().positive(),
  userId: (schema) => schema.userId.min(1),
  title: (schema) => schema.title.min(1).max(64),
  content: (schema) => schema.content.min(1).max(1024),
}).pick({
  id: true,
  userId: true,
  title: true,
  content: true,
  createdAt: true,
}).merge(z.object({
  read: z.boolean(),
}));

export type SystemNotificationApi = z.infer<typeof SystemNotificationApi>;


export const GetSystemNotificationsResponse = z.object({
  data: z.array(SystemNotificationApi),
});

export type GetSystemNotificationsResponse = z.infer<typeof GetSystemNotificationsResponse>;


export const PostSystemNotificationReadReqBody = z.object({
  id: z.union([
    SystemNotificationApi.shape.id,
    z.array(SystemNotificationApi.shape.id).min(1),
  ]),
});

export type PostSystemNotificationReadReqBody = z.infer<typeof PostSystemNotificationReadReqBody>;


export const GetSystemNotificationsReadResponse = z.object({
  data: z.array(SystemNotificationApi),
});

export type GetSystemNotificationsReadResponse = z.infer<typeof GetSystemNotificationsReadResponse>;


export const PostSystemNotificationBroadcastReqBody = SystemNotificationApi.pick({
  title: true,
  content: true,
});

export type PostSystemNotificationBroadcastReqBody = z.infer<typeof PostSystemNotificationBroadcastReqBody>;
