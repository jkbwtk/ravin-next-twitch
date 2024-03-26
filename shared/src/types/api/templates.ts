import { z } from 'zod';

export const TemplateEnvironments = z.enum(['empty', 'command']);

export type TemplateEnvironments = z.infer<typeof TemplateEnvironments>;


export const Template = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3),
  template: z.string().min(1),
  userId: z.string().min(1),
  environments: z.array(TemplateEnvironments)
    .refine((v) => Array.from(new Set(v))),
});

export type Template = z.infer<typeof Template>;


export const GetTemplatesResponse = z.object({
  data: z.array(Template),
});

export type GetTemplatesResponse = z.infer<typeof GetTemplatesResponse>;


export const PostTemplateReqBody = Template.omit({ id: true, userId: true, environments: true });

export type PostTemplateReqBody = z.infer<typeof PostTemplateReqBody>;


export const TestTemplateReqBody = Template.pick({ template: true });

export type TestTemplateReqBody = z.infer<typeof TestTemplateReqBody>;


export const TemplateIssue = z.object({
  SyntaxError: z.string().optional(),
  ReferenceError: z.string().optional(),
});

export const TestTemplateResponse = z.object({
  data: z.record(TemplateIssue.nullable()),
});

export type TestTemplateResponse = z.infer<typeof TestTemplateResponse>;


export const PatchTemplateReqBody = Template.pick({ id: true }).merge(PostTemplateReqBody.partial());

export type PatchTemplateReqBody = z.infer<typeof PatchTemplateReqBody>;


export const DeleteTemplateReqBody = Template.pick({ id: true });

export type DeleteTemplateReqBody = z.infer<typeof DeleteTemplateReqBody>;

