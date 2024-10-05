import { PostChantingSettingsReqBody, PostOfflineChatSettingsReqBody } from '#types/api/channel';
import { z } from 'zod';


export const PostChantingSchema = z.object({
  body: PostChantingSettingsReqBody,
});

export type PostChantingSchema = z.infer<typeof PostChantingSchema>;


export const PostOfflineChatSettingsSchema = z.object({
  body: PostOfflineChatSettingsReqBody,
});

export type PostOfflineChatSettingsSchema = z.infer<typeof PostOfflineChatSettingsSchema>;
