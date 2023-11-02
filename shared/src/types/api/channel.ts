import { z } from 'zod';


export const ChantingSettings = z.object({
  enabled: z.boolean(),
  interval: z.number().min(0).max(300).int().multipleOf(5),
  length: z.number().min(0).max(100).int(),
});

export type ChantingSettings = z.infer<typeof ChantingSettings>;


export const GetChantingSettingsResponse = z.object({
  data: ChantingSettings,
});

export type GetChantingSettingsResponse = z.infer<typeof GetChantingSettingsResponse>;


export const PostChantingSettingsReqBody = ChantingSettings;

export type PostChantingSettingsReqBody = z.infer<typeof PostChantingSettingsReqBody>;
