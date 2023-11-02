import { z } from 'zod';


export const Emote = z.object({
  name: z.string().min(1),
  count: z.number().int().positive(),
  positions: z.array(z.string()),
});

export type Emote = z.infer<typeof Emote>;


export const EmotesUsed = z.record(Emote);

export type EmotesUsed = z.infer<typeof EmotesUsed>;


export const Message = z.object({
  id: z.string().min(1),
  channelId: z.string().min(1),
  channelName: z.string().min(1),
  color: z.string().nullable(),
  userId: z.string().min(1),
  displayName: z.string().min(1),
  emotes: EmotesUsed.nullable(),
  content: z.string(),
  timestamp: z.number().int().positive(),
});

export type Message = z.infer<typeof Message>;


export const GetMessagesResponse = z.object({
  data: z.array(Message),
});

export type GetMessagesResponse = z.infer<typeof GetMessagesResponse>;
