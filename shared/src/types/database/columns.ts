import { z } from 'zod';


export const ChantingSettings = z.object({
  enabled: z.boolean(),
  interval: z.number().min(0).max(300).int().multipleOf(5),
  length: z.number().min(0).max(100).int(),
});

export type ChantingSettings = z.infer<typeof ChantingSettings>;


export const ChatSettings = z.object({
  emoteMode: z.boolean().default(false),
  followerMode: z.boolean().default(false),
  followerModeDuration: z.number().min(0).max(129600).default(0),
  slowMode: z.boolean().default(false),
  slowModeWaitTime: z.number().min(3).max(120).default(30),
  subscriberMode: z.boolean().default(false),
  uniqueChatMode: z.boolean().default(false),
});

export type ChatSettings = z.infer<typeof ChatSettings>;


export const OfflineChatSettings = z.object({
  enabled: z.boolean(),
  liveSettings: ChatSettings,
  offlineSettings: ChatSettings,
});

export type OfflineChatSettings = z.infer<typeof OfflineChatSettings>;


// eslint-disable-next-line @typescript-eslint/ban-types
export type DefaultStates = 'customState' | 'counterState' | (string & {});

export type StatesObject = Partial<Record<DefaultStates, unknown>>;


export const TemplateEnvironments = z.enum(['generic', 'command', 'timer']);

export type TemplateEnvironments = z.infer<typeof TemplateEnvironments>;


export const BotActionData = z.array(z.coerce.string()).default([]);

export type BotActionData = z.infer<typeof BotActionData>;


export const Emote = z.object({
  name: z.string().min(1),
  count: z.number().int().nonnegative(),
  positions: z.array(z.string()),
});

export type Emote = z.infer<typeof Emote>;

export const EmotesUsed = z.record(Emote);

export type EmotesUsed = z.infer<typeof EmotesUsed>;
