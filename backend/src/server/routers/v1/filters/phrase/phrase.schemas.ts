import { DeletePhraseFilterReqBody, PatchPhraseFilterReqBody, PostPhraseFilterReqBody } from '#shared/types/api/filters';
import { z } from 'zod';


export const PostPhraseFilterSchema = z.object({
  body: PostPhraseFilterReqBody,
});

export type PostPhraseFilterSchema = z.infer<typeof PostPhraseFilterSchema>;


export const PatchPhraseFilterSchema = z.object({
  body: PatchPhraseFilterReqBody,
});

export type PatchPhraseFilterSchema = z.infer<typeof PatchPhraseFilterSchema>;


export const DeletePhraseFilterSchema = z.object({
  body: DeletePhraseFilterReqBody,
});

export type DeletePhraseFilterSchema = z.infer<typeof DeletePhraseFilterSchema>;
