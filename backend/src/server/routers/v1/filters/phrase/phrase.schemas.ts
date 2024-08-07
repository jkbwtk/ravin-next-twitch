import { PatchPhraseFilterReqBody, PostPhraseFilterReqBody } from '#types/api/filters';
import { z } from 'zod';


export const PostPhraseFilterSchema = z.object({
  body: PostPhraseFilterReqBody,
});

export type PostPhraseFilterSchema = z.infer<typeof PostPhraseFilterSchema>;


export const PatchPhraseFilterSchema = z.object({
  body: PatchPhraseFilterReqBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type PatchPhraseFilterSchema = z.infer<typeof PatchPhraseFilterSchema>;


export const DeletePhraseFilterSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type DeletePhraseFilterSchema = z.infer<typeof DeletePhraseFilterSchema>;
