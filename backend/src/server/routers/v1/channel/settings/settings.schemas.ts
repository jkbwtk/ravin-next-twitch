import { ChantingSettings } from '#shared/types/api/channel';
import { z } from 'zod';


export type PostChantingRequestSchema = {
  body: ChantingSettings;
};

export const PostChantingSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
    interval: z.number().min(0).max(300).int().multipleOf(5),
    length: z.number().min(0).max(100).int(),
  }),
}) satisfies z.Schema<PostChantingRequestSchema>;
