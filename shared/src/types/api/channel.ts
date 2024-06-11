import { ChantingSettings } from '../database/columns';
import { z } from 'zod';


export const GetChantingSettingsResponse = z.object({
  data: ChantingSettings,
});

export type GetChantingSettingsResponse = z.infer<typeof GetChantingSettingsResponse>;


export const PostChantingSettingsReqBody = ChantingSettings;

export type PostChantingSettingsReqBody = z.infer<typeof PostChantingSettingsReqBody>;
