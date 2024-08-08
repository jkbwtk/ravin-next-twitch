import { createSelectSchema } from 'drizzle-zod';
import { TemplateEnvironments } from '../database/columns';
import { PaginatedResponse } from '../pagination';
import { z } from 'zod';
import { templatesTable } from '../../schema/schema';


export { TemplateEnvironments };

export const TemplateApi = createSelectSchema(templatesTable, {
  id: (schema) => schema.id.positive().int(),
  name: (schema) => schema.name.min(3),
  template: (schema) => schema.template.min(1),
  channelUserId: (schema) => schema.channelUserId.min(1),
  environments: () => z.array(TemplateEnvironments),
}).pick({
  id: true,
  name: true,
  template: true,
  channelUserId: true,
  environments: true,
});

export type TemplateApi = z.infer<typeof TemplateApi>;


export const GetTemplatesResponse = z.object({
  data: z.array(TemplateApi),
});

export type GetTemplatesResponse = z.infer<typeof GetTemplatesResponse>;


export const GetTemplatesPaginatedResponse = PaginatedResponse(GetTemplatesResponse);

export type GetTemplatesPaginatedResponse = z.infer<typeof GetTemplatesPaginatedResponse>;


export const PostTemplateReqBody = TemplateApi.omit({ id: true, channelUserId: true, environments: true });

export type PostTemplateReqBody = z.infer<typeof PostTemplateReqBody>;


export const PatchTemplateReqBody = PostTemplateReqBody.partial();

export type PatchTemplateReqBody = z.infer<typeof PatchTemplateReqBody>;


export const TestTemplateReqBody = z.object({
  template: z.string(),
});

export type TestTemplateReqBody = z.infer<typeof TestTemplateReqBody>;


export const TemplateIssue = z.object({
  type: z.enum(['SyntaxError', 'ReferenceError']),
  message: z.string(),
});

export type TemplateIssue = z.infer<typeof TemplateIssue>;

export const TestTemplateResponse = z.object({
  data: z.record(TemplateIssue.nullable()),
});

export type TestTemplateResponse = z.infer<typeof TestTemplateResponse>;
