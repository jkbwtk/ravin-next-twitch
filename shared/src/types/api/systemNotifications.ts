import { z } from 'zod';


export const SystemNotification = z.object({
  id: z.number().int().positive(),
  userId: z.string().min(1).max(64),
  title: z.string().min(1).max(64),
  content: z.string().min(1).max(1024),
  read: z.boolean(),
  createdAt: z.date(),
});

export type SystemNotification = z.infer<typeof SystemNotification>;


export const GetSystemNotificationsResponse = z.object({
  data: z.array(SystemNotification),
});

export type GetSystemNotificationsResponse = z.infer<typeof GetSystemNotificationsResponse>;


export const PostSystemNotificationReadReqBody = z.object({
  id: z.union([
    SystemNotification.shape.id,
    z.array(SystemNotification.shape.id).min(1),
  ]),
});

export type PostSystemNotificationReadReqBody = z.infer<typeof PostSystemNotificationReadReqBody>;


export const GetSystemNotificationsReadResponse = z.object({
  data: z.array(SystemNotification),
});

export type GetSystemNotificationsReadResponse = z.infer<typeof GetSystemNotificationsReadResponse>;


export const PostSystemNotificationBroadcastReqBody = SystemNotification.pick({
  title: true,
  content: true,
});

export type PostSystemNotificationBroadcastReqBody = z.infer<typeof PostSystemNotificationBroadcastReqBody>;
