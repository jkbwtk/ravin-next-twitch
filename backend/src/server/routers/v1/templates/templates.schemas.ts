import { z } from 'zod';
import { PatchTemplateReqBody, PostTemplateReqBody, TestTemplateReqBody } from '#types/api/templates';


export const PostTemplateSchema = z.object({
  body: PostTemplateReqBody,
});

export type PostTemplateRequestSchema = z.infer<typeof PostTemplateSchema>;

export const TestTemplateSchema = z.object({
  body: TestTemplateReqBody,
});

export type TestTemplateRequestSchema = z.infer<typeof TestTemplateSchema>;

export const PatchTemplateSchema = z.object({
  body: PatchTemplateReqBody,
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type PatchTemplateRequestSchema = z.infer<typeof PatchTemplateSchema>;

export const DeleteTemplateSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export type DeleteTemplateRequestSchema = z.infer<typeof DeleteTemplateSchema>;
