import { z } from 'zod';
import { DeleteTemplateReqBody, PatchTemplateReqBody, PostTemplateReqBody } from '#shared/types/api/templates';


export const PostTemplateSchema = z.object({
  body: PostTemplateReqBody,
});

export type PostTemplateRequestSchema = z.infer<typeof PostTemplateSchema>;

export const TestTemplateSchema = z.object({
  body: PostTemplateReqBody,
});

export type TestTemplateRequestSchema = z.infer<typeof TestTemplateSchema>;

export const PatchTemplateSchema = z.object({
  body: PatchTemplateReqBody,
});

export type PatchTemplateRequestSchema = z.infer<typeof PatchTemplateSchema>;

export const DeleteTemplateSchema = z.object({
  body: DeleteTemplateReqBody,
});

export type DeleteTemplateRequestSchema = z.infer<typeof DeleteTemplateSchema>;
