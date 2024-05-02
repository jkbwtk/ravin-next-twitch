import { DeleteCommandTimerReqBody, PatchCommandTimerReqBody } from '#shared/types/api/commands';
import { PostRegexFilterReqBody } from '#shared/types/api/filters';
import { z } from 'zod';


export const PostRegexFilterSchema = z.object({
  body: PostRegexFilterReqBody,
});

export type PostRegexFilterSchema = z.infer<typeof PostRegexFilterSchema>;


export const PatchRegexFilterSchema = z.object({
  body: PatchCommandTimerReqBody,
});

export type PatchRegexFilterSchema = z.infer<typeof PatchRegexFilterSchema>;


export const DeleteRegexFilterSchema = z.object({
  body: DeleteCommandTimerReqBody,
});

export type DeleteRegexFilterSchema = z.infer<typeof DeleteRegexFilterSchema>;
