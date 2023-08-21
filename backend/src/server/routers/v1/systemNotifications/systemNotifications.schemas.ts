import { z } from 'zod';
import { PatchConfigRequest } from '#types/api/admin';
import { PostSystemNotificationBroadcastRequest, PostSystemNotificationReadRequest } from '#shared/types/api/systemNotifications';


export type PatchConfigRequestSchema = {
  body: PatchConfigRequest;
};

export const PatchConfigSchema = z.object({
  body: z.object({
    adminUsername: z.string().min(1).max(64).optional(),
    botLogin: z.string().min(1).max(64).optional(),
    botToken: z.string().min(1).max(64).optional(),
    twitchClientId: z.string().min(1).max(64).optional(),
    twitchClientSecret: z.string().min(1).max(64).optional(),
  }),
}) satisfies z.Schema<PatchConfigRequestSchema>;

export type PostReadNotificationsRequestSchema = {
  body: PostSystemNotificationReadRequest
};

export const PostReadNotificationsSchema = z.object({
  body: z.object({
    id: z.union([z.number(), z.array(z.number())]),
  }),
}) satisfies z.Schema<PostReadNotificationsRequestSchema>;

export type PostBroadcastNotificationRequestSchema = {
  body: PostSystemNotificationBroadcastRequest;
};

export const PostBroadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(64),
    content: z.string().min(1).max(1024),
  }),
}) satisfies z.Schema<PostBroadcastNotificationRequestSchema>;
