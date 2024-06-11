import { PostChantingSettingsReqBody } from '#types/api/channel';
import { z } from 'zod';


export const PostChantingSchema = z.object({
  body: PostChantingSettingsReqBody,
});

export type PostChantingSchema = z.infer<typeof PostChantingSchema>;
