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
