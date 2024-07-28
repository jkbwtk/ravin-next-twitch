import { z } from 'zod';


export const ChantingSettings = z.object({
  enabled: z.boolean(),
  interval: z.number().min(0).max(300).int().multipleOf(5),
  length: z.number().min(0).max(100).int(),
});

export type ChantingSettings = z.infer<typeof ChantingSettings>;


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
