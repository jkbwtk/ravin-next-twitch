import { z } from 'zod';
import { PostSystemNotificationBroadcastReqBody, PostSystemNotificationReadReqBody } from '#shared/types/api/systemNotifications';


export const PostReadNotificationsSchema = z.object({
  body: PostSystemNotificationReadReqBody,
});

export type PostReadNotificationsSchema = z.infer<typeof PostReadNotificationsSchema>;


export const PostBroadcastNotificationSchema = z.object({
  body: PostSystemNotificationBroadcastReqBody,
});

export type PostBroadcastNotificationSchema = z.infer<typeof PostBroadcastNotificationSchema>;
