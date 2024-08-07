import { PatchRegexFilterReqBody, PostRegexFilterReqBody } from '#types/api/filters';
import { z } from 'zod';


export const PostRegexFilterSchema = z.object({
  body: PostRegexFilterReqBody,
});

export type PostRegexFilterSchema = z.infer<typeof PostRegexFilterSchema>;


export const PatchRegexFilterSchema = z.object({
  body: PatchRegexFilterReqBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type PatchRegexFilterSchema = z.infer<typeof PatchRegexFilterSchema>;


export const DeleteRegexFilterSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type DeleteRegexFilterSchema = z.infer<typeof DeleteRegexFilterSchema>;
