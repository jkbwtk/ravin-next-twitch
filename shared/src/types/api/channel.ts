import { ChantingSettings, OfflineChatSettings } from '../database/columns';
import { z } from 'zod';


export { ChantingSettings, OfflineChatSettings };

export const GetChantingSettingsResponse = z.object({
  data: ChantingSettings,
});

export type GetChantingSettingsResponse = z.infer<typeof GetChantingSettingsResponse>;


export const PostChantingSettingsReqBody = ChantingSettings;

export type PostChantingSettingsReqBody = z.infer<typeof PostChantingSettingsReqBody>;


export const GetOfflineChatSettingsResponse = z.object({
  data: OfflineChatSettings,
});

export type GetOfflineChatSettingsResponse = z.infer<typeof GetOfflineChatSettingsResponse>;


export const PostOfflineChatSettingsReqBody = OfflineChatSettings;

export type PostOfflineChatSettingsReqBody = z.infer<typeof PostOfflineChatSettingsReqBody>;
